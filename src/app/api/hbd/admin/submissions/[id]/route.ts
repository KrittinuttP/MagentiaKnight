import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isSiteAdminUnlocked } from "@/lib/site-admin-auth";
import {
  deleteHbdSubmission,
  isHbdSubmissionAction,
  updateHbdSubmissionStatus,
} from "@/lib/hbd-submissions-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function guard(context: RouteContext) {
  if (!(await isSiteAdminUnlocked())) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      error: NextResponse.json({ error: "Supabase ไม่พร้อม" }, { status: 503 }),
    };
  }

  const { id } = await context.params;
  if (!id) {
    return {
      error: NextResponse.json({ error: "Missing id" }, { status: 400 }),
    };
  }

  return { id };
}

export async function POST(request: Request, context: RouteContext) {
  const result = await guard(context);
  if ("error" in result) return result.error;

  let body: { action?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isHbdSubmissionAction(body.action)) {
    return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const row = await updateHbdSubmissionStatus(result.id, body.action);
    revalidatePath("/", "page");
    return NextResponse.json({ ok: true, submission: row });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "อัปเดตไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const result = await guard(context);
  if ("error" in result) return result.error;

  try {
    await deleteHbdSubmission(result.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ลบไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
