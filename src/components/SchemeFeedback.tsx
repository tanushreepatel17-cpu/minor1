import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, MessageSquare, Star } from "lucide-react";

type FeedbackRow = {
  id: string;
  name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

const feedbackQuery = (schemeId: string) => ({
  queryKey: ["scheme_feedback", schemeId],
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
  const { data = [], isLoading, isError } = useQuery(feedbackQuery(schemeId));

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (rating < 1) throw new Error("Choose a rating from 1 to 5 stars.");
      const { error } = await supabase.from("scheme_feedback").insert({
        scheme_id: schemeId,
        rating,
        name: name.trim() || null,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["scheme_feedback", schemeId] });
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

  const average = data.length
    ? data.reduce((total, row) => total + row.rating, 0) / data.length
    : 0;

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
            Citizen Feedback
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Share how useful this scheme page was. Feedback is public and helps other applicants.
          </p>
        </div>
        {data.length > 0 && (
          <div className="rounded-xl border bg-muted/40 px-3 py-2 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Stars value={Math.round(average)} />
              <span className="text-sm font-bold text-foreground">{average.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {data.length} {data.length === 1 ? "review" : "reviews"}
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
            No account needed. Do not post personal or sensitive information.
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
          Recent feedback
        </h3>

        {isLoading && <p className="text-xs text-muted-foreground">Loading feedback...</p>}

        {isError && (
          <p className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
            Feedback could not be loaded right now. You can still submit yours.
          </p>
        )}

        {!isLoading && !isError && data.length === 0 && (
          <p className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
            No feedback yet for this scheme. Be the first to share your experience.
          </p>
        )}

        {data.length > 0 && (
          <ul className="divide-y rounded-xl border bg-card">
            {data.slice(0, 6).map((row) => (
              <li key={row.id} className="p-3.5 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {row.name?.trim() || "Anonymous citizen"}
                    </span>
                    <Stars value={row.rating} />
                  </div>
                  <time
                    className="text-[10px] text-muted-foreground"
                    dateTime={row.created_at}
                  >
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

        {data.length > 6 && (
          <p className="text-[11px] text-muted-foreground">
            Showing the 6 most recent of {data.length} feedback entries.
          </p>
        )}
      </div>
    </section>
  );
}
