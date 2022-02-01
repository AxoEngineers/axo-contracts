// SPDX-License-Identifier: MIT

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
  bool public stakingPaused;

  // Amount of $BUBBLE generated each block, contains 18 decimals.
  uint256 public emissionPerBlock;

  /// @notice struct per owner address to store:
  /// a. previously calced rewards, b. number staked, and block since last reward calculation.
  struct staker {
    // number of axolittles currently staked
    uint256 numStaked;
    // block since calcedReward was last updated
    uint256 blockSinceLastCalc;
    // previously calculated rewards
    uint256 calcedReward;
  }

  /// @dev setting as public for now, to make testing easier
  mapping(address => staker) public stakers;
  mapping(uint256 => address) internal stakedAxos;

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
  event SetStakingPaused(bool _stakingPaused);
  event AdminTransfer(uint256[] tokenIds);

  /// @notice Function to stake axos. Transfers axos from sender to this contract.
  function stake(uint256[] memory tokenIds) external {
    require(!stakingPaused, "Staking is paused");
    require(tokenIds.length > 0, "Nothing to stake");
    stakers[msg.sender].calcedReward = _checkRewardInternal(msg.sender);
    stakers[msg.sender].numStaked += tokenIds.length;
    stakers[msg.sender].blockSinceLastCalc = block.number;
    for (uint256 i = 0; i < tokenIds.length; i++) {
      IERC721(AXOLITTLES).transferFrom(msg.sender, address(this), tokenIds[i]);
      stakedAxos[tokenIds[i]] = msg.sender;
    }
    emit Stake(msg.sender, tokenIds);
  }

  /// @notice Function to unstake axos. Transfers axos from this contract back to sender address.
  function unstake(uint256[] memory tokenIds) external {
    require(tokenIds.length > 0, "Nothing to unstake");
    require(tokenIds.length <= stakers[msg.sender].numStaked, "Not your axo!");
    stakers[msg.sender].calcedReward = _checkRewardInternal(msg.sender);
    stakers[msg.sender].numStaked -= tokenIds.length;
    stakers[msg.sender].blockSinceLastCalc = block.number;
    for (uint256 i = 0; i < tokenIds.length; i++) {
      require(msg.sender == stakedAxos[tokenIds[i]], "Not your axo!");
      delete stakedAxos[tokenIds[i]];
      IERC721(AXOLITTLES).transferFrom(address(this), msg.sender, tokenIds[i]);
    }
    emit Unstake(msg.sender, tokenIds);
  }

  /// @notice Function to claim $BUBBLE.
  function claim() external {
    //todo: ownership and other checks here
    uint256 totalReward = _checkRewardInternal(msg.sender);
    require(totalReward > 0, "Nothing to claim");
    stakers[msg.sender].blockSinceLastCalc = block.number;
    stakers[msg.sender].calcedReward = 0;
    IBubbles(TOKEN).mint(msg.sender, totalReward);
    emit Claim(msg.sender, totalReward);
  }

  /// @notice Function to check rewards per staker address
  function checkReward(address _staker_address)
    external
    view
    returns (uint256)
  {
    return _checkRewardInternal(_staker_address);
  }

  /// @notice Internal function to check rewards per staker address
  function _checkRewardInternal(address _staker_address)
    internal
    view
    returns (uint256)
  {
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

  /// @notice Function to prevent further staking
  function setStakingPaused(bool _isPaused) external onlyOwner {
    stakingPaused = _isPaused;
    emit SetStakingPaused(stakingPaused);
  }

  /// @notice Function for admin to transfer axos out of contract back to original owner
  function adminTransfer(uint256[] memory tokenIds) external onlyOwner {
    require(tokenIds.length > 0, "Nothing to unstake");
    for (uint256 i = 0; i < tokenIds.length; i++) {
      address owner = stakedAxos[tokenIds[i]];
      require(owner != address(0), "Axo not found");
      stakers[owner].numStaked--;
      delete stakedAxos[tokenIds[i]];
      IERC721(AXOLITTLES).transferFrom(address(this), owner, tokenIds[i]);
    }
    emit AdminTransfer(tokenIds);
  }
}
