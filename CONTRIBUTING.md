# Contributing to Sentinel

Thanks for considering a contribution! Sentinel is early-stage — the most
valuable contributions right now are:

1. **New invariant checks** in `contracts/src/Sentinel.sol` (with tests in
   `contracts/test/`)
2. **New notifiers** in `sdk/src/notifiers/` (with tests in `sdk/test/`)
3. **Real integration feedback** — if you try wiring Sentinel into your own
   contracts and something is awkward or missing, open an issue

## Setup

```bash
git clone <repo-url>
cd sentinel

cd contracts && forge install && forge test
cd ../sdk && npm install && npm test
```

## Pull requests

- Keep PRs focused — one invariant or one notifier per PR is easier to review
  than a bundle of unrelated changes
- Add a test for any new check or notifier
- Update the relevant `README.md` (root, `contracts/`, or `sdk/`) if you add
  a new public function or notifier

## Code style

- Solidity: NatSpec comments on all public/external functions and events
- TypeScript: explicit types on exported functions, no `any` in public APIs

## Reporting a security issue

Please do not open a public issue for a security vulnerability in Sentinel
itself. Open a private security advisory on GitHub instead.
