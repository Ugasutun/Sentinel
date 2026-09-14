# sentinel-sdk

Off-chain watcher for `SentinelAlert` events emitted by contracts using
[`sentinel-contracts`](../contracts). Pushes alerts to Discord, Telegram,
or any webhook.

## Install

```bash
npm install sentinel-sdk
```

## Usage

```ts
import { watch, discordNotifier, webhookNotifier } from "sentinel-sdk";

const stop = watch({
  rpcUrl: process.env.RPC_URL!,
  contracts: ["0xYourPoolAddress"],
  notifiers: [
    discordNotifier(process.env.DISCORD_WEBHOOK_URL!),
    webhookNotifier("https://your-internal-alerting.example.com/hook"),
  ],
});

// later, to stop watching:
// stop();
```

## Build & test

```bash
npm install
npm run build
npm test
```

## Roadmap

- Mempool-level watching (pending tx simulation), not just confirmed events
- Config file format (`sentinel.config.json`) instead of hand-written setup
- Slack notifier
