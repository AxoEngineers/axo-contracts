const { BigNumber, providers, Wallet } = require("ethers");
const {
    getL2Network,
    Erc20Bridger,
    L1ToL2MessageStatus,
} = require("@arbitrum/sdk");
const { arbLog, requireEnvVariables } = require("arb-shared-dependencies");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { readFileSync } = require("fs");
const { Console } = require("console");
require("dotenv").config();
requireEnvVariables(["DEVNET_PRIVKEY", "L1RPC", "L2RPC"]);

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.DEVNET_PRIVKEY;
// rinkeby (eth) bubbles contract address
const l1BubblesAddress = "0x6CD50AbC7861605dCE86241e1e174DA82190987f";

const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC);
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC);

const l1Wallet = new Wallet(walletPrivateKey, l1Provider);
const l2Wallet = new Wallet(walletPrivateKey, l2Provider);

/**
 * Set the amount of token to be transferred to L2
 */
const tokenDepositAmount = BigNumber.from(500000);
const tokenWithdrawAmount = BigNumber.from(200000);

const main = async () => {
    console.log("Deposit then withdraw bubbles to/from Arbitrum");
    // set up L1 / L2 bubbles contract objects
    const bubblesJSON = JSON.parse(readFileSync(`./abi/Bubbles.json`));
    l1Bubbles = new ethers.Contract(l1BubblesAddress, bubblesJSON, l1Provider);
    l2Bubbles = new ethers.Contract(l1BubblesAddress, bubblesJSON, l2Provider);
    /**
     * Use l2Network to create an Arbitrum SDK Erc20Bridger instance
     * We'll use Erc20Bridger for its convenience methods around transferring token to L2
     */
    const l2Network = await getL2Network(l2Provider);
    const erc20Bridge = new Erc20Bridger(l2Network);

    // addresses of bubbles address on both L1 and L2
    const l1erc20Address = l1Bubbles.address;

    /**
     * We get the address of L1 Gateway for our DappToken, which later helps us to get the initial token balance of Bridge (before deposit)
     */
    const expectedL1GatewayAddress = await erc20Bridge.getL1GatewayAddress(
        l1erc20Address,
        l1Provider
    );
    const initialBridgeTokenBalance = await l1Bubbles.balanceOf(
        expectedL1GatewayAddress
    );

    /**
     * The Standard Gateway contract will ultimately be making the token transfer call; thus, that's the contract we need to approve.
     * erc20Bridge.approveToken handles this approval
     * Arguments required are:
     * (1) l1Signer: The L1 address transferring token to L2
     * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
     */
    const approveTx = await erc20Bridge.approveToken({
        l1Signer: l1Wallet,
        erc20L1Address: l1erc20Address,
    });

    const approveRec = await approveTx.wait();
    console.log(
        `You successfully allowed the Arbitrum Bridge to spend DappToken ${approveRec.transactionHash}`
    );

    /**
     * Deposit DappToken to L2 using erc20Bridge. This will escrow funds in the Gateway contract on L1, and send a message to mint tokens on L2.
     * The erc20Bridge.deposit method handles computing the necessary fees for automatic-execution of retryable tickets — maxSubmission cost & l2 gas price * gas — and will automatically forward the fees to L2 as callvalue
     * Also note that since this is the first DappToken deposit onto L2, a standard Arb ERC20 contract will automatically be deployed.
     * Arguments required are:
     * (1) amount: The amount of tokens to be transferred to L2
     * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
     * (2) l1Signer: The L1 address transferring token to L2
     * (3) l2Provider: An l2 provider
     */

    const depositTx = await erc20Bridge.deposit({
        amount: tokenDepositAmount,
        erc20L1Address: l1erc20Address,
        l1Signer: l1Wallet,
        l2Provider: l2Provider,
    });

    // Now we wait for L1 and L2 side of transactions to be confirmed

    console.log(
        `Deposit initiated: waiting for L2 retryable (takes < 10 minutes; current time: ${new Date().toTimeString()}) `
    );
    const depositRec = await depositTx.wait();
    const l2Result = await depositRec.waitForL2(l2Provider);
    console.log(`Bubbles L1 -> L2 bridge complete`);

    // The `complete` boolean tells us if the l1 to l2 message was successul

    l2Result.complete
        ? console.log(
              `L2 message successful: status: ${
                  L1ToL2MessageStatus[l2Result.status]
              }`
          )
        : console.log(
              `L2 message failed: status ${
                  L1ToL2MessageStatus[l2Result.status]
              }`
          );

    // Get the Bridge token balance

    const finalBridgeTokenBalance = await l1Bubbles.balanceOf(
        expectedL1GatewayAddress
    );
    console.log("Bubbles l1 bridge balance: ", finalBridgeTokenBalance);

    // Check if Bridge balance has been updated correctly

    expect(
        initialBridgeTokenBalance
            .add(tokenDepositAmount)
            .eq(finalBridgeTokenBalance),
        "bridge balance not updated after L1 token deposit txn"
    ).to.be.true;

    //   Check if our l2Wallet DappToken balance has been updated correctly
    //   To do so, we use erc20Bridge to get the l2Token address and contract

    const l2TokenAddress = await erc20Bridge.getL2ERC20Address(
        l1erc20Address,
        l1Provider
    );
    const l2Token = erc20Bridge.getL2TokenContract(l2Provider, l2TokenAddress);

    const testWalletL2Balance = (
        await l2Token.functions.balanceOf(l2Wallet.address)
    )[0];

    // expect(
    //     testWalletL2Balance.eq(tokenDepositAmount),
    //     "l2 wallet not updated after deposit"
    // ).to.be.true;

    console.log("Bubbles l2 balance before withdraw: ", testWalletL2Balance);
    // Withdraw Bubbles from L2
    console.log("Withdraw some bubbles back from L2 to L1");
    const withdrawTx = await erc20Bridge.withdraw({
        amount: tokenWithdrawAmount,
        erc20l1Address: l1erc20Address,
        l2Signer: l2Wallet,
    });
    const withdrawRec = await withdrawTx.wait();
    console.log(
        `Bubbles withdrawal initiated! 🥳 ${withdrawRec.transactionHash}`
    );

    testWalletL2Balance = (
        await l2Token.functions.balanceOf(await l2Wallet.getAddress())
    )[0];
    console.log("Bubbles l2 balance after withdraw: ", testWalletL2Balance);

    // expect(
    //     testWalletL2Balance.add(tokenWithdrawAmount).eq(tokenDepositAmount),
    //     "token withdraw balance not deducted"
    // ).to.be.true;
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
