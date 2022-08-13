// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./lib/OFTCore.sol";

interface IBubbles {
    function burnFrom(address target, uint256 amount) external;
    function mint(address recipient, uint256 amount) external;
}

contract BubbleBridgeArb is OFTCore {
    IBubbles public Bubbles;

    constructor(address _lzEndpoint, address _bubbles) OFTCore(_lzEndpoint) {
        Bubbles = IBubbles(_bubbles);
    }

    function _debitFrom(address _from, uint16, bytes memory, uint _amount) internal virtual override {
        Bubbles.burnFrom(_from, _amount);
    }

    function _creditTo(uint16, address _toAddress, uint _amount) internal virtual override {
        Bubbles.mint(_toAddress, _amount);
    }
}