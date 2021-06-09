var dbClient = function (pool) {

    /**
     * 处理查询条件及排序
     * @param cnd
     * @param args
     * @param cb
     * @returns {*}
     */
    function getCnd(cnd, args, cb) {
        if (arguments.length > 3) return null;
        if (arguments.length == 1) {
            return {where: " where 1 = 1 ", args: [], cb: arguments[0]}
        } else if (arguments.length == 2) {
            var info = {args: [], cb: args};
            args = cnd;
            cnd = " where 1 = 1 ";
            if (args) {
                for (var key in args) {
                    if (!key || key == "_orderBy" || typeof args[key] == "function") continue;
                    cnd += " and " + key + " = ? ";
                    info.args.push(args[key]);
                }
                var orderByArr = args._orderBy;
                if (orderByArr && orderByArr.length > 0) {
                    cnd += " order by "
                    for (var i = 0, li = orderByArr.length; i < li; i++) {
                        cnd += " " + orderByArr[i] + " ";
                        if (i < li - 1) cnd += ","
                    }
                }
            }
            info.where = cnd;
            return info;
        }
        cnd = cnd || "";
        if (cnd.trim() != "" && cnd.search(/^[\s]*where[\s]/) != 0) {
            cnd = " where " + cnd
        }
        return {where: cnd, args: args, cb: cb};
    };

    /**
     * 执行sql语句
     * @param sql
     * @param cb
     */
    function query(sql, cb) {
        var arr = Array.prototype.slice.apply(arguments);
        var cb = arr.pop();
        pool.getConnection(function (err, connection) {
            if (err) return cb(err);
            arr.push(function (err, results) {
                connection.release();
                err ? cb(err) : cb(null, results);
            });
            connection.query.apply(connection, arr);
        });
    };

    /**
     * 处理 新增或者更新传过来的字段及对应的值
     * @param fields
     * @returns {{args: Array}}
     */
    function getFields(fields) {
        var info = {args: []};
        var f = '';
        if (fields) {
            for (var key in fields) {
                f += key + " = ? ,";
                info.args.push(fields[key]);
            }
        }
        info.fields = f.substring(0, f.length - 2);
        return info;
    };

    /**
     * 数据查询操作。
     * @param tableName
     * @param fields
     * @param cnd
     * @param args
     * @param cb
     */
    function select({tableName, fields}, cnd, args, cb) {
        var cnd = getCnd.apply(this, Array.prototype.slice.call(arguments, 1));
        var strSql = `select ${fields ? fields : '*'} from ` + tableName + cnd.where;

        this.query(strSql, cnd.args, function (err, result) {
            err ? cnd.cb(err, null) : cnd.cb(null, {data: result});
        });
    };

    /**
     * 分页数据查询操作。
     * @param tableName
     * @param fields
     * @param page
     * @param page_size
     * @param cnd
     * @param args
     * @param cb
     */
    function pagination({tableName, fields, page, page_size}, cnd, args, cb) {
        var cnd = getCnd.apply(this, Array.prototype.slice.call(arguments, 1));
        var strSql = `select ${fields ? fields : '*'} from ` + tableName + cnd.where;
        var strCountSql = "select COUNT(*) from " + tableName + cnd.where;
        page = page ? page : 1;
        page_size = page_size ? page_size : 10;
        strSql = strCountSql + ";" + strSql + "limit " + (page - 1) * page_size + "," + page_size;
        this.query(strSql, cnd.args, function (err, result) {
            if (err) {
                cnd.cb(err, null)
            }
            else {
                var res = {
                    total: result[0][0]['COUNT(*)'],
                    currentPage: page,
                    pageSize: page_size,
                    totalPages: Math.floor(result[0][0]['COUNT(*)'] / page_size),
                    data: result[1]
                }
                cnd.cb(null, res)
            }
        });
    };

    /**
     * 数据删除
     * @param tableName 表名
     * @param cnd 条件,对象 如：{id:1,name:'aaa'}
     * @param cb 回调函数
     */
    function del(tableName, cnd, cb) {
        var cnd = getCnd.apply(this, Array.prototype.slice.call(arguments, 1));
        var strSql = `delete  from ` + tableName + cnd.where;

        this.query(strSql, cnd.args, function (err, result) {
            err ? cnd.cb(err, null) : cnd.cb(null, {data: result});
        });
    };

    /**
     * 新增
     * @param tableName 表名
     * @param fields 数据,如：{name:'zhangsan',age:1}
     * @param cb 数据,如：{name:'zhangsan',age:1}
     */
    function add(tableName, fields, cb) {
        var f = getFields(fields);
        var strSql = `insert into  ${tableName}  set  ${f.fields}`;
        this.query(strSql, f.args, function (err, result) {
            err ? cb(err, null) : cb(null, {data: result});
        });
    };

    /**
     * 修改
     * @param tableName 表名
     * @param fields 更新字段 如：{name:'zhangsan',age:1}
     * @param cnd 查询条件 如：{id:1}
     * @param cb 查询条件 如：{id:1}
     */
    function update(tableName, fields, cnd, cb) {
        var f = getFields(fields);
        var cnd = getCnd.apply(this, Array.prototype.slice.call(arguments, 2));
        var strSql = `update  ${tableName} set ` + f.fields + cnd.where;
        this.query(strSql, f.args.concat(cnd.args), function (err, result) {
            err ? cb(err, null) : cb(null, {data: result});
        });
    };


    this.query = query;
    this.select = select;
    this.pagination = pagination;
    this.del = del;
    this.add = add;
    this.update = update;
}

exports.dbClient = dbClient;

