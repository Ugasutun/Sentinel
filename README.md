# Sentinel

Open-source runtime security monitoring for smart contracts.

Sentinel is two pieces that work together, kept in one repo for now (v1) and
designed to split into separate repos later once each has its own release
cadence — see `/contracts` and `/sdk`.

- **`contracts/`** — Solidity library of gas-conscious invariant-checking
  modifiers and hooks you inline into your own contracts. Emits a standard
  `SentinelAlert` event when an invariant is violated.
- **`sdk/`** — TypeScript/Node package that watches your contracts' events
  (and optionally the mempool) for configured invariants and pushes alerts
  to Discord / Telegram / a webhook.

Neither piece takes custody of funds. Sentinel doesn't hold assets — it just
watches and alerts.

## Why this exists

Most exploits aren't caught by audits — they happen after deployment, when
state drifts into conditions the audit never modeled. Sentinel gives any
team a lightweight, pluggable way to define "this should never happen" rules
and get paged the moment they do.

## Quickstart

```bash
# contracts
cd contracts
forge install
forge test

# sdk
cd ../sdk
npm install
npm run build
```

See `contracts/README.md` and `sdk/README.md` for details.

## Status

Early scaffold — v1 invariants are TVL-drop and single-address-drain
detection. Contributions and integration feedback welcome; see
`CONTRIBUTING.md`.

## License

MIT
