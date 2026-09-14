// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Sentinel
/// @notice Lightweight, gas-conscious invariant-checking hooks for smart
///         contracts. Inherit this contract and call the check functions
///         at the points in your logic where the invariant should hold.
///         Violations emit an event rather than reverting by default, so
///         teams can choose alert-only or hard-revert behavior per check.
/// @dev    Sentinel never takes custody of funds and holds no state about
///         your protocol beyond the config each check is called with.
abstract contract Sentinel {
    /// @notice Emitted whenever a configured invariant is violated.
    /// @param kind      Short identifier for which check fired, e.g. "TVL_DROP".
    /// @param actor     The address associated with the triggering action, if any.
    /// @param observed  The observed value that violated the invariant.
    /// @param threshold The configured threshold that was crossed.
    event SentinelAlert(
        bytes32 indexed kind,
        address indexed actor,
        uint256 observed,
        uint256 threshold
    );

    /// @dev Set to true to revert on violation instead of only emitting.
    ///      Override in the inheriting contract if hard-stop behavior is
    ///      desired for a given deployment.
    bool internal sentinelHardStop = false;

    /// @notice Checks that a single-block balance drop does not exceed
    ///         `maxDropBps` (basis points, out of 10_000).
    /// @param balanceBefore Pool/TVL balance before the action.
    /// @param balanceAfter  Pool/TVL balance after the action.
    /// @param maxDropBps    Max allowed drop in a single call, in bps.
    function _checkTvlDrop(
        uint256 balanceBefore,
        uint256 balanceAfter,
        uint256 maxDropBps
    ) internal {
        if (balanceAfter >= balanceBefore) return;

        uint256 dropBps = ((balanceBefore - balanceAfter) * 10_000) / balanceBefore;

        if (dropBps > maxDropBps) {
            emit SentinelAlert(bytes32("TVL_DROP"), msg.sender, dropBps, maxDropBps);
            if (sentinelHardStop) {
                revert("Sentinel: TVL drop exceeds threshold");
            }
        }
    }

    /// @notice Checks that a single address is not withdrawing more than
    ///         `maxShareBps` of the pool in one action.
    /// @param actor      The address performing the withdrawal.
    /// @param amount     The amount being withdrawn.
    /// @param poolTotal  The total pool balance before withdrawal.
    /// @param maxShareBps Max allowed share of pool in bps.
    function _checkSingleActorDrain(
        address actor,
        uint256 amount,
        uint256 poolTotal,
        uint256 maxShareBps
    ) internal {
        if (poolTotal == 0) return;

        uint256 shareBps = (amount * 10_000) / poolTotal;

        if (shareBps > maxShareBps) {
            emit SentinelAlert(bytes32("SINGLE_ACTOR_DRAIN"), actor, shareBps, maxShareBps);
            if (sentinelHardStop) {
                revert("Sentinel: single-actor drain exceeds threshold");
            }
        }
    }
}
