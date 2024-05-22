import {
	CREDENTIALS_CONTEXT_V1_URL,
	CredentialEventTypes,
	CredentialState,
	CredentialStateChangedEvent,
	DidCommMessageRepository,
	JsonEncoder,
	JsonLdCredentialFormat,
	KeyType,
	SECURITY_CONTEXT_BBS_URL,
	TypedArrayEncoder,
	utils,
} from "@credo-ts/core";
import { holder } from "./holder";
import { issuer } from "./issuer";
import { firstValueFrom } from "rxjs";
import { filter, first, timeout } from "rxjs/operators";

const getCredentialData = (issuerDid: string, holderDid?: string) => {
	const credentialSubject = {};
	if (holderDid) {
		credentialSubject.id = holderDid;
	}

	return {
		credential: {
			"@context": [
				CREDENTIALS_CONTEXT_V1_URL,
				"https://www.w3.org/2018/credentials/examples/v1",
				// Add BBS context to the credential
				SECURITY_CONTEXT_BBS_URL,
			],
			type: ["VerifiableCredential", "UniversityDegreeCredential"],
			issuer: issuerDid,
			issuanceDate: new Date().toISOString(),
			credentialSubject: {
				...credentialSubject,
				degree: {
					type: "BachelorDegree",
					name: "Bachelor of Science and Arts",
				},
			},
		},
		options: {
			// Added BBS proof type
			proofType: "BbsBlsSignature2020",
			proofPurpose: "assertionMethod",
		},
	};
};

async function app() {
	await issuer.initialize();
	await holder.initialize();
	issuer.config.logger.info("Agents initialized!");

	// Create did:key with Bls key type for issuer
	const {
		didState: { did: issuerDid },
	} = await issuer.dids.create({
		method: "key",
		options: {
			keyType: KeyType.Bls12381g2,
			privateKey: TypedArrayEncoder.fromString(
				"00000000000000000000000000000bbs",
			),
		},
	});

	if (!issuerDid) {
		throw new Error("Issuer DID not created");
	}

	// Create did:key with Ed25519 key type for holder
	const {
		didState: { did: holderDid },
	} = await holder.dids.create({
		method: "key",
		options: {
			keyType: KeyType.Ed25519,
			privateKey: TypedArrayEncoder.fromString(
				"00000000000000000000000000holder",
			),
		},
	});

	if (!holderDid) {
		throw new Error("Holder DID not created");
	}

	const credentialOffer = await issuer.credentials.createOffer({
		credentialFormats: {
			jsonld: getCredentialData(issuerDid) as unknown as JsonLdCredentialFormat,
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

	// Adding delay to ensure that the connection is established
	await new Promise((resolve) => setTimeout(resolve, 5000));

	// Get and Accept the credential
	const credentials = await holder.credentials.getAll();

	holder.config.logger.info("Credentials: ", credentials);

	// Accept the credential offer from the first credential in the list
	// const credentialRecord = await holder.credentials.acceptOffer({
	// 	credentialRecordId: credentials[0].id,
	// });

	const didCommMessageRepository = holder.context.dependencyManager.resolve(
		DidCommMessageRepository,
	);

	const didCommRecord = await didCommMessageRepository.getSingleByQuery(
		holder.context,
		{
			associatedRecordId: credentials[0].id,
		},
	);

	// console.log("didCommRecord: ", JSON.stringify(didCommRecord?.toJSON()));

	// const offerMessage = JsonEncoder.fromBase64(
	// 	didCommRecord.message["offers~attach"][0].data.base64,
	// );

	const newCred = getCredentialData(issuerDid, holderDid);

	const newOfferMessage = JsonEncoder.toBase64(newCred);

	didCommRecord.message["offers~attach"][0].data.base64 = newOfferMessage;

	const offerMessage = JsonEncoder.fromBase64(
		didCommRecord.message["offers~attach"][0].data.base64,
	);

	console.log("offerMessage: ", JSON.stringify(offerMessage));

	await didCommMessageRepository.update(holder.context, didCommRecord);

	const credentialDone$ = holder.events
		.observable<CredentialStateChangedEvent>(
			CredentialEventTypes.CredentialStateChanged,
		)
		.pipe(
			// Correct record with id and state
			filter(
				(event) =>
					event.payload.credentialRecord.id === credentials[0].id &&
					[CredentialState.Done].includes(event.payload.credentialRecord.state),
			),
			// 10 seconds to complete exchange
			timeout(10000),
			first(),
		);

	const credentialDonePromise = firstValueFrom(credentialDone$);

	const credentialRecord = await holder.credentials.acceptOffer({
		credentialRecordId: credentials[0].id,
	});

	await credentialDonePromise;

	const credentialFormatData = await holder.credentials.getFormatData(
		credentials[0].id,
	);

	console.log("credentialFormatData", JSON.stringify(credentialFormatData));

	const proofRequest = await issuer.proofs.createRequest({
		proofFormats: {
			presentationExchange: {
				presentationDefinition: {
					id: utils.uuid(),
					input_descriptors: [
						{
							constraints: {
								fields: [
									{
										path: ["$.credentialSubject.degree.type"],
									},
								],
							},
							id: "citizenship_input_1",
							schema: [
								{ uri: "https://www.w3.org/2018/credentials/examples/v1" },
							],
						},
					],
				},
			},
		},
		protocolVersion: "v2",
	});

	const inv1 = await issuer.oob.createInvitation({
		messages: [proofRequest.message],
	});

	// Accept the invitation
	const { connectionRecord: rec1 } = await holder.oob.receiveInvitation(
		inv1.outOfBandInvitation,
	);
}

app();
