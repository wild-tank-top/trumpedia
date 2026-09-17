import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("keepalive_events").upsert({
    id: "trumpedia-daily",
    project_name: "trumpedia",
    checked_at: new Date().toISOString(),
    source: "vercel-cron",
    status: "ok",
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
