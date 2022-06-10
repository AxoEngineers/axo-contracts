require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("hardhat-gas-reporter");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                blockNumber: 10813699,
                enabled: true,
            },
        },
        live: {
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
        },
        // ftmTestnet: {
        //     url: `https://rpc.testnet.fantom.network`,
        //     accounts: [process.env.TESTER_PRIVATE_KEY],
        // },
        arbitrum : {
            url: `https://arb-mainnet.g.alchemy.com/v2/m-Io_rcSWMqv9A52_dQfkBYHo8EV_HUC`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
        },
        rinkArby: {
            url: `https://arb-rinkeby.g.alchemy.com/v2/${process.env.ARB_RINKEBY_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
        },
        // l1: {
        //     gas: 2100000,
        //     gasLimit: 0,
        //     url: process.env["L1RPC"] || "",
        //     accounts: process.env["TESTER_PRIVATE_KEY"]
        // },
        // l2: {
        //     url: process.env["L2RPC"] || "",
        //     accounts: process.env["TESTER_PRIVATE_KEY"]
        // },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            ftmTestnet: process.env.FTMSCAN_API_KEY,
            rinkeby: process.env.ETHERSCAN_API_KEY,
            arbitrumOne: process.env.ARBISCAN_API_KEY,
            arbitrumTestnet: process.env.ARBISCAN_API_KEY,
        },
    },
    solidity: {
        version: "0.8.10",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    gasReporter: {
        currency: "USD",
        token: "ETH",
        gasPrice: 120,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
};
