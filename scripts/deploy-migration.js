// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MigrationReward = await hre.ethers.getContractFactory(
    "MigrationReward"
  );
  const migrationreward = await MigrationReward.deploy(
    process.env.TOKEN_ADDRESS
  );
  await migrationreward.deployed();

  console.log("Migration Contract deployed to:", migrationreward.address);
  await hre.run("verify:verify", {
    address: migrationreward.address,
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