import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const TOKEN_HOLDER = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(TOKEN_HOLDER);
  const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);
  
  const USDC_Contr = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
  const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

  const amountIn = ethers.parseEther("0.5");
  const path = [WETH, USDC];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // Get the estimated amounts out
  const amounts = await ROUTER.getAmountsOut(amountIn, path);
  // The getAmountsOut function returns an array of amounts for each step in the path. We're interested in the last element, which is the expected USDC output.
  const amountOutMin = amounts[amounts.length - 1];

  // Fetch initial balances
  const initialEthBal = await ethers.provider.getBalance(impersonatedSigner.address);
  const initialUsdcBal = await USDC_Contr.balanceOf(impersonatedSigner.address);

  console.log("===========================================");
  console.log("Initial ETH balance:", ethers.formatEther(initialEthBal));
  console.log("Initial USDC balance:", ethers.formatUnits(initialUsdcBal, 6));

  // Perform the swap
  const tx = await ROUTER.swapExactETHForTokens(
    amountOutMin,
    path,
    impersonatedSigner.address,
    deadline,
    { value: amountIn }
  );
  await tx.wait();
  console.log(tx);

  // Fetch final balances
  const finalEthBal = await ethers.provider.getBalance(impersonatedSigner.address);
  const finalUsdcBal = await USDC_Contr.balanceOf(impersonatedSigner.address);

  
  console.log("Final ETH balance:", ethers.formatEther(finalEthBal));
  console.log("Final USDC balance:", ethers.formatUnits(finalUsdcBal, 6));
  console.log("===========================================");
  console.log("ETH spent:", ethers.formatEther(initialEthBal - finalEthBal));
  console.log("USDC received:", ethers.formatUnits(finalUsdcBal - initialUsdcBal, 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});