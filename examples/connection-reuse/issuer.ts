import { AskarModule } from "@credo-ts/askar";
import {
	Agent,
	ConnectionsModule,
	ConsoleLogger,
	HttpOutboundTransport,
	LogLevel,
} from "@credo-ts/core";
import { HttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

export const issuer = new Agent({
	config: {
		label: "Holder Agent 1",
		walletConfig: {
			id: "holder-agent-id-1",
			key: "holder-agent-key",
		},
		endpoints: ["http://localhost:6008/didcomm"],
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

issuer.registerInboundTransport(
	new HttpInboundTransport({
		port: 6008,
		path: "/didcomm",
	}),
);
issuer.registerOutboundTransport(new HttpOutboundTransport());
