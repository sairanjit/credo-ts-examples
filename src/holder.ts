import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { AskarModule } from '@aries-framework/askar'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  ConnectionsModule,
  ConsoleLogger,
  CredentialsModule,
  DidsModule,
  HttpOutboundTransport,
  JsonLdCredentialFormatService,
  KeyDidRegistrar,
  KeyDidResolver,
  LogLevel,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
  W3cCredentialsModule,
  WebDidResolver,
} from '@aries-framework/core'
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidRegistrar,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
  IndyVdrSovDidResolver,
} from '@aries-framework/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

// provides legacy (non-ledger-agnostic) indy anoncreds for
// v1/v2 proof/credential protocol
const indyProofFormat = new LegacyIndyProofFormatService()
const indyCredentialFormat = new LegacyIndyCredentialFormatService()

export const holder = new Agent({
  config: {
    label: 'Holder Agent',
    walletConfig: {
      id: 'holder-agent',
      key: 'holder-agent-key',
    },
    // Change to view logs in terminal
    logger: new ConsoleLogger(LogLevel.debug),
    endpoints: ['http://localhost:6007/didcomm'],
  },
  modules: {
    // Storage
    askar: new AskarModule({
      ariesAskar,
    }),

    // Connections module is enabled by default, but we can
    // override the default configuration
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),

    // Credentials module is enabled by default, but we can
    // override the default configuration
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.Always,

      // Support v1 and v2 protocol, both support indy, only v2 supports jsonld
      credentialProtocols: [
        // v1 credential protocol is imported from anoncreds package
        // and provides legacy indy support
        new V1CredentialProtocol({
          indyCredentialFormat,
        }),
        new V2CredentialProtocol({
          credentialFormats: [
            indyCredentialFormat,
            new JsonLdCredentialFormatService(),
            new AnonCredsCredentialFormatService(),
          ],
        }),
      ],
    }),

    // Proofs module is enabled by default, but we can
    // override the default configuration
    proofs: new ProofsModule({
      autoAcceptProofs: AutoAcceptProof.ContentApproved,

      // Support v1 and v2 protocol, but only with indy proof format
      proofProtocols: [
        // v1 proof protocol is imported from anoncreds package
        // and provides legacy indy support
        new V1ProofProtocol({
          indyProofFormat,
        }),
        new V2ProofProtocol({
          proofFormats: [indyProofFormat, new AnonCredsProofFormatService()],
        }),
      ],
    }),

    // Dids
    // dids: new DidsModule({
    //   // Support creation of did:indy, did:key dids
    //   registrars: [new KeyDidRegistrar()],
    //   // Support resolving of did:indy, did:sov, did:key and did:web dids
    //   resolvers: [new KeyDidResolver()],
    // }),

    // AnonCreds
    anoncreds: new AnonCredsModule({
      // Support indy anoncreds method
      registries: [new IndyVdrAnonCredsRegistry()],
    }),
    // Use anoncreds-rs as anoncreds backend
    _anoncreds: new AnonCredsRsModule({
      anoncreds,
    }),

    // Configure supported indy ledger (bcovrin:test)
    indyVdr: new IndyVdrModule({
      indyVdr,
      networks: [
        {
          indyNamespace: 'indicio:demonet',
          isProduction: false,
          connectOnStartup: true,
          genesisTransactions: `{"reqSignature":{},"txn":{"data":{"data":{"alias":"opsnode-dn","blskey":"3brafcinN6X2wXvkgLdTUiVNCaJr1EhdM2bZFcmufx3ywS9XebbpwPpT7dMza9UzL5yk4HavjFuWHSBuyT5MsuLb6MYLwyzVXGiokZeubpRwuLfghVEchVALczFsJyKo7w5NZtamYP4Lx2SAYofaqHqQj3RibuPSv3err6rt9JFx6x3","blskey_pop":"RXMfLofDgBaZP3Nj8jY7fKM23atzcvne566MPmVqnnCLcocxvPRTV44S9fxS63URHZatM6UVTT9e3a5z2CnAL9mpdWB26YwQAHY3qQckJRU9fZuUk2TuTpcqD7Ga3ev75rrfsLqHiK2H2g6bA8sdB8X5NtQrqx3uZVrwwbwHg49WTy","client_ip":"13.244.162.184","client_port":"9702","node_ip":"13.244.218.51","node_port":"9701","services":["VALIDATOR"]},"dest":"A1XETkQtZmHhWiEcbdcJEwww49dmC7x47q9JgvzMksKV"},"metadata":{"from":"LCWN4ivQ3b68GaoMAuKyDq"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"cae6afe3265457b7222617237aef8c0bf6e2900968d0922fc48e18473a221f88"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"IdRamp-Demo1","blskey":"PUyFcZsKvVFy9qE4PHZReRDTMLQ9yRLuGvkUrN8fv24BYyFYcaHm66xgjaSk67tuv9ZyPvigHvFNocLSfxyeLtcjSr2oYjy99C3QXSpp8ZxGPTeWgbkNWxwLgZcXEYHdy6cjyg48N9AQFa4fx6zKnndMfKDxavGtZ1Pcciyesrvy1s","blskey_pop":"RL3oCrshuc8uiQ61VHPKfU7Pvkf9myjAcBNyGWHbG9Ws5PwXBwL7hNmhUR795zZNY2N275J1nP8iA8GJTaYR8M5onvH7CYKK5Pwom1iNuSV9Crxwg3pxTQVD3vNeEPAy9ZWEmZctS2w8dqQQ1aZp6hEU936dAz1XxxFb3j74oYj6Ky","client_ip":"207.126.128.11","client_port":"9702","node_ip":"207.126.129.11","node_port":"9701","services":["VALIDATOR"]},"dest":"DNfGpxhAvpwBVGEnFLJxC3GVHzXPVjQDtxsmT6PezsRy"},"metadata":{"from":"UgWhCVmxmsMm5XbafkSDzw"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"15182d52b3b8fb130b2ab04aa982059b6d6543989b755a1e0eae02304ae51d53"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"IdRamp-Demo2","blskey":"13fwtVCpuLDLJp5EyoT9mQK9x3f3uykhRFG1SbRWrHMpXz2mptsqi8agDKviWMnCywcAGuwsZyCg8PdZUtKeByPtj78HtHf1Rnaa84DpDQ7CGnfuNwi881TqbScQyYpHw1ZsqqQmh7CXx6h8UeNWnVqpvViDx2DRi8hKScisFkkBH6o","blskey_pop":"R5QRJhHZijB7i1ESNZgGnU8cmdhNGhZHMGkie7cf6opW7DqAhuWWzEc4dRB1tKoEwDAXy9Akwc5KGXE4FLRzpj6WAzKEjyuat2vntzQGFusdSCrrjr4Kut1LF5YRr8xEQGwRw3iXguhhw4ehn6bBwc4hPG2MhqYrHyzfe3KhoReYjR","client_ip":"207.126.128.14","client_port":"9702","node_ip":"207.126.129.14","node_port":"9701","services":["VALIDATOR"]},"dest":"61CT5xXftBfYQqCjuBwCcd1rzsdkYh4AbEmkkG6LK1xB"},"metadata":{"from":"BZQJHtWR9uTpUGpHXC5AQc"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7a900ed1b24945a6be2afe76a82cb6645e4d48b922627b6db40dda387c53c972"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"IdRamp-Demo3","blskey":"KvZ49NgBiKjiHNPckG5n1NqPZQYrSztpxghWnVkbsAndeZ9U5Zq5aaLFcJDi7wN9A6DM7cwJQVmYWdVuNG8Ci8kzo95P1WhM9x4ye2s6eh3Uoiq1vpRGoSt3LX1HecqENK8gTQCqpGiZpz74b5tg4RLuRm65TPcKLM7gpGcfFRHZCr","blskey_pop":"QsphXcJaPrTWUPtFMnd4CLqMPpuU9b5fXXSUBsbiFnL5fidPD9B8rFnukD4wDSteeBGFTxM7Xi1agSLpah19nWevh8Mn9mHEb1KATEG5xaVWdrHxEJHHGXavxEoVkdDjWYx97bDyPuccEc5K8zaE9qt5VPe9K7CNqqHdikvhPZxxQw","client_ip":"207.126.128.16","client_port":"9702","node_ip":"207.126.129.16","node_port":"9701","services":["VALIDATOR"]},"dest":"CAHd9Wt1NaaM7uWu4L2ZoXw6Gy7WDyqFLnNmRDZLW9cT"},"metadata":{"from":"TnbCiyvJwbri1qBoC9DPYd"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"e79eae9b08847569f6584e439598b69a983c068995ddfd2d1c032d8f6cb5ffe6"},"ver":"1"}`,
        },
        {
          indyNamespace: 'bcovrin:test',
          isProduction: false,
          connectOnStartup: true,
          genesisTransactions: `{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"138.197.138.255","client_port":9702,"node_ip":"138.197.138.255","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"138.197.138.255","client_port":9704,"node_ip":"138.197.138.255","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"138.197.138.255","client_port":9706,"node_ip":"138.197.138.255","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"138.197.138.255","client_port":9708,"node_ip":"138.197.138.255","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}`,
        },
      ],
    }),
  },
  dependencies: agentDependencies,
})

holder.registerInboundTransport(
  new HttpInboundTransport({
    port: 6007,
    path: '/didcomm',
  })
)
holder.registerOutboundTransport(new HttpOutboundTransport())
