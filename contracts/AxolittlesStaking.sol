// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Interface to interact with Bubbles contract.
interface IBubbles {
  function mint(address recipient, uint256 amount) external;
}

/// @author The Axolittles Team
/// @title Contract for staking axos to receive $BUBBLE
contract AxolittlesStaking is Ownable {
  address public AXOLITTLES;
  address public TOKEN;
  bytes32 public merkleRoot = 0;
  bool public stakingPaused;

  // Amount of $BUBBLE generated each block, contains 18 decimals.
  uint256 public emissionPerBlock;

  /// @notice struct per owner address to store:
  /// a. previously calced rewards, b. number staked, and block since last reward calculation.
  struct staker {
    // previously calculated rewards
    uint256 calcedReward;
    // number of axolittles currently staked
    uint256 numStaked;
    // block since calcedReward was last updated
    uint256 blockSinceLastCalc;
  }

  mapping(address => staker) internal stakers;
  mapping(uint256 => address) internal stakedAxos;
  mapping(address => bool) internal migrationClaimed;

  constructor(
    address _axolittlesAddress,
    address _tokenAddress,
    uint256 _emissionPerBlock
  ) {
    AXOLITTLES = _axolittlesAddress;
    TOKEN = _tokenAddress;
    emissionPerBlock = _emissionPerBlock;
    stakingPaused = false;
  }

  event Stake(address indexed owner, uint256[] tokenIds);
  event Unstake(address indexed owner, uint256[] tokenIds);
  event Claim(address indexed owner, uint256 totalReward);
  event ClaimMigrationReward(address indexed owner, uint256 _rewardAmount);

  /// @notice Function to stake axos. Transfers axos from sender to this contract.
  function stake(uint256[] memory tokenIds) external {
    require(!stakingPaused, "Staking is paused");
    require(tokenIds.length > 0, "Nothing to stake");
    for (uint256 i = 0; i < tokenIds.length; i++) {
      IERC721(AXOLITTLES).transferFrom(msg.sender, address(this), tokenIds[i]);
      stakedAxos[tokenIds[i]] = msg.sender;
    }
    stakers[msg.sender].calcedReward = checkReward(msg.sender);
    stakers[msg.sender].numStaked += tokenIds.length;
    stakers[msg.sender].blockSinceLastCalc = block.number;
    emit Stake(msg.sender, tokenIds);
  }

  /// @notice Function to unstake axos. Transfers axos from this contract back to sender address.
  function unstake(uint256[] memory tokenIds) external {
    //need to perform ownership checks
    require(tokenIds.length > 0, "Nothing to unstake");
    stakers[msg.sender].calcedReward = checkReward(msg.sender);
    for (uint256 i = 0; i < tokenIds.length; i++) {
      require(msg.sender == stakedAxos[tokenIds[i]], "Not your axo!");
      delete stakedAxos[tokenIds[i]];
      IERC721(AXOLITTLES).transferFrom(address(this), msg.sender, tokenIds[i]);
    }
    stakers[msg.sender].numStaked -= tokenIds.length;
    stakers[msg.sender].blockSinceLastCalc = block.number;
    emit Unstake(msg.sender, tokenIds);
  }

  /// @notice Function to claim $BUBBLE.
  function claim() external {
    //todo: ownership and other checks here
    uint256 totalReward = checkReward(msg.sender);
    require(totalReward > 0, "Nothing to claim");
    stakers[msg.sender].blockSinceLastCalc = block.number;
    stakers[msg.sender].calcedReward = 0;
    IBubbles(TOKEN).mint(msg.sender, totalReward);
    emit Claim(msg.sender, totalReward);
  }

  /** 
    todo: claim migration rewards function
    pass in data via merkle root in format of addreess/$BUBBLE owed
    keep mapping(address => bool) rewardsTracker to track who has claimed already
  */
  function claimMigrationReward(
    uint256 _rewardAmount,
    bytes32[] calldata merkleProof
  ) external {
    require(!migrationClaimed[msg.sender], "Already claimed!");
    bytes32 node = keccak256(abi.encodePacked(msg.sender, _rewardAmount)); //check both address and amount
    require(
      MerkleProof.verify(merkleProof, merkleRoot, node),
      "Verification failed!"
    );
    IBubbles(TOKEN).mint(msg.sender, _rewardAmount);
    emit ClaimMigrationReward(msg.sender, _rewardAmount);
  }

  /// @notice Function to check rewards per staker address
  function checkReward(address _staker_address) public view returns (uint256) {
    //todo:
    return (stakers[_staker_address].calcedReward +
      stakers[_staker_address].numStaked *
      emissionPerBlock *
      (block.number - stakers[_staker_address].blockSinceLastCalc));
  }

  //ADMIN FUNCTIONS
  /// @notice Function to change address of NFT
  function setAxolittlesAddress(address _axolittlesAddress) external onlyOwner {
    AXOLITTLES = _axolittlesAddress;
  }

  /// @notice Function to change address of reward token
  function setTokenAddress(address _tokenAddress) external onlyOwner {
    TOKEN = _tokenAddress;
  }

  /// @notice Function to change amount of $BUBBLE generated each block per axo
  function setEmissionPerBlock(uint256 _emissionPerBlock) external onlyOwner {
    emissionPerBlock = _emissionPerBlock;
  }

  /// @notice Function to turn prevent further staking
  function pauseStaking(bool _isPaused) external onlyOwner {
    stakingPaused = _isPaused;
  }

  /* WIP:
  /// @notice Function for admin to transfer axos out of contract back to original owner
  function adminTransfer(uint256[] memory tokenIds) external onlyOwner{
    require(tokenIds.length > 0, "Nothing to unstake"); //cant calc here, but will be really expensive to calc these inside loop
    stakers[msg.sender].calcedReward = checkReward(msg.sender);
    for (uint256 i = 0; i < tokenIds.length; i++) {
      delete stakedAxos[tokenIds[i]];
      IERC721(AXOLITTLES).transferFrom(address(this), msg.sender, tokenIds[i]);
    }
    stakers[msg.sender].numStaked -= tokenIds.length;
    stakers[msg.sender].blockSinceLastCalc = block.number;
    emit Unstake(msg.sender, tokenIds);
  }
  */
}
