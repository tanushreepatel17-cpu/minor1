import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getGuestKey } from "@/lib/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Lock, MessageSquare, Star } from "lucide-react";

type FeedbackRow = {
  id: string;
  name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

type FeedbackStats = {
  review_count: number;
  average_rating: number;
};

/*
 * Only the signed-in user's own feedback is returned: row-level security in
 * `scheme_feedback` matches `user_id` (signed in) or the `x-guest-key` header
 * (guest). The average rating is fetched separately as an anonymous aggregate,
 * so no one's comments are exposed.
 */
const myFeedbackQuery = (schemeId: string) => ({
  queryKey: ["scheme_feedback", "mine", schemeId],
  queryFn: async (): Promise<FeedbackRow[]> => {
    const { data, error } = await supabase
      .from("scheme_feedback")
      .select("id,name,rating,comment,created_at")
      .eq("scheme_id", schemeId)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 10_000,
});

const feedbackStatsQuery = (schemeId: string) => ({
  queryKey: ["scheme_feedback", "stats", schemeId],
  queryFn: async (): Promise<FeedbackStats> => {
    const { data, error } = await supabase.rpc("scheme_feedback_stats", {
      p_scheme_id: schemeId,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return {
      review_count: Number(row?.review_count ?? 0),
      average_rating: Number(row?.average_rating ?? 0),
    };
  },
  staleTime: 30_000,
});

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

export function SchemeFeedback({
  schemeId,
  schemeTitle,
}: {
  schemeId: string;
  schemeTitle: string;
}) {
  const queryClient = useQueryClient();
  const { data: mine = [], isLoading, isError } = useQuery(myFeedbackQuery(schemeId));
  const { data: stats } = useQuery(feedbackStatsQuery(schemeId));

  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUserId(data.session?.user.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = useMutation({
    mutationFn: async () => {
      if (rating < 1) throw new Error("Choose a rating from 1 to 5 stars.");
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session.session?.user.id ?? null;
      const { error } = await supabase.from("scheme_feedback").insert({
        scheme_id: schemeId,
        rating,
        name: name.trim() || null,
        comment: comment.trim() || null,
        user_id: currentUserId,
        guest_key: currentUserId ? null : getGuestKey(),
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["scheme_feedback", "mine", schemeId] }),
        queryClient.invalidateQueries({ queryKey: ["scheme_feedback", "stats", schemeId] }),
      ]);
      toast.success("Thanks! Your feedback has been recorded.");
      setRating(0);
      setHovered(0);
      setName("");
      setComment("");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Could not save your feedback. Please try again.",
      );
    },
  });

  return (
    <section
      id="feedback"
      className="rounded-2xl border bg-card p-6 shadow-sm space-y-5 scroll-mt-24"
      aria-labelledby="feedback-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="feedback-heading" className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Your Feedback
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground flex items-start gap-1.5">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            Private to you — only your own feedback is shown on this page.
          </p>
        </div>
        {stats && stats.review_count > 0 && (
          <div className="rounded-xl border bg-muted/40 px-3 py-2 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Stars value={Math.round(stats.average_rating)} />
              <span className="text-sm font-bold text-foreground">
                {stats.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Average from {stats.review_count} {stats.review_count === 1 ? "review" : "reviews"}
            </p>
          </div>
        )}
      </div>

      <form
        className="space-y-3 rounded-xl border bg-muted/30 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit.mutate();
        }}
      >
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground">Your rating</span>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Rating out of 5"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onMouseEnter={() => setHovered(star)}
                onFocus={() => setHovered(star)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hovered || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
            <span className="ml-1 text-[11px] text-muted-foreground">
              {rating > 0 ? `${rating} / 5` : "Select a rating"}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Your name (optional)"
            className="h-9 text-xs bg-background"
            aria-label="Your name (optional)"
          />
          <div className="text-[11px] text-muted-foreground sm:text-right sm:self-center">
            Reviewing: <span className="font-medium text-foreground">{schemeTitle}</span>
          </div>
        </div>

        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Was this information clear? Anything missing? (optional)"
          className="text-xs bg-background resize-y"
          aria-label="Your feedback"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">
            {userId
              ? "Saved to your account. Only you can see it."
              : "No account needed — this browser is remembered so only you see it."}
          </p>
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={rating === 0 || submit.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {submit.isPending ? "Saving..." : "Submit feedback"}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your previous feedback
        </h3>

        {isLoading && <p className="text-xs text-muted-foreground">Loading your feedback...</p>}

        {isError && (
          <p className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
            Your feedback could not be loaded right now. You can still submit a new review.
          </p>
        )}

        {!isLoading && !isError && mine.length === 0 && (
          <p className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
            You have not reviewed this scheme yet. Your note stays private to you.
          </p>
        )}

        {mine.length > 0 && (
          <ul className="divide-y rounded-xl border bg-card">
            {mine.slice(0, 6).map((row) => (
              <li key={row.id} className="p-3.5 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {row.name?.trim() || (userId ? "You" : "Anonymous (you)")}
                    </span>
                    <Stars value={row.rating} />
                  </div>
                  <time className="text-[10px] text-muted-foreground" dateTime={row.created_at}>
                    {new Date(row.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                {row.comment?.trim() && (
                  <p className="text-xs leading-relaxed text-muted-foreground">{row.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {mine.length > 6 && (
          <p className="text-[11px] text-muted-foreground">
            Showing your 6 most recent reviews of this scheme.
          </p>
        )}
      </div>
    </section>
  );
}
