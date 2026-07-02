import { AskarModule } from "@credo-ts/askar";
import {
	CheqdDidCreateOptions,
	CheqdDidRegistrar,
	CheqdDidResolver,
	CheqdModule,
} from "@credo-ts/cheqd";
import { Agent, ConsoleLogger, DidsModule, LogLevel } from "@credo-ts/core";
import { agentDependencies } from "@credo-ts/node";
import { askar } from "@openwallet-foundation/askar-nodejs";

async function example() {
	const agent = new Agent({
		config: {
			label: "Create did:cheqd",
			logger: new ConsoleLogger(LogLevel.debug),
		},
		dependencies: agentDependencies,
		modules: {
			askar: new AskarModule({
				askar,
				store: {
					id: "create-did-cheqd-wallet",
					key: "create-did-cheqd-wallet",
				},
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

	// CheqdDidCreateOptions provided the required interface for creating
	// a did:cheqd DID. As of 0.6 the signing key is generated in the KMS via
	// `createKey` instead of passing a raw private key through `secret`.
	const didResult = await agent.dids.create<CheqdDidCreateOptions>({
		method: "cheqd",
		options: {
			network: "testnet",
			methodSpecificIdAlgo: "base58btc",
			createKey: {
				type: {
					kty: "OKP",
					crv: "Ed25519",
				},
			},
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
