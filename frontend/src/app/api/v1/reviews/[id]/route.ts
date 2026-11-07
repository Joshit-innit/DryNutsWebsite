import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getSupabase } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

type ReviewRouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: ReviewRouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  const { data, error } = await getSupabase().from("reviews").delete().eq("id", id).select("id");
  if (error) return Response.json({ message: "Could not delete review." }, { status: 500 });
  if (!data?.length) return Response.json({ message: "Review not found." }, { status: 404 });
  return Response.json({ data: { deleted: true } });
}
