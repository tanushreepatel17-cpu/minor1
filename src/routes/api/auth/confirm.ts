import { createFileRoute } from "@tanstack/react-router";
import { handleConfirmOfficer } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/confirm")({
  server: { handlers: { POST: ({ request }) => handleConfirmOfficer(request) } },
});
