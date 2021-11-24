const { assert } = require("chai");

const VotingApp = artifacts.require("VotingApp");

require("chai").use(require("chai-as-promised")).should();

contract("VotingApp", ([owner, user, other_user]) => {
  const Stage = {
    INITIAL: 0,
    REGISTER: 1,
    VOTING: 2,
    END: 3,
  };
  const CHOICE = {
    Choice_1: 0,
    Choice_2: 1,
  };
  const TEST_TITLE = "Test Voting";
  let votingApp;

  before(async () => {
    votingApp = await VotingApp.new(TEST_TITLE, [
      CHOICE.Choice_1,
      CHOICE.Choice_2,
    ]);
  });

  describe("Deployment", async () => {
    it("has the correct name", async () => {
      const name = await votingApp.name();
      assert.equal(name, "Voting App");
    });

    it("has the correct title", async () => {
      const title = await votingApp.title();
      assert.equal(title, TEST_TITLE);
    });
  });

  describe("Stages", async () => {
    describe("Construction", async () => {
      it("starts in initial stage", async () => {
        const currentStage = await votingApp.currentStage();
        assert.equal(currentStage, Stage.INITIAL);
      });
    });

    // TODO is it necessary to test for every possible transition in these tests?
    // I.e. every combo of from -> to and owner vs non-owner
    describe("Resetting", async () => {
      beforeEach(async () => {
        await votingApp.setStage(Stage.VOTING);
      });

      it("owner can reset to previous stages", async () => {
        await votingApp.resetToStage(Stage.INITIAL, { from: owner });
        assert.equal(await votingApp.currentStage(), Stage.INITIAL);
      });

      it("non-owner cannot reset", async () => {
        await votingApp.resetToStage(Stage.INITIAL, { from: user }).should.be
          .rejected;
        assert.equal(await votingApp.currentStage(), Stage.VOTING);
      });

      it("nobody can reset to current or next stages", async () => {
        await votingApp.resetToStage(Stage.VOTING, { from: owner }).should.be
          .rejected;
        await votingApp.resetToStage(Stage.END, { from: owner }).should.be
          .rejected;
      });
    });

    // TODO is it necessary to test for every possible transition in these tests?
    // I.e. every combo of from -> to and owner vs non-owner
    describe("Advancing", async () => {
      beforeEach(async () => {
        await votingApp.resetToStage(Stage.INITIAL);
      });

      it("owner can advance in the correct order", async () => {
        await votingApp.advance({ from: owner });
        assert.equal(await votingApp.currentStage(), Stage.REGISTER);

        await votingApp.advance({ from: owner });
        assert.equal(await votingApp.currentStage(), Stage.VOTING);

        await votingApp.advance({ from: owner });
        assert.equal(await votingApp.currentStage(), Stage.END);

        await votingApp.advance({ from: owner }).should.be.rejected;
      });

      it("non-owner can not advance", async () => {
        await votingApp.advance({ from: user }).should.be.rejected;
        assert.equal(await votingApp.currentStage(), Stage.INITIAL);
      });
    });
  });

  describe("Register", async () => {
    describe("During register stage", async () => {
      before(async () => {
        await votingApp.setStage(Stage.REGISTER);
      });

      describe("Non-registered users", async () => {
        it("can register", async () => {
          await votingApp.register({ from: user });
          assert.equal(await votingApp.amIRegistered({ from: user }), true);
        });

        it("cannot unregister", async () => {
          await votingApp.unregister({ from: user });
          await votingApp.unregister({ from: user }).should.be.rejected;
        });
      });

      describe("Registed users", async () => {
        it("cannot register again", async () => {
          await votingApp.register({ from: user });
          await votingApp.register({ from: user }).should.be.rejected;
        });

        it("can unregister", async () => {
          await votingApp.unregister({ from: user });
          assert.equal(await votingApp.amIRegistered({ from: user }), false);
        });
      });
    });

    describe("During non-register stage", async () => {
      before(async () => {
        await votingApp.setStage(Stage.INITIAL);
      });

      it("users can not register during non-register stage", async () => {
        await votingApp.register({ from: user }).should.be.rejected;
      });

      it("users can not unregister during non-register stage", async () => {
        await votingApp.register({ from: user }).should.be.rejected;
      });
    });
  });

  describe("Voting", async () => {
    describe("During voting stage", async () => {
      before(async () => {
        await votingApp.setStage(Stage.REGISTER);

        const isRegistered = await votingApp.amIRegistered({ from: user });
        if (isRegistered) {
          await votingApp.unregister({ from: user });
        }

        await votingApp.register({ from: user });
        await votingApp.advance({ from: owner });
      });

      it("registered users can vote", async () => {
        await votingApp.vote(CHOICE.Choice_1, { from: user }).should.be
          .fulfilled;
      });

      it("users who have already voted cannot vote", async () => {
        const hasVoted = await votingApp.haveIVoted({ from: user });
        if (!hasVoted) {
          await votingApp.vote(CHOICE.Choice_1, { from: user });
        }

        await votingApp.vote(CHOICE.Choice_1, { from: user }).should.be
          .rejected;
      });

      it("non-registered users cannot vote", async () => {
        await votingApp.vote(CHOICE.Choice_1, { from: other_user }).should.be
          .rejected;
      });
    });

    describe("During non-voting stage", async () => {
      before(async () => {
        await votingApp.setStage(Stage.INITIAL, { from: owner });
      });

      it("voting is disabled", async () => {
        await votingApp.vote(CHOICE.Choice_1, { from: user }).should.be
          .rejected;
      });
    });
  });
});
