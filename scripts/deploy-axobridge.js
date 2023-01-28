// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {

    // const AxoTestNFT = await hre.ethers.getContractFactory(
    //     "AxoTestNFT"
    // );
    // const axotestnft = await AxoTestNFT.deploy();
    // await axotestnft.deployed();

    // console.log(
    //     "axotestnft:",
    //     axotestnft.address
    // );

    // const AxoBridge = await hre.ethers.getContractFactory("AxoBridge");
    // const axobridge = await AxoBridge.deploy("0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675");
    // await axobridge.deployed();
    // console.log("axobridge: ", axobridge.address);

    //await axobridge.setTrustedRemote(10011, "0xD9FB89c3f4456104130a97abDf2F756360660E0a");



    // await testnft.setApprovalForAll(axobridge.address, true);
    // const AxoArb = await hre.ethers.getContractFactory("AxolittlesArb");
    // const axoarb = await AxoArb.deploy("0x3c2269811836af69497E5F486A85D7316753cf62");
    // await axoarb.deployed();
    // console.log("axoarb: ", axoarb.address);

    /*--------------- test code ----------------*/

//  accounts = await hre.ethers.getSigners();

//     testnft = new ethers.Contract(
//         "0x14B6254fe94527FF1e4E2654ab7A9b6De52baFa7",
//         require("./ABI/TestNFTABI.json"),
//         accounts[0]
//     );
//     for (let i = 0; i < 20; i++)
//     {
//         testnft.mint();
//         await waitFor(10000);
//     }

    // axobridge = new ethers.Contract(
    //     "0xF25e24520f4E980e84888bb14b211B8a8ae4f015",
    //     require("./ABI/AxoBridgeABI.json"),
    //     accounts[0]
    // );

    // await axobridge.setTrustedRemote(10010, "0x1C57a8294626d8a3D73E7CC4F25E7464A53BdE4d");
    let x = 200000 + (75000 * 3);
    console.log(ethers.utils.solidityPack(['uint16', 'uint256'], [1, x]));


    // console.log(await testnft.ownerOf(0));
    // await axobridge.sendFrom(
    //     "0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639",
    //     10011,
    //     "0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639",
    //     [0],
    //     "0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639",
    //     hre.ethers.constants.AddressZero,
    //     "0x",
    //     {value: ethers.utils.parseEther(".05")});
    // console.log(await testnft.ownerOf(0));


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
