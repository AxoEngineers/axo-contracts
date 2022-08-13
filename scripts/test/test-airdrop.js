// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {
    accounts = await hre.ethers.getSigners();

        await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639"],
    });
    ori = await ethers.getSigner(
        "0xa1aed6f3B7C8F871b4Ac27144ADE9fDa6fBCD639"
    );

    airdrop = new ethers.Contract(
        "0x184FAe65b0D0bBbA559326FEb7D9FCC6e8f31df7",
        require("../ABI/AirdropABI.json"),
        ori
    );

    await airdrop.claimAirdrop("2924685000000000294912", ["0x6d9dcb4c1e7fd00d350a860f17edaf012ce03e7ce8f02988abed2f9281f7dd01", "0xcf63ccacbb9c54ffec89e883e01c1a6c5ef0499b4511841d82d73dba8e131985", "0x8967ad6f71c122cf7786397084b55425ef45b93d49e09aedcab86d4531f10351", "0x001db33006610e43ef7dce862fb7b491aab076a63031bb0475fe9fa566e03264", "0xc2599fafb6138fb32afff5c71acd023d897925c661889744566b1e454302d807", "0x46834509cf9dbfb7bf0ee4f924f7069fddf47f52d9932118200d65b2f6417331", "0xdf6af6bd465617b652bf91e1b685fd125acd71c1c724d8d115503406841e4f8f", "0xf99edd41ac13295f9136d654b51a0244456435ee8d248ef75fea982715a2b90d", "0xc5fa8ad23c376d51e05de59262d9a26bdcdd278c78a506e044b8be8c7264746c", "0xaaf810f6761e693787af951d82b942ad85f3c5cda2f65a1df900ecf3afe7d662", "0xfe4613e135b62e4266359c175d30538f8bfbc30e499f24989c3eeaffbbc065b7", "0xd61d26b69ba775397f173b8b3cd5dbcc1072e5cfed255c701fdcc2fc05d5a9a0", "0xcc19eb39d6a81cbad12c48baf1ceaa270f89c5245d7ad46ee35d81e5ba52ccac"]);



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
