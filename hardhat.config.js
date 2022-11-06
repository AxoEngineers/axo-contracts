require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("hardhat-gas-reporter");

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // forking: {
            //     url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            //     blockNumber: 11192702,
            //     enabled: true,
            // },
        },
        ethereum: {
            url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ETHEREUM_PROJECT_ID}`,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
        },
        arbitrum: {
            url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARBITRUM_PROJECT_ID}`,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
        },
        goleri: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOLERI_PROJECT_ID}`,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
        }
    },
    solidity: {
        version: "0.8.10",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        token: "ETH",
        gasPrice: 120,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
};
