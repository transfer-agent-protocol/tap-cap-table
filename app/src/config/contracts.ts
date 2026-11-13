import { type Address, isAddress, zeroAddress } from "viem";

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "") as Address;

// Optional extra address granted OPERATOR_ROLE at mint. createCapTable skips the zero address.
// Empty and the old UPDATE_ME placeholder use it. Any other non-address is refused at mint so a
// typo does not skip the grant.
const operatorEnv = (process.env.NEXT_PUBLIC_OPERATOR_ADDRESS ?? "").trim();
const operatorIsPlaceholder = operatorEnv === "" || operatorEnv === "UPDATE_ME";

export const operatorAddressError: string | null =
	!operatorIsPlaceholder && !isAddress(operatorEnv)
		? `NEXT_PUBLIC_OPERATOR_ADDRESS "${operatorEnv}" is not a valid address. Fix it or leave it empty, then restart the app.`
		: null;

export const OPERATOR_ADDRESS: Address = isAddress(operatorEnv) ? operatorEnv : zeroAddress;

export { capTableFactoryAbi, useWriteCapTableFactoryCreateCapTable } from "../generated";
