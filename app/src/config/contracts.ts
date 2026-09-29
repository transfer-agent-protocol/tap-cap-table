import { type Address, isAddress, zeroAddress } from "viem";

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "") as Address;

// Optional extra address granted OPERATOR_ROLE at mint. createCapTable skips the zero address, so
// anything that is not an address (empty, or UPDATE_ME from an older bootstrap) falls back to it
// instead of making viem reject the mint.
const operatorEnv = (process.env.NEXT_PUBLIC_OPERATOR_ADDRESS ?? "").trim();
if (operatorEnv && !isAddress(operatorEnv)) {
	console.warn(`NEXT_PUBLIC_OPERATOR_ADDRESS "${operatorEnv}" is not a valid address; minting without an extra operator.`);
}
export const OPERATOR_ADDRESS: Address = isAddress(operatorEnv) ? operatorEnv : zeroAddress;

export { capTableFactoryAbi, useWriteCapTableFactoryCreateCapTable } from "../generated";
