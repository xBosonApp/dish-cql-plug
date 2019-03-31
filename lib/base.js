var tools = require('./tools.js');

module.exports = create;

var CONTENT = 'content-type', 
    TYPE = 'application/json; charset=utf-8';

//
// 创建一个 cql for dish 过滤器
// client_getter -- Function(service_context, request, response)
//
function create(client_getter) {
  
if (!client_getter) 
  throw new Error('must have client_getter');
  
return cql;

//
// 创建一个执行 cql 的环境, 并且预绑定一个查询, 更高的效率, 
// 自动处理 pageState 这个参数, 可以在 query 中绑定,
// pageState 是一个 cassandra 内部用于标记页码的句柄字符串;
//
// fconf 参数:
//    cql : 带有 ? 用于绑定参数的 cql 查询语句
//    o   : queryOption, 查询时必要的参数
//    q   : Array<String>, 从 req.query[q] 中获取参数, 按顺序绑定到 cql ? 中
//    n   : name, 给 cql 起一个名字, 允许同时有多个 cql 过滤器
//
// 绑定函数 resp.cql = Function(n, r[, rcb])
//    n   : 对应参数中的名字
//    r   : Object{k:v}, 用与向 cql 传递非 req.query 中的参数, k 必须在 q 中出现
//    rcb : 回调函数, 默认直接调用 next 返回給客户端
//
function cql(fconf, service_context) {
  var ckey = '__cql_c0ntext';

  var cql_context = service_context[ckey];
  if (!cql_context) {
    cql_context = service_context[ckey] = {
      fn: {},
    };
  }

  if (!fconf.n) 
    throw new Error('must have [n]ame');
  if (!fconf.cql) 
    throw new Error('must have [cql]command');
  if (!fconf.q) 
    throw new Error('must have [q]ueryArray');
  if (cql_context.fn[fconf.n]) 
    throw new Error('conflict [n]ame');

  var qname = fconf.q;
  var opt   = fconf.o || { prepare: true };
  var cql   = fconf.cql;
  var qmap  = {};
  var qlen  = qname.length;

  for (var i=0; i<qlen; ++i) {
    qmap[ qname[i] ] = i;
  }

  cql_context.fn[fconf.n] = function(req, r, rcb) {
    var values = [];
    var q = req.query;

    for (var i=0; i<qlen; ++i) {
      var nn =  qname[i];
      values[i] =  (r && r[nn]) || q[nn];
    }

    if (q.pageState) {
      opt.pageState = q.pageState;
    } else {
      delete opt.pageState;
    }

    client_getter(
      service_context, req, this)
        .execute(cql, values, opt, rcb);
  };


  return function(req, resp, next) {
    if (!resp.cql) {
      resp.cql = function(n, r, rcb) {
        return cql_context.fn[n].call(this, req, r, pack_rcb);

        function pack_rcb(err, ret) {
          if (rcb) {
            try {
              rcb(err, ret);
            } catch(e) {
              next(e);
            }
            return;
          }
          default_ret(err, ret);
        }
      
        function default_ret(err, dat) {
          var retobj = {};
            
          if (err) {
            retobj.ret  = err.code;
            retobj.msg  = err.message;
            retobj.data = err;
          } else {
            retobj.ret  = 0;
            retobj.msg  = dat.info;
            retobj.data = dat;
          }
            
          resp.setHeader(CONTENT, TYPE);
          resp.end(JSON.stringify(retobj));
        }
      }
    } // end if
    next();
  }
}

}