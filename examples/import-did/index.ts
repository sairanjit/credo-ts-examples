import { AskarModule, transformPrivateKeyToPrivateJwk } from "@credo-ts/askar";
import {
	Agent,
	ConsoleLogger,
	LogLevel,
	TypedArrayEncoder,
} from "@credo-ts/core";
import { agentDependencies } from "@credo-ts/node";
import { askar } from "@openwallet-foundation/askar-nodejs";

async function example() {
	const agent = new Agent({
		config: {
			label: "Import did",
			logger: new ConsoleLogger(LogLevel.debug),
		},
		dependencies: agentDependencies,
		modules: {
			askar: new AskarModule({
				askar,
				store: {
					id: "import-did-wallet",
					key: "import-did-wallet",
				},
			}),
		},
	});

	await agent.initialize();

	const did = "did:key:z6MksU88bfe9oFybGt61sxynDKcmVJU7DgewErFVWMaFPRFg";

	// As of 0.6 keys are managed by the KMS. To associate a private key with the
	// imported did, first import the private key into the KMS to obtain a `keyId`.
	// `transformPrivateKeyToPrivateJwk` converts a raw private key (as used before
	// the KMS API) into a private JWK that the KMS can import.
	const { privateJwk } = transformPrivateKeyToPrivateJwk({
		type: { kty: "OKP", crv: "Ed25519" },
		privateKey: TypedArrayEncoder.fromString(
			"08fd2c63e4f58c078a256c30ec37dd8d",
		),
	});
	const { keyId } = await agent.kms.importKey({ privateJwk });

	// When importing a did, it's not needed to explicitly support the did method using a did registrar.
	// This is useful for .e.g did:web DIDs, where you host the did:web on your own web server, and then
	//import it into credo, allowing you to .e.g issue credentials with it.
	await agent.dids.import({
		// The DID you want to import
		did,

		// Whether to overwrite the did if it already exists.
		// If you want to update the did, you can set this to true
		overwrite: true,

		// You can optionally provide a did document. If no did document is provided, the DID will be resolved
		// and the resolved did document will be used. In this case you MUST make sure a did resolver is registered
		// on the agent than can resolve the DID.
		// If provided, the did will not be resolved and the provided DID document will be used.
		// didDocument: JsonTransformer.fromJSON({ /* did document json */ }, DidDocument),

		// The keys associated with this DID that are managed by the agent's KMS. Each entry links a
		// verification method in the did document (by its relative key id / fragment) to a key id in
		// the KMS. Not all keys of a did document need to be provided, only the ones you intend to use.
		// For a did:key the verification method fragment equals the method-specific identifier.
		keys: [
			{
				kmsKeyId: keyId,
				didDocumentRelativeKeyId:
					"#z6MksU88bfe9oFybGt61sxynDKcmVJU7DgewErFVWMaFPRFg",
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
