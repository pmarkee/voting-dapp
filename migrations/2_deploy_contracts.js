const VotingApp = artifacts.require("VotingApp");

module.exports = (deployer) => {
  deployer.deploy(VotingApp, "Test Voting", ["asd", "qwe"]);
};
