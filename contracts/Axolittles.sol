// SPDX-License-Identifier: GPL-3.0

// File contracts/Axolittles.sol

/**
   #                                                            
  # #   #    #  ####  #      # ##### ##### #      ######  ####  
 #   #   #  #  #    # #      #   #     #   #      #      #      
#     #   ##   #    # #      #   #     #   #      #####   ####  
#######   ##   #    # #      #   #     #   #      #           # 
#     #  #  #  #    # #      #   #     #   #      #      #    # 
#     # #    #  ####  ###### #   #     #   ###### ######  ####  
 */
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.10;

/// @title Main contract for Axolittles NFT
/// @author Axolittles Team
/// @notice Contract used for initial minting phase
contract Axolittles is ERC721, Ownable {
    uint256 public mintPrice = 0.07 ether; // Mutable by owner
    uint256 public maxItems = 10000;
    uint256 public totalSupply = 0;
    uint256 public maxItemsPerTx = 10; // Mutable by owner
    string public _baseTokenURI;
    bool public publicMintPaused = false;
    uint256 public startTimestamp = 1630944000; // Monday, September 6, 2021 at 12pm Eastern

    // declare Mint event. Emits are stored on blockchain and applications can listen for them.
    event Mint(address indexed owner, uint256 indexed tokenId);

    //Set contract name and token symbol
    constructor() ERC721("Axolittles", "AXOLITTLE") {}

    /// @dev there is nothing to receive, probably not needed?
    receive() external payable {}

    /// @notice Function for airdropping by owner, calls `_mintWithoutValidation()` function
    function giveawayMint(address to, uint256 amount) external onlyOwner {
        _mintWithoutValidation(to, amount);
    }

    /// @notice Public minting function, accessed by public through axo website
    /// @dev Checks start date, contract paused, eth remainder, max # axos per transaction before minting
    /// @dev Calculates # of axos to mint based on eth amount sent
    function publicMint() external payable {
        require(block.timestamp >= startTimestamp, "publicMint: Not open yet");
        require(!publicMintPaused, "publicMint: Paused");
        uint256 remainder = msg.value % mintPrice;
        uint256 amount = msg.value / mintPrice;
        require(remainder == 0, "publicMint: Send a divisible amount of eth");
        require(amount <= maxItemsPerTx, "publicMint: Surpasses maxItemsPerTx");

        _mintWithoutValidation(msg.sender, amount);
    }

    /// @dev internal minting function, no checks
    function _mintWithoutValidation(address to, uint256 amount) internal {
        require(
            totalSupply + amount <= maxItems,
            "mintWithoutValidation: Sold out"
        );
        for (uint256 i = 0; i < amount; i++) {
            _mint(to, totalSupply);
            emit Mint(to, totalSupply);
            totalSupply += 1;
        }
    }

    /// @notice checks if mint open, needs start time passed, unpaused, and axos in stock
    function isOpen() external view returns (bool) {
        return
            block.timestamp >= startTimestamp &&
            !publicMintPaused &&
            totalSupply < maxItems;
    }

    /// @notice ADMIN FUNCTIONALITY

    function setStartTimestamp(uint256 _startTimestamp) external onlyOwner {
        startTimestamp = _startTimestamp;
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function setPublicMintPaused(bool _publicMintPaused) external onlyOwner {
        publicMintPaused = _publicMintPaused;
    }

    function setMaxItemsPerTx(uint256 _maxItemsPerTx) external onlyOwner {
        maxItemsPerTx = _maxItemsPerTx;
    }

    /// @dev set base URI for token metadata. Allows file host change to ipfs
    function setBaseTokenURI(string memory __baseTokenURI) external onlyOwner {
        _baseTokenURI = __baseTokenURI;
    }

    /// @dev Withdraw the entire contract balance to the dev address
    function withdraw() external onlyOwner {
        sendEth(owner(), address(this).balance);
    }

    function sendEth(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Failed to send ether");
    }

    // METADATA FUNCTIONALITY
    /// @dev Returns a URI for a given token ID's metadata
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return
            string(abi.encodePacked(_baseTokenURI, Strings.toString(_tokenId)));
    }
}
