// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./lib/OFTCore.sol";

interface IBubbles is IERC20 {
    function burn(uint256 amount) external;
    function mint(address recipient, uint256 amount) external;
}

contract BubbleBridgeEth is OFTCore {
    IERC20 public Bubbles;

    constructor(address _lzEndpoint, address _bubbles) OFTCore(_lzEndpoint) {
        Bubbles = IERC20(_bubbles);
    }

    function _debitFrom(address _from, uint16, bytes memory, uint _amount) internal virtual override {
        uint256 currentAllowance = Bubbles.allowance(_from, address(this));
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= _amount, "ERC20: insufficient allowance");
        }

        Bubbles.transferFrom(_from, address(this), _amount);
        IBubbles(address(Bubbles)).burn(_amount);
    }

    function _creditTo(uint16, address _toAddress, uint _amount) internal virtual override {
        IBubbles(address(Bubbles)).mint(_toAddress, _amount);
    }
}