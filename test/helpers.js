//WIP
/*
const Papa = require("papaparse");
const fs = require("fs-extra");
const path = require("path");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);


//function takes in merkleTreeDB, returns merkle tree object
// use merkleTree.getRoot() for merkle root
function generateMerkleTree(merkleTreeDB) {
    const leafNodes = merkleTreeDB.map(convertEntryToHash);
    return new MerkleTree(leafNodes, keccak256, { sortPairs: true });
}

//returns merkle proof for given address and balance
function generateCallerProof(caller, merkleTree) {
    let callerHash = convertEntryToHash(caller);
    let callerProof = merkleTree.getHexProof(callerHash);
}

//function to parse input file
//probably need to modify to fit whatever input file format is
function generateMerkleTreeDB(_file) {
    var content = fs.readFileSync(_file, "utf8");
    const allAddresses = [];
    Papa.parse(content, {
        delimeter: "\t",
        complete: function (results) {
            const data = results.data;
            for (const address of data) {
                allAddresses.push(address[0].trim().toLowerCase());
            }
        },
    });
    return allAddresses;
}

//export { generateMerkleTree, generateCallerProof, generateMerkleTreeDB };
*/
