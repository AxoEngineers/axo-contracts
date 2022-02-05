const { expect, assert } = require("chai");
const { network, ethers } = require("hardhat");
const { beforeEach } = require("mocha");
const { start } = require("repl");
require("dotenv").config();

//todo: check how reverts work when failure partway through function, especially w/ regard to transfers
describe("AxolittlesStakingV2", () => {
    //deploy contract before each test
    let owner, addr1, n8, ac019;
    let oldStakingContract,
        stakingContractV2,
        axolittlesContract,
        bubblesContract;
    let axoBalanceAC, axoBalanceN8, axoBalanceStaking;
    let testingEmissionAmount = 15;
    let n8axos = [
        4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690, 4253,
        8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830, 8983, 6598,
        1695, 9053, 9986, 5642, 362, 1426, 4724, 2787, 3392, 8293, 6894, 458,
        6043, 2101, 925, 6427, 2220, 6483, 6053, 6731, 3453, 8658, 6890, 6877,
        5543, 114, 5055, 804, 9858, 2437, 2562, 96, 6331, 7554, 8561, 2583, 90,
        1452, 807, 3377, 3514, 1316, 3112, 3629, 8653, 2055, 2639, 5140, 2572,
        3659, 4537, 1178, 6377, 5497, 2560, 3140, 9839, 3815, 9631, 4858, 2050,
        2816, 7253, 1410, 2602, 8081, 7055, 5304, 3150, 8324, 4434, 835, 1569,
        1067, 8354, 6480, 9731, 7798, 7600, 6284, 5932, 5814, 5026, 4314, 2014,
        1876, 1381,
    ];
    const c_verboseLogging = true;
    //reset network state
    beforeEach(async () => {
        await ethers.provider.send("hardhat_reset", [
            {
                forking: {
                    jsonRpcUrl: process.env.ALCHEMY_RPC,
                    blockNumber: 14135835,
                },
            },
        ]);
        [owner, addr1] = await ethers.getSigners();
        //impersonate n8 and ac019
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xb0151D256ee16d847F080691C3529F316b2D54b3"],
        });
        n8 = await ethers.getSigner(
            "0xb0151D256ee16d847F080691C3529F316b2D54b3"
        );
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x8Ada5F216eBA7612682b64C9fd65D460bFed264F"],
        });
        ac019 = await ethers.getSigner(
            "0x8Ada5F216eBA7612682b64C9fd65D460bFed264F"
        );
        //get existing bubbles contract
        bubblesContract = await ethers.getContractAt(
            "Bubbles",
            process.env.TOKEN_ADDRESS
        );
        //get existing axolittles contract
        axolittlesContract = await ethers.getContractAt(
            "Axolittles",
            process.env.AXOLITTLES_ADDRESS
        );
        oldStakingContract = await ethers.getContractAt(
            "old_AxolittlesStaking",
            process.env.OLD_STAKING_ADDRESS
        );
        //send n8 and ac019 some $$$
        await owner.sendTransaction({
            to: ac019.address,
            value: ethers.utils.parseEther("10.0"),
        });
        await owner.sendTransaction({
            to: n8.address,
            value: ethers.utils.parseEther("10.0"),
        });
        //deploy new staking contract
        const AxolittlesStakingV2 = await ethers.getContractFactory(
            "AxolittlesStakingV2"
        );
        stakingContractV2 = await AxolittlesStakingV2.deploy();
        await stakingContractV2.deployed();

        //allow new staking contract to mint bubbles
        bubblesContract.connect(n8).setMinter(stakingContractV2.address, 1);
        //allow staking contract to transfer axos
        await axolittlesContract
            .connect(n8)
            .setApprovalForAll(stakingContractV2.address, 1);
        await axolittlesContract
            .connect(ac019)
            .setApprovalForAll(stakingContractV2.address, 1);
        //allow old staking contract to transfer axos
        await axolittlesContract
            .connect(n8)
            .setApprovalForAll(oldStakingContract.address, 1);
        await axolittlesContract
            .connect(ac019)
            .setApprovalForAll(oldStakingContract.address, 1);
        //check axo balances
        axoBalanceAC = await axolittlesContract.balanceOf(ac019.address);
        axoBalanceN8 = await axolittlesContract.balanceOf(n8.address);
        axoBalanceStaking = await axolittlesContract.balanceOf(
            stakingContractV2.address
        );
        //lower emission to prevent testing overflow
        await stakingContractV2.setEmissionPerBlock(testingEmissionAmount);
        await oldStakingContract
            .connect(n8)
            .setEmissionPerBlock(testingEmissionAmount);
    });
    describe("Deployment", () => {
        //DEPLOYMENT TEST:
        it("should fork and deploy contracts", async () => {
            expect(await axolittlesContract.owner()).to.equal(
                "0xb0151D256ee16d847F080691C3529F316b2D54b3"
            );
            expect(await bubblesContract.owner()).to.equal(
                "0xb0151D256ee16d847F080691C3529F316b2D54b3"
            );
            expect(await stakingContractV2.AXOLITTLES()).to.equal(
                process.env.AXOLITTLES_ADDRESS
            );
            expect(await stakingContractV2.TOKEN()).to.equal(
                process.env.TOKEN_ADDRESS
            );
            expect(await stakingContractV2.checkReward(owner.address)).to.equal(
                0
            );
            expect(await stakingContractV2.owner()).to.equal(owner.address);
        });
    });
    describe.only("User Methods", () => {
        //STAKING TESTS: (for each test, check all state variables)
        //test what happens if try to stake mix of tokenIDs owned + tokenIDs not owned
        //a. owned first, then not owned
        it("should fail when staking mixed owned then not owned together", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803, 1, 2, 3])
            ).to.be.revertedWith(
                "ERC721: transfer caller is not owner nor approved"
            );
        });

        //test what happens when staking nothing
        it("should fail when staking nothing", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([])
            ).to.be.revertedWith("Nothing to stake");
        });
        //4. test legitimate stake
        it("should pass with legitimate stake", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            expect(await axolittlesContract.balanceOf(n8.address)).to.be.lt(
                axoBalanceN8
            );
            expect(
                await axolittlesContract.balanceOf(stakingContractV2.address)
            ).to.be.gt(axoBalanceStaking);
        });

        //UNSTAKING TESTS: (for each test, check all state variables)
        // 1. test what happens if try to unstake mix of tokenIDs owned + tokenIDs not owned
        //a. owned first, then not owned
        it("should fail when unstaking mixed owned (staked) then not owned together", async () => {
            await expect(stakingContractV2.connect(ac019).stake([8052]))
                .to.emit(stakingContractV2, "Stake")
                .withArgs(ac019.address, [8052]);
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            await expect(
                stakingContractV2.connect(n8).unstake([4504, 7027, 5803, 8052])
            ).to.be.revertedWith("Not your axo!");
        });

        //2. test what happens when unstaking nothing
        it("should fail when unstaking nothing", async () => {
            await expect(
                stakingContractV2.connect(n8).unstake([])
            ).to.be.revertedWith("Nothing to unstake");
        });

        //3. test what happens when unstaking items not owned and not in contract
        it("should fail when unstaking items not owned and not in contract", async () => {
            await expect(
                stakingContractV2.connect(n8).unstake([1, 2, 3])
            ).to.be.revertedWith("Not your axo!");
        });

        //4. test legitmate unstake with delay
        it("should pass with legitimate unstake with delay", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            // Advance time 1 week
            await hre.ethers.provider.send("evm_increaseTime", [
                7 * 24 * 60 * 60,
            ]);
            await network.provider.send("evm_mine");
            await expect(stakingContractV2.connect(n8).unstake([4504, 7027]))
                .to.emit(stakingContractV2, "Unstake")
                .withArgs(n8.address, [4504, 7027]);
            expect(await axolittlesContract.balanceOf(n8.address)).to.equal(
                axoBalanceN8 - 1
            );
            expect(
                await axolittlesContract.balanceOf(stakingContractV2.address)
            ).to.equal(1);
        });

        //4. test legitmate unstake without delay
        it("should pass with legitimate unstake without delay", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            await expect(stakingContractV2.connect(n8).unstake([4504, 7027]))
                .to.emit(stakingContractV2, "Unstake")
                .withArgs(n8.address, [4504, 7027]);
            expect(await axolittlesContract.balanceOf(n8.address)).to.equal(
                axoBalanceN8 - 1
            );
            expect(
                await axolittlesContract.balanceOf(stakingContractV2.address)
            ).to.equal(1);
        });

        //CLAIMING TESTS:
        //1. perform claim when nothing staked before
        it("should fail claim when no axos staked, no $BUBBLE generated", async () => {
            await expect(
                stakingContractV2.connect(n8).claim()
            ).to.be.revertedWith("Nothing to claim");
        });

        //3. perform claim when axos unstaked, but $BUBBLE remains
        it("should allow claim with $BUBBLE remaining but axos unstaked", async () => {
            //stake
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            // Advance time 10 blocks
            for (let i = 0; i < 10; i++) {
                await ethers.provider.send("evm_mine");
            }
            //unstake
            await expect(
                stakingContractV2.connect(n8).unstake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Unstake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            //claim
            await expect(stakingContractV2.connect(n8).claim()).to.emit(
                stakingContractV2,
                "Claim"
            );
            expect(await stakingContractV2.checkReward(n8.address)).to.equal(0);
        });

        //4. perform claim when axos staked, $BUBBLE generated
        it("should allow claim when axos staked, $BUBBLE generated", async () => {
            //stake
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            // Advance 10 blocks
            for (let i = 0; i < 10; i++) {
                await ethers.provider.send("evm_mine");
            }
            await expect(stakingContractV2.connect(n8).claim()).to.emit(
                stakingContractV2,
                "Claim"
            );
            expect(await stakingContractV2.checkReward(n8.address)).to.equal(0);
        });
        //CHECKREWARDS TESTS:
        //todo: make a test with variable reward dturned off

        //2. check reward on user with axos staked
        it.only("should check reward when $BUBBLE remaining, axos staked", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            // Advance 1000 blocks
            for (let i = 0; i < 1000; i++) {
                await ethers.provider.send("evm_mine");
            }
            //start block should be close to 14083004
            const startBlock = (
                await stakingContractV2.stakers(n8.address)
            ).blockSinceLastCalc.toNumber();
            //currBlock should be close to startBlock + 1000 = 14084004
            const currBlock = (await ethers.provider.getBlock("latest")).number;
            let totalEmission = testingEmissionAmount;
            if (stakingContractV2.isVariableReward()) {
                let stakeTarget = (
                    await stakingContractV2.stakeTarget()
                ).toNumber();
                let bothStaked =
                    (
                        await axolittlesContract.balanceOf(
                            stakingContractV2.address
                        )
                    ).toNumber() +
                    (
                        await axolittlesContract.balanceOf(
                            oldStakingContract.address
                        )
                    ).toNumber();
                totalEmission =
                    bothStaked >= stakeTarget
                        ? testingEmissionAmount * 2
                        : testingEmissionAmount +
                          (testingEmissionAmount * bothStaked) / stakeTarget;
            }

            expect(
                (await stakingContractV2.checkReward(n8.address)).toNumber()
            ).to.equal(3 * totalEmission * (currBlock - startBlock));
        });
    });
    describe("Admin Methods", () => {
        //ADMIN TESTS:
        //1. Test setAxolittlesAddress
        it("should allow axolittles address change when set by owner", async () => {
            await stakingContractV2.setAxolittlesAddress(
                bubblesContract.address
            );
            expect(await stakingContractV2.AXOLITTLES()).to.equal(
                bubblesContract.address
            );
        });
        //2. Test setTokenAddress
        it("should allow token address change when set by owner", async () => {
            await stakingContractV2.setTokenAddress(axolittlesContract.address);
            expect(await stakingContractV2.TOKEN()).to.equal(
                axolittlesContract.address
            );
        });
        //3. Change emissions when not owner
        it("Should not allow emissions change when not set by owner", async () => {
            await expect(
                stakingContractV2.connect(addr1).setEmissionPerBlock(0)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        //4. Change emissions when owner
        it("should allow emissions change when set by owner", async () => {
            await stakingContractV2.setEmissionPerBlock(0);
            expect(await stakingContractV2.emissionPerBlock()).to.equal("0");
        });
        //5. Test pauseStaking
        it("should fail when staking after paused", async () => {
            await stakingContractV2.setStakingPaused(true);
            await expect(
                stakingContractV2.connect(n8).stake([1, 2, 3])
            ).to.be.revertedWith("Staking is paused");
        });
        //6. Test admin transfer
        it("should admin transfer when called by owner", async () => {
            await expect(stakingContractV2.connect(ac019).stake([8052]))
                .to.emit(stakingContractV2, "Stake")
                .withArgs(ac019.address, [8052]);
            expect(
                await axolittlesContract.balanceOf(stakingContractV2.address)
            ).to.equal(1);
            await expect(stakingContractV2.adminTransfer([8052]))
                .to.emit(stakingContractV2, "AdminTransfer")
                .withArgs([8052]);
            expect(
                await axolittlesContract.balanceOf(stakingContractV2.address)
            ).to.equal(0);
        });

        //7. Test admin Transfer w/ already removed axo
        it("should fail admin Transfer w/ already removed axo", async () => {
            await expect(
                stakingContractV2.connect(n8).stake([4504, 7027, 5803])
            )
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, [4504, 7027, 5803]);
            await expect(stakingContractV2.connect(n8).unstake([4504, 7027]))
                .to.emit(stakingContractV2, "Unstake")
                .withArgs(n8.address, [4504, 7027]);
            await expect(
                stakingContractV2.adminTransfer([4504])
            ).to.be.revertedWith("Axo not found");
        });
    });
    describe("Gas Testing", () => {
        //GAS TESTS: (comparison of deployment and all functions using hardhat)
        //1. Test Whale Stake
        it("should test whale stake", async () => {
            await expect(stakingContractV2.connect(n8).stake(n8axos))
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, n8axos);
        });
        //2. Test Whale Unstake
        it("should test whale unstake", async () => {
            await expect(stakingContractV2.connect(n8).stake(n8axos))
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, n8axos);
            await stakingContractV2.connect(n8).unstake(n8axos);
        });
        //3. Test Whale Claim
        it("should test whale claim", async () => {
            await expect(stakingContractV2.connect(n8).stake(n8axos))
                .to.emit(stakingContractV2, "Stake")
                .withArgs(n8.address, n8axos);
            // Advance 1000 blocks
            for (let i = 0; i < 1000; i++) {
                await ethers.provider.send("evm_mine");
            }
            await stakingContractV2.connect(n8).claim();
        });
        //1. Test Whale Stake (Old Contract)
        it("should test whale stake (Old Contract)", async () => {
            await expect(oldStakingContract.connect(n8).stake(n8axos)).to.emit(
                oldStakingContract,
                "Stake"
            );
        });
        //2. Test Whale Unstake (Old Contract)
        it("should test whale unstake (Old Contract)", async () => {
            await expect(oldStakingContract.connect(n8).stake(n8axos)).to.emit(
                oldStakingContract,
                "Stake"
            );
            await oldStakingContract.connect(n8).unstake(n8axos);
        });
        //3. Test Whale Claim (Old Contract)
        it("should test whale claim (Old Contract)", async () => {
            await expect(oldStakingContract.connect(n8).stake(n8axos)).to.emit(
                oldStakingContract,
                "Stake"
            );
            // Advance 1000 blocks
            for (let i = 0; i < 1000; i++) {
                await ethers.provider.send("evm_mine");
            }
            await oldStakingContract.connect(n8).claim(n8axos);
        });
    });
});
