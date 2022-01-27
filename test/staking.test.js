const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { beforeEach } = require("mocha");
const { Contract, Signer } = require("ethers");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const AXOLITTLES_ADDRESS = "0xf36446105fF682999a442b003f2224BcB3D82067";
const TOKEN_ADDRESS = "0x58f46F627C88a3b217abc80563B9a726abB873ba";

//todo: check how reverts work when failure partway through function, especially w/ regard to transfers
describe("AxolittlesStaking", () => {
  //deploy contract before each test
  let owner, addr1;
  let stakingContract, axolittlesContract, bubblesContract;
  beforeEach(async () => {
    //placeholder in case needed
    [owner, addr1] = await ethers.getSigners();
    const AxolittlesStaking = await ethers.getContractFactory("AxolittlesStaking");
    stakingContract = await AxolittlesStaking.deploy("15000000000000000");
    axolittlesContract = await ethers.getContractAt("Axolittles", AXOLITTLES_ADDRESS);
    bubblesContract = await ethers.getContractAt("Bubbles", TOKEN_ADDRESS);
    console.log("Current block number is: ", ethers.provider.getBlock("latest"));
    await stakingContract.deployed();
    //console.log("Contract deployed to:", stakingContract.address);
  });

  //DEPLOYMENT TEST:
  it("should deploy contract with correct constructors", async () => {

    expect(await stakingContract.AXOLITTLES()).to.equal(AXOLITTLES_ADDRESS);
    expect(await stakingContract.TOKEN()).to.equal(TOKEN_ADDRESS);
    expect(await stakingContract.emissionPerBlock()).to.equal("15000000000000000");
    expect(await stakingContract.checkReward(owner.getAddress())).to.equal(0);
  });

  it("Should set the right owner", async () => {
    expect(await stakingContract.owner()).to.equal(await owner.address);
  });

  //ADMIN TESTS:
  //Change emissions when not owner
  it("Should not allow emissions change when not set by owner", async () => {
    await expect(
      stakingContract.connect(addr1).setEmissionPerBlock(0)
    )
      .to.be.revertedWith('Ownable: caller is not the owner');
    expect(await stakingContract.emissionPerBlock()).to.equal("15000000000000000");
  });

  //Change emissions when owner
  it("should allow emissions change when set by owner", async () => {
    await stakingContract.setEmissionPerBlock(0);
    expect(await stakingContract.emissionPerBlock()).to.equal("0");
  });

  //STAKING TESTS: (for each test, check all state variables)
  //test what happens if try to stake mix of tokenIDs owned + tokenIDs not owned
      //a. owned first, then not owned
      //b. not owned first, then owned
  it("should fail when staking mixed owned then not owned", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
  });

  it("should fail when staking mixed not owned then owned", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
  });

  //test what happens when staking nothing
  it("should fail when staking nothing", async () => {
    /* 
    //something wrong with this, need to fix
    await expect(
      stakingContract.stake.bind("")
    ).to.throw("INVALID_ARGUMENT");
    */
  });

  //3. test what happens when staking items not owned
  it("should fail when staking items not owned", async () => {
    await expect(
      stakingContract.stake([1])
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });

  //4. test legitimate stake
  it("should pass with legitimate stake", async () => {
    //expect(await stakingContract.stake(1)).to.emit(stakingContract, "Stake").withArgs(owner.address, tokens);
    assert.fail("actual", "expected", "Error message");
  });


  //UNSTAKING TESTS: (for each test, check all state variables)
  // 1. test what happens if try to unstake mix of tokenIDs owned + tokenIDs not owned
      //a. owned first, then not owned
      //b. not owned first, then owned    

  //2. test what happens when staking nothing

  //3. test what happens when staking 

  //4. test legitmate unstake

  //CLAIMING TESTS: 
  //1. perform claim when nothing staked before
  it("should fail when no axos staked, no bubbles generated", async () => {
    await expect(
      stakingContract.claim()
    ).to.be.revertedWith("Nothing to claim");
  });

  //2. perform claim when axos staked, but no bubbles generated yet
  it("should revert when axos staked but no bubbles generated yet", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
    await expect(
      stakingContract.claim()
    ).to.be.revertedWith("Nothing to claim");
  });

  //3. perform claim when axos unstaked, but bubbles remain
  it("should allow claim with bubbles remaining but axos unstaked", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
  });
  //
  it("should allow claim when axos staked, bubbles generated", async () => {
    assert.fail("actual", "expected", "Test not implemented yet");
  });

  //CHECKREWARDS TESTS:
  //1. check reward  on user without axos staked
  //2. check reward on user with axos staked

  //EMIT TESTS:


  });


//GAS TESTS: (comparison of deployment and all functions using hardhat)
//1. Old Contract
//2. New Contract w/ autoclaim each stake/unstake (no storage of calcedReward)
//3. New Contract without autoclaim (includes calcedReward)
//4. New Contract with stakedAxos reimplemented inside staker struct


