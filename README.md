# Ludo Dice Generator & Uniswap Interaction Scripts

This repository contains two separate projects: 

1. **Ludo Dice Generator (Hardhat)**:  
   A simple Ludo game dice generator smart contract implemented using Solidity and Hardhat. It simulates the dice roll mechanics of the Ludo game.

2. **Uniswap Interaction Scripts**:  
   A collection of scripts to interact with four core Uniswap functions:
   - Add Liquidity
   - Remove Liquidity
   - swapExactETHForTokens
   - swapTokensForExactETH

## Structure
- **/ludo-dice-generator**: Contains the Hardhat project with the smart contract for generating random dice rolls.
- **/uniswap-interactions**: Contains scripts for interacting with the Uniswap protocol using ethers.js, focused on liquidity management and token swaps.

## Setup Instructions
1. Clone the repository:
   ```bash
   git https://github.com/Lukman-01/Web3Bridge-Eviction-Test.git
   ```
2. Navigate to each folder and install dependencies:
   ```bash
   cd Ludo-Game
   npm install
   ```
   ```bash
   cd uniswap-interactions
   npm install
   ```

## Running the Projects
### Ludo Dice Generator
1. Compile the contract:
   ```bash
   npx hardhat compile
   ```
2. Deploy the contract:
   ```bash
   npx hardhat ignition deploy ./ignition/modules/deploy.ts --network lisk-sepolia
   ```

### Uniswap Interactions
1. Update the `.env` file with your environment variables (e.g., provider URL, private key).
2. Run the interaction scripts:
   ```bash
   npx hardhat run scripts/Uniswap-Add-Liquidity.ts
   ```