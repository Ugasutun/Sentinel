import { describe, it, expect, vi, beforeEach } from "vitest";
import { webhookNotifier } from "../src/notifiers/webhook";
import type { SentinelAlertPayload } from "../src/types";

describe("webhookNotifier", () => {
  const alert: SentinelAlertPayload = {
    contract: "0x0000000000000000000000000000000000dEaD",
    kind: "TVL_DROP",
    actor: "0x000000000000000000000000000000000000AA",
    observed: 2500n,
    threshold: 2000n,
    txHash: "0xabc",
    blockNumber: 123,
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 200 }))
    );
  });

  it("posts JSON with bigints stringified", async () => {
    const notifier = webhookNotifier("https://example.com/hook");
    await notifier.send(alert);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = (fetch as any).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.observed).toBe("2500");
    expect(body.threshold).toBe("2000");
    expect(body.kind).toBe("TVL_DROP");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 }))
    );
    const notifier = webhookNotifier("https://example.com/hook");
    await expect(notifier.send(alert)).rejects.toThrow();
  });
});
