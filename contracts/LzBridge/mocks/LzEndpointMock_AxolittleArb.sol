// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ILayerZeroReceiver.sol";

contract LzEndpointMock_AxolittlesArb  {

    ILayerZeroReceiver axolittlesArb;

    function setAxolittles(address _axolittles) external {
        axolittlesArb = ILayerZeroReceiver(_axolittles);
    }

    function mintNfts(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _toAddress, uint16[] memory _tokenIds) external {
        bytes memory payload = abi.encode(_toAddress, _tokenIds);
        axolittlesArb.lzReceive(_srcChainId, _srcAddress, _nonce, payload);
    }
}