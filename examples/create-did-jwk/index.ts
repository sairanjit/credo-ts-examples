import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
	ConsoleLogger,
	JwkDidCreateOptions,
	LogLevel,
} from "@credo-ts/core";
import { agentDependencies } from "@credo-ts/node";
import { askar } from "@openwallet-foundation/askar-nodejs";

async function example() {
	const agent = new Agent({
		config: {
			label: "Create did:jwk",
			logger: new ConsoleLogger(LogLevel.debug),
		},
		dependencies: agentDependencies,
		modules: {
			askar: new AskarModule({
				askar,
				store: {
					id: "create-did-jwk-wallet",
					key: "create-did-jwk-wallet",
				},
			}),
		},
	});

	await agent.initialize();

	// JwkDidCreateOptions provided the required interface for creating
	// a did:jwk DID.
	const didResult = await agent.dids.create<JwkDidCreateOptions>({
		method: "jwk",
		options: {
			// `createKey` describes the key that will be generated in the KMS and
			// used for the did:jwk DID. For askar you can use `Ed25519`, `X25519`, `P-256`
			createKey: {
				type: {
					kty: "OKP",
					crv: "Ed25519",
				},
			},
			// Alternatively, if you already have a key in the KMS you can reference it
			// by passing `{ keyId: "<existing-key-id>" }` instead of `createKey`.
		},
	});

	// Some dids require multi-step processes to create and register a did, but for did:jwk, the DID
	// should always immediately reach state 'finished'. If this is not the case, something went wrong
	if (didResult.didState.state !== "finished") {
		throw new Error(
			`Expected did state to be finished, but got ${
				didResult.didState.state
			}. ${
				didResult.didState.state === "failed"
					? didResult.didState.reason
					: "Unknown error"
			}`,
		);
	}

	agent.config.logger.info(`Created did:jwk DID: ${didResult.didState.did}`, {
		didDocument: didResult.didState.didDocument.toJSON(),
	});
}

example();
