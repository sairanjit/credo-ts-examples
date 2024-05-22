import {
	CREDENTIALS_CONTEXT_V1_URL,
	KeyType,
	SECURITY_CONTEXT_BBS_URL,
	TypedArrayEncoder,
	utils,
} from "@credo-ts/core";
import { issuer } from "./issuer";

async function app() {
	await issuer.initialize();
	issuer.config.logger.info("Agents initialized!");

	const credDef = await issuer.modules.anoncreds.getCredentialDefinition(
		"TZZg3zDZKMhDdjMTAqrtp4:3:CL:57510:Insurance Form - Nirmax Tech",
	);

	// console.log("credDef: ", JSON.stringify(credDef));

	// Create out of band invitation
	// const inv = await issuer.oob.createInvitation();

	// console.log(
	// 	"Invitation: ",
	// 	inv.outOfBandInvitation.toUrl({
	// 		domain: "https://github.com",
	// 	}),
	// );

	// const credentialOffer = await issuer.proofs.requestProof({
	// 	connectionId: "7c151128-bfdd-41aa-9e76-49211fa6f4ba",
	// 	proofFormats: {
	// 		presentationExchange: {
	// 			presentationDefinition: {
	// 				id: utils.uuid(),
	// 				name: "Proof Request",
	// 				input_descriptors: [
	// 					{
	// 						constraints: {
	// 							fields: [
	// 								{
	// 									path: [
	// 										"$.credentialSubject.Gender",
	// 										"$.credentialSubject.Citizenship",
	// 									],
	// 								},
	// 							],
	// 						},
	// 						id: "citizenship_input",
	// 						schema: [
	// 							{
	// 								uri: "https://schema.credebl.id/schemas/71eb18a2-7238-4577-8137-288f46b97873",
	// 							},
	// 						],
	// 					},
	// 					// {
	// 					// 	constraints: {
	// 					// 		fields: [
	// 					// 			{
	// 					// 				path: [
	// 					// 					"$.credentialSubject['Full Name']",
	// 					// 					"$.credentialSubject['Emp_ID']",
	// 					// 				],
	// 					// 			},
	// 					// 		],
	// 					// 	},
	// 					// 	id: "citizenship_input_1",
	// 					// 	schema: [
	// 					// 		{
	// 					// 			uri: "https://schema.credebl.id/schemas/ac448f46-39b1-4da7-aa57-a4d16b125b4b",
	// 					// 		},
	// 					// 	],
	// 					// },
	// 					{
	// 						constraints: {
	// 							fields: [
	// 								{
	// 									path: [
	// 										// "$.credentialSubject['Employee ID']",
	// 										"$.credentialSubject['Role']",
	// 									],
	// 								},
	// 							],
	// 						},
	// 						id: "citizenship_input_22",
	// 						schema: [
	// 							{
	// 								uri: "https://schema.credebl.id/schemas/6973593f-ea09-4825-bf0a-dc271bf27ca2",
	// 							},
	// 						],
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// 	protocolVersion: "v2",
	// });

	// const credentialOffer = await issuer.proofs.requestProof({
	// 	connectionId: "7c151128-bfdd-41aa-9e76-49211fa6f4ba",
	// 	proofFormats: {
	// 		indy: {
	// 			name: "Proof Request",
	// 			version: "1.0",
	// 			requested_attributes: {},
	// 		},
	// 		// presentationExchange: {
	// 		// 	presentationDefinition: {
	// 		// 		id: utils.uuid(),
	// 		// 		name: "Proof Request",
	// 		// 		input_descriptors: [
	// 		// 			{
	// 		// 				constraints: {
	// 		// 					fields: [
	// 		// 						{
	// 		// 							path: [
	// 		// 								"$.credentialSubject.Gender",
	// 		// 								"$.credentialSubject.Citizenship",
	// 		// 							],
	// 		// 						},
	// 		// 					],
	// 		// 				},
	// 		// 				id: "citizenship_input",
	// 		// 				schema: [
	// 		// 					{
	// 		// 						uri: "https://schema.credebl.id/schemas/71eb18a2-7238-4577-8137-288f46b97873",
	// 		// 					},
	// 		// 				],
	// 		// 			},
	// 		// 			// {
	// 		// 			// 	constraints: {
	// 		// 			// 		fields: [
	// 		// 			// 			{
	// 		// 			// 				path: [
	// 		// 			// 					"$.credentialSubject['Full Name']",
	// 		// 			// 					"$.credentialSubject['Emp_ID']",
	// 		// 			// 				],
	// 		// 			// 			},
	// 		// 			// 		],
	// 		// 			// 	},
	// 		// 			// 	id: "citizenship_input_1",
	// 		// 			// 	schema: [
	// 		// 			// 		{
	// 		// 			// 			uri: "https://schema.credebl.id/schemas/ac448f46-39b1-4da7-aa57-a4d16b125b4b",
	// 		// 			// 		},
	// 		// 			// 	],
	// 		// 			// },
	// 		// 			{
	// 		// 				constraints: {
	// 		// 					fields: [
	// 		// 						{
	// 		// 							path: [
	// 		// 								// "$.credentialSubject['Employee ID']",
	// 		// 								"$.credentialSubject['Role']",
	// 		// 							],
	// 		// 						},
	// 		// 					],
	// 		// 				},
	// 		// 				id: "citizenship_input_22",
	// 		// 				schema: [
	// 		// 					{
	// 		// 						uri: "https://schema.credebl.id/schemas/6973593f-ea09-4825-bf0a-dc271bf27ca2",
	// 		// 					},
	// 		// 				],
	// 		// 			},
	// 		// 		],
	// 		// 	},
	// 		// },
	// 	},
	// 	protocolVersion: "v1",
	// });
}

app();

// https://schema.credebl.id/schemas/71eb18a2-7238-4577-8137-288f46b97873 // foundation id
// https://schema.credebl.id/schemas/6973593f-ea09-4825-bf0a-dc271bf27ca2 // employee
