import { type Address } from "viem";

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "") as Address;

export const DECIMAL_SCALE = 10_000_000_000n; // 1e10

// Default operator address for new cap tables (may be set to the server wallet)
export const OPERATOR_ADDRESS = (process.env.NEXT_PUBLIC_OPERATOR_ADDRESS ||
	"0x0000000000000000000000000000000000000000") as `0x${string}`;

export {
	capTableFactoryAbi,
	useWriteCapTableFactoryCreateCapTable,
	useSimulateCapTableFactoryCreateCapTable,
	useWatchCapTableFactoryCapTableCreatedEvent,
	useReadCapTableFactoryGetCapTableCount,
} from "../generated";
