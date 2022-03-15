import {Name, PrivateKey} from '@greymass/eosio'

export interface APIConfig {
    api: string // API URL
}

export interface SignerConfig {
    actor: Name
    permission: Name
    key: PrivateKey
}

export interface MultiplierConfig {
    fee_multiplier: string
}
