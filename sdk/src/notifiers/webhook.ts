import type { Notifier, SentinelAlertPayload } from "../types";

/** Posts the raw alert payload (with bigints stringified) as JSON to a webhook URL. */
export function webhookNotifier(url: string): Notifier {
  return {
    name: `webhook(${url})`,
    async send(alert: SentinelAlertPayload) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value
        ),
      });
      if (!res.ok) {
        throw new Error(`webhook responded ${res.status}`);
      }
    },
  };
}
