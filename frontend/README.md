# sentinel-frontend

A single-page dashboard that shows alert history from `sentinel-backend`.
No build step, no framework — just one HTML file.

## Run it

Make sure `sentinel-backend` is running first (`npm start` in `../backend`,
listening on `http://localhost:4000`).

Then just open `index.html` directly in your browser — double-click it, or
right-click → **Open with** → your browser.

The page polls `GET /alerts` every 5 seconds and shows:

- A green/red badge for whether the backend is reachable
- A table of every stored alert: when it arrived, what kind it was, which
  contract and actor were involved, the observed value vs. the threshold,
  and the transaction hash

## Pointing it at a different backend

If your backend runs somewhere other than `localhost:4000` (a different
port, or a deployed server), open `index.html` in a text editor and change
this line near the top of the `<script>` section:

```js
const API_BASE = "http://localhost:4000";
```

## Notes

This is intentionally minimal — no routing, no build tooling, no
dependencies. Good enough to actually see your alerts instead of reading
raw JSON. A real framework-based dashboard (with charts, pagination, etc.)
is tracked as an issue rather than built preemptively.
