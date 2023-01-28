# Axolittles Contracts

## Description
Repository contains the code for current axolittles smart contracts, backups of the legacy axolittles contracts, and supporting infra. This repo is built using hardhat.

All code in this repo is available under the MIT License unless specified otherwise. All code is available as-is. Axolittles takes no risk or responsibility for anyone using this code.

## Installation
`npm install`

You must create a `.env` file that contains the API_KEYS and Private Keys used in `hardhat.config.js` and elsewhere. 

## Code Layout
- Smart Contracts can be found in the `/contracts/` directory.
- Scripts for deploying smart contracts can be found in the `/scripts/` directory 
- Tests can be found in the `/test/` directory. You can execute them with `npx hardhat test <path to test>`
- Utilities can be found in the `/utils/` directory. You can run the build-merkle.js tool with `node utils/build-merkle.js`

## Existing Contract Addresses:
Ethereum
- Axolittles: 0xf36446105fF682999a442b003f2224BcB3D82067 
- Bubbles: 0x58f46f627c88a3b217abc80563b9a726abb873ba 
- StakingV1: 0x1ca6e4643062e67ccd555fb4f64bee603340e0ea 
- StakingV2: 0xbfcA4318f4d47f8A8e49e16c0f2B466c46EAC184 
- Airdrop: 0x184fae65b0d0bbba559326feb7d9fcc6e8f31df7 
- AxoBridge: 0x49dc480b512bb675a6f0e8bbab39e47096902e4d 
- BubbleBridge: 0x67e82738f07d9063Cacf69f853a0e6151014620B

Arbitrum
- AxolittleArb: 0xcc737e05a6b5d94cafa523e55c5689631c8e97a4 
- Bubbles: 0xBB113ad1B7C4615CcF59A5D8A4062335038D6ee5 
- Staking: 0xDb4736eE9Cf22d79501e4C079ac8ca090694274b 
- BubbleBridge: 0x23f8dA239084247d564c912c5A0372B901985DAe
- SeasonalAxos: 0xbcdab29129534f5cfcd54fd2f6e489026bd88e9e

# Issues
[Issue Tracker](https://github.com/axoengineers/axo-contracts/issues)

# Socials
Join our Discord: https://discord.gg/axolittlesnft