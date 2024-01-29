import { AskarModule } from "@aries-framework/askar";
import {
	Agent,
	ConsoleLogger,
	KeyType,
	LogLevel,
	TypedArrayEncoder,
} from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

async function example() {
	const agent = new Agent({
		config: {
			label: "Import did",
			logger: new ConsoleLogger(LogLevel.debug),
			walletConfig: {
				id: "import-did-wallet",
				key: "import-did-wallet",
			},
		},
		dependencies: agentDependencies,
		modules: {
			askar: new AskarModule({
				ariesAskar,
			}),
		},
	});

	await agent.initialize();

	const did = "did:key:z6MksU88bfe9oFybGt61sxynDKcmVJU7DgewErFVWMaFPRFg";

	// When importing a did, it's not needed to explicitly support the did method using a did registrar.
	// This is useful for .e.g did:web DIDs, where you host the did:web on your own web server, and then
	//import it into credo, allowing you to .e.g issue credentials with it.
	await agent.dids.import({
		// The DID you want to import
		did,

		// Whether to overwrite the did and the associated private keys in the wallet if it already exists
		// If you want to update the did, you can set this to true
		overwrite: true,

		// You can optionally provide a did document. If no did document is provided, the DID will be resolved
		// and the resolved did document will be used. In this case you MUST make sure a did resolver is registered
		// on the agent than can resolve the DID.
		// If provided, the did will not be resolved and the provided DID document will be used.
		// didDocument: JsonTransformer.fromJSON({ /* did document json */ }, DidDocument),

		// The private keys associated with this DID. To be able to use the keys in the did document you must make sure
		// the private keys are available in the wallet. Not all keys of a did document need to be provided, only the ones
		// you intend to use from within the agent.
		// You can manually import keys associated with the did later on by calling `agent.wallet.createKey` and providing
		// the `privateKey` and `keyType` of the key you want to create/import.
		privateKeys: [
			{
				keyType: KeyType.Ed25519,
				privateKey: TypedArrayEncoder.fromString(
					"08fd2c63e4f58c078a256c30ec37dd8d",
				),
			},
		],
	});

	const [createdDid] = await agent.dids.getCreatedDids({
		did,
	});

	agent.config.logger.info(`Successfully imported did: ${did}`, {
		createdDid: createdDid.toJSON(),
	});
}

example();
