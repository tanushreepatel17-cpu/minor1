import { createFileRoute } from "@tanstack/react-router";
import { handleRegisterOfficer } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/register")({
  server: { handlers: { POST: ({ request }) => handleRegisterOfficer(request) } },
});
