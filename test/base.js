// var config = require('configuration-lib');
// var cc = config.load().cassandra;

// var cass_drv = require('cassandra-driver');
// var cass_cli = new cass_drv.Client(cc);

var cqlplug = require('../');
var cqlfilter = cqlplug.createfilter(cqlplug.single());

var dish = require('dish-lib');
dish.filter(cqlfilter);

var container = dish.create('/t', {});
  
container.service(serFn, [
  { type: 'cql', n: 'getpersonlist', q: ['id'],
    cql: 'select * from person where id=?' },
]);
  
function serFn(req, resp, next) {
  resp.cql('getpersonlist');
}


var http = require('http');
var server = http.createServer(container);
server.listen(88);

