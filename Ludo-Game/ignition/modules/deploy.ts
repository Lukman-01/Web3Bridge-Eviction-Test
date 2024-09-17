import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LudoModule = buildModule("LudoModule", (m) => {

  const ludo = m.contract("Ludo");

  return { ludo };
});

export default LudoModule;
