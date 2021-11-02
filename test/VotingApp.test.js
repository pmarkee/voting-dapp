const { assert } = require("chai");

const VotingApp = artifacts.require("VotingApp");

require("chai").use(require("chai-as-promised")).should();

contract("VotingApp", () => {
  let votingApp;
  let now;

  before(async () => {
    now = Date.now();
    votingApp = await VotingApp.new(
      now + 60,
      now + 2 * 60,
      now + 3 * 60,
      now + 4 * 60,
      ["Choice 1", "Choice 2"]
    ).should.be.fulfilled;
  });

  describe("VotingApp deployment", async () => {
    it("constructs correctly", async () => {
      // TODO construction really needs to be rethough, it's so ugly to test all these
      // variations one by one. The number of cases grows exponentially with added params.

      // Register phase begins in the past
      // FIXME this cannot be tested for now because ganache sets weird
      // block timestamps.
      // await VotingApp.new(now - 60000, now, now + 60000, now + 2 * 60000, [
      //   "Choice 1",
      //   "Choice 2",
      // ]).should.be.rejected;

      // Register phase ends before it begins
      await VotingApp.new(now + 60000, now, now + 2 * 60000, now + 3 * 60000, [
        "Choice 1",
        "Choice 2",
      ]).should.be.rejected;

      // Register does not end before voting begins
      await VotingApp.new(
        now + 60000,
        now + 2 * 60000,
        now + 90000,
        now + 3 * 60000,
        ["Choice 1", "Choice 2"]
      ).should.be.rejected;

      // Voting ends before it begins
      await VotingApp.new(
        now + 60000,
        now + 2 * 60000,
        now + 4 * 60000,
        now + 3 * 60000,
        ["Choice 1", "Choice 2"]
      ).should.be.rejected;

      // Not enough choices
      await VotingApp.new(
        now + 60000,
        now + 2 * 60000,
        now + 3 * 60000,
        now + 4 * 60000,
        ["Choice 1"]
      ).should.be.rejected;

      await VotingApp.new(
        now + 60000,
        now + 2 * 60000,
        now + 3 * 60000,
        now + 4 * 60000,
        []
      ).should.be.rejected;
    });

    it("has the correct name", async () => {
      const name = await votingApp.name();
      assert.equal(name, "Voting App");
    });
  });
});
