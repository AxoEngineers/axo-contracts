# Axolittles Contracts

## Description

Repository contains the current implementation of axolittles contracts and backups of the legacy axolittles contracts.
May merge later with other parts of axolittles codebase.

### Axolittles contracts:

-   Main NFT contract
-   Staking contract
-   Bubbles contract

### Existing Contracts:

-   [Axolittles main](https://etherscan.io/address/0xf36446105ff682999a442b003f2224bcb3d82067)
-   [Bubbles](https://etherscan.io/address/0x58f46f627c88a3b217abc80563b9a726abb873ba)
-   [Axolittles Staking](https://etherscan.io/address/0x1ca6e4643062e67ccd555fb4f64bee603340e0ea)

## Installation

```
git clone https://github.com/ac019/axo-contracts.git
cd axo-contracts
npm install
```

Default network set as rinkeby (eth) testnet.

To specify network: --network "network here"

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/deploy-main.js
node scripts/deploy-staking.js
npx hardhat help
```

## Issues

[Issue Tracker](https://github.com/axoengineers/axo-contracts/issues)
