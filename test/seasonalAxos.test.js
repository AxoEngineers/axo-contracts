const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SeasonalAxos Test", function () {
  let AxoFactory;
  let axolittles;

  const baseUri = "http://uri/{id}.json";
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"))
  const BURNER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE"))
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  before(async function () {
    AxoFactory = await ethers.getContractFactory("SeasonalAxolittles");
  });

  beforeEach(async function() {
    axolittles = await AxoFactory.deploy();
    await axolittles.deployed();
  });

  describe("Test axolittles", async function() {
    let owner, minter, user1, user2, user3;

    beforeEach(async function() {
      [owner, minter, user1, user2, user3] = await ethers.getSigners();
    })

    it("check roles", async function() {
        // check owner
        expect(await axolittles.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        expect(await axolittles.hasRole(MINTER_ROLE, owner.address)).to.be.false;
        expect(await axolittles.hasRole(BURNER_ROLE, owner.address)).to.be.false;

        // check minter initial
        expect(await axolittles.hasRole(DEFAULT_ADMIN_ROLE, minter.address)).to.be.false;
        expect(await axolittles.hasRole(MINTER_ROLE, minter.address)).to.be.false;
        expect(await axolittles.hasRole(BURNER_ROLE, minter.address)).to.be.false;

        // check minter after granting Minter Role
        await axolittles.grantRole(MINTER_ROLE, minter.address);
        expect(await axolittles.hasRole(MINTER_ROLE, minter.address)).to.be.true;
        expect(await axolittles.hasRole(BURNER_ROLE, minter.address)).to.be.false;

        // check minter after granting Burner Role
        await axolittles.grantRole(BURNER_ROLE, minter.address);
        expect(await axolittles.hasRole(MINTER_ROLE, minter.address)).to.be.true;
        expect(await axolittles.hasRole(BURNER_ROLE, minter.address)).to.be.true;

        // check minter after revoking roles
        await axolittles.revokeRole(MINTER_ROLE, minter.address);
        await axolittles.revokeRole(BURNER_ROLE, minter.address);
        expect(await axolittles.hasRole(MINTER_ROLE, minter.address)).to.be.false;
        expect(await axolittles.hasRole(BURNER_ROLE, minter.address)).to.be.false;
    })

    it("mint 1 token", async function() {
    await axolittles.grantRole(MINTER_ROLE, minter.address);

      await axolittles.connect(minter).mint(user1.address, 1, 1, "0x");
      expect(await axolittles.balanceOf(user1.address, 1)).to.equal(1);
    })

    it ("mint multiple tokens", async function() {
        await axolittles.grantRole(MINTER_ROLE, minter.address);

        await axolittles.connect(minter).mintBatch(user1.address, [0,1,2,3], [10,9,8,7], "0x");
        expect(await axolittles.balanceOf(user1.address, 0)).to.equal(10);
        expect(await axolittles.balanceOf(user1.address, 1)).to.equal(9);
        expect(await axolittles.balanceOf(user1.address, 2)).to.equal(8);
        expect(await axolittles.balanceOf(user1.address, 3)).to.equal(7);
    })

    it("burn 1 token", async function() {
            await axolittles.grantRole(MINTER_ROLE, minter.address);
            await axolittles.grantRole(BURNER_ROLE, minter.address);

          await axolittles.connect(minter).mint(user1.address, 1, 1, "0x");
          expect(await axolittles.balanceOf(user1.address, 1)).to.equal(1);
          await axolittles.connect(minter).burn(user1.address, 1, 1);
          expect(await axolittles.balanceOf(user1.address, 1)).to.equal(0);
        })

    it("test uri", async function() {
        expect(await axolittles.uri(0)).to.equal(baseUri);
        await axolittles.setUri("foo");
        expect(await axolittles.uri(0)).to.equal("foo");
    })

    it("test bad callers", async function() {
        await expect(axolittles.connect(user1).setUri("foo")).to.be.reverted;
        await expect(axolittles.connect(user1).mint(user1.address, 1, 1, "0x")).to.be.reverted;
        await expect(axolittles.connect(user1).mintBatch(user1.address, [0,1], [1, 1], "0x")).to.be.reverted;
        await expect(axolittles.connect(user1).burn(user1.address, 1, 1)).to.be.reverted;
        await expect(axolittles.connect(user1).burnBatch(user1.address, [0, 1], [1, 1])).to.be.reverted;
        await expect(axolittles.connect(user1).grantRole(MINTER_ROLE, user1.address)).to.be.reverted;
        await expect(axolittles.connect(user1).revokeRole(MINTER_ROLE, user1.address)).to.be.reverted;

    })

    it.only("lets try", async function() {
        const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

        accounts = await hre.ethers.getSigners();
        const myJson = require('../scripts/csvjson.json');


        const SeasonalAxos = await hre.ethers.getContractFactory("SeasonalAxolittles");
        const axos = await SeasonalAxos.deploy();
        await axos.deployed();
        console.log("Seasonal contract deployed to:", axos.address);

        await axos.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", accounts[0].address)
        // for (let k of myJson) {
        //     if (k.axos == 1) {
        //         await axos.mint(k.address, k.tokens, k.amount, "0x");
        //     } else {
        //         await axos.mintBatch(k.address, k.tokens, k.amount, "0x");
        //     }
        //     console.log(" SUCCESS: ", k.address);
        //     waitFor(3000);
        // }

    })
  })

});
