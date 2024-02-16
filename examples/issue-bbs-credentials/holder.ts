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

export const holder = new Agent({
	config: {
		label: "Holder Agent",
		walletConfig: {
			id: "holder-agent-id",
			key: "holder-agent-key",
		},
		logger: new ConsoleLogger(LogLevel.debug),
		endpoints: ["http://localhost:6007/didcomm"],
	},
	modules: {
		// BBS Module
		bbs: new BbsModule(),

		// Storage Module
		askar: new AskarModule({
			ariesAskar,
		}),

		// Connections module
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),

		// Credentials module
		credentials: new CredentialsModule({
			autoAcceptCredentials: AutoAcceptCredential.ContentApproved,

			// Only v2 Credential Protocol supports jsonld
			credentialProtocols: [
				new V2CredentialProtocol({
					credentialFormats: [new JsonLdCredentialFormatService()],
				}),
			],
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
