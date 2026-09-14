/**
 * Minimal ABI fragment — just the event Sentinel.sol emits. Consumers don't
 * need the full contract ABI to watch for alerts.
 */
export const SENTINEL_ALERT_ABI = [
  "event SentinelAlert(bytes32 indexed kind, address indexed actor, uint256 observed, uint256 threshold)",
];
