'use strict'

const cf = require('../config')
const mS = require('../callMySqlServer')
const cAS = require('../callAssetServer')
const handle = require('../handle')

class BatchService {
    constructor() {
        let self = this
        self.update_MSG_1_to_0()
        self.update_MAIL_1_to_0()
        self.update_ORDER_L_2_E()
        self.redo_BUY_update_ORDER_L_2_E()
        self.update_ORDER_E_2_A()
    }

    update_MSG_1_to_0() {
        let self = this
        setTimeout(async () => {
            try {
                console.log('update_MSG_1_to_0')
                if (await mS.updateStatus_1_to_0('pw_msg_log')) {
                    process.nextTick(() => {
                        self.update_MSG_1_to_0()
                    })
                    console.log('update_MSG_1_to_0执行成功')
                }
            } catch (e) {
                console.error(e)
                console.log('update_MSG_1_to_0执行失败')
                process.nextTick(() => {
                    self.update_MSG_1_to_0()
                })
            }
        }, 60 * 60 * 24 * 1000)
        // }, 6 * 1000) //测试用运行时间 = 6秒
    }

    update_MAIL_1_to_0() {
        let self = this
        setTimeout(async () => {
            try {
                console.log('update_MAIL_1_to_0')
                if (await mS.updateStatus_1_to_0('pw_mail_log')) {
                    process.nextTick(() => {
                        self.update_MAIL_1_to_0()
                    })
                    console.log('update_MAIL_1_to_0执行成功')
                }
            } catch (e) {
                console.error(e)
                console.log('update_MAIL_1_to_0执行失败')
                process.nextTick(() => {
                    self.update_MAIL_1_to_0()
                })
            }
        }, 60 * 60 * 24 * 1000)
        // }, 6 * 1000) //测试用运行时间 = 6秒
    }

    update_ORDER_L_2_E() {
        let self = this
        setTimeout(async () => {

            console.log('update_ORDER_L_2_E')

            //先查询是否存在状态为

            let url = cf.mS.selectAll + 'pw_order'

            let whereJson = {
                status: 'l'
                , direction: 's'
            }

            let postData = {
                where: JSON.stringify(whereJson)
                , offset: 0
                , limit: 10
            }

            let orderList = ''

            try {
                orderList = await mS.selectAll(url, postData)
            } catch (e) {
                console.error(e)
                console.log('查找全部的LOCK状态的orderList执行失败')
                process.nextTick(() => {
                    self.update_ORDER_L_2_E()
                })
            }

            if (orderList) {

                for (let i = 0; i < orderList.length; i++) {

                    let url = cf.mS.select + 'pw_order'

                    let postData = {
                        status: 'l'
                        , direction: 'b'
                        , orderid: orderList[i].other_orderid
                    }
                    let order_buy = ''
                    try {
                        order_buy = await mS.select(url, postData)
                    } catch (e) {
                        console.error(e)
                        console.log('查找order_buy执行失败')
                        continue
                    }


                    if (order_buy) {
                        //如果存在order_buy的话，就要自动进行币栈订单执行
                        //执行完毕后，更新数据库状态为e
                        let updateUrl = cf.mS.updateData + 'pw_order'
                        try {
                            await handle.doExecute(orderList[i])

                            //1个事务提交更新L_2_E

                            let updateSellData = {
                                status: 'e'
                            }

                            let updateSellWhere = {
                                status: 'l'
                                , userid: orderList[i].userid
                                , orderid: orderList[i].orderid
                            }

                            let updateSellPostData = {
                                data: JSON.stringify(updateSellData)
                                , where: JSON.stringify(updateSellWhere)
                            }

                            await mS.updateStatus_L_2_E(updateUrl, updateSellPostData)

                        } catch (e) {
                            console.error(e)
                            console.log('执行两个订单失败')
                            continue
                        }

                        try {
                            await handle.doExecute(order_buy)

                            let updateBuyData = {
                                status: 'e'
                            }

                            let updateBuyWhere = {
                                status: 'l'
                                , userid: order_buy.userid
                                , orderid: order_buy.orderid
                            }

                            let updateBuyPostData = {
                                data: JSON.stringify(updateBuyData)
                                , where: JSON.stringify(updateBuyWhere)
                            }


                            await mS.updateStatus_L_2_E(updateUrl, updateBuyPostData)
                        } catch (e) {
                            console.error(e)
                            console.log('更新两个订单状态失败')
                            continue
                        }

                        // req.query.lockorder = JSON.stringify(lockOrder)

                        //     .post('/updateL_2_E/:table'
                        //         , uH.updateL_2_EPOST)
                        // let postData = {
                        //     updateSellData: updateSellData
                        //     , updateSellWhere: updateSellWhere
                        //     , updateBuyData: updateBuyData
                        //     , updateBuyWhere: updateBuyWhere
                        // }
                        // let url = cf.mS.update_L_2_E + 'pw_order'
                        // let order_buy = await mS.updateStatus_L_2_E(url, postData)
                    }
                }

                //此处可用使用promise一起发

                process.nextTick(() => {
                    self.update_ORDER_L_2_E()
                })
                console.log('update_ORDER_L_2_E处理成功，进入下一个轮询')
            } else {
                process.nextTick(() => {
                    self.update_ORDER_L_2_E()
                })
                console.log('update_ORDER_L_2_E没有数据需要处理')
            }

        }, 10 * 1000)
    }

    redo_BUY_update_ORDER_L_2_E() {
        let self = this
        setTimeout(async () => {

            console.log('redo_BUY_update_ORDER_L_2_E')

            //先查询是否存在状态为

            let url = cf.mS.selectAll + 'pw_order'

            let whereJson = {
                status: 'e'
                , direction: 's'
            }

            let postData = {
                where: JSON.stringify(whereJson)
                , offset: 0
                , limit: 10
            }

            let orderList = ''

            try {
                orderList = await mS.selectAll(url, postData)
            } catch (e) {
                console.error(e)
                console.log('查找SELL的EXECUTE状态的orderList执行失败')
                process.nextTick(() => {
                    self.redo_BUY_update_ORDER_L_2_E()
                })
            }

            if (orderList) {

                for (let i = 0; i < orderList.length; i++) {

                    let url = cf.mS.select + 'pw_order'

                    let postData = {
                        status: 'l'
                        , direction: 'b'
                        , orderid: orderList[i].other_orderid
                    }
                    let order_buy = ''
                    try {
                        order_buy = await mS.select(url, postData)
                    } catch (e) {
                        console.error(e)
                        console.log('查找order_buy执行失败')
                        continue
                    }


                    if (order_buy) {
                        //如果存在order_buy的话，就要自动进行币栈订单执行
                        //执行完毕后，更新数据库状态为e
                        let updateUrl = cf.mS.updateData + 'pw_order'

                        try {
                            await handle.doExecute(order_buy)

                            let updateBuyData = {
                                status: 'e'
                            }

                            let updateBuyWhere = {
                                status: 'l'
                                , userid: order_buy.userid
                                , orderid: order_buy.orderid
                            }

                            let updateBuyPostData = {
                                data: JSON.stringify(updateBuyData)
                                , where: JSON.stringify(updateBuyWhere)
                            }


                            await mS.updateStatus_L_2_E(updateUrl, updateBuyPostData)
                        } catch (e) {
                            console.error(e)
                            console.log('更新两个订单状态失败')
                            continue
                        }

                    }
                }

                //此处可用使用promise一起发

                process.nextTick(() => {
                    self.redo_BUY_update_ORDER_L_2_E()
                })
                console.log('redo_BUY_update_ORDER_L_2_E处理成功，进入下一个轮询')
            } else {
                process.nextTick(() => {
                    self.redo_BUY_update_ORDER_L_2_E()
                })
                console.log('redo_BUY_update_ORDER_L_2_E没有数据需要处理')
            }

        }, 10 * 1000)
    }

    update_ORDER_E_2_A() {
        let self = this
        setTimeout(async () => {

            console.log('update_ORDER_L_2_E')

            //先查询是否存在状态为

            let url = cf.mS.selectAll + 'pw_order'

            let whereJson = {
                status: 'e'
                , direction: 's'
            }

            let postData = {
                where: JSON.stringify(whereJson)
                , offset: 0
                , limit: 10
            }

            let orderList = ''

            try {
                orderList = await mS.selectAll(url, postData)
            } catch (e) {
                console.error(e)
                console.log('查找全部的EXECUTE状态的orderList执行失败')
                process.nextTick(() => {
                    self.update_ORDER_E_2_A()
                })
            }

            if (orderList) {

                for (let i = 0; i < orderList.length; i++) {

                    let url = cf.mS.select + 'pw_order'

                    let postData = {
                        status: 'e'
                        , direction: 'b'
                        , orderid: orderList[i].other_orderid
                    }
                    let order_buy = ''
                    try {
                        order_buy = await mS.select(url, postData)
                    } catch (e) {
                        console.error(e)
                        console.log('查找order_buy执行失败')
                        continue
                    }


                    if (order_buy) {
                        //如果存在order_buy的话，就要自动进行币栈订单执行
                        //执行完毕后，更新数据库状态为e
                        let updateUrl = cf.mS.updateData + 'pw_order'
                        try {

                            //1个事务提交更新E_2_A

                            let updateSellData = {
                                status: 'a'
                            }

                            let updateSellWhere = {
                                status: 'e'
                                , userid: orderList[i].userid
                                , orderid: orderList[i].orderid
                            }

                            let updateSellPostData = {
                                data: JSON.stringify(updateSellData)
                                , where: JSON.stringify(updateSellWhere)
                            }

                            await mS.updateStatus_E_2_A(updateUrl, updateSellPostData)

                        } catch (e) {
                            console.error(e)
                            console.log('执行第1个订单失败')
                            continue
                        }

                        try {

                            let updateBuyData = {
                                status: 'a'
                            }

                            let updateBuyWhere = {
                                status: 'e'
                                , userid: order_buy.userid
                                , orderid: order_buy.orderid
                            }

                            let updateBuyPostData = {
                                data: JSON.stringify(updateBuyData)
                                , where: JSON.stringify(updateBuyWhere)
                            }


                            await mS.updateStatus_E_2_A(updateUrl, updateBuyPostData)
                        } catch (e) {
                            console.error(e)
                            console.log('执行第2个订单失败')
                            continue
                        }

                        // req.query.lockorder = JSON.stringify(lockOrder)

                        //     .post('/updateL_2_E/:table'
                        //         , uH.updateL_2_EPOST)
                        // let postData = {
                        //     updateSellData: updateSellData
                        //     , updateSellWhere: updateSellWhere
                        //     , updateBuyData: updateBuyData
                        //     , updateBuyWhere: updateBuyWhere
                        // }
                        // let url = cf.mS.update_L_2_E + 'pw_order'
                        // let order_buy = await mS.updateStatus_L_2_E(url, postData)
                    }
                }

                //此处可用使用promise一起发

                process.nextTick(() => {
                    self.update_ORDER_E_2_A()
                })
                console.log('update_ORDER_E_2_A处理成功，进入下一个轮询')
            } else {
                process.nextTick(() => {
                    self.update_ORDER_E_2_A()
                })
                console.log('update_ORDER_E_2_A没有数据需要处理')
            }

        }, 10 * 1000)
    }
}

module.exports = new BatchService()