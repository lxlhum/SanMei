'use strict'

//MysqlServer
exports.mS = {
    select: 'http://127.0.0.1:3069/mysql/select/'
    , url: 'http://127.0.0.1:3069/mysqlbatch/updatestatus/'
    , selectAll: 'http://127.0.0.1:3069/mysql/selectall/'
    , update: 'http://127.0.0.1:3069/mysql/update/'
    , updateMail: 'http://127.0.0.1:3069/mysql/updatemail/'
    , updateData: 'http://127.0.0.1:3069/mysql/updatedata/'
    , createAndUpdate: 'http://127.0.0.1:3069/mysql/create_update_by_lock/'
    , update_L_2_E: 'http://127.0.0.1:3069/mysql/updateL_2_E/'
    , insert: 'http://127.0.0.1:3069/mysql/insert/'
    , count: 'http://127.0.0.1:3069/mysql/count/'
}

//币栈
exports.baddr = {
    btc: 'http://47.104.68.12:9000/api/wallet/'
    , btcAddr: 'http://47.104.68.12:9000/api/platform/'
    , eth: 'http://47.104.68.12:9001/api/'
}