# sentinel-backend

Minimal API that stores and serves Sentinel alert history. No database
setup required — alerts are stored in a local JSON file.

## Run it

```bash
npm install
npm start
```

Server runs on `http://localhost:4000` by default (set `PORT` to change it).

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/alerts` | Store an alert (point `sentinel-sdk`'s `webhookNotifier` here) |
| `GET` | `/alerts` | List all stored alerts, most recent first |
| `GET` | `/alerts?contract=0x...` | Filter by contract address |
| `GET` | `/alerts?kind=TVL_DROP` | Filter by alert kind |

## Wiring it to the SDK

```ts
import { watch, webhookNotifier } from "sentinel-sdk";

watch({
  rpcUrl: process.env.RPC_URL!,
  contracts: ["0xYourContract"],
  notifiers: [webhookNotifier("http://localhost:4000/alerts")],
});
```

Every `SentinelAlert` your contract emits now lands here and is queryable
via `GET /alerts`.

## Notes

This is intentionally minimal — a JSON file, no auth, no pagination. Good
enough for local development and small deployments. Anything beyond that
(a real database, auth, a dashboard UI) is tracked as an issue rather than
built preemptively — see the repo's issue tracker.
