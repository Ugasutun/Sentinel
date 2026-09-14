# sentinel-contracts

Solidity library of invariant-checking hooks. Inherit `Sentinel` and call
the `_check*` functions at the points in your logic where an invariant
should hold. Violations emit `SentinelAlert`; set `sentinelHardStop = true`
to revert instead of just alerting.

## Install (Foundry)

```bash
forge install <org>/sentinel-contracts
```

## Usage

```solidity
import {Sentinel} from "sentinel-contracts/Sentinel.sol";

contract MyPool is Sentinel {
    function withdraw(uint256 amount) external {
        uint256 before = totalPool;
        _checkSingleActorDrain(msg.sender, amount, totalPool, 3_000); // 30%
        // ... do the withdrawal ...
        _checkTvlDrop(before, totalPool, 2_000); // 20%
    }
}
```

See `src/examples/ExamplePool.sol` for a full minimal integration.

## Invariants (v1)

| Check | What it catches |
|---|---|
| `_checkTvlDrop` | A single call drops pool balance by more than `maxDropBps`. |
| `_checkSingleActorDrain` | A single address withdraws more than `maxShareBps` of the pool in one call. |

More invariants (oracle deviation, abnormal withdrawal cadence) are planned —
see the root `README.md` roadmap.

## Test

```bash
forge test
```
