const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {
    ///// ETH/
    let bubbleBankFactory = await ethers.getContractFactory("BubbleBank");
    let bubbleBank = await bubbleBankFactory.deploy("0x2fBBfaa127Ea1Bd096e25b7158da916B7Eb648c7");
    await bubbleBank.deployed();
    console.log("bubbleBank: ", bubbleBank.address);
  /*
    {
        // Bubble contract
        let bubbleEthFactory = await ethers.getContractFactory("Bubbles_OLD_");
        let bubblesEth = await bubbleEthFactory.deploy();
        await bubblesEth.deployed();
        console.log("bubbleEth: ", bubblesEth.address);
        await waitFor(5000);

        // Axo contract
        let axoEthFactory = await ethers.getContractFactory("AxoTestNFT");
        let axoEth = await axoEthFactory.deploy();
        await axoEth.deployed();
        console.log("axoEth: ", axoEth.address);
        await waitFor(5000);

        // AxoBridge
        let axoBridgeEthFactory = await ethers.getContractFactory("AxoBridge");
        let axoBridgeEth = await axoBridgeEthFactory.deploy("0x79a63d6d8BBD5c6dfc774dA79bCcD948EAcb53FA", axoEth.address);
        await axoBridgeEth.deployed();
        console.log("axoBridgeEth: ", axoBridgeEth.address);
        await waitFor(5000);

        // bubbleBridge
        let bubbleBridgeEthFactory = await ethers.getContractFactory("BubbleBridgeEth");
        let bubbleBridgeEth = await bubbleBridgeEthFactory.deploy("0x79a63d6d8BBD5c6dfc774dA79bCcD948EAcb53FA", bubblesEth.address);
        await bubbleBridgeEth.deployed();
        console.log("bubbleBridge: ", bubbleBridgeEth.address);
        await waitFor(5000);
    }
*/
    ///// Arb
/*
    {
        // Bubble contract
        let bubbleArbFactory = await ethers.getContractFactory("Bubbles");
        let bubbleArb = await bubbleArbFactory.deploy();
        await bubbleArb.deployed();
        console.log("bubbleArb: ", bubbleArb.address);
        await waitFor(5000);

        // AxoArb
        let axoArbFactory = await ethers.getContractFactory("AxolittlesArb");
        let axoArb = await axoArbFactory.deploy("0x4D747149A57923Beb89f22E6B7B97f7D8c087A00");
        await axoArb.deployed();
        console.log("axoArb: ", axoArb.address);
        await waitFor(5000)

        // BubbleBridge
        let bubbleBridgeArbFactory = await ethers.getContractFactory("BubbleBridgeArb");
        let bubbleBridgeArb = await bubbleBridgeArbFactory.deploy("0x4D747149A57923Beb89f22E6B7B97f7D8c087A00", bubbleArb.address);
        await bubbleBridgeArb.deployed();
        console.log("bubbleBridgeArb: ", bubbleBridgeArb.address);
        await waitFor(5000);

        // Staking
        let stakingArbFactory = await ethers.getContractFactory("AxolittlesStaking");
        let stakingArb = await stakingArbFactory.deploy(axoArb.address, bubbleArb.address);
        await stakingArb.deployed();
        console.log("stakingArb: ", stakingArb.address);
    }
*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
