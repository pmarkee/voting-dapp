// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingApp is Ownable {
    string public name = "Voting App";

    enum Stage {
        INITIAL,
        REGISTER,
        VOTING,
        END
    }

    string public title;
    string[] public choices;
    Stage public currentStage;

    mapping(address => bool) private isRegistered;
    mapping(address => bool) private hasVoted;
    uint256[] numberOfVotes;

    constructor(string memory _title, string[] memory _choices) {
        title = _title;
        choices = _choices;
        currentStage = Stage.INITIAL;
        populateNumberOfVotes();
    }

    modifier registeredMustEqual(bool mustBeRegistered) {
        require(isRegistered[msg.sender] == mustBeRegistered);
        _;
    }

    modifier votedMustEqual(bool mustHaveVoted) {
        require(hasVoted[msg.sender] == mustHaveVoted);
        _;
    }

    modifier onlyInStage(Stage stage) {
        require(currentStage == stage, "Invalid stage for requested operation");
        _;
    }

    function setStage(uint8 stage) external onlyOwner {
        // FOR TESTING PURPOSES ONLY
        // TODO how to ensure it's not used any other time?
        // Or how else to solve it? Using startNextStage and resetToStage
        // for misc operations is ugly in testing
        require(
            stage >= uint8(Stage.INITIAL) && stage <= uint8(Stage.END),
            "stage out of range"
        );
        currentStage = Stage(stage);
    }

    function advance() external onlyOwner {
        require(currentStage != Stage.END, "Already reached end stage");

        if (currentStage == Stage.INITIAL) {
            currentStage = Stage.REGISTER;
        } else if (currentStage == Stage.REGISTER) {
            currentStage = Stage.VOTING;
        } else {
            currentStage = Stage.END;
        }
    }

    function resetToStage(uint8 stage) external onlyOwner {
        require(
            uint256(currentStage) > stage,
            "Resetting is only possible to an earlier stage"
        );
        currentStage = Stage(stage);
    }

    function register()
        external
        registeredMustEqual(false)
        onlyInStage(Stage.REGISTER)
    {
        isRegistered[msg.sender] = true;
    }

    function unregister()
        external
        registeredMustEqual(true)
        onlyInStage(Stage.REGISTER)
    {
        isRegistered[msg.sender] = false;
    }

    function vote(uint256 choice)
        external
        registeredMustEqual(true)
        onlyInStage(Stage.VOTING)
        votedMustEqual(false)
    {
        hasVoted[msg.sender] = true;
        numberOfVotes[choice]++;
    }

    function haveIVoted()
        external
        view
        registeredMustEqual(true)
        returns (bool)
    {
        return hasVoted[msg.sender];
    }

    function amIRegistered() external view returns (bool) {
        return isRegistered[msg.sender];
    }

    function getResults()
        external
        view
        onlyInStage(Stage.END)
        returns (uint256[] memory)
    {
        return numberOfVotes;
    }

    function populateNumberOfVotes()
        private
        onlyOwner
        onlyInStage(Stage.INITIAL)
    {
        numberOfVotes = new uint256[](choices.length);
        for (uint256 i = 0; i < choices.length; i++) {
            numberOfVotes[i] = 0;
        }
    }
}
