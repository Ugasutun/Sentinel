import { ethers } from "ethers";
import { SENTINEL_ALERT_ABI } from "./abi";
import type { SentinelAlertPayload, WatchConfig } from "./types";

/**
 * Starts watching the configured contracts for SentinelAlert events and
 * fans each one out to every configured notifier.
 *
 * Returns a function to stop watching.
 */
export function watch(config: WatchConfig): () => void {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const iface = new ethers.Interface(SENTINEL_ALERT_ABI);
  const topic = iface.getEvent("SentinelAlert")!.topicHash;

  const handleLog = async (log: ethers.Log) => {
    let parsed;
    try {
      parsed = iface.parseLog(log);
    } catch {
      return; // not a SentinelAlert log, ignore
    }
    if (!parsed) return;

    const payload: SentinelAlertPayload = {
      contract: log.address,
      kind: ethers.decodeBytes32String(parsed.args.kind),
      actor: parsed.args.actor,
      observed: parsed.args.observed,
      threshold: parsed.args.threshold,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    };

    await Promise.allSettled(
      config.notifiers.map((n) =>
        n.send(payload).catch((err) => {
          console.error(`[sentinel-sdk] notifier "${n.name}" failed:`, err);
        })
      )
    );
  };

  const filter = {
    address: config.contracts,
    topics: [topic],
  };

  provider.on(filter, handleLog);

  return () => {
    provider.off(filter, handleLog);
  };
}
