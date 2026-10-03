import { NextResponse } from "next/server";
import { requireNewsroomAccess } from "@/lib/newsroom/guard";
import { logAutomation } from "@/lib/newsroom/log";
import { getSettings, parseSettingsInput, saveSettings } from "@/lib/newsroom/settings";

export async function GET() {
  const access = await requireNewsroomAccess("read");
  if ("error" in access) return access.error;
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(request: Request) {
  const access = await requireNewsroomAccess("write");
  if ("error" in access) return access.error;
  const next = parseSettingsInput(await request.json().catch(() => null), await getSettings());
  await saveSettings(next);
  await logAutomation("settings.updated", "Automation settings updated", { meta: { enabled: next.enabled, autoResearch: next.autoResearch, autoDraft: next.autoDraft, requireApproval: next.requireApproval } });
  return NextResponse.json({ settings: next });
}
