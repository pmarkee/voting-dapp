# Voting Dapp

This is a learning project to learn about the Ethereum blockchain, the Solidity programming language and the Truffle framework.

## What does it do?

It lets you create an anonymous poll with as many options as you like.

## How does it work?

The poll consists of 4 stages:
- initial: at this point the poll has been created but nothing can be done with it yet.
- register: in this phase users are allowed to register.
- voting: this is where registered users can cast their vote.
- end: voting has ended and the results can now be accessed.

The owner of the contract can advance these stages one by one. There is no built-in mechanism as to how this happens since writing datetime-aware code is kinda difficult in Solidity and even more so to test it. (Why? Because the only way to get any sort of datetime value in Solidity is either by using a block time which is kinda wonky, especially in development environments, or by passing it manually from the calling side.) So this is left to you, you can just call the contract manually to advance it or you can write some sort of script with web3.js to automate it, or modify the contract itself.

For available contract calls and their documentation, see `VotingApp.sol`.

## Step by step

0. Install local development environment.
    - node
    - yarn
    - truffle
    - some sort of code editor, a simple one will do
    - optional: Ganache if you want to use a local blockchain
1. `git clone https://github.com/pmarkee/voting-dapp`
2. `cd voting-dapp`
3. `yarn install`
4. `truffle compile` to make sure it compiles
    - Optional: `truffle test` to make sure everything works
5. Edit `migrations/2_deploy_contracts.js` with the poll name and choices you want.
6. `truffle migrate` to deploy.
7. Enjoy
