const { ethers } = require("hardhat");
require("dotenv").config();
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
var fs = require('fs');

let airdropPath = process.env.AIRDROP_PATH
let outputPath = process.env.PROOFS_PATH
let merkleRootPath = process.env.MERKLE_ROOT_PATH

function convertEntryToHash(entry) {
    let packedEntry = ethers.utils.concat([
        ethers.utils.arrayify(entry.address),
        ethers.utils.zeroPad(ethers.utils.hexlify(ethers.BigNumber.from(entry.balance)), 32)
    ]);

    return (
        "0x" +
        Buffer.from(
            keccak256("0x" + Buffer.from(packedEntry).toString("hex"))
        ).toString("hex")
    );
}


console.log('building merkle tree...')
const merkleTreeDB = require(airdropPath); 
const leafNodes = merkleTreeDB.map(convertEntryToHash);
merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
console.log('done!')

console.log('getting proofs...')
let output = [];

for (const entry in merkleTreeDB ){
    let address = merkleTreeDB[entry]["address"];
    let balance = merkleTreeDB[entry]["balance"];
    let caller = {
        address:address,
        balance:balance
    };
    let callerHash = convertEntryToHash(caller);
    let callerProof = merkleTree.getHexProof(callerHash);

    let outputEntry = {
        "address":address,
        "balance":balance,
        "proof":callerProof
    }

    output.push(outputEntry);
}
console.log('done!')

console.log('writing proofs to: ', outputPath)

let jsonString = JSON.stringify(output)
fs.writeFile(outputPath, jsonString, function(err) {
    if (err) throw err;
    console.log('done!');
    }
);


console.log('writing merkle root to: ', merkleRootPath)

let merkleRoot = merkleTree.getRoot().toString('hex')
fs.writeFile(merkleRootPath, merkleRoot, function(err) {
    if (err) throw err;
    console.log('done!');
    }
);
