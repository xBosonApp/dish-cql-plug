var cqlplug = require('../');
var cass_cli = cqlplug.single()();


exec("CREATE KEYSPACE IF NOT EXISTS test WITH REPLICATION =\
      { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };");

exec("use test;");

exec("CREATE TABLE IF NOT EXISTS person (\
      id     uuid PRIMARY KEY, \
      name   text, \
      age    text );");

function exec(query, p) {
  cass_cli.execute(query, p, function(err, result) {
    if (err) {
      console.log('\n', query);
      console.log(err);
    }
  });
}