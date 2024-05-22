import {
	CREDENTIALS_CONTEXT_V1_URL,
	KeyType,
	SECURITY_CONTEXT_BBS_URL,
	TypedArrayEncoder,
	utils,
} from "@credo-ts/core";
import { holder } from "./holder";
import { issuer } from "./issuer";

async function app() {
	await issuer.initialize();
	await holder.initialize();
	issuer.config.logger.info("Agents initialized!");

	// Create did:key with Bls key type for issuer
	// const {
	// 	didState: { did: issuerDid },
	// } = await issuer.dids.create({
	// 	method: "key",
	// 	options: {
	// 		keyType: KeyType.Ed25519,
	// 		privateKey: TypedArrayEncoder.fromString(
	// 			"00000000000000000000000000000bbs",
	// 		),
	// 	},
	// });

	// if (!issuerDid) {
	// 	throw new Error("Issuer DID not created");
	// }

	// // Create did:key with Ed25519 key type for holder
	// const {
	// 	didState: { did: holderDid },
	// } = await holder.dids.create({
	// 	method: "key",
	// 	options: {
	// 		keyType: KeyType.Ed25519,
	// 		privateKey: TypedArrayEncoder.fromString(
	// 			"00000000000000000000000000holder",
	// 		),
	// 	},
	// });

	// if (!holderDid) {
	// 	throw new Error("Holder DID not created");
	// }

	// const credentialOffer = await issuer.credentials.createOffer({
	// 	credentialFormats: {
	// 		jsonld: {
	// 			credential: {
	// 				"@context": [
	// 					CREDENTIALS_CONTEXT_V1_URL,
	// 					"https://schema.credebl.id/schemas/71eb18a2-7238-4577-8137-288f46b97873",
	// 				],
	// 				type: ["VerifiableCredential", "foundation_schema"],
	// 				issuer: issuerDid,
	// 				issuanceDate: new Date().toISOString(),
	// 				credentialSubject: {
	// 					id: holderDid,
	// 					"Full Name": "Dorji Sonam",
	// 					"Blood Type": "NA",
	// 					"Date of Birth": "19/07/1995",
	// 					Gender: "Male",
	// 					"ID Type": "Citizenship",
	// 					"ID Number": "1234",
	// 					"Household Number": "160700131",
	// 					Citizenship: "Bhutanese",
	// 					revocation_id: "15f75552-8be6-4f86-bdc8-4e41f40bb3fe",
	// 					type: ["foundation_schema"],
	// 				},
	// 			},
	// 			options: {
	// 				proofType: "Ed25519Signature2018",
	// 				proofPurpose: "assertionMethod",
	// 			},
	// 		},
	// 	},
	// 	protocolVersion: "v2",
	// });

	const arr = new Array(200).fill(0);

	for await (const iterator of arr) {
		const credentialOffer = await issuer.proofs.createRequest({
			proofFormats: {
				presentationExchange: {
					presentationDefinition: {
						id: utils.uuid(),
						input_descriptors: [
							{
								constraints: {
									fields: [
										{
											path: ["$.credentialSubject['ID Type']"],
										},
									],
								},
								id: "citizenship_input_1",
								schema: [
									{
										uri: "https://schema.credebl.id/schemas/71eb18a2-7238-4577-8137-288f46b97873",
									},
								],
							},
							{
								constraints: {
									fields: [
										{
											path: ["$.credentialSubject['ID Number']"],
										},
									],
								},
								id: "citizenship_input_2",
								schema: [
									{
										uri: "https://schema.credebl.id/schemas/71eb18a2-7238-4577-8137-288f46b97873",
									},
								],
							},
						],
					},
				},
			},
			protocolVersion: "v2",
		});

		// Create out of band invitation
		const inv = await issuer.oob.createInvitation({
			messages: [credentialOffer.message],
		});

		// Accept the invitation
		const { connectionRecord } = await holder.oob.receiveInvitation(
			inv.outOfBandInvitation,
		);

		if (!connectionRecord) {
			throw new Error("Connection not found");
		}

		// Wait for connection to be established
		await holder.connections.returnWhenIsConnected(connectionRecord.id);

		console.log("iterator", iterator);
		// Adding delay to ensure that the connection is established
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

app();
