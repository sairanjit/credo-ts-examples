import {
	transformPrivateKeyToPrivateJwk,
	transformSeedToPrivateJwk,
} from "@credo-ts/askar";
import { TypedArrayEncoder } from "@credo-ts/core";
import { endorser } from "./endorser";
import { issuer } from "./issuer";

async function app() {
	await issuer.initialize();
	await endorser.initialize();
	issuer.config.logger.info("Agents initialized!");

	const endorserDid = "did:indy:bcovrin:test:4bbYgjU6JbV4DShPbGoQcA";
	const endorserSeed = "afjdemoverysecure000000000000002";
	const issuerSeed = "afjdemoverysecure000000000000005";

	// As of 0.6 keys are managed by the KMS. Import the endorser's private key into the
	// KMS to obtain a `keyId`, then import the DID linking its `#verkey` verification
	// method (the standard did:indy verification method) to that key.
	const { privateJwk: endorserPrivateJwk } = transformPrivateKeyToPrivateJwk({
		type: { kty: "OKP", crv: "Ed25519" },
		privateKey: TypedArrayEncoder.fromString(endorserSeed),
	});
	const { keyId: endorserKeyId } = await endorser.kms.importKey({
		privateJwk: endorserPrivateJwk,
	});

	// Import endorser DID
	await endorser.dids.import({
		did: endorserDid,
		overwrite: true,
		keys: [
			{
				kmsKeyId: endorserKeyId,
				didDocumentRelativeKeyId: "#verkey",
			},
		],
	});

	// Import the issuer's key (derived from a seed) into the KMS, so the new did:indy
	// is created deterministically from it. The resulting `keyId` is passed to
	// `dids.create` instead of the previous `secret.seed`.
	const { privateJwk: issuerPrivateJwk } = transformSeedToPrivateJwk({
		type: { kty: "OKP", crv: "Ed25519" },
		seed: TypedArrayEncoder.fromString(issuerSeed),
	});
	const { keyId: issuerKeyId } = await issuer.kms.importKey({
		privateJwk: issuerPrivateJwk,
	});

	// Create issuer DID
	const did = await issuer.dids.create({
		method: "indy",
		options: {
			endorserMode: "external",
			endorserDid,
			keyId: issuerKeyId,
		},
	});

	issuer.config.logger.info("DID state!", did);

	if (did.didState.state !== "action") {
		throw new Error(
			`Expected did state to be 'action', but got '${did.didState.state}'`,
		);
	}

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
	});

	issuer.config.logger.info("DidWrite ", didWrite);
}

app();
