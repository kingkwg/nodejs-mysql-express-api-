var mysql = require('mysql');
const dbConfig = require("../config/db.config.js");
/*
 * 创建连接池。
 */
var create = function () {
    var pool = mysql.createPool({
        connectionLimit: 200,
        acquireTimeout: 30000,
        host: dbConfig.HOST,
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        database: dbConfig.DB,
        port: dbConfig.PORT,
        multipleStatements: true
    });
    return pool;
};

exports.create = create;
