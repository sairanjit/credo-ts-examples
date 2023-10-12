import console from 'console'
import { issuer } from './issuer'
import { holder } from './holder'
import {
  DidDocument,
  DidDocumentBuilder,
  JsonTransformer,
  KeyType,
  OutOfBandState,
  TypedArrayEncoder,
  getEd25519VerificationKey2018,
} from '@aries-framework/core'

async function app() {
  await issuer.initialize()
  await holder.initialize()
  issuer.config.logger.info('Agents initialized!')

  const domain = 'sairanjit.github.io'
  const did = `did:web:${domain}`
  const keyId = `${did}#key-1`

  const key = await issuer.wallet.createKey({
    keyType: KeyType.Ed25519,
    privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  })

  const didDocument = new DidDocumentBuilder(did)
    .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
    .addVerificationMethod(getEd25519VerificationKey2018({ key, id: keyId, controller: did }))
    .addAuthentication(keyId)
    .build()

  await issuer.dids.import({
    did,
    overwrite: true,
    didDocument,
  })

  // const issuerId = `did:web:sairanjitaw.github.io`
  // const privateKey = '73f80dcde8be30e538ea8bafeb4701d098c5ea72720a51dc750527f4b78f01b2'
  // await issuer.dids.import({
  //   did: issuerId,
  //   overwrite: true,
  //   privateKeys: [
  //     {
  //       keyType: KeyType.Ed25519,
  //       privateKey: TypedArrayEncoder.fromHex(privateKey),
  //     },
  //   ],
  // })

  const dids = await issuer.dids.getCreatedDids({ did })
  console.log('dids', JSON.stringify(dids))

  // Create out of band invitation

  const inv = await holder.oob.createLegacyInvitation({
    autoAcceptConnection: true,
  })
  const { connectionRecord } = await issuer.oob.receiveInvitation(inv.invitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await issuer.connections.returnWhenIsConnected(connectionRecord.id)

  const usingDid = dids.find((record) => record.did.includes('did:web'))?.did

  console.log('\n\n\nusingDid***', usingDid)

  const credRecord = await issuer.credentials.offerCredential({
    connectionId: connectionRecord.id,
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: { id: usingDid! },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  })
}

app()
