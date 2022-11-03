// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { makeInterfaceId } = require("@openzeppelin/test-helpers");
const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const myJson = require('./csvjson.json')



async function main() {
    accounts = await hre.ethers.getSigners();

    axos = new ethers.Contract(
        "0xBcdaB29129534f5cfCD54Fd2f6e489026Bd88e9E",
        require("./ABI/SeasonalAxo.json"),
        accounts[0]
    );

//     const SeasonalAxos = await hre.ethers.getContractFactory("SeasonalAxolittles");
//     const axos = await SeasonalAxos.deploy();
//     await axos.deployed();
//     console.log("Seasonal contract deployed to:", axos.address);

//    await axos.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", accounts[0].address)
   let x = 0;
   for (let k of myJson) {
        if (k.axos == 1) {
            await axos.mint(k.address, k.tokens, k.amount, "0x");
        } else {
            await axos.mintBatch(k.address, k.tokens, k.amount, "0x");
        }
        console.log(x + " SUCCESS: ", k.address);
        x++;
        await waitFor(10000);
    }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
