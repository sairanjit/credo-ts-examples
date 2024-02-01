import { AskarModule } from "@credo-ts/askar";
import {
	CheqdDidCreateOptions,
	CheqdDidRegistrar,
	CheqdDidResolver,
	CheqdModule,
} from "@credo-ts/cheqd";
import {
	Agent,
	ConsoleLogger,
	DidsModule,
	LogLevel,
	TypedArrayEncoder,
} from "@credo-ts/core";
import { agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

async function example() {
	const agent = new Agent({
		config: {
			label: "Create did:cheqd",
			logger: new ConsoleLogger(LogLevel.debug),
			walletConfig: {
				id: "create-did-cheqd-wallet",
				key: "create-did-cheqd-wallet",
			},
		},
		dependencies: agentDependencies,
		modules: {
			askar: new AskarModule({
				ariesAskar,
			}),

			// CheqdModule
			// Testnet Wallet address used cheqd1f9azjjmq8w5sq7dpsyl8pgw0672gp326v3h9gz
			cheqdSdk: new CheqdModule({
				networks: [
					{
						rpcUrl: "https://rpc.cheqd.network",
						network: "testnet",
						cosmosPayerSeed:
							"truck exist skin trial divert master vintage ridge can ginger clap ugly",
					},
				],
			}),

			// Dids Module with CheqdDidRegistrar and CheqdDidResolver
			dids: new DidsModule({
				registrars: [new CheqdDidRegistrar()],
				resolvers: [new CheqdDidResolver()],
			}),
		},
	});

	await agent.initialize();

	// Generate a seed and get private key from it
	const privateKey = TypedArrayEncoder.fromString(
		Array(32 + 1)
			.join(`${Math.random().toString(36)}00000000000000000`.slice(2, 18))
			.slice(0, 32),
	);

	// CheqdDidCreateOptions provided the required interface for creating
	// a did:cheqd DID.
	const didResult = await agent.dids.create<CheqdDidCreateOptions>({
		method: "cheqd",
		secret: {
			verificationMethod: {
				id: "key-1",
				type: "Ed25519VerificationKey2018",
				privateKey,
			},
		},
		options: {
			network: "testnet",
			methodSpecificIdAlgo: "base58btc",
		},
	});

	// Some dids require multi-step processes to create and register a did, but for did:cheqd, the DID
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

	agent.config.logger.info(`Created did:cheqd DID: ${didResult.didState.did}`, {
		didDocument: didResult.didState.didDocument.toJSON(),
	});
}

example();
