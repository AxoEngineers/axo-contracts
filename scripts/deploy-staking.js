// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { syncBuiltinESMExports } = require("module");
require("dotenv").config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const AxolittlesStaking = await hre.ethers.getContractFactory(
    "AxolittlesStaking"
  );
  const axolittlesstaking = await AxolittlesStaking.deploy(
    AXOLITTLES_ADDRESS,
    TOKEN_ADDRESS,
    "15000000000000000"
  );
  await axolittlesstaking.deployed();

  console.log("Staking Contract deployed to:", axolittlesstaking.address);
  await hre.run("verify:verify", {
    address: axolittlesstaking.address,
    constructorArguments: [
      process.env.AXOLITTLES_ADDRESS,
      process.env.TOKEN_ADDRESS,
      process.env.EMISSION_AMOUNT,
    ],
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
