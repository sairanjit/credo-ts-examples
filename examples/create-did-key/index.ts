import { AskarModule } from "@aries-framework/askar";
import {
	Agent,
	ConsoleLogger,
	KeyDidCreateOptions,
	KeyType,
	LogLevel,
} from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

async function example() {
	const agent = new Agent({
		config: {
			label: "Create did:key",
			logger: new ConsoleLogger(LogLevel.debug),
			walletConfig: {
				id: "create-did-key-wallet",
				key: "create-did-key-wallet",
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

	// KeyDidCreateOptions provided the required interface for creating
	// a did:key DID.
	const didResult = await agent.dids.create<KeyDidCreateOptions>({
		method: "key",
		options: {
			// key type specifies which type of key will be used for the did:key DID.
			// For askar you can use `Ed25519`, `X25519`, `P256`, `BLS12381G1`, `BLS12381G2`, `BLS12381G1G2`
			keyType: KeyType.Ed25519,
		},
		secret: {
			// You can optionally provide a privateKey or seed to consistently generate the same DID.
			// privateKey: TypedArrayEncoder.fromString(
			// 	"c1fb70daced48f10598d5525c570d390",
			// ),
		},
	});

	// Some dids require multi-step processes to create and register a did, but for did:key, the DID
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

	agent.config.logger.info(`Created did:key DID: ${didResult.didState.did}`, {
		didDocument: didResult.didState.didDocument.toJSON(),
	});
}

example();
