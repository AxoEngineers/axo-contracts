// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISeaonalAxolittles {
    function mint(address account, uint256 id, uint256 amount, bytes memory data) external;
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external; 
}

interface IBubbles {
    function burnFrom(address target, uint256 amount) external;
    function balanceOf(address account) external returns (uint256); 
}

contract AxoweenMinter is Ownable {
    bool public isStarted = true;

    // Payment
    uint256 public priceOneTokenBubble = 10000 ether;

    // Known contracts
    ISeaonalAxolittles public axoContract;
    IBubbles public bubbleContract;

    constructor(address _axoContract, address _bubbleContract) {
        axoContract = ISeaonalAxolittles(_axoContract);
        bubbleContract = IBubbles(_bubbleContract);
    }


    function mintAxoween(uint256 tokenId, uint256 amount) external {
        require(isStarted, "not started");
        require(tokenId < 10, "invalid token");
        uint256 mintCost = amount * priceOneTokenBubble;
        require (mintCost <= bubbleContract.balanceOf(msg.sender), "not enough bubbles");
        bubbleContract.burnFrom(msg.sender, mintCost);
        axoContract.mint(msg.sender, tokenId, amount, "0x");
    }

    // ************Modifiers*****//******* //
    function setIsStarted(bool _isStarted) external onlyOwner {
        isStarted = _isStarted;
    }

    function setPrice(uint256 _priceOneTokenBubble) external onlyOwner {
        priceOneTokenBubble = _priceOneTokenBubble;
    }
}