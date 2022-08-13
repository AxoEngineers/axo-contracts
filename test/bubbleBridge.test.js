const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("OFT: ", function () {
    const chainIdSrc = 1
    const chainIdDst = 2
    let LZEndpointMockFactory, BubblesEthFactory, BubblesArbFactory, BridgeEthFactory, BridgeArbFactory
    let lzEndpointEthMock, lzEndpointArbMock, BridgeEth, BridgeArb, BubblesEth, BubblesArb

    before(async function () {
        LZEndpointMockFactory = await ethers.getContractFactory("LZEndpointMock")
        BubblesEthFactory = await ethers.getContractFactory("Bubbles_OLD_")
        BubblesArbFactory = await ethers.getContractFactory("Bubbles")
        BridgeEthFactory = await ethers.getContractFactory("BubbleBridgeEth")
        BridgeArbFactory = await ethers.getContractFactory("BubbleBridgeArb")
    })

    beforeEach(async function () {
        lzEndpointEthMock = await LZEndpointMockFactory.deploy(chainIdSrc)
        lzEndpointArbMock = await LZEndpointMockFactory.deploy(chainIdDst)

        // create bubble contracts
        BubblesEth = await BubblesEthFactory.deploy()
        BubblesArb = await BubblesArbFactory.deploy()

        // create bubbleBridge contracts
        BridgeEth = await BridgeEthFactory.deploy(lzEndpointEthMock.address, BubblesEth.address)
        BridgeArb = await BridgeArbFactory.deploy(lzEndpointArbMock.address, BubblesArb.address)

        // internal bookkeeping for endpoints (not part of a real deploy, just for this test)
        lzEndpointEthMock.setDestLzEndpoint(BridgeArb.address, lzEndpointArbMock.address)
        lzEndpointArbMock.setDestLzEndpoint(BridgeEth.address, lzEndpointEthMock.address)

        // set each contracts source address so it can send to each other
        await BridgeEth.setTrustedRemote(chainIdDst, BridgeArb.address) // for A, set B
        await BridgeArb.setTrustedRemote(chainIdSrc, BridgeEth.address) // for B, set A
    })

    describe("send bubble from Eth to Arb and back again", async function () {
        // v1 adapterParams, encoded for version 1 style, and 200k gas quote
        const adapterParam = ethers.utils.solidityPack(["uint16", "uint256"], [1, 225000])
        const sendQty = ethers.utils.parseUnits("1", 18) // amount to be sent across
        const initialBubbleQty = ethers.utils.parseUnits("100", 18)
        let owner, user;

        beforeEach(async function () {
            [owner, user] = await ethers.getSigners()

            // Set approvals
            await BubblesEth.setMinter(owner.address, true);
            await BubblesEth.setMinter(BridgeEth.address, true);
            await BubblesArb.setMinter(BridgeArb.address, true);
            await BubblesArb.setBurner(BridgeArb.address, true);
            await BubblesEth.connect(user).approve(BridgeEth.address, ethers.constants.MaxUint256);
            await BubblesArb.connect(user).approve(BridgeArb.address, ethers.constants.MaxUint256);

            // mint 100 Bubbles
            await BubblesEth.mint(user.address, initialBubbleQty)

            // ensure they're both starting with correct amounts
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(initialBubbleQty)
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal("0")
        })

        it("send bubble back and forth", async function () {
            await expect(
                BridgeEth.connect(user).sendFrom(
                    chainIdDst,
                    ethers.utils.solidityPack(["address"], [user.address]),
                    sendQty,
                    user.address,
                    ethers.constants.AddressZero,
                    adapterParam
                )
            ).to.not.reverted

            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(initialBubbleQty.sub(sendQty))
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(sendQty)

            await expect(
                BridgeArb.connect(user).sendFrom(
                    chainIdSrc,
                    ethers.utils.solidityPack(["address"], [user.address]),
                    sendQty.div(2),
                    user.address,
                    ethers.constants.AddressZero,
                    adapterParam
                )
            ).to.not.reverted

            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(initialBubbleQty.sub(sendQty.div(2)))
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(sendQty.div(2))
        })
    })


    describe("setup stored payload, send bubble from Eth to Arb", async function () {
        // v1 adapterParams, encoded for version 1 style, and 200k gas quote
        const adapterParam = ethers.utils.solidityPack(["uint16", "uint256"], [1, 225000])
        const sendQty = ethers.utils.parseUnits("1", 18) // amount to be sent across
        const initialBubbleQty = ethers.utils.parseUnits("100", 18)
        let owner, user;

        beforeEach(async function () {
            [owner, user] = await ethers.getSigners()

            // Set approvals
            await BubblesEth.setMinter(owner.address, true);
            await BubblesEth.setMinter(BridgeEth.address, true);
            await BubblesArb.setMinter(BridgeArb.address, true);
            await BubblesArb.setBurner(BridgeArb.address, true);
            await BubblesEth.connect(user).approve(BridgeEth.address, ethers.constants.MaxUint256);

            // mint 100 Bubbles
            await BubblesEth.mint(user.address, initialBubbleQty)

            // ensure they're both starting with correct amounts
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(initialBubbleQty)
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal("0")

            // block receiving msgs on the dst lzEndpoint to simulate ua reverts which stores a payload
            await lzEndpointArbMock.blockNextMsg()

            // stores a payload
            await expect(
                BridgeEth.connect(user).sendFrom(
                    chainIdDst,
                    ethers.utils.solidityPack(["address"], [user.address]),
                    sendQty,
                    user.address,
                    ethers.constants.AddressZero,
                    adapterParam
                )
            ).to.emit(lzEndpointArbMock, "PayloadStored")

            // verify tokens burned on source chain and minted on destination chain
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(initialBubbleQty.sub(sendQty))
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(0)
        })

        it("hasStoredPayload() - stores the payload", async function () {
            expect(await lzEndpointArbMock.hasStoredPayload(chainIdSrc, BridgeEth.address)).to.equal(true)
        })

        it("getLengthOfQueue() - cant send another msg if payload is blocked", async function () {
            // queue is empty
            expect(await lzEndpointArbMock.getLengthOfQueue(chainIdSrc, BridgeEth.address)).to.equal(0)

            // now that a msg has been stored, subsequent ones will not revert, but will get added to the queue
            await expect(
                BridgeEth.connect(user).sendFrom(
                    chainIdDst,
                    ethers.utils.solidityPack(["address"], [user.address]),
                    sendQty,
                    user.address,
                    ethers.constants.AddressZero,
                    adapterParam
                )
            ).to.not.reverted

            // queue has increased
            expect(await lzEndpointArbMock.getLengthOfQueue(chainIdSrc, BridgeEth.address)).to.equal(1)
        })

        it("retryPayload() - delivers a stuck msg", async function () {
            // balance before transfer is 0
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(0)

            const payload = ethers.utils.defaultAbiCoder.encode(["bytes", "uint256"], [user.address, sendQty])
            await expect(lzEndpointArbMock.retryPayload(chainIdSrc, BridgeEth.address, payload)).to.emit(lzEndpointArbMock, "PayloadCleared")

            // balance after transfer is sendQty
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(sendQty)
        })
    })

    describe("setup stored payload, send bubble from Arb to Eth", async function () {
        // v1 adapterParams, encoded for version 1 style, and 200k gas quote
        const adapterParam = ethers.utils.solidityPack(["uint16", "uint256"], [1, 225000])
        const sendQty = ethers.utils.parseUnits("1", 18) // amount to be sent across
        const initialBubbleQty = ethers.utils.parseUnits("100", 18)
        let owner, user;

        beforeEach(async function () {
            [owner, user] = await ethers.getSigners()

            // Set approvals
            await BubblesArb.setMinter(owner.address, true);
            await BubblesEth.setMinter(BridgeEth.address, true);
            await BubblesArb.setMinter(BridgeArb.address, true);
            await BubblesArb.setBurner(BridgeArb.address, true);
            await BubblesArb.connect(user).approve(BridgeArb.address, ethers.constants.MaxUint256);

            // mint 100 Bubbles
            await BubblesArb.mint(user.address, initialBubbleQty)

            // ensure they're both starting with correct amounts
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(initialBubbleQty)
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal("0")

            // block receiving msgs on the dst lzEndpoint to simulate ua reverts which stores a payload
            await lzEndpointEthMock.blockNextMsg()

            // stores a payload
            await expect(
                BridgeArb.connect(user).sendFrom(
                    chainIdSrc,
                    ethers.utils.solidityPack(["address"], [user.address]),
                    sendQty,
                    user.address,
                    ethers.constants.AddressZero,
                    adapterParam
                )
            ).to.emit(lzEndpointEthMock, "PayloadStored")

            // verify tokens burned on source chain and minted on destination chain
            expect(await BubblesArb.balanceOf(user.address)).to.be.equal(initialBubbleQty.sub(sendQty))
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(0)
        })

        it("hasStoredPayload() - stores the payload", async function () {
            expect(await lzEndpointEthMock.hasStoredPayload(chainIdDst, BridgeArb.address)).to.equal(true)
        })

        it("getLengthOfQueue() - cant send another msg if payload is blocked", async function () {
            // queue is empty
            expect(await lzEndpointEthMock.getLengthOfQueue(chainIdDst, BridgeArb.address)).to.equal(0)

            // now that a msg has been stored, subsequent ones will not revert, but will get added to the queue
            await expect(
                BridgeArb.connect(user).sendFrom(
                    chainIdSrc,
                    ethers.utils.solidityPack(["address"], [user.address]),
                    sendQty,
                    user.address,
                    ethers.constants.AddressZero,
                    adapterParam
                )
            ).to.not.reverted

            // queue has increased
            expect(await lzEndpointEthMock.getLengthOfQueue(chainIdDst, BridgeArb.address)).to.equal(1)
        })

        it("retryPayload() - delivers a stuck msg", async function () {
            // balance before transfer is 0
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(0)

            const payload = ethers.utils.defaultAbiCoder.encode(["bytes", "uint256"], [user.address, sendQty])
            await expect(lzEndpointEthMock.retryPayload(chainIdDst, BridgeArb.address, payload)).to.emit(lzEndpointEthMock, "PayloadCleared")

            // balance after transfer is sendQty
            expect(await BubblesEth.balanceOf(user.address)).to.be.equal(sendQty)
        })
    })
})