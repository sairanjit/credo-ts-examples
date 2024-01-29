import { KeyType, TypedArrayEncoder } from "@aries-framework/core";
import { endorser } from "./endorser";
import { issuer } from "./issuer";

async function app() {
	await issuer.initialize();
	await endorser.initialize();
	issuer.config.logger.info("Agents initialized!");

	const endorserDid = "did:indy:bcovrin:test:4bbYgjU6JbV4DShPbGoQcA";
	const endorserSeed = "afjdemoverysecure000000000000002";
	const issuerSeed = "afjdemoverysecure000000000000004";

	// Import endorser DID
	await endorser.dids.import({
		did: endorserDid,
		overwrite: true,
		privateKeys: [
			{
				keyType: KeyType.Ed25519,
				privateKey: TypedArrayEncoder.fromString(endorserSeed),
			},
		],
	});

	// Create issuer DID
	const did = await issuer.dids.create({
		method: "indy",
		options: {
			endorserMode: "external",
			endorserDid,
		},
		secret: {
			seed: TypedArrayEncoder.fromString(issuerSeed),
		},
	});

	issuer.config.logger.info("DID state!", did);

	// Endorse issuer DID with endorser
	const signedNymRequest = await endorser.modules.indyVdr.endorseTransaction(
		did.didState.nymRequest,
		did.didState.endorserDid,
	);

	issuer.config.logger.info(`signedNymRequest : ${signedNymRequest}`);

	// Write issuer ID to ledger
	const didWrite = await issuer.dids.create({
		did: did.didState.did,
		options: {
			endorserMode: "external",
			endorsedTransaction: {
				nymRequest: signedNymRequest,
			},
		},
		secret: {
			seed: TypedArrayEncoder.fromString(issuerSeed),
		},
	});

	issuer.config.logger.info("DidWrite ", didWrite);
}

app();
