const VotingApp = artifacts.require("VotingApp");

module.exports = (deployer) => {
  deployer.deploy(
    VotingApp,
    new Date("2021-11-10").getTime(),
    new Date("2021-11-12").getTime(),
    new Date("2021-11-14").getTime(),
    new Date("2021-11-16").getTime(),
    ["asd", "qwe"]
  );
};
