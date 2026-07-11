/** Protocol fixed-point scale for share quantities and prices. */
export declare const SCALE: bigint;
export declare const DECIMAL_SCALE: bigint;

export declare function scaleShares(quantity: string | number | bigint): bigint;
export declare function scaleAmount(amount: string | number): bigint;
export declare function unscale(scaled: bigint | string | number): string;

export declare function bytes16ToUuid(bytes16: string): string;
export declare function uuidToBytes16(value: string): `0x${string}`;
export declare function generateBytes16Id(): `0x${string}`;

export interface ShareCapInput {
	quantity: string | number | bigint;
	issuerAuthorized: string | number | bigint;
	issuerIssued?: string | number | bigint;
	classAuthorized?: string | number | bigint;
	classIssued?: string | number | bigint;
}

export interface ShareCapResult {
	ok: boolean;
	errors: string[];
	warnings: string[];
}

export declare function validateShareCaps(input: ShareCapInput): ShareCapResult;
export declare function assertShareCaps(input: ShareCapInput): ShareCapResult;
