const ether = require("@openzeppelin/test-helpers/src/ether");
const { expect, assert } = require("chai");
const { network, ethers } = require("hardhat");
const { beforeEach } = require("mocha");
const { start } = require("repl");
require("dotenv").config();

describe("AxolittlesStakingGeneric test suite", () => {
    //deploy contract before each test
    let owner, user;

    let BubbleFactory, AxoFactory, StakingFactory, LzEndpointMockFactory;
    let Bubbles, Axolittles, Staking, LzEndpointMock;

    before(async () => {
        BubbleFactory = await ethers.getContractFactory("Bubbles");
        AxoFactory = await ethers.getContractFactory("AxolittlesArb");
        StakingFactory = await ethers.getContractFactory("AxolittlesStaking");
        LzEndpointMockFactory = await ethers.getContractFactory("LzEndpointMock_AxolittlesArb");
    })

    describe.only("User Methods", () => {
        beforeEach(async () => {
            [owner, user] = await ethers.getSigners();

            // Deploy contracts
            Bubbles = await BubbleFactory.deploy();
            LzEndpointMock = await LzEndpointMockFactory.deploy();
            Axolittles = await AxoFactory.deploy(LzEndpointMock.address);
            Staking = await StakingFactory.deploy(Axolittles.address, Bubbles.address);

            // setup LzEndpoint
            await LzEndpointMock.setAxolittles(Axolittles.address);
            await Axolittles.setTrustedRemote(1, ethers.constants.AddressZero);

            // Set approvals
            await Bubbles.setMinter(Staking.address, true)
            await Axolittles.setApprovalForAll(Staking.address, true);
            await Axolittles.connect(user).setApprovalForAll(Staking.address, true);

            // mint 10 axos to user
            await LzEndpointMock.mintNfts(1, ethers.constants.AddressZero, 0, user.address, [0,1,2,3,4,5])
            await LzEndpointMock.mintNfts(1, ethers.constants.AddressZero, 1, owner.address, [100,101,102,103,104,105])

        });

        it("should fail when staking mixed owned then not owned together", async () => {
            await expect(
                Staking.connect(user).stake([1, 2, 3, 100, 101, 102])
            ).to.be.revertedWith(
                "ERC721: transfer from incorrect owner"
            );
        });

        it("should fail when staking nothing", async () => {
            await expect(
                Staking.connect(user).stake([])
            ).to.be.revertedWith("Nothing to stake");
        });

        it("should pass with legitimate stake", async () => {
            let initialBalance = await Axolittles.balanceOf(user.address);
            await expect(
                Staking.connect(user).stake([0, 1, 2])
            )
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0, 1, 2]);

            expect(await Axolittles.balanceOf(user.address)).to.equal(
                initialBalance-3
            );
            expect(
                await Axolittles.balanceOf(Staking.address)
            ).to.equal(3);
        });

        it("should fail when unstaking mixed owned (staked) then not owned together", async () => {
            await expect(Staking.connect(user).stake([0]))
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0]);

            await expect(
                Staking.stake([100, 101])
            )
                .to.emit(Staking, "Stake")
                .withArgs(owner.address, [100, 101]);

            await expect(
                Staking.connect(user).unstake([0, 100])
            ).to.be.revertedWith("Not your axo!");
        });

        it("should fail when unstaking nothing", async () => {
            await expect(
                Staking.connect(user).unstake([])
            ).to.be.revertedWith("Nothing to unstake");
        });

        it("should fail when unstaking items not owned and not in contract", async () => {
            await expect(
                Staking.connect(user).unstake([0, 1])
            ).to.be.revertedWith("Not your axo!");
        });

        it("should pass with legitimate unstake with delay", async () => {
            await expect(
                Staking.connect(user).stake([0, 1, 2])
            )
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0, 1, 2]);

            // Advance time 1 week
            await hre.ethers.provider.send("evm_increaseTime", [
                7 * 24 * 60 * 60,
            ]);
            await network.provider.send("evm_mine");

            await expect(Staking.connect(user).unstake([0, 1]))
                .to.emit(Staking, "Unstake")
                .withArgs(user.address, [0, 1]);
            expect(await Axolittles.balanceOf(user.address)).to.equal(
                5
            );

            expect(
                await Axolittles.balanceOf(Staking.address)
            ).to.equal(1);
        });

        it("should pass with legitimate unstake without delay", async () => {
            await expect(
                Staking.connect(user).stake([0, 1, 2])
            )
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0, 1, 2]);

            await expect(Staking.connect(user).unstake([0, 1]))
                .to.emit(Staking, "Unstake")
                .withArgs(user.address, [0, 1]);
            expect(await Axolittles.balanceOf(user.address)).to.equal(
                5
            );
            expect(
                await Axolittles.balanceOf(Staking.address)
            ).to.equal(1);
        });

        //CLAIMING TESTS:
        //1. perform claim when nothing staked before
        it("should fail claim when no axos staked, no $BUBBLE generated", async () => {
            await expect(
                Staking.connect(user).claim()
            ).to.be.revertedWith("Nothing to claim");
        });

        //3. perform claim when axos unstaked, but $BUBBLE remains
        it("should allow claim with $BUBBLE remaining but axos unstaked", async () => {
            //stake
            await expect(
                Staking.connect(user).stake([0, 1, 2])
            )
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0,1,2]);
            // Advance time 10 blocks
            for (let i = 0; i < 10; i++) {
                await ethers.provider.send("evm_mine");
            }
            //unstake
            await expect(
                Staking.connect(user).unstake([0,1,2])
            )
                .to.emit(Staking, "Unstake")
                .withArgs(user.address, [0,1,2]);
            //claim
            await expect(Staking.connect(user).claim()).to.emit(
                Staking,
                "Claim"
            );
            expect(await Staking.checkReward(user.address)).to.equal(0);
        });

        //4. perform claim when axos staked, $BUBBLE generated
        it("should allow claim when axos staked, $BUBBLE generated", async () => {
            //stake
            await expect(
                Staking.connect(user).stake([0,1,2])
            )
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0,1,2]);
            // Advance 10 blocks
            for (let i = 0; i < 10; i++) {
                await ethers.provider.send("evm_mine");
            }

            await expect(Staking.connect(user).claim()).to.emit(
                Staking,
                "Claim"
            );

            expect(await Staking.checkReward(user.address)).to.equal(0);
            expect(await Bubbles.balanceOf(user.address)).to.be.gt(0);
        });

        //CHECKREWARDS TESTS:
        //todo: make a test with variable reward turned off
        it("should check reward when variable reward off", async () => {
            expect(await Staking.isVariableReward()).to.equal(false);
            await expect(
                Staking.connect(user).stake([0,1,2])
            )
                .to.emit(Staking, "Stake")
                .withArgs(user.address, [0,1,2]);
            // Advance 1000 blocks
            for (let i = 0; i < 1000; i++) {
                await ethers.provider.send("evm_mine");
            }

            //calc new reward to add to calcedReward
            let reward = (await Staking.emissionPerBlock()).mul(3).mul(1000);

            expect(await Staking.checkReward(user.address)).to.be.equal(reward);
        });
    });
});
