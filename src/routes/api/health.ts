import { createFileRoute } from "@tanstack/react-router";

// Lightweight probe for Render and Vercel health checks. It touches neither
// Supabase nor the AI provider, so it stays green while a dependency is slow.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ status: "ok", service: "nagsi" }), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        }),
    },
  },
});
