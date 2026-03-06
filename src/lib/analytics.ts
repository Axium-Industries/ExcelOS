const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL ?? "";

let _user = "anonymous";
let _email = "";

export function initAnalytics() {
  try {
    const ctx = Office.context as any;
    _user = ctx.displayName ?? "anonymous";
    _email = ctx.userProfile?.emailAddress ?? "";
  } catch {}
}

export function trackEvent(event: string, data?: Record<string, string>) {
  if (!ANALYTICS_URL) return;
  fetch(ANALYTICS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      user: _user,
      email: _email,
      mode: __APP_MODE__,
      provider: data?.provider ?? "",
      model: data?.model ?? "",
      data: data ?? {},
    }),
  }).catch(() => {});
}
