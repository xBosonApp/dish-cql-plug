# 执行 cql 命令

`dish-lib` 插件


# install

`npm install cql-dishplug-lib --save`

> 依赖项目: dish-lib, cassandra-driver  
> 依赖项目从外部注入或安装, 本项目并不会自动安装这些依赖.


# Usage

### 将 cql 插件与 dish 关联:

```js
var cass_drv = require('cassandra-driver');
var cass_cli = new cass_drv.Client({ /* cassandra config */ });

var cqlplug = require('cql-dishplug-lib');
var dish = require('dish-lib');

// 这里是关键
var cqlfilter = cqlplug.createfilter(cqlplug.single(cass_cli));
dish.filter(cqlfilter);
```


### 在 dish 的服务中使用 cql:

```js
var container = dish.create('/e-ui/service', context);

//
// 声明一个服务, 并声明服务使用的过滤器
//
// type -- 呼叫 cql 插件必须使用 'cql'
// n    -- (1) cql 命令名称
// q    -- (2) cql 参数名称
// cql  -- (3) cql 绑定语句
// (3) 中的语句 `?` 顺序必须与 (2) 中数组元素一一对应
// 当进行参数绑定时, 过滤器会尝试从 `req.query` 对象中寻找 (2) 中出现的
// 参数并绑定到最终语句, (即: `req.query.person_name` 被绑定给 `name=?`
// 可以在 cql 过滤器之前插入变量检查过滤器从而检查参数有效性
// * container.service 的说明见 dish-lib
//
container.service(serFn, [
  { type: 'cql', n: 'getpersonlist', q: ['person_name', 'person_age'],
    cql: 'select * from person where name=? and age=?' },
]);

function serFn(req, resp, next) {
  //
  // 参数绑定扩展, 如果需要强制设置某个参数的值则使用这个变量
  // 如下的设置会使 person_name='x' 从而忽略从前端传递来的参数.
  //
  var ex_parms = { person_name: 'x' };

  resp.cql('getpersonlist', ex_parms, function(err, ret) {
    if (err) console.log(e.message);
  });
}
```


# API

### cqlplug.createfilter(Function cli_getter(service_context, request, response));

  该函数返回一个过滤器给 dish 使用, cli_getter 参数是一个函数, 该函数返回 cassandra client 对象,
  在内部, 每次执行 cql 语句时 cli_getter 函数都会被调用, 允许在不同的情况返回不同的连接.
  cassandra 文档中指出, 通常情况下全局使用唯一 client 即可.
  
  
### resp.cql(cql_name, ex_parms, callback_function);

  调用声明的过滤器, 参数 ex_parms, callback_function 可以省略, 若省略 callback_function,
  返回一个标准的 json 其中含有返回数据和到服务器的连接, 这些数据仅用于测试, 在生产环境不应出现.
  
  
### cqlplug.single(cass_cli)

  该函数是 cli_getter 的默认实现, 它总是返回全局唯一的连接对象: cass_cli,
  若省略参数, 则尝试创建全局连接, 此时注意 cassandra-driver 是否正确安装
  
  