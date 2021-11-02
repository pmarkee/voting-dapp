// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingApp is Ownable {
    string public name = "Voting App";

    struct RegisterPhase {
        uint256 startDate;
        uint256 endDate;
        address[] registered;
    }

    struct VotingPhase {
        uint256 startDate;
        uint256 endDate;
        address[] voted;
        mapping(string => uint256) numberOfVotes;
    }

    RegisterPhase registerPhase;
    VotingPhase votingPhase;

    string[] public choices;

    // TODO how to maket this argument list shorter?
    constructor(
        uint256 registerStart,
        uint256 registerEnd,
        uint256 votingStart,
        uint256 votingEnd,
        string[] memory _choices
    ) {
        // FIXME: this first require will more or less randomly pass
        // or fail because ganache sets all sorts of weird block timestamps.
        // require(
        //     registerStart > block.timestamp,
        //     "register cannot start in the past"
        // );
        require(
            registerStart < registerEnd,
            "register start date must be earlier than end date"
        );
        require(
            registerEnd <= votingStart,
            "register must end before voting begins"
        );
        require(
            votingStart < votingEnd,
            "voting start date must be earlier than end date"
        );
        require(_choices.length > 1, "there must be at least 2 choices");

        registerPhase.startDate = registerStart;
        registerPhase.endDate = registerEnd;
        votingPhase.startDate = votingStart;
        votingPhase.endDate = votingEnd;

        choices = _choices;
    }
}
