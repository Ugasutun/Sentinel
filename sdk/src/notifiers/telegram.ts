import type { Notifier, SentinelAlertPayload } from "../types";

/** Sends a formatted message via a Telegram bot to a given chat ID. */
export function telegramNotifier(botToken: string, chatId: string): Notifier {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  return {
    name: "telegram",
    async send(alert: SentinelAlertPayload) {
      const text =
        `🚨 Sentinel Alert: ${alert.kind}\n` +
        `Contract: ${alert.contract}\n` +
        `Actor: ${alert.actor}\n` +
        `Observed: ${alert.observed} / Threshold: ${alert.threshold}\n` +
        `Tx: ${alert.txHash} (block ${alert.blockNumber})`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (!res.ok) {
        throw new Error(`telegram API responded ${res.status}`);
      }
    },
  };
}
