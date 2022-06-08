// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./lib/ONFT721Core.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract AxoBridge is ONFT721Core, IERC721Receiver {

    IERC721 public Axolittles = IERC721(0x14B6254fe94527FF1e4E2654ab7A9b6De52baFa7);

    constructor(address _lzEndpoint) ONFT721Core(_lzEndpoint) {}

    function _debitFrom(address _from, uint16, bytes memory, uint16[] memory _tokenIds) internal virtual override {
        require(Axolittles.isApprovedForAll(_from, address(this)), "AxoBridge: not approved");

        for (uint16 i = 0; i < _tokenIds.length;) {
            require(Axolittles.ownerOf(_tokenIds[i]) == _from, "AxoBridge: send caller not owner");
            Axolittles.safeTransferFrom(_from, address(this), _tokenIds[i]);
            unchecked { i++; }
        }
    }

    function _creditTo(uint16, address _toAddress, uint16[] memory _tokenIds) internal virtual override {
        for (uint16 i = 0; i < _tokenIds.length;) {
            Axolittles.safeTransferFrom(address(this), _toAddress, _tokenIds[i]);
            unchecked { i++; }
        }
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        require(msg.sender == address(Axolittles), "AxoBridge: received non Axolittle");
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function sd() external {
        selfdestruct(payable(msg.sender));
    }
}