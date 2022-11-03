// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SeasonalAxolittles is ERC1155, AccessControl {
    bytes32 public constant MinterRole = keccak256("MINTER_ROLE");
    bytes32 public constant BurnerRole = keccak256("BURNER_ROLE");

    constructor()
        ERC1155(
            "https://storage.googleapis.com/axolittles/metadata/seasonal/{id}.json"
        )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyRole(MinterRole) {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyRole(MinterRole) {
        _mintBatch(to, ids, amounts, data);
    }

    function burn(
        address account,
        uint256 id,
        uint256 value
    ) public onlyRole(BurnerRole) {
        _burn(account, id, value);
    }

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) public onlyRole(BurnerRole) {
        _burnBatch(account, ids, values);
    }

    function setUri(string memory _uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(_uri);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IAccessControl).interfaceId ||
            interfaceId == type(IERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
