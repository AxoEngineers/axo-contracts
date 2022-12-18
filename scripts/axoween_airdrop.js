// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require("dotenv").config();
const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {
    // read in snapshot csv
    let snapshot = require("./snapshot.json");

    // read in reserve csv
    let claim = require("./claim.json");

    // calculate total axos per user
    let i = 0;
    claim.forEach(element => {
        snapshot.forEach(obj => {
            if (obj.address == element.claimed) {
                let total = obj.n_arbi_axos+obj.n_axos_staked_arbitrum+obj.n_axos_staked_v1+obj.n_axos_staked_v2+obj.n_eth_axos;
                claim[i].count = total;
                return;
            }
        })
        i++
    });

    // airdrop
    // 11, 12, 13, 14, 15, 16, 17, 18 19
    let m = 0;
    claim.forEach(element => {
        let num = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        let k = 0;
        for(let j = 0; j<element.count && j < 90; j++){
            if (k == 9) { k = 0 }

            num[k]++;
            k++;
        }
        claim[m].tokens = num;
        m++;
    })

    // airdrop

    // await hre.network.provider.request({
    //     method: "hardhat_impersonateAccount",
    //     params: ["0xB798D630Fc71004d863bf3b3CCD1f70B6CA919f1"],
    // });
    // ori = await ethers.getSigner(
    //     "0xB798D630Fc71004d863bf3b3CCD1f70B6CA919f1"
    // );
    let accounts = await ethers.getSigners();
    airdrop = new ethers.Contract(
        "0xBcdaB29129534f5cfCD54Fd2f6e489026Bd88e9E",
        require("./ABI/SeasonalAxos.json"),
        accounts[0]
    );

    for (let i = 0; i < claim.length; i++ ){
        console.log("minting: " + claim[i].claimed + " for: ", claim[i].tokens)
        await airdrop.mintBatch(claim[i].claimed, [11,12,13,14,15,16,17,18,19], claim[i].tokens, "0x");
        await waitFor(5000);
        
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
