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
                url: process.env.ALCHEMY_RPC,
                blockNumber: 14135835,
                enabled: true,
            },
        },
        live: {
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: [process.env.AC019_PRIVATE_KEY],
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
        },
        ftmTestnet: {
            url: `https://rpc.testnet.fantom.network`,
            accounts: [process.env.AC019_PRIVATE_KEY],
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            ftmTestnet: process.env.FTMSCAN_API_KEY,
            rinkeby: process.env.ETHERSCAN_API_KEY,
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
