import type { Notifier, SentinelAlertPayload } from "../types";

/** Sends a formatted message to a Discord webhook URL. */
export function discordNotifier(webhookUrl: string): Notifier {
  return {
    name: "discord",
    async send(alert: SentinelAlertPayload) {
      const content =
        `🚨 **Sentinel Alert: ${alert.kind}**\n` +
        `Contract: \`${alert.contract}\`\n` +
        `Actor: \`${alert.actor}\`\n` +
        `Observed: ${alert.observed} / Threshold: ${alert.threshold}\n` +
        `Tx: \`${alert.txHash}\` (block ${alert.blockNumber})`;

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        throw new Error(`discord webhook responded ${res.status}`);
      }
    },
  };
}
