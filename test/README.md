# Contract Tests

## To run the Airdrop Migration tests

-   In a console, run a local node:
    `$ npx hardhat node --fork https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`

-   Add .only on the airdrop test's `describe`
    `describe.only("Test Bubbles Airdrop", function () {`

-   Execute the test in a separate console:
    `$ npx hardhat test --network localhost`

## To run the Airdrop Migration tests

-   In a console, run a local node:
    `$ npx hardhat node --fork https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`

-   Add .only on the airdrop test's `describe`
    `describe.only("Test Bubbles Airdrop", function () {`

-   Execute the test in a separate console:
    `$ npx hardhat test --network localhost`

## About Airdrop Migrations test

-   You can enable/disable verbose logging by setting `c_verboseLogging`.
-   All logging should be wrapped in braces so they can be collapsed for easy reading.

### Example input for createMerkleTree()

```
merkleTreeDB = [
    {
        address: accounts[10].address,
        balance: 10,
    },
    {
        address: accounts[11].address,
        balance: 11,
    },
    {
        address: accounts[12].address,
        balance: 12,
    },
    {
        address: accounts[13].address,
        balance: 13,
    },
];
```

### Example input for generateCallerProof:

```
caller = {
    address: accounts[10].address,
    balance: 10,
}
```
