import nextra from "nextra";

const withNextra = nextra({
	search: {
		codeblocks: false,
	},
});

// Old URLs stay live: renamed pages first, then the /features -> /api-guides catch-all.
const renamedPages = [
	["/features/issuer-management/create-issuer", "/api-guides/issuer-management/register-issuer"],
	["/features/issuer-management/append-history", "/api-guides/issuer-management/history-routes"],
	["/features/cap-table-management/create-stock-class-and-shareholders", "/api-guides/cap-table-management/supporting-records"],
	["/features/cap-table-management/issue-and-accept-stock", "/api-guides/cap-table-management/accept-stock"],
	["/features/corporate-actions/save-offchain-corporate-actions", "/api-guides/corporate-actions/equity-compensation-and-convertibles"],
	["/features/corporate-actions/update-valuations-and-terms", "/api-guides/corporate-actions/valuations-and-terms"],
];

export default withNextra({
	reactStrictMode: true,
	async redirects() {
		return [
			...renamedPages.map(([source, destination]) => ({ source, destination, permanent: true })),
			{ source: "/features", destination: "/api-guides", permanent: true },
			{ source: "/features/:path*", destination: "/api-guides/:path*", permanent: true },
		];
	},
});
