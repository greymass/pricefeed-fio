import {Action, Float64} from '@greymass/eosio'
import config from 'config'

import {Feevoter, Setfeemult} from './abi-types'
import {client, transact} from './client'
import {logger} from './logger'

import {SignerConfig, MultiplierConfig} from './types'

const multiplier: MultiplierConfig = config.get('multiplier')
const signer: SignerConfig = config.get('signer')

async function getExistingMultiplier() {
    const results = await client.v1.chain.get_table_rows({
        code: 'fio.fee',
        scope: 'fio.fee',
        table: 'feevoters',
        lower_bound: signer.actor,
        upper_bound: signer.actor,
        type: Feevoter,
    })
    return results.rows[0]
}

async function setFeeMultiplier(multiplier: Float64) {
    const setfeemult = Action.from({
        account: 'fio.fee',
        name: 'setfeemult',
        authorization: [{actor: signer.actor, permission: signer.permission}],
        data: Setfeemult.from({
            multiplier,
            max_fee: 20000000000,
            actor: signer.actor,
        }),
    })
    return transact(setfeemult)
}

export async function updateFeeMultiplier() {
    const fee_multiplier: Float64 = Float64.from(multiplier.fee_multiplier)
    const existing = await getExistingMultiplier()
    if (existing) {
        if (existing.fee_multiplier.equals(fee_multiplier)) {
            logger.info('Fee multipliers configured matches existing on-chain data, not updating.')
        } else {
            logger.info('Fee multipliers configured differs from on-chain data, updating...')
            setFeeMultiplier(fee_multiplier)
        }
    } else {
        logger.info(`No fee multiplier set for ${signer.actor}, initializing value...`)
        setFeeMultiplier(fee_multiplier)
    }
}
