import { holder } from "./holder";
import { issuer } from "./issuer";

async function app() {
	await holder.initialize();
	await issuer.initialize();
	issuer.config.logger.info("Agents initialized!");

	// Create invitation
	const oobRecord = await issuer.modules.didcomm.oob.createInvitation({
		label: "Issuer",
	});

	// We have to save the invitationDid to reuse the connection later
	// and we have to use invitationDid again while creating the invitation
	const invitationDid = oobRecord.outOfBandInvitation.invitationDids[0];

	// We can reuse the connection if we want to by passing the `reuseConnection` flag to the receiveInvitation method.
	// As of 0.6 a `label` is required when receiving an invitation (it is used as our label in the exchange).
	const rec = await holder.modules.didcomm.oob.receiveInvitation(
		oobRecord.outOfBandInvitation,
		{
			label: "Holder",
			reuseConnection: true,
		},
	);

	if (!rec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder.modules.didcomm.connections.returnWhenIsConnected(
		rec.connectionRecord?.id,
	);

	// We pass the invitationDid here to create a new connection invitation
	const oobRecord1 = await issuer.modules.didcomm.oob.createInvitation({
		label: "Issuer",
		invitationDid,
	});

	const oobRec = await holder.modules.didcomm.oob.receiveInvitation(
		oobRecord1.outOfBandInvitation,
		{
			label: "Holder",
			reuseConnection: true,
		},
	);

	if (!oobRec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder.modules.didcomm.connections.returnWhenIsConnected(
		oobRec.connectionRecord?.id,
	);

	const issuerConnections = await issuer.modules.didcomm.connections.getAll();
	const holderConnections = await holder.modules.didcomm.connections.getAll();

	issuer.config.logger.info(
		`Issuer Connections count: ${issuerConnections.length}`,
	);

	holder.config.logger.info(
		`Holder Connections count: ${holderConnections.length}`,
	);
}

app();
