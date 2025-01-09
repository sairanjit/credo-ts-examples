import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
	AutoAcceptCredential,
	AutoAcceptProof,
	ConnectionsModule,
	ConsoleLogger,
	CredentialsModule,
	DifPresentationExchangeProofFormatService,
	HttpOutboundTransport,
	JsonLdCredentialFormatService,
	LogLevel,
	MediationRecipientModule,
	MediatorPickupStrategy,
	ProofsModule,
	V2CredentialProtocol,
	V2ProofProtocol,
	WsOutboundTransport,
} from "@credo-ts/core";
import { HttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

export const holder = new Agent({
	config: {
		label: "Holder Agent",
		walletConfig: {
			id: "holder-agent-id",
			key: "holder-agent-key",
		},
		endpoints: ["http://localhost:6007/didcomm"],
		logger: new ConsoleLogger(LogLevel.trace),
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		// Connections module is enabled by default, but we can
		// override the default configuration
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),
	},
	dependencies: agentDependencies,
});

holder.registerInboundTransport(
	new HttpInboundTransport({
		port: 6007,
		path: "/didcomm",
	}),
);
holder.registerOutboundTransport(new HttpOutboundTransport());
holder.registerOutboundTransport(new WsOutboundTransport());
