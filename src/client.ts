import {
    Action,
    APIClient,
    FetchProvider,
    PrivateKey,
    SignedTransaction,
    Transaction,
} from '@greymass/eosio'
import config from 'config'
import fetch from 'node-fetch'
import {logger} from './logger'

import {APIConfig, SignerConfig} from './types'

const eosio: APIConfig = config.get('eosio')
const signer: SignerConfig = config.get('signer')

// API Client - basic node
export const provider = new FetchProvider(eosio.api, {fetch})
export const client = new APIClient({provider})

export async function transact(action: Action) {
    const info = await client.v1.chain.get_info()
    const header = info.getTransactionHeader()
    const transaction = Transaction.from({
        ...header,
        actions: [action],
    })
    const privateKey = PrivateKey.from(signer.key)
    const signature = privateKey.signDigest(transaction.signingDigest(info.chain_id))
    const signedTransaction = SignedTransaction.from({
        ...transaction,
        signatures: [signature],
    })
    try {
        const result = await client.v1.chain.push_transaction(signedTransaction)
        return result
    } catch (error) {
        logger.warn({action, error}, 'error pushing transaction')
        throw error
    }
}
