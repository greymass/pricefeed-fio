import config from 'config'

import {binance} from './axios'
import {logger} from './logger'
import {updateFeeMultiplier} from './multiplier'
import {updateFeeVotes} from './votes'

const {interval}: {interval: number} = config.get('general')

async function getFeedBinance() {
    const {
        data: {weightedAvgPrice},
    } = await binance.get('ticker/24hr?symbol=FIOUSDT')
    return parseFloat(weightedAvgPrice)
}

async function getUSDPrice() {
    const prices = await Promise.all([getFeedBinance()])
    logger.debug({prices}, 'prices returned by APIs')
    const average = prices.reduce((a, b) => a + b) / prices.length
    logger.debug({average}, 'average of all prices')
    return average
}

async function run() {
    const price = await getUSDPrice()
    logger.info({price}, 'average FIO price in USDT.')
    // Update fee multiplier based on configuration value (not used in pricefeed, but needs to exist)
    await updateFeeMultiplier()
    await updateFeeVotes(price)
}

export async function main() {
    logger.info({interval}, 'pricefeed-fio starting...')
    // Run immediately
    run()
    // Run on setInterval
    setInterval(run, interval * 1000)
}

function ensureExit(code: number, timeout = 3000) {
    process.exitCode = code
    setTimeout(() => {
        process.exit(code)
    }, timeout)
}

if (module === require.main) {
    process.once('uncaughtException', (error) => {
        logger.error(error, 'Uncaught exception')
        ensureExit(1)
    })
    main().catch((error) => {
        logger.fatal(error, 'Unable to start application')
        ensureExit(1)
    })
}
