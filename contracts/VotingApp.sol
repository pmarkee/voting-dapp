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

    mapping(address => bool) isRegistered;
    mapping(address => bool) hasVoted;
    mapping(string => uint256) numberOfVotes;

    constructor(string memory _title, string[] memory _choices) {
        title = _title;
        choices = _choices;
        populateNumberOfVotes();
        currentStage = Stage.INITIAL;
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

    function register() external {
        require(
            currentStage == Stage.REGISTER,
            currentStage == Stage.INITIAL
                ? "Registering has not started yet"
                : "Registering has already ended"
        );
        require(!isRegistered[msg.sender], "Already registered");
        isRegistered[msg.sender] = true;
    }

    function unregister() external {
        require(
            currentStage == Stage.REGISTER,
            "Registering has already ended"
        );
        require(isRegistered[msg.sender], "Not registered");
        isRegistered[msg.sender] = false;
    }

    function amIRegistered() external view returns (bool) {
        return isRegistered[msg.sender];
    }

    modifier onlyRegistered() {
        require(isRegistered[msg.sender]);
        _;
    }

    function populateNumberOfVotes() private {
        for (uint256 i = 0; i < choices.length; i++) {
            numberOfVotes[choices[i]] = 0;
        }
    }
}
