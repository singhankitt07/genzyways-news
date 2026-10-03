export type CallResult<T = Record<string, unknown>> = { ok: boolean; status: number; data: T & { error?: string } };

export async function call<T = Record<string, unknown>>(url: string, method = "GET", body?: unknown): Promise<CallResult<T>> {
  try {
    const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Unable to reach the server." } as CallResult<T>["data"] };
  }
}

export const fmt = (value: string | Date | null | undefined) => (value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

export const RISK_STYLE: Record<string, string> = { HIGH: "border-red-600 text-red-700", MEDIUM: "border-gold text-ink", LOW: "border-line text-ink/60" };
