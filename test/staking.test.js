const { expect, assert } = require("chai");
const { network, ethers } = require("hardhat");
const { beforeEach } = require("mocha");
const AXOLITTLES_ADDRESS = "0xf36446105fF682999a442b003f2224BcB3D82067";
const TOKEN_ADDRESS = "0x58f46F627C88a3b217abc80563B9a726abB873ba";
const EMISSION_AMOUNT = "15000000000000000";

//todo: check how reverts work when failure partway through function, especially w/ regard to transfers
describe("AxolittlesStaking", () => {
  //deploy contract before each test
  let owner, addr1, n8, ac019;
  let stakingContract, axolittlesContract, bubblesContract;
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
    await owner.sendTransaction({
      to: ac019.address,
      value: ethers.utils.parseEther("1.0"),
    });
    const AxolittlesStaking = await ethers.getContractFactory(
      "AxolittlesStaking"
    );
    stakingContract = await AxolittlesStaking.deploy(
      AXOLITTLES_ADDRESS,
      TOKEN_ADDRESS,
      EMISSION_AMOUNT
    );
    axolittlesContract = await ethers.getContractAt(
      "Axolittles",
      AXOLITTLES_ADDRESS
    );
    bubblesContract = await ethers.getContractAt("Bubbles", TOKEN_ADDRESS);
    await stakingContract.deployed();
    bubblesContract.connect(n8).setMinter(stakingContract.address, 1);
    await axolittlesContract
      .connect(n8)
      .setApprovalForAll(stakingContract.address, 1);
    await axolittlesContract
      .connect(ac019)
      .setApprovalForAll(stakingContract.address, 1);
    //console.log("Contract deployed to:", stakingContract.address);
  });
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
    expect(await stakingContract.AXOLITTLES()).to.equal(AXOLITTLES_ADDRESS);
    expect(await stakingContract.TOKEN()).to.equal(TOKEN_ADDRESS);
    expect(await stakingContract.emissionPerBlock()).to.equal(EMISSION_AMOUNT);
    expect(await stakingContract.checkReward(owner.address)).to.equal(0);
  });

  it("Should set the right owner", async () => {
    expect(await stakingContract.owner()).to.equal(owner.address);
  });

  //ADMIN TESTS:
  //Change emissions when not owner
  it("Should not allow emissions change when not set by owner", async () => {
    await expect(
      stakingContract.connect(addr1).setEmissionPerBlock(0)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  //Change emissions when owner
  it("should allow emissions change when set by owner", async () => {
    await stakingContract.setEmissionPerBlock(0);
    expect(await stakingContract.emissionPerBlock()).to.equal("0");
  });

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
  it("should fail when staking items not owned and not in contract", async () => {
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
    // Advance time 1 week
    await hre.ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");
    //unstake
    await expect(stakingContract.connect(n8).unstake([4504, 7027, 5803]))
      .to.emit(stakingContract, "Unstake")
      .withArgs(n8.address, [4504, 7027, 5803]);
    //claim
    await expect(stakingContract.connect(n8).claim())
      .to.emit(stakingContract, "Claim")
      .withArgs(n8.address, "90000000000000000");
  });

  //4. perform claim when axos staked, $BUBBLE generated
  it("should allow claim when axos staked, $BUBBLE generated", async () => {
    //stake
    await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
      .to.emit(stakingContract, "Stake")
      .withArgs(n8.address, [4504, 7027, 5803]);
    // Advance time 1 week
    await hre.ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");
    //claim
    await expect(stakingContract.connect(n8).claim())
      .to.emit(stakingContract, "Claim")
      .withArgs(n8.address, "90000000000000000");
  });

  //CHECKREWARDS TESTS:
  //1. check reward  on user without axos staked
  it("should check reward when $BUBBLE remaining, axos unstaked", async () => {
    await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
      .to.emit(stakingContract, "Stake")
      .withArgs(n8.address, [4504, 7027, 5803]);
    // Advance time 1 week
    await hre.ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");
    await expect(stakingContract.connect(n8).unstake([4504, 7027, 5803]))
      .to.emit(stakingContract, "Unstake")
      .withArgs(n8.address, [4504, 7027, 5803]);
    expect(await stakingContract.connect(n8).checkReward(n8.address)).to.equal(
      "90000000000000000"
    );
    expect(
      await stakingContract.connect(ac019).checkReward(ac019.address)
    ).to.equal(0);
  });
  //2. check reward on user with axos staked
  it("should check reward when $BUBBLE remaining, axos staked", async () => {
    await expect(stakingContract.connect(n8).stake([4504, 7027, 5803]))
      .to.emit(stakingContract, "Stake")
      .withArgs(n8.address, [4504, 7027, 5803]);
    // Advance time 1 week
    await hre.ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");
    expect(await stakingContract.connect(n8).checkReward(n8.address)).to.equal(
      "45000000000000000"
    );
    expect(
      await stakingContract.connect(ac019).checkReward(ac019.address)
    ).to.equal(0);
  });
  it("todo: Manually calculate $BUBBLE rewards and check against claim/checkRewards for accuracy", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
  });
  //MIGRATION FUNCTION TESTS:
  //1. Test function to give rewards to original stakers w/ merkle tree implementation
  //2. Test axo migration helper function
  it("should transfer axo from old contract to new one", async () => {
    await stakingContract.connect(n8).migrationHelper([5555]);
  });
  //when user doesnt own the axo in old contract
  it("should not transfer axo from old contract to new one when not owned", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
  });
});

//GAS TESTS: (comparison of deployment and all functions using hardhat)
//1. Old Contract
//2. New Contract w/ autoclaim each stake/unstake (no storage of calcedReward)
//3. New Contract without autoclaim (includes calcedReward)
//4. New Contract with stakedAxos reimplemented inside staker struct
