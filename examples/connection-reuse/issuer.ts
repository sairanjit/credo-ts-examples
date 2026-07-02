import { AskarModule } from "@credo-ts/askar";
import { Agent, ConsoleLogger, LogLevel } from "@credo-ts/core";
import { DidCommHttpOutboundTransport, DidCommModule } from "@credo-ts/didcomm";
import { DidCommHttpInboundTransport, agentDependencies } from "@credo-ts/node";
import { askar } from "@openwallet-foundation/askar-nodejs";

export const issuer = new Agent({
	config: {
		label: "Holder Agent 1",
		logger: new ConsoleLogger(LogLevel.trace),
	},
	modules: {
		// Storage Module
		askar: new AskarModule({
			askar,
			store: {
				id: "holder-agent-id-1",
				key: "holder-agent-key",
			},
		}),

		// As of 0.6 DIDComm lives in its own module. Endpoints, transports and the
		// connections configuration are all provided through the DidCommModule.
		didcomm: new DidCommModule({
			endpoints: ["http://localhost:6008/didcomm"],
			// Connections are always enabled, but we can override the default configuration
			connections: {
				autoAcceptConnections: true,
			},
		}),
	},
	dependencies: agentDependencies,
});

issuer.modules.didcomm.registerInboundTransport(
	new DidCommHttpInboundTransport({
		port: 6008,
		path: "/didcomm",
	}),
);
issuer.modules.didcomm.registerOutboundTransport(
	new DidCommHttpOutboundTransport(),
);
