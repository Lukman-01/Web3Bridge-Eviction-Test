import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const PAIR_ADDRESS = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5"; 

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountADesired = ethers.parseUnits("1", 6); 
    const amountBDesired = ethers.parseUnits("2", 18); 
    const amountAMin = ethers.parseUnits("0", 6); 
    const amountBMin = ethers.parseUnits("0", 18); 
    const liquidityAmount = ethers.parseUnits("0.00000088319034449", 18); 

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    const PAIR_Contract = await ethers.getContractAt("IERC20", PAIR_ADDRESS, impersonatedSigner);

    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    const usdcBalBefore = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalBefore = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("USDC balance before adding liquidity", ethers.formatUnits(usdcBalBefore, 6));
    console.log("DAI balance before adding liquidity", ethers.formatUnits(daiBalBefore, 18));

    await USDC_Contract.approve(ROUTER_ADDRESS, amountADesired);
    await DAI_Contract.approve(ROUTER_ADDRESS, amountBDesired);

    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    const addLiquidityTx = await ROUTER.addLiquidity(
        USDC,
        DAI,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        impersonatedSigner.address,
        deadline
    );

    await addLiquidityTx.wait();

    console.log("Liquidity added successfully!");
    console.log(addLiquidityTx);

    const lpTokenBalAfterAdding = await PAIR_Contract.balanceOf(impersonatedSigner.address);
    console.log("LP Token balance after adding liquidity", ethers.formatUnits(lpTokenBalAfterAdding, 18));

    if (lpTokenBalAfterAdding < (liquidityAmount)) {
        console.error("Insufficient LP tokens to remove liquidity");
        process.exitCode = 1;
        return;
    }

    const usdcBalAfterAddingLiquidity = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfterAddingLiquidity = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("USDC balance before adding liquidity", ethers.formatUnits(usdcBalAfterAddingLiquidity, 6));
    console.log("DAI balance before adding liquidity", ethers.formatUnits(daiBalAfterAddingLiquidity, 18));

    await PAIR_Contract.approve(ROUTER_ADDRESS, liquidityAmount);

    const removeLiquidityTx = await ROUTER.removeLiquidity(
        USDC,
        DAI,
        liquidityAmount,
        amountAMin,
        amountBMin,
        impersonatedSigner.address,
        deadline
    );

    await removeLiquidityTx.wait(); 

    console.log(removeLiquidityTx);

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("USDC balance after removing liquidity", ethers.formatUnits(usdcBalAfter, 6));
    console.log("DAI balance after removing liquidity", ethers.formatUnits(daiBalAfter, 18));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
