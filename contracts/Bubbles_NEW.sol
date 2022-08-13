// SPDX-License-Identifier: MIT

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
contract Bubbles is ERC20("Bubbles", "BUBBLE"), Ownable {
    /// @dev addresses allowed to mint or burn bubbles
    mapping(address => bool) public minters;
    mapping(address => bool) public burners;

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
    @notice function to burn bubbles owned by target
    @param target address where Bubbles are burned
    @param amount number of bubbles(including 18 decimals) to burn
    */
    function burnFrom(address target, uint256 amount) external {
        require(burners[msg.sender], "Not approved to burn");
        _spendAllowance(target, address(msg.sender), amount);
        _burn(target, amount);
    }

    /**
    @notice function to add addresses allowed to mint
    @param addr address of minter
    @param val bool toggle, allows minting from address when true
     */
    function setMinter(address addr, bool val) external onlyOwner {
        minters[addr] = val;
    }

    /**
    @notice function to add addresses allowed to burn for others
    @param addr address of burner
    @param val bool toggle, allows burning from address when true
     */
    function setBurner(address addr, bool val) external onlyOwner {
        burners[addr] = val;
    }
}
