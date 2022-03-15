import {Action, Asset, Float64} from '@greymass/eosio'
import config from 'config'

import {Feevoter, Setfeemult, Setfeevote, Feevalue} from './abi-types'
import {client, transact} from './client'
import {logger} from './logger'

import {SignerConfig, MultiplierConfig} from './types'

const multiplier: MultiplierConfig = config.get('multiplier')
const signer: SignerConfig = config.get('signer')

const symbol = Asset.Symbol.from('9,FIO')
const fees = Object.assign({}, config.get('fees'))
const feesTypes = Object.keys(fees)

export async function updateFeeVotes(price: number) {
    const fee_ratios: Feevalue[] = feesTypes.map((fee) =>
        Feevalue.from({
            end_point: fee,
            value: Asset.from(fees[fee] / price, symbol).units.toNumber(),
        })
    )

    const setfeevote = Action.from({
        account: 'fio.fee',
        name: 'setfeevote',
        authorization: [{actor: signer.actor, permission: signer.permission}],
        data: Setfeevote.from({
            fee_ratios,
            max_fee: 20000000000,
            actor: signer.actor,
        }),
    })

    const result = await transact(setfeevote)
    console.log(result)
}
