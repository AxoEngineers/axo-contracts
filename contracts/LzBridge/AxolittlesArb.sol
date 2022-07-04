
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./lib/ONFT721Core.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AxolittlesArb is Ownable, ONFT721Core, ERC721 {
    uint256 public totalSupply = 10000;
    string public _baseTokenURI;

    constructor(address _lzEndpoint) ERC721("Axolittles", "AXOLITTLE") ONFT721Core(_lzEndpoint) {}

    function supportsInterface(bytes4 interfaceId) public view virtual override(ONFT721Core, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _debitFrom(address _from, uint16, bytes memory, uint16[] memory _tokenIds) internal virtual override {
        for (uint16 i = 0; i < _tokenIds.length;) {
            require(ERC721.ownerOf(_tokenIds[i]) == _from, "Axolittles: incorrect owner");
            _burn(_tokenIds[i]);
            unchecked { ++i; }
        }
    }

    function _creditTo(uint16, address _toAddress, uint16[] memory _tokenIds) internal virtual override {
        for (uint16 i = 0; i < _tokenIds.length;) {
            require(!_exists(_tokenIds[i]), "Axolittles: already exist");
            _safeMint(_toAddress, _tokenIds[i]);
            unchecked { ++i; }
        }
    }

    // set base URI for token metadata. Allows file host change to ipfs
    function setBaseTokenURI(string memory __baseTokenURI) external onlyOwner {
        _baseTokenURI = __baseTokenURI;
    }

    // Returns a URI for a given token ID's metadata
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return
            string(abi.encodePacked(_baseTokenURI, Strings.toString(_tokenId)));
    }

    function adminRecover(address _to, uint16 _tokenId, bool isMint) external onlyOwner {
        if (isMint) {
            _safeMint(_to, _tokenId);
        }
        else {
            require(_exists(_tokenId), "Axolittles: doesn't exist");
            _burn(_tokenId);
        }
    }
}