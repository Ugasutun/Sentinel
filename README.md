# Sentinel

**Open-source runtime security monitoring for smart contracts.**

Sentinel gives any Solidity team a lightweight, pluggable way to define
"this should never happen" rules for their contracts, and get alerted the
moment one fires — in real time, in production, without waiting for the
next audit.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## Table of contents

- [Why this exists](#why-this-exists)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Quickstart](#quickstart)
- [Usage](#usage)
- [Invariants (v1)](#invariants-v1)
- [Design principles](#design-principles)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)

---

## Why this exists

Most smart contract exploits aren't caught by audits. Audits check a
contract against the conditions the auditor thought to model, at a single
point in time. Exploits happen later — after an upgrade, after a market
moves in a way nobody modeled, after some other integrated protocol changes
behavior underneath you. State drifts into territory nobody signed off on,
and by the time a team notices, funds are already gone.

The usual answers today are:

- **Pay for closed-source monitoring** (node operators, proprietary
  dashboards) — expensive, and you're trusting someone else's black box to
  watch your protocol.
- **Fly blind between audits** — the default for most small and mid-size
  teams, simply because nothing lightweight exists.

Sentinel is the missing middle ground: a small, auditable, open-source
library you inline directly into your own contracts, paired with an
off-chain watcher you run yourself. No black box, no vendor lock-in, no
custody of your funds — just configurable invariants and an alert the
moment one breaks.

## How it works

Sentinel is built from a few pieces that work together:

```
┌─────────────────────────┐         ┌──────────────────────────┐         ┌───────────────────────┐
│   contracts/              │  emits  │   sdk/                     │  posts  │   backend/              │
│   Sentinel.sol             │ ──────▶ │   watches for the event,   │ ──────▶ │   stores alert history, │
│   (inherited by your       │ Sentinel│   fans it out to your      │  JSON   │   serves it back via    │
│   contract, checks run     │ Alert   │   Discord/Telegram/        │         │   a small REST API      │
│   inline in your logic)    │ event   │   webhook                  │         │   (optional)            │
└─────────────────────────┘         └──────────────────────────┘         └───────────────────────┘
```

1. Your contract inherits `Sentinel` and calls a `_check*` function at the
   point in your logic where an invariant should hold (e.g. right after a
   withdrawal).
2. If the invariant is violated, Sentinel emits a `SentinelAlert` event.
   Optionally, it can revert the transaction instead (hard-stop mode).
3. The `sentinel-sdk` watcher (running wherever you like — your own server,
   a small VM, a serverless function) listens for that event on-chain and
   pushes a formatted alert to Discord, Telegram, or any webhook you
   configure.
4. Optionally, point the SDK's `webhookNotifier` at `sentinel-backend` to
   keep a queryable history of every alert, instead of (or alongside)
   Discord/Telegram notifications.

Sentinel never takes custody of funds and holds no state about your
protocol beyond the thresholds each check is called with. It's a
dependency, not a service you have to trust.

## Project structure

Kept as a single repo for now (v1), with each half designed to split into
its own repo later once it has its own release cadence:

```
sentinel/
├── contracts/              # Solidity library
│   ├── src/
│   │   ├── Sentinel.sol           # the invariant-checking library
│   │   └── examples/
│   │       └── ExamplePool.sol    # minimal integration example
│   ├── test/
│   │   └── Sentinel.t.sol         # Foundry tests
│   └── foundry.toml
│
├── sdk/                     # TypeScript/Node off-chain watcher
│   ├── src/
│   │   ├── watcher.ts             # core event-watching logic
│   │   ├── types.ts               # shared types
│   │   ├── abi.ts                 # SentinelAlert event ABI fragment
│   │   └── notifiers/
│   │       ├── discord.ts
│   │       ├── telegram.ts
│   │       └── webhook.ts
│   ├── test/
│   └── package.json
│
├── backend/                 # minimal alert-history API (JSON file, no DB)
│   ├── src/
│   │   ├── index.js               # Express server + endpoints
│   │   └── store.js               # JSON-file read/write helpers
│   ├── data/                      # alerts.json lives here (gitignored)
│   └── package.json
│
├── CONTRIBUTING.md
├── LICENSE
└── README.md                # you are here
```

## Quickstart

**Prerequisites:** [Node.js](https://nodejs.org) 18+ and
[Foundry](https://book.getfoundry.sh/getting-started/installation).

```bash
git clone https://github.com/ugasutun/sentinel.git
cd sentinel

# contracts
cd contracts
forge install foundry-rs/forge-std --no-commit
forge test
cd ..

# sdk
cd sdk
npm install
npm run build
npm test
cd ..

# backend
cd backend
npm install
npm start
```

If `forge test`, `npm test` (in `sdk`), and `npm start` (in `backend`) all
work, you're fully set up. See [`contracts/README.md`](./contracts/README.md),
[`sdk/README.md`](./sdk/README.md), and
[`backend/README.md`](./backend/README.md) for details specific to each
part.

## Usage

### 1. Add invariant checks to your contract

```solidity
import {Sentinel} from "sentinel-contracts/Sentinel.sol";

contract MyPool is Sentinel {
    function withdraw(uint256 amount) external {
        uint256 before = totalPool;

        _checkSingleActorDrain(msg.sender, amount, totalPool, 3_000); // 30% max

        // ... your actual withdrawal logic ...

        _checkTvlDrop(before, totalPool, 2_000); // 20% max drop per call
    }
}
```

See [`contracts/src/examples/ExamplePool.sol`](./contracts/src/examples/ExamplePool.sol)
for a complete working example.

### 2. Run the watcher

```ts
import { watch, discordNotifier, webhookNotifier } from "sentinel-sdk";

const stop = watch({
  rpcUrl: process.env.RPC_URL!,
  contracts: ["0xYourDeployedContractAddress"],
  notifiers: [
    discordNotifier(process.env.DISCORD_WEBHOOK_URL!),
    webhookNotifier("https://your-internal-alerting.example.com/hook"),
  ],
});

// stop() to stop watching
```

That's it — any `SentinelAlert` your contract emits now shows up in your
Discord channel (or wherever else you've wired it) in real time.

## Invariants (v1)

| Check | What it catches |
|---|---|
| `_checkTvlDrop` | A single call drops the pool/TVL balance by more than a configured percentage in one shot — often a sign of an exploit or a misconfigured integration. |
| `_checkSingleActorDrain` | A single address withdraws more than a configured share of the pool in one call — catches both attacks and simple bugs (e.g. a misplaced decimal). |

Both checks are alert-only by default (they emit `SentinelAlert` and let the
transaction proceed); set `sentinelHardStop = true` in your contract if you
want violations to revert instead.

More invariants are planned — see [Roadmap](#roadmap).

## Design principles

- **No custody.** Sentinel never holds your funds. It only observes and
  alerts.
- **No black box.** Every check is a few lines of readable Solidity you can
  audit yourself in minutes.
- **Opt-in strictness.** Alert-only by default; hard-stop (revert) is a
  one-line opt-in for teams that want it.
- **Composable, not a platform.** No dashboard lock-in, no proprietary
  format — the SDK is a plain event watcher you can run anywhere and wire
  to any destination.

## Roadmap

- [ ] Oracle-deviation invariant check
- [ ] Abnormal withdrawal cadence / frequency check
- [ ] Mempool-level watching (pending-tx simulation), not just confirmed
      on-chain events
- [ ] `sentinel.config.json` config file format for the SDK, instead of
      hand-written setup
- [ ] Slack notifier
- [ ] Split `contracts/` and `sdk/` into independently versioned,
      independently publishable repos

## Contributing

Contributions are very welcome — new invariant checks, new notifiers,
integration feedback, docs improvements, all of it. See
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup instructions and PR
guidelines. Issues labeled `good first issue` are a good place to start.

## FAQ

**Does Sentinel take custody of my funds?**
No. It never holds assets — it only watches and alerts.

**Does it work with any EVM chain?**
Yes — it's plain Solidity and a standard on-chain event, so it works
anywhere Foundry and an EVM JSON-RPC endpoint work.

**Do I have to use both halves together?**
No. You can use `sentinel-contracts` alone (just the on-chain checks and
event, no off-chain watcher) or `sentinel-sdk` alone if you're already
emitting your own similarly-shaped alert events and just want the
notification fan-out.

**Is this audited?**
Not yet — this is an early-stage project. Treat it as a starting point and
review the code yourself before relying on it in production. See
[Contributing](#contributing) if you'd like to help change that.

## License

[MIT](./LICENSE)
