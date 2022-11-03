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
    ///// ETH/
    // let bubbleBankFactory = await ethers.getContractFactory("BubbleBank");
    // let bubbleBank = await bubbleBankFactory.deploy("0x2fBBfaa127Ea1Bd096e25b7158da916B7Eb648c7");
    // await bubbleBank.deployed();
    // console.log("bubbleBank: ", bubbleBank.address);

    {
        // // Bubble contract
        // let bubbleEthFactory = await ethers.getContractFactory("Bubbles_OLD_");
        // let bubblesEth = await bubbleEthFactory.deploy();
        // await bubblesEth.deployed();
        // console.log("bubbleEth: ", bubblesEth.address);
        // await waitFor(5000);

        // // Axo contract
        // let axoEthFactory = await ethers.getContractFactory("AxoTestNFT");
        // let axoEth = await axoEthFactory.deploy();
        // await axoEth.deployed();
        // console.log("axoEth: ", axoEth.address);
        // await waitFor(5000);

        // // AxoBridge
        // let axoBridgeEthFactory = await ethers.getContractFactory("AxoBridge");
        // let axoBridgeEth = await axoBridgeEthFactory.deploy("0x79a63d6d8BBD5c6dfc774dA79bCcD948EAcb53FA", axoEth.address);
        // await axoBridgeEth.deployed();
        // console.log("axoBridgeEth: ", axoBridgeEth.address);
        // await waitFor(5000);

        // bubbleBridge
        let bubbleBridgeEthFactory = await ethers.getContractFactory("BubbleBridgeEth");
        let bubbleBridgeEth = await bubbleBridgeEthFactory.deploy("0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675", "0x58f46f627c88a3b217abc80563b9a726abb873ba");
        await bubbleBridgeEth.deployed();
        console.log("bubbleBridge: ", bubbleBridgeEth.address);
        await waitFor(5000);
    }

    ///// Arb

    {
        // Bubble contract
        // let bubbleArbFactory = await ethers.getContractFactory("Bubbles");
        // let bubbleArb = await bubbleArbFactory.deploy();
        // await bubbleArb.deployed();
        // console.log("bubbleArb: ", bubbleArb.address);
        // await waitFor(5000);

        // // AxoArb
        // let axoArbFactory = await ethers.getContractFactory("AxolittlesArb");
        // let axoArb = await axoArbFactory.deploy("0x4D747149A57923Beb89f22E6B7B97f7D8c087A00");
        // await axoArb.deployed();
        // console.log("axoArb: ", axoArb.address);
        // await waitFor(5000)

        // // BubbleBridge
        // let bubbleBridgeArbFactory = await ethers.getContractFactory("BubbleBridgeArb");
        // let bubbleBridgeArb = await bubbleBridgeArbFactory.deploy("0x3c2269811836af69497E5F486A85D7316753cf62", "0xBB113ad1B7C4615CcF59A5D8A4062335038D6ee5");
        // await bubbleBridgeArb.deployed();
        // console.log("bubbleBridgeArb: ", bubbleBridgeArb.address);
        // await waitFor(5000);

        // // Staking
        // let stakingArbFactory = await ethers.getContractFactory("AxolittlesStaking");
        // let stakingArb = await stakingArbFactory.deploy("0xcc737e05a6b5d94cafa523e55c5689631c8e97a4", bubbleArb.address);
        // await stakingArb.deployed();
        // console.log("stakingArb: ", stakingArb.address);
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
