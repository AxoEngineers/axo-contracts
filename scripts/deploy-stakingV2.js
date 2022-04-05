// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const AxolittlesStakingV2 = await hre.ethers.getContractFactory(
        "AxolittlesStakingV2"
    );
    const axolittlesstakingv2 = await AxolittlesStakingV2.deploy();
    await axolittlesstakingv2.deployed();

    console.log("Staking Contract deployed to:", axolittlesstakingv2.address);
    //timeout so etherscan can load
    await waitFor(30000);
    await hre.run("verify:verify", {
        address: axolittlesstakingv2.address,
        constructorArguments: [],
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
