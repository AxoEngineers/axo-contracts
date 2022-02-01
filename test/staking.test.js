const { expect, assert } = require("chai");
const { network, ethers } = require("hardhat");
const { beforeEach } = require("mocha");
const { start } = require("repl");

//todo: check how reverts work when failure partway through function, especially w/ regard to transfers
describe("AxolittlesStaking", () => {
  //deploy contract before each test
  let owner, addr1, n8, ac019;
  let stakingContract, axolittlesContract, bubblesContract;
  //reset network state
  beforeEach(async () => {
    await ethers.provider.send("hardhat_reset", [
      {
        forking: {
          jsonRpcUrl:
            "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
          blockNumber: 14083004,
        },
      },
    ]);
    expect((await ethers.provider.getBlock("latest")).number).to.equal(
      14083004
    );
    [owner, addr1] = await ethers.getSigners();
    //impersonate n8 and ac019
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xb0151D256ee16d847F080691C3529F316b2D54b3"],
    });
    n8 = await ethers.getSigner("0xb0151D256ee16d847F080691C3529F316b2D54b3");
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x8Ada5F216eBA7612682b64C9fd65D460bFed264F"],
    });
    ac019 = await ethers.getSigner(
      "0x8Ada5F216eBA7612682b64C9fd65D460bFed264F"
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
    const AxolittlesStaking = await ethers.getContractFactory(
      "AxolittlesStaking"
    );
    stakingContract = await AxolittlesStaking.deploy();
    await stakingContract.deployed();
    //deploy old staking contract
    const OldAxolittlesStaking = await ethers.getContractFactory(
      "old_AxolittlesStaking"
    );
    oldStakingContract = await OldAxolittlesStaking.deploy(
      process.env.TOKEN_ADDRESS,
      process.env.EMISSION_AMOUNT
    );
    await stakingContract.deployed();
    //get existing axolittles contract
    axolittlesContract = await ethers.getContractAt(
      "Axolittles",
      process.env.AXOLITTLES_ADDRESS
    );
    //get existing bubbles contract
    bubblesContract = await ethers.getContractAt(
      "Bubbles",
      process.env.TOKEN_ADDRESS
    );
    //allow new staking contract to mint bubbles
    bubblesContract.connect(n8).setMinter(stakingContract.address, 1);
    //allow old staking contract to mint bubbles
    bubblesContract.connect(n8).setMinter(oldStakingContract.address, 1);
    //allow staking contract to transfer axos
    await axolittlesContract
      .connect(n8)
      .setApprovalForAll(stakingContract.address, 1);
    await axolittlesContract
      .connect(ac019)
      .setApprovalForAll(stakingContract.address, 1);
    //allow old staking contract to transfer axos
    await axolittlesContract
      .connect(n8)
      .setApprovalForAll(oldStakingContract.address, 1);
    await axolittlesContract
      .connect(ac019)
      .setApprovalForAll(oldStakingContract.address, 1);
  });
  describe("Deployment", () => {
    //AUX CONTRACT CHECKS:
    it("should fork existing contract state", async () => {
      expect(await axolittlesContract.owner()).to.equal(
        "0xb0151D256ee16d847F080691C3529F316b2D54b3"
      );
      expect(await bubblesContract.owner()).to.equal(
        "0xb0151D256ee16d847F080691C3529F316b2D54b3"
      );
    });
    //DEPLOYMENT TEST:
    it("should deploy contract with correct constructors", async () => {
      expect(await stakingContract.AXOLITTLES()).to.equal(
        process.env.AXOLITTLES_ADDRESS
      );
      expect(await stakingContract.TOKEN()).to.equal(process.env.TOKEN_ADDRESS);
      expect(await stakingContract.emissionPerBlock()).to.equal(
        process.env.EMISSION_AMOUNT
      );
      expect(await stakingContract.checkReward(owner.address)).to.equal(0);
    });

    it("Should set the right owner", async () => {
      expect(await stakingContract.owner()).to.equal(owner.address);
    });
  });
  describe("User Methods", () => {
    //STAKING TESTS: (for each test, check all state variables)
    //test what happens if try to stake mix of tokenIDs owned + tokenIDs not owned
    //a. owned first, then not owned
    it("should fail when staking mixed owned then not owned together", async () => {
      await expect(
        stakingContract.connect(n8).stake([4504, 7027, 5803, 1, 2, 3])
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    //test what happens when staking nothing
    it("should fail when staking nothing", async () => {
      await expect(stakingContract.connect(n8).stake([])).to.be.revertedWith(
        "Nothing to stake"
      );
    });

    //3. test what happens when staking items not owned
    it("should fail when staking items not owned", async () => {
      await expect(
        stakingContract.connect(n8).stake([1, 2, 3])
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    //4. test legitimate stake
    it("should pass with legitimate stake", async () => {
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      expect(await axolittlesContract.balanceOf(n8.address)).to.equal(100);
      expect(
        await axolittlesContract.balanceOf(stakingContract.address)
      ).to.equal(3);
    });

    //UNSTAKING TESTS: (for each test, check all state variables)
    // 1. test what happens if try to unstake mix of tokenIDs owned + tokenIDs not owned
    //a. owned first, then not owned
    it("should fail when unstaking mixed owned (staked) then not owned together", async () => {
      await expect(stakingContract.connect(ac019).stake([8052]))
        .to.emit(stakingContract, "Stake")
        .withArgs(ac019.address, [8052]);
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      await expect(
        stakingContract.connect(n8).unstake([4504, 7027, 5803, 8052])
      ).to.be.revertedWith("Not your axo!");
    });

    //2. test what happens when unstaking nothing
    it("should fail when unstaking nothing", async () => {
      await expect(stakingContract.connect(n8).unstake([])).to.be.revertedWith(
        "Nothing to unstake"
      );
    });

    //3. test what happens when unstaking items not owned and not in contract
    it("should fail when unstaking items not owned and not in contract", async () => {
      await expect(
        stakingContract.connect(n8).unstake([1, 2, 3])
      ).to.be.revertedWith("Not your axo!");
    });

    //4. test legitmate unstake with delay
    it("should pass with legitimate unstake with delay", async () => {
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      // Advance time 1 week
      await hre.ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await network.provider.send("evm_mine");
      await expect(stakingContract.connect(n8).unstake([4504, 7027]))
        .to.emit(stakingContract, "Unstake")
        .withArgs(n8.address, [4504, 7027]);
      expect(await axolittlesContract.balanceOf(n8.address)).to.equal(102);
      expect(
        await axolittlesContract.balanceOf(stakingContract.address)
      ).to.equal(1);
    });

    //4. test legitmate unstake without delay
    it("should pass with legitimate unstake without delay", async () => {
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      await expect(stakingContract.connect(n8).unstake([4504, 7027]))
        .to.emit(stakingContract, "Unstake")
        .withArgs(n8.address, [4504, 7027]);
      expect(await axolittlesContract.balanceOf(n8.address)).to.equal(102);
      expect(
        await axolittlesContract.balanceOf(stakingContract.address)
      ).to.equal(1);
    });

    //CLAIMING TESTS:
    //1. perform claim when nothing staked before
    it("should fail claim when no axos staked, no $BUBBLE generated", async () => {
      await expect(stakingContract.connect(n8).claim()).to.be.revertedWith(
        "Nothing to claim"
      );
    });

    //3. perform claim when axos unstaked, but $BUBBLE remains
    it("should allow claim with $BUBBLE remaining but axos unstaked", async () => {
      //stake
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      // Advance time 10 blocks
      for (let i = 0; i < 10; i++) {
        await ethers.provider.send("evm_mine");
      }
      //unstake
      await expect(stakingContract.connect(n8).unstake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Unstake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      const startBlock = (await stakingContract.stakers(n8.address))
        .blockSinceLastCalc;
      const currBlock = (await ethers.provider.getBlock("latest")).number;
      const n8calcedReward = (await stakingContract.stakers(n8.address))
        .calcedReward;
      const n8NumStaked = (await stakingContract.stakers(n8.address)).numStaked;
      const n8Reward = n8calcedReward.add(
        n8NumStaked.mul(
          process.env.EMISSION_AMOUNT * (currBlock + 1 - startBlock)
        )
      );
      //claim
      await expect(stakingContract.connect(n8).claim())
        .to.emit(stakingContract, "Claim")
        .withArgs(n8.address, `${n8Reward}`);
    });

    //4. perform claim when axos staked, $BUBBLE generated
    it("should allow claim when axos staked, $BUBBLE generated", async () => {
      //stake
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      // Advance 10 blocks
      for (let i = 0; i < 10; i++) {
        await ethers.provider.send("evm_mine");
      }
      const startBlock = (await stakingContract.stakers(n8.address))
        .blockSinceLastCalc;
      const currBlock = (await ethers.provider.getBlock("latest")).number;
      const n8calcedReward = (await stakingContract.stakers(n8.address))
        .calcedReward;
      const n8NumStaked = (await stakingContract.stakers(n8.address)).numStaked;
      const n8Reward = n8calcedReward.add(
        n8NumStaked.mul(
          process.env.EMISSION_AMOUNT * (currBlock + 1 - startBlock)
        )
      );
      //claim
      await expect(stakingContract.connect(n8).claim())
        .to.emit(stakingContract, "Claim")
        .withArgs(n8.address, `${n8Reward}`);
    });
    //CHECKREWARDS TESTS:
    //1. check reward  on user without axos staked
    it("should check reward when $BUBBLE remaining, axos unstaked", async () => {
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      // Advance 1000 blocks
      for (let i = 0; i < 1000; i++) {
        await ethers.provider.send("evm_mine");
      }
      await expect(stakingContract.connect(n8).unstake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Unstake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      const startBlock = (await stakingContract.stakers(n8.address))
        .blockSinceLastCalc;
      const currBlock = (await ethers.provider.getBlock("latest")).number;
      const n8calcedReward = (await stakingContract.stakers(n8.address))
        .calcedReward;
      const n8NumStaked = (await stakingContract.stakers(n8.address)).numStaked;
      const n8Reward = n8calcedReward.add(
        n8NumStaked * process.env.EMISSION_AMOUNT * (currBlock - startBlock)
      );
      expect(
        await stakingContract.connect(n8).checkReward(n8.address)
      ).to.equal(`${n8Reward}`);

      expect(
        await stakingContract.connect(ac019).checkReward(ac019.address)
      ).to.equal(0);
    });
    //2. check reward on user with axos staked
    it("should check reward when $BUBBLE remaining, axos staked", async () => {
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      // Advance 1000 blocks
      for (let i = 0; i < 1000; i++) {
        await ethers.provider.send("evm_mine");
      }
      //start block should be close to 14083004
      const startBlock = (await stakingContract.stakers(n8.address))
        .blockSinceLastCalc;
      //currBlock should be close to startBlock + 1000 = 14084004
      const currBlock = (await ethers.provider.getBlock("latest")).number;
      const n8Reward =
        3 * process.env.EMISSION_AMOUNT * (currBlock - startBlock);
      expect(
        await stakingContract.connect(n8).checkReward(n8.address)
      ).to.equal(`${n8Reward}`);
      expect(
        await stakingContract.connect(ac019).checkReward(ac019.address)
      ).to.equal(0);
    });
  });
  describe("Admin Methods", () => {
    //ADMIN TESTS:
    //1. Test setAxolittlesAddress
    it("should allow axolittles address change when set by owner", async () => {
      await stakingContract.setAxolittlesAddress(bubblesContract.address);
      expect(await stakingContract.AXOLITTLES()).to.equal(
        bubblesContract.address
      );
    });
    //2. Test setTokenAddress
    it("should allow token address change when set by owner", async () => {
      await stakingContract.setTokenAddress(axolittlesContract.address);
      expect(await stakingContract.TOKEN()).to.equal(
        axolittlesContract.address
      );
    });
    //3. Change emissions when not owner
    it("Should not allow emissions change when not set by owner", async () => {
      await expect(
        stakingContract.connect(addr1).setEmissionPerBlock(0)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    //4. Change emissions when owner
    it("should allow emissions change when set by owner", async () => {
      await stakingContract.setEmissionPerBlock(0);
      expect(await stakingContract.emissionPerBlock()).to.equal("0");
    });
    //5. Test pauseStaking
    it("should fail when staking after paused", async () => {
      await stakingContract.setStakingPaused(true);
      await expect(
        stakingContract.connect(n8).stake([1, 2, 3])
      ).to.be.revertedWith("Staking is paused");
    });
    //6. Test admin transfer
    it("should admin transfer when called by owner", async () => {
      await expect(stakingContract.connect(ac019).stake([8052]))
        .to.emit(stakingContract, "Stake")
        .withArgs(ac019.address, [8052]);
      expect(
        await axolittlesContract.balanceOf(stakingContract.address)
      ).to.equal(1);
      await expect(stakingContract.adminTransfer([8052]))
        .to.emit(stakingContract, "AdminTransfer")
        .withArgs([8052]);
      expect(
        await axolittlesContract.balanceOf(stakingContract.address)
      ).to.equal(0);
    });

    //7. Test admin Transfer w/ already removed axo
    it("should fail admin Transfer w/ already removed axo", async () => {
      await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
        .to.emit(stakingContract, "Stake")
        .withArgs(n8.address, [4504, 7027, 5803]);
      await expect(stakingContract.connect(n8).unstake([4504, 7027]))
        .to.emit(stakingContract, "Unstake")
        .withArgs(n8.address, [4504, 7027]);
      await expect(stakingContract.adminTransfer([4504])).to.be.revertedWith(
        "Axo not found"
      );
    });
  });
  describe("Gas Testing", () => {
    //GAS TESTS: (comparison of deployment and all functions using hardhat)
    //1. Test Whale Stake
    it("should test whale stake", async () => {
      await expect(
        stakingContract
          .connect(n8)
          .stake([
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ])
      )
        .to.emit(stakingContract, "Stake")
        .withArgs(
          n8.address,
          [
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ]
        );
    });
    //2. Test Whale Unstake
    it("should test whale unstake", async () => {
      await expect(
        stakingContract
          .connect(n8)
          .stake([
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ])
      )
        .to.emit(stakingContract, "Stake")
        .withArgs(
          n8.address,
          [
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ]
        );
      await stakingContract
        .connect(n8)
        .unstake([
          4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
          4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
        ]);
    });
    //3. Test Whale Claim
    it("should test whale claim", async () => {
      await expect(
        stakingContract
          .connect(n8)
          .stake([
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ])
      )
        .to.emit(stakingContract, "Stake")
        .withArgs(
          n8.address,
          [
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ]
        );
      // Advance 1000 blocks
      for (let i = 0; i < 1000; i++) {
        await ethers.provider.send("evm_mine");
      }
      await stakingContract.connect(n8).claim();
    });
    //1. Test Whale Stake (Old Contract)
    it("should test whale stake (Old Contract)", async () => {
      await expect(
        oldStakingContract
          .connect(n8)
          .stake([
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ])
      ).to.emit(oldStakingContract, "Stake");
    });
    //2. Test Whale Unstake (Old Contract)
    it("should test whale unstake (Old Contract)", async () => {
      await expect(
        oldStakingContract
          .connect(n8)
          .stake([
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ])
      ).to.emit(oldStakingContract, "Stake");
      await oldStakingContract
        .connect(n8)
        .unstake([
          4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
          4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
        ]);
    });
    //3. Test Whale Claim (Old Contract)
    it("should test whale claim (Old Contract)", async () => {
      await expect(
        oldStakingContract
          .connect(n8)
          .stake([
            4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
            4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
          ])
      ).to.emit(oldStakingContract, "Stake");
      // Advance 1000 blocks
      for (let i = 0; i < 1000; i++) {
        await ethers.provider.send("evm_mine");
      }
      await oldStakingContract
        .connect(n8)
        .claim([
          4504, 7027, 5803, 4385, 4087, 3619, 6730, 4890, 9771, 1018, 7690,
          4253, 8616, 8636, 7385, 4041, 364, 2098, 3288, 4851, 7090, 8830,
        ]);
    });
  });
});
