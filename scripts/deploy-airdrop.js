// Script to deploy airdrop contract

const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {
    // We get the contract to deploy
    const BubblesAirdrop = await hre.ethers.getContractFactory(
        "BubblesAirdrop"
    );
    const bubblesairdrop = await BubblesAirdrop.deploy(
        process.env.TOKEN_ADDRESS
    );
    await bubblesairdrop.deployed();

    console.log(
        "Bubbles Airdrop Contract deployed to:",
        bubblesairdrop.address
    );
    await waitFor(30000);
    await hre.run("verify:verify", {
        address: bubblesairdrop.address,
        constructorArguments: [process.env.TOKEN_ADDRESS],
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
