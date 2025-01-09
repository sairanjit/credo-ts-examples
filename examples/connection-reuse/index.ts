import { holder } from "./holder";
import { issuer } from "./issuer";

async function app() {
	await holder.initialize();
	await issuer.initialize();
	issuer.config.logger.info("Agents initialized!");

	// Create invitation
	const oobRecord = await issuer.oob.createInvitation();

	// We have to save the invitationDid to reuse the connection later
	// and we have to use invitationDid again while creating the invitation
	const invitationDid = oobRecord.outOfBandInvitation.invitationDids[0];

	// We can reuse the connection if we want to by passing the `reuseConnection` flag to the receiveInvitation method
	const rec = await holder.oob.receiveInvitation(
		oobRecord.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	if (!rec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder.connections.returnWhenIsConnected(rec.connectionRecord?.id);

	// We pass the invitationDid here to create a new connection invitation
	const oobRecord1 = await issuer.oob.createInvitation({
		invitationDid,
	});

	const oobRec = await holder.oob.receiveInvitation(
		oobRecord1.outOfBandInvitation,
		{
			reuseConnection: true,
		},
	);

	if (!oobRec.connectionRecord?.id) {
		throw new Error("Connection record not found");
	}

	await holder.connections.returnWhenIsConnected(oobRec.connectionRecord?.id);

	const issuerConnections = await issuer.connections.getAll();
	const holderConnections = await holder.connections.getAll();

	issuer.config.logger.info(
		`Issuer Connections count: ${issuerConnections.length}`,
	);

	holder.config.logger.info(
		`Holder Connections count: ${holderConnections.length}`,
	);
}

app();
