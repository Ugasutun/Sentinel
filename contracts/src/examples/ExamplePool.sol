// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Sentinel} from "../Sentinel.sol";

/// @title ExamplePool
/// @notice Minimal pool contract showing how to wire Sentinel checks into
///         withdrawal logic. Not production code — just illustrates the
///         integration pattern for `_checkTvlDrop` and `_checkSingleActorDrain`.
contract ExamplePool is Sentinel {
    mapping(address => uint256) public balances;
    uint256 public totalPool;

    uint256 public constant MAX_TVL_DROP_BPS = 2_000; // 20%
    uint256 public constant MAX_ACTOR_SHARE_BPS = 3_000; // 30%

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        totalPool += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");

        uint256 before = totalPool;

        _checkSingleActorDrain(msg.sender, amount, totalPool, MAX_ACTOR_SHARE_BPS);

        balances[msg.sender] -= amount;
        totalPool -= amount;

        _checkTvlDrop(before, totalPool, MAX_TVL_DROP_BPS);

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }
}
