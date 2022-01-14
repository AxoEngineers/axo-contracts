// SPDX-License-Identifier: GPL-3.0

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

pragma solidity ^0.8.7;


contract Axolittles is ERC721, Ownable {

    uint public mintPrice = 0.07 ether; // Mutable by owner
    uint public maxItems = 10000;
    uint public totalSupply = 0;
    uint public maxItemsPerTx = 10; // Mutable by owner
    string public _baseTokenURI;
    bool public publicMintPaused = false;
    uint public startTimestamp = 1630944000; // Monday, September 6, 2021 at 12pm Eastern

    event Mint(address indexed owner, uint indexed tokenId);

    constructor() ERC721("Axolittles", "AXOLITTLE") {}

    receive() external payable {}

    function giveawayMint(address to, uint amount) external onlyOwner {
        _mintWithoutValidation(to, amount);
    }

    function publicMint() external payable {
        require(block.timestamp >= startTimestamp, "publicMint: Not open yet");
        require(!publicMintPaused, "publicMint: Paused");
        uint remainder = msg.value % mintPrice;
        uint amount = msg.value / mintPrice;
        require(remainder == 0, "publicMint: Send a divisible amount of eth");
        require(amount <= maxItemsPerTx, "publicMint: Surpasses maxItemsPerTx");

        _mintWithoutValidation(msg.sender, amount);
    }

    function _mintWithoutValidation(address to, uint amount) internal {
        require(totalSupply + amount <= maxItems, "mintWithoutValidation: Sold out");
        for (uint i = 0; i < amount; i++) {
            _mint(to, totalSupply);
            emit Mint(to, totalSupply);
            totalSupply += 1;
        }
    }

    function isOpen() external view returns (bool) {
        return block.timestamp >= startTimestamp && !publicMintPaused && totalSupply < maxItems;
    }

    // ADMIN FUNCTIONALITY

    function setStartTimestamp(uint _startTimestamp) external onlyOwner {
        startTimestamp = _startTimestamp;
    }

    function setMintPrice(uint _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function setPublicMintPaused(bool _publicMintPaused) external onlyOwner {
        publicMintPaused = _publicMintPaused;
    }

    function setMaxItemsPerTx(uint _maxItemsPerTx) external onlyOwner {
        maxItemsPerTx = _maxItemsPerTx;
    }

    function setBaseTokenURI(string memory __baseTokenURI) external onlyOwner {
        _baseTokenURI = __baseTokenURI;
    }

    /**
     * @dev Withdraw the contract balance to the dev address or splitter address
     */
    function withdraw() external onlyOwner {
        sendEth(owner(), address(this).balance);
    }

    function sendEth(address to, uint amount) internal {
        (bool success,) = to.call{value: amount}("");
        require(success, "Failed to send ether");
    }

    // METADATA FUNCTIONALITY

    /**
     * @dev Returns a URI for a given token ID's metadata
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, Strings.toString(_tokenId)));
    }

}