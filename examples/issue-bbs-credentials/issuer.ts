import { AskarModule } from "@credo-ts/askar";
import { BbsModule } from "@credo-ts/bbs-signatures";
import {
	Agent,
	AutoAcceptCredential,
	ConnectionsModule,
	ConsoleLogger,
	CredentialsModule,
	HttpOutboundTransport,
	JsonLdCredentialFormatService,
	LogLevel,
	V2CredentialProtocol,
} from "@credo-ts/core";
import { HttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

export const issuer = new Agent({
	config: {
		label: "Issuer Agent",
		walletConfig: {
			id: "issuer-agent-id",
			key: "issuer-agent-key",
		},
		endpoints: ["http://localhost:6006/didcomm"],
		logger: new ConsoleLogger(LogLevel.debug),
	},
	modules: {
		// BBS Module
		bbs: new BbsModule(),

		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		// Connections module is enabled by default, but we can
		// override the default configuration
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),

		// Credentials module is enabled by default, but we can
		// override the default configuration
		credentials: new CredentialsModule({
			autoAcceptCredentials: AutoAcceptCredential.Always,

			// Only v2 supports jsonld
			credentialProtocols: [
				new V2CredentialProtocol({
					credentialFormats: [new JsonLdCredentialFormatService()],
				}),
			],
		}),
	},
	dependencies: agentDependencies,
});

issuer.registerInboundTransport(
	new HttpInboundTransport({
		port: 6006,
		path: "/didcomm",
	}),
);
issuer.registerOutboundTransport(new HttpOutboundTransport());
