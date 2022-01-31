// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Interface to interact with Bubbles contract.
interface IBubbles {
  function mint(address recipient, uint256 amount) external;
}

/// @author The Axolittles Team
/// @title Contract for claiming axolittle staking migration reward
contract MigrationReward is Ownable {
  address public TOKEN;
  bytes32 public merkleRoot = 0;

  mapping(address => bool) internal migrationClaimed;

  constructor(address _tokenAddress) {
    TOKEN = _tokenAddress;
  }

  event ClaimMigrationReward(address indexed owner, uint256 _rewardAmount);

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
    migrationClaimed[msg.sender] = true;
    IBubbles(TOKEN).mint(msg.sender, _rewardAmount);
    emit ClaimMigrationReward(msg.sender, _rewardAmount);
  }

  /// @notice Function to change address of reward token
  function setTokenAddress(address _tokenAddress) external onlyOwner {
    TOKEN = _tokenAddress;
  }
}
