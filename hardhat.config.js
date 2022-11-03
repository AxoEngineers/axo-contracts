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
            // forking: {
            //     url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOLERI_PROJECT_ID}`,
            //     enabled: true,
            // },
          },
          goleri: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOLERI_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
          },
          arbGoleri: {
            url: `https://arb-goerli.g.alchemy.com/v2/${process.env.ARB_GOLERI_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
          },
          optimism: {
            url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.OPTIMISM_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
          },
          arbitrum: {
            url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARBITRUM_PROJECT_ID}`,
            accounts: [process.env.TESTER_PRIVATE_KEY],
          },
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
                runs: 200,
            },
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        token: "ETH",
        gasPrice: 120,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
};
