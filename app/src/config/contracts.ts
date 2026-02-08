import { type Address } from "viem";

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "") as Address;

export {
	capTableFactoryAbi,
	useWriteCapTableFactoryCreateCapTable,
	useSimulateCapTableFactoryCreateCapTable,
	useWatchCapTableFactoryCapTableCreatedEvent,
	useReadCapTableFactoryGetCapTableCount,
} from "../generated";
