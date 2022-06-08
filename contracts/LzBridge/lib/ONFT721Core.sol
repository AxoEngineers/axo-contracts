// SPDX-License-Identifier: MIT
// copied from: https://github.com/LayerZero-Labs/solidity-examples/blob/main/contracts/token/onft/ONFT721Core.sol

pragma solidity ^0.8.0;

import "../interfaces/IONFT721Core.sol";
import "./NonblockingLzApp.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract ONFT721Core is NonblockingLzApp, ERC165, IONFT721Core {
    constructor(address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {}

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IONFT721Core).interfaceId || super.supportsInterface(interfaceId);
    }

    function estimateSendFee(uint16 _dstChainId, bytes memory _toAddress, uint16[] memory _tokenIds, bool _useZro, bytes memory _adapterParams) public view virtual override returns (uint nativeFee, uint zroFee) {
        // mock the payload for send()
        bytes memory payload = abi.encode(_toAddress, _tokenIds);
        return lzEndpoint.estimateFees(_dstChainId, address(this), payload, _useZro, _adapterParams);
    }

    function sendFrom(address _from, uint16 _dstChainId, bytes memory _toAddress, uint16[] memory _tokenIds, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams) public payable virtual override {
        _send(_from, _dstChainId, _toAddress, _tokenIds, _refundAddress, _zroPaymentAddress, _adapterParams);
    }

    function _send(address _from, uint16 _dstChainId, bytes memory _toAddress, uint16[] memory _tokenIds, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams) internal virtual {
        _debitFrom(_from, _dstChainId, _toAddress, _tokenIds);

        bytes memory payload = abi.encode(_toAddress, _tokenIds);
        _lzSend(_dstChainId, payload, _refundAddress, _zroPaymentAddress, _adapterParams);

        uint64 nonce = lzEndpoint.getOutboundNonce(_dstChainId, address(this));
        emit SendToChain(_from, _dstChainId, _toAddress, _tokenIds, nonce);
    }

    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        // decode and load the toAddress
        (bytes memory toAddressBytes, uint16[] memory tokenIds) = abi.decode(_payload, (bytes, uint16[]));
        address toAddress;
        assembly {
            toAddress := mload(add(toAddressBytes, 20))
        }

        _creditTo(_srcChainId, toAddress, tokenIds);

        emit ReceiveFromChain(_srcChainId, _srcAddress, toAddress, tokenIds, _nonce);
    }

    function _debitFrom(address _from, uint16 _dstChainId, bytes memory _toAddress, uint16[] memory _tokenIds) internal virtual;

    function _creditTo(uint16 _srcChainId, address _toAddress, uint16[] memory _tokenIds) internal virtual;
}