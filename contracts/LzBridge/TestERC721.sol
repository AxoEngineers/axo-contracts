
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AxoTestNFT is ERC721 {
    uint16 count;
    constructor() ERC721("Axolittles", "AXOLITTLE") {}

    function mint() external {
        _safeMint(msg.sender, count);
        count++;
    }

    function sd() external {
        selfdestruct(payable(msg.sender));
    }
}