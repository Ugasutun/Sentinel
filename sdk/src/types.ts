export interface SentinelAlertPayload {
  /** Contract address the alert came from. */
  contract: string;
  /** Short kind identifier, e.g. "TVL_DROP" or "SINGLE_ACTOR_DRAIN". */
  kind: string;
  /** Address associated with the triggering action, if any. */
  actor: string;
  /** Observed value that violated the invariant (raw, not decimal-adjusted). */
  observed: bigint;
  /** Configured threshold that was crossed. */
  threshold: bigint;
  /** Transaction hash the alert was emitted in. */
  txHash: string;
  /** Block number the alert was emitted in. */
  blockNumber: number;
}

export interface Notifier {
  /** Human-readable name, used in logs. */
  name: string;
  send(alert: SentinelAlertPayload): Promise<void>;
}

export interface WatchConfig {
  /** JSON-RPC endpoint (HTTP or WS) to watch. */
  rpcUrl: string;
  /** Contract addresses to watch for SentinelAlert events. */
  contracts: string[];
  /** Notifiers to fan alerts out to. */
  notifiers: Notifier[];
  /** Poll interval in ms when using an HTTP provider. Defaults to 12000. */
  pollIntervalMs?: number;
}
