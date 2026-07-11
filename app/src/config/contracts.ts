import { type Address } from "viem";
import { DECIMAL_SCALE as UNITS_SCALE } from "@tap/units";

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "") as Address;

/** @deprecated Prefer importing DECIMAL_SCALE / SCALE from @tap/units */
export const DECIMAL_SCALE = UNITS_SCALE;

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
