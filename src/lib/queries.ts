import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SchemeRow = Database["public"]["Tables"]["schemes"]["Row"];

/*
 * Only the fields the eligibility matcher and result cards need. The full
 * `select("*")` payload is ~9 MB for 3,540 schemes (eligibility, benefits and
 * tags are long text columns), which made /eligibility take 15+ seconds to
 * render. This projection is ~2.8 MB and loads in about 2 seconds.
 */
export type EligibilityScheme = Pick<
  SchemeRow,
  | "id"
  | "slug"
  | "title"
  | "level"
  | "sector"
  | "summary"
  | "beneficiary_types"
  | "is_demo"
  | "min_age"
  | "max_age"
  | "genders"
  | "max_annual_income"
  | "social_categories"
  | "occupations"
  | "residence"
  | "requires_bpl"
  | "requires_disability"
>;

// The Supabase REST API caps every response at 1000 rows, so page until exhausted.
async function fetchAllPublishedSchemes(): Promise<SchemeRow[]> {
  const pageSize = 1000;
  const rows: SchemeRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("status", "published")
      .order("is_demo")
      .order("title")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function fetchEligibilitySchemes(): Promise<EligibilityScheme[]> {
  const pageSize = 1000;
  const rows: EligibilityScheme[] = [];

  // Fetch four pages concurrently instead of one after another. With 3,540
  // schemes this turns four ~500 ms round trips into roughly one.
  for (let from = 0; ; from += pageSize * 4) {
    const pages = await Promise.all(
      Array.from({ length: 4 }, (_, index) => {
        const start = from + index * pageSize;
        return supabase
          .from("schemes")
          .select(
            "id,slug,title,level,sector,summary,beneficiary_types,is_demo,min_age,max_age,genders,max_annual_income,social_categories,occupations,residence,requires_bpl,requires_disability",
          )
          .eq("status", "published")
          .order("is_demo")
          .order("title")
          .range(start, start + pageSize - 1);
      }),
    );

    let done = false;
    for (const { data, error } of pages) {
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) done = true;
    }
    if (done) break;
  }

  return rows;
}

export const schemesQuery = queryOptions({
  queryKey: ["schemes"],
  queryFn: fetchAllPublishedSchemes,
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
});

export const eligibilitySchemesQuery = queryOptions({
  queryKey: ["schemes", "eligibility"],
  queryFn: fetchEligibilitySchemes,
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
});

export const schemeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["scheme", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("schemes").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const systemsQuery = queryOptions({
  queryKey: ["ai_systems"],
  queryFn: async () => {
    const { data, error } = await supabase.from("ai_systems").select("*, departments(name, level, state_name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const incidentsQuery = queryOptions({
  queryKey: ["incidents"],
  queryFn: async () => {
    const { data, error } = await supabase.from("incidents").select("*, ai_systems(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const departmentsQuery = queryOptions({
  queryKey: ["departments"],
  queryFn: async () => {
    const { data, error } = await supabase.from("departments").select("*").order("name");
    if (error) throw error;
    return data;
  },
});
