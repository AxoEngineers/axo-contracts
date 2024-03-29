// SPDX-License-Identifier: GPL-3.0

/*************************************
 * old bubbles contract, deployed on eth
 * https://etherscan.io/address/0x58f46f627c88a3b217abc80563b9a726abb873ba#code
 * Use Bubbles_NEW.sol for future deployments
 */

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
    @title Contract for Bubbles token
    @author Axolittles Team
    @notice BUBBLE token generated from axolittle staking
    @notice Bubbles amount includes 18 decimals.
    Imitates relationship between Ether and Wei, contains 18 decimals.
    User representation is balance/(10 ** 18).
    */
contract Bubbles_OLD_ is ERC20("Bubbles", "BUBBLE"), Ownable {
    /// @dev addresses allowed to mint bubbles, currently only set to address of AxolittlesStaking contract
    mapping(address => bool) public minters;

    constructor() {}

    /**
    @notice function to mint Bubbles to recipient
    @param recipient address where Bubbles are sent
    @param amount number of bubbles(including 18 decimals)
    */
    function mint(address recipient, uint256 amount) external {
        require(minters[msg.sender], "Not approved to mint");
        _mint(recipient, amount);
    }

    /**
    @notice function to burn bubbles owned by sender
    @param amount number of bubbles(including 18 decimals) to burn
    */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
    @notice function to add addresses allowed to mint
    @param addr address of minter
    @param val bool toggle, allows minting from address when 1
     */
    function setMinter(address addr, bool val) external onlyOwner {
        minters[addr] = val;
    }
}
