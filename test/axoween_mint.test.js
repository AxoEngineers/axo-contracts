const { expect } = require("chai");
const {  ethers } = require("hardhat");
require("dotenv").config();

describe("Axoween Minter Tests", () => {
    //deploy contract before each test
    let owner, user, user2;

    let BubbleFactory, AxoweenFactory, MinterFactory;
    let bubble, axoween, minter;

    const AXOWEEN_MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    before(async () => {
        BubbleFactory = await ethers.getContractFactory("Bubbles");
        AxoweenFactory = await ethers.getContractFactory("SeasonalAxolittles");
        MinterFactory = await ethers.getContractFactory("AxoweenMinter");
    })

    describe("Test Minters", () => {
        beforeEach(async () => {
            [owner, user, user2] = await ethers.getSigners();

            // Deploy contracts
            bubble = await BubbleFactory.deploy();
            axoween = await AxoweenFactory.deploy();
            minter = await MinterFactory.deploy(axoween.address, bubble.address);

            // Set approvals
            await bubble.setBurner(minter.address, true);
            await bubble.setMinter(owner.address, true);
            await axoween.grantRole(AXOWEEN_MINTER_ROLE, minter.address);
            await bubble.connect(user).approve(minter.address, ethers.constants.MaxUint256);

            // mint 100,000 bubble to user
            await bubble.mint(user.address, ethers.utils.parseEther("100000.0"));
        });

        it("user can mint an axoween", async () => {
            expect(await axoween.balanceOf(user.address, 0)).to.equal(0);
            await minter.connect(user).mintAxoween(0, 1);
            expect(await axoween.balanceOf(user.address, 0)).to.equal(1);
            expect(await bubble.balanceOf(user.address)).to.equal(ethers.utils.parseEther("90000.0"));
        });

        it("user can mint 3 axoweens", async () => {
            expect(await axoween.balanceOf(user.address, 0)).to.equal(0);
            await minter.connect(user).mintAxoween(0, 3);
            expect(await axoween.balanceOf(user.address, 0)).to.equal(3);
            expect(await bubble.balanceOf(user.address)).to.equal(ethers.utils.parseEther("70000.0"));
        });

        it("user can mint 1 axoween from each collection", async () => {
            expect(await axoween.balanceOf(user.address, 0)).to.equal(0);
            await minter.connect(user).mintAxoween(0, 1);
            await minter.connect(user).mintAxoween(1, 1);
            await minter.connect(user).mintAxoween(2, 1);
            await minter.connect(user).mintAxoween(3, 1);
            expect(await axoween.balanceOf(user.address, 0)).to.equal(1);
            expect(await axoween.balanceOf(user.address, 1)).to.equal(1);
            expect(await axoween.balanceOf(user.address, 2)).to.equal(1);
            expect(await axoween.balanceOf(user.address, 3)).to.equal(1);
            expect(await bubble.balanceOf(user.address)).to.equal(ethers.utils.parseEther("60000.0"));
        });

        it("user can mint 1 axoween from each collection", async () => {
            expect(await axoween.balanceOf(user.address, 0)).to.equal(0);
            await minter.connect(user).mintAxoween(0, 1);
            await minter.connect(user).mintAxoween(1, 1);
            await minter.connect(user).mintAxoween(2, 1);
            await minter.connect(user).mintAxoween(3, 1);
            expect(await axoween.balanceOf(user.address, 0)).to.equal(1);
            expect(await axoween.balanceOf(user.address, 1)).to.equal(1);
            expect(await axoween.balanceOf(user.address, 2)).to.equal(1);
            expect(await axoween.balanceOf(user.address, 3)).to.equal(1);
            expect(await bubble.balanceOf(user.address)).to.equal(ethers.utils.parseEther("60000.0"));
        });

        it("user with no bubbles cannot mint an axoween", async () => {
            expect(await axoween.balanceOf(user2.address, 0)).to.equal(0);
            await expect(minter.connect(user2).mintAxoween(0, 1)).to.reverted;
            expect(await axoween.balanceOf(user2.address, 0)).to.equal(0);
        });

        it("user cannot mint non-existant token", async () => {
            expect(await axoween.balanceOf(user.address, 12)).to.equal(0);
            await expect(minter.connect(user).mintAxoween(12, 1)).to.reverted;
            expect(await axoween.balanceOf(user.address, 12)).to.equal(0);
            expect(await bubble.balanceOf(user.address)).to.equal(ethers.utils.parseEther("100000.0"));
        });

        it("user cannot mint if contract disabled", async () => {
            await minter.setIsStarted(false);
            expect(await axoween.balanceOf(user.address, 0)).to.equal(0);
            await expect(minter.connect(user).mintAxoween(0, 1)).to.reverted;
            expect(await axoween.balanceOf(user.address, 0)).to.equal(0);
            expect(await bubble.balanceOf(user.address)).to.equal(ethers.utils.parseEther("100000.0"));
        });


    });
});
