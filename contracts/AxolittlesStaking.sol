// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title Interface to interact with Bubbles contract. 
/// @dev can be used with IBubbles(contractAddress).functionName(params)
interface IBubbles {
    function mint(address recipient, uint amount) external;
}

/// @title Contract for staking axos to receive BUBBLE
/// @author Axolittles Team
/// @dev Staking contract interacts with Axolittles contract and Bubbles contract
contract AxolittlesStaking is Ownable {
    address public constant AXOLITTLES = 0xf36446105fF682999a442b003f2224BcB3D82067;
    address public constant TOKEN = 0x58f46F627C88a3b217abc80563B9a726abB873ba;
    /** 
    @notice Amount of bubbles generated each block. 
    Imitates relationship between Ether and Wei, contains 18 decimals.
    User representation is balance/(10 ** 18).
    Average block time for eth is 12-14 seconds.
    */
    uint256 public emissionPerBlock;

    /// @notice Constructor takes in Bubbles address, and # bubbles generated per block
    constructor(uint _emissionPerBlock) {
        emissionPerBlock = _emissionPerBlock;
        //console.log("Deployed staking contract with axo addr: '%s', token addr: '%s', emissionPerBlock: '%d'",
        //AXOLITTLES, TOKEN, emissionPerBlock);
    }

    /**
    @notice 
    staker struct to store: (per owner address)
        1. rewards that were calculated but not claimed yet
        2. number of axos currently staked
        3. block since last reward calculation
     */
    struct staker {
        uint calcedReward;
        uint numStaked;
        uint blockSinceLastCalc;
    }


    /**
    @notice Maps to store user info
    `stakers` stores (address of owner => staker struct)
    `stakedAxos` stores (tokenID => address of owner)
    */
    mapping(address => staker) internal stakers;
    mapping(uint => address) internal stakedAxos;

    /// @notice declare Stake and Unstake event. Emits are stored on blockchain and applications can listen for them.
    event Stake(address indexed owner, uint[] tokenIds);
    event Unstake(address indexed owner, uint[] tokenIds);
    event Claim(address indexed owner, uint totalReward);

    //todo: pause function?


    /**
    @notice Function to stake axos. Transfers axos from sender to this contract.
    @param tokenIds array of axolittle tokenIds to stake
    @dev 
    1. perform ownership and other checks w/ require
    2. add staker to stakers map if new address
    3. transfer staked axos from owner to staking contract
    4. push tokenIDs in stakedAxos map
    5. calc rewards generated up to this point
        1. calcedReward += numStaked * Bubblesperblock * (curr block - blockSinceLastCalc) 
    6. numStaked += tokenIDs.size
    7. blockSinceLastCalc = currBlock
    */
    function stake(uint[] memory tokenIds) external {
        require(tokenIds.length > 0, "Nothing to stake");
        for (uint i = 0; i < tokenIds.length; i++) {
            IERC721(AXOLITTLES).transferFrom(msg.sender, address(this), tokenIds[i]);
            //is this doable by batch?
            stakedAxos[tokenIds[i]] = msg.sender;
            console.log("staked axo id: ", tokenIds[i]);
        }
        stakers[msg.sender].calcedReward = checkReward(msg.sender);
        stakers[msg.sender].numStaked += tokenIds.length;
        stakers[msg.sender].blockSinceLastCalc = block.number;
        emit Stake(msg.sender, tokenIds);
    }

    /**
    @notice Function to unstake axos. Transfers axos from this contract back to sender address.
    @param tokenIds array of axolittle tokenIds to unstake
    @dev loops through each axo, then:
    1. perform ownership and other checks w/ require
    2. calc rewards generated up to this point:
        calcedReward += numStaked * Bubblesperblock * (curr block - blockSinceLastCalc) 
    3. pop tokenIDs from stakedAxos map
    4. numStaked -= tokenIDs.size
    5. blockSinceLastCalc = currBlock
    6. transfer unstaked axos back to owner
    @dev maybe utilize claim() function here, instead of reimplementing it? 
    @dev is there any benefit of deleting user if they no longer have any staked?
     */
    function unstake(uint[] memory tokenIds) external {
        //todo:
        //need to perform ownership checks
        //will everything revert if fails partway?
        stakers[msg.sender].calcedReward = checkReward(msg.sender);
        for(uint i = 0; i < tokenIds.length; i++) {
            require(msg.sender == stakedAxos[tokenIds[i]], "Not your axo!");
            delete stakedAxos[tokenIds[i]];
            IERC721(AXOLITTLES).transferFrom(address(this), msg.sender, tokenIds[i]);
        }
        stakers[msg.sender].numStaked -= tokenIds.length;
        stakers[msg.sender].blockSinceLastCalc = block.number;
        emit Unstake(msg.sender, tokenIds);
    }

    /**
    @notice Function to claim Bubbles.
    @dev 
    1. perform ownership and other check w/ require 
    2. calc rewards generated up to this point:
        calcedReward += numStaked * Bubblesperblock * (curr block - blockSinceLastCalc) 
    3. blockSinceLastcalc = currBlock
    4. reset calcedReward
    5. mint Bubbles to staker address
    */
    function claim() external {
        //todo: ownership and other checks here
        uint totalReward = checkReward(msg.sender);
        require(totalReward > 0, "Nothing to claim");
        stakers[msg.sender].blockSinceLastCalc = block.number;
        stakers[msg.sender].calcedReward = 0;
        IBubbles(TOKEN).mint(msg.sender, totalReward);
        emit Claim(msg.sender, totalReward);
    }

    /**
    @notice Function to check rewards per staker address
    @param _staker_address address of axo owner
    */
    function checkReward(address _staker_address) public view returns (uint) {
        //todo:
        return (
            stakers[_staker_address].calcedReward +
            stakers[_staker_address].numStaked *
            emissionPerBlock *
            (block.number - stakers[_staker_address].blockSinceLastCalc)
        );
    }

    /// @notice Function to change amount of Bubbles generated each block per axo
    function setEmissionPerBlock(uint _emissionPerBlock) external onlyOwner {
        emissionPerBlock = _emissionPerBlock;
    }
}
    /**
    todo: airdrop rewards function
    pass in data via merkle root in format of adderess/bubblesOwed
    keep mapping(address => bool) rewardsTracker to track who has claimed already
    
    todo: migration helper
    help transfer peoples axos from old staking contract to new one, autoclaim rewards?
    
    todo: admin unstake function?
    for emergency use, etc.
    */