import {
	FREIGHTER_ID,
	StellarWalletsKit,
	WalletNetwork,
	allowAllModules,
} from "@creit.tech/stellar-wallets-kit";

let kit: StellarWalletsKit;

if (typeof window !== 'undefined') {
	kit = new StellarWalletsKit({
		network: WalletNetwork.TESTNET,
		selectedWalletId: FREIGHTER_ID,
		modules: allowAllModules(),
	});
} else {
	// Provide a dummy kit for server-side rendering
	kit = {} as StellarWalletsKit;
}

export { kit };