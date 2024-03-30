import {
	AutoAcceptCredential,
	KeyType,
	TypedArrayEncoder,
	utils,
} from "@credo-ts/core";
import { holder } from "./holder";
import { issuer } from "./issuer";

async function app() {
	await issuer.initialize();
	await holder.initialize();
	issuer.config.logger.info("Agents initialized!");

	const issuerDid = "did:indy:bcovrin:test:4bbYgjU6JbV4DShPbGoQcA";
	const issuerSeed = "afjdemoverysecure000000000000002";

	// Import endorser DID
	// await issuer.dids.import({
	// 	did: issuerDid,
	// 	overwrite: true,
	// 	privateKeys: [
	// 		{
	// 			keyType: KeyType.Ed25519,
	// 			privateKey: TypedArrayEncoder.fromString(issuerSeed),
	// 		},
	// 	],
	// });

	// Create a Schema
	// const schema = await issuer.modules.anoncreds.registerSchema({
	// 	schema: {
	// 		attrNames: ["name", "degree", "age"],
	// 		issuerId: issuerDid,
	// 		name: "Degree",
	// 		version: "1.0",
	// 	},
	// 	options: {},
	// });

	// Create a Credential Definition
	// const credDef = await issuer.modules.anoncreds.registerCredentialDefinition({
	// 	credentialDefinition: {
	// 		issuerId: issuerDid,
	// 		schemaId: schema.schemaState.schemaId,
	// 		tag: "latest",
	// 	},
	// 	options: {
	// 		supportRevocation: false,
	// 	},
	// });

	// Create a Credential Offer
	// const credOffer = await issuer.credentials.createOffer({
	// 	credentialFormats: {
	// 		anoncreds: {
	// 			attributes: [
	// 				{
	// 					name: "name",
	// 					value: "Kevin",
	// 				},
	// 				{
	// 					name: "age",
	// 					value: "25",
	// 				},
	// 				{
	// 					name: "degree",
	// 					value: "Bachelor of Science",
	// 				},
	// 			],
	// 			credentialDefinitionId:
	// 				"did:indy:bcovrin:test:4bbYgjU6JbV4DShPbGoQcA/anoncreds/v0/CLAIM_DEF/535558/latest",
	// 		},
	// 	},
	// 	protocolVersion: "v2",
	// });

	// const invitation = await issuer.oob.createInvitation({
	// 	messages: [credOffer.message],
	// });

	// // Accept the Credential Offer
	// const credentialRecord = await holder.oob.receiveInvitation(
	// 	invitation.outOfBandInvitation,
	// );

	// Proof Request

	// Create a Proof Request
	const proofRequest = await issuer.proofs.createRequest({
		proofFormats: {
			presentationExchange: {
				presentationDefinition: {
					id: utils.uuid(),
					name: "Proof of Degree",
					input_descriptors: [
						{
							id: utils.uuid(),
							schema: [
								{
									uri: "https://www.w3.org/2018/credentials/v1",
								},
							],
							constraints: {
								fields: [
									{
										path: ["$.credentialSubject.name"],
									},
									{
										path: ["$.credentialSubject.degree"],
									},
								],
							},
						},
					],
				},
			},
		},
		protocolVersion: "v2",
	});

	const invitation = await issuer.oob.createInvitation({
		messages: [proofRequest.message],
	});

	const proofRecord = await holder.oob.receiveInvitation(
		invitation.outOfBandInvitation,
	);
}

app();
