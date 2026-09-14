// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ExamplePool} from "../src/examples/ExamplePool.sol";

contract SentinelTest is Test {
    // Same name+signature as Sentinel.SentinelAlert. vm.expectEmit matches
    // logs by topic hash (derived from this signature), not by which
    // contract declared the event, so a local re-declaration works fine
    // here and avoids Solidity's cross-contract event-reference syntax.
    event SentinelAlert(
        bytes32 indexed kind,
        address indexed actor,
        uint256 observed,
        uint256 threshold
    );

    ExamplePool pool;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        pool = new ExamplePool();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function test_normalDepositAndWithdraw_noAlert() public {
        vm.prank(alice);
        pool.deposit{value: 10 ether}();

        vm.prank(alice);
        pool.withdraw(1 ether); // 10% of pool, under both thresholds

        assertEq(pool.totalPool(), 9 ether);
    }

    function test_singleActorDrain_emitsAlert() public {
        vm.prank(alice);
        pool.deposit{value: 10 ether}();
        vm.prank(bob);
        pool.deposit{value: 10 ether}();

        // alice withdraws 40% of the 20 ether pool in one call -> over 30% threshold
        vm.expectEmit(true, true, false, true);
        emit SentinelAlert(bytes32("SINGLE_ACTOR_DRAIN"), alice, 4_000, 3_000);

        vm.prank(alice);
        pool.withdraw(8 ether);
    }
}
