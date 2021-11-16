const VotingApp = artifacts.require("VotingApp");

module.exports = (deployer) => {
  let now = Date.now();
  deployer.deploy(VotingApp, "Test Voting", [("asd", "qwe")]);
};
