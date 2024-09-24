import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("LudoGame", function () {
  
    async function deployLudoGame() {
  
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const LudoGame = await hre.ethers.getContractFactory("MyLudoGame");
      const ludo = await LudoGame.deploy();
  
      return { ludo, owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("Should emit the right message after player is moved", async function () {
        const { ludo, owner, otherAccount } = await loadFixture(deployLudoGame);
        const res = await ludo.throwDice();
         
        await expect(ludo.movePlayer(1)).to.be.emit(ludo, "PlayerMoved")
      })
    })
  });