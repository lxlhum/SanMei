'use strict'

const cf = require('../config')
const bU = require('../baseUtils')
const cAS = require('../callAssetServer')

exports.doExecute = async (order) => {

    try {
        let coin = order.asset_owned.toLowerCase()
        let postData = {
            userid: order.userid
            , type: coin
            , ticket: order.txid
            , preimage: order.preimage
        }

        if (coin === 'tbtc') {
            postData.ticket = order.ticket_mine
            await cAS.callBTCExecute(postData)
        } else {
            await cAS.callETHExecute(postData)
        }

        return true
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}