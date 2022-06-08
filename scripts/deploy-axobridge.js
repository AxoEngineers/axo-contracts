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
    // const axobridge = await AxoBridge.deploy("0x79a63d6d8BBD5c6dfc774dA79bCcD948EAcb53FA");
    // await axobridge.deployed();
    // console.log("axobridge: ", axobridge.address);

    // await axobridge.setTrustedRemote(10011, "0xD9FB89c3f4456104130a97abDf2F756360660E0a");



    // await testnft.setApprovalForAll(axobridge.address, true);
    // const AxoArb = await hre.ethers.getContractFactory("AxolittlesArb");
    // const axoarb = await AxoArb.deploy("0x4D747149A57923Beb89f22E6B7B97f7D8c087A00");
    // await axoarb.deployed();
    // console.log("axoarb: ", axoarb.address);

    /*--------------- test code ----------------*/

    // await hre.network.provider.request({
    //     method: "hardhat_impersonateAccount",
    //     params: ["0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639"],
    // });
    // ori = await ethers.getSigner(
    //     "0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639"
    // );

    // testnft = new ethers.Contract(
    //     "0x14B6254fe94527FF1e4E2654ab7A9b6De52baFa7",
    //     require("./ABI/TestNFTABI.json"),
    //     ori
    // );

    // axobridge = new ethers.Contract(
    //     "0x435885c918450049C2d6d14D51B47A341a26fAad",
    //     require("./ABI/AxoBridgeABI.json"),
    //     ori
    // );

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
