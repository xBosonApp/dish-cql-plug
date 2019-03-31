
module.exports = {
  single : single,
};

var single_client_instance;


function single(cassandra_client) {
  if (!cassandra_client) {
    if (!single_client_instance) {
      var conflib = require('configuration-lib');
      var cass_drv = require('cassandra-driver');
      
      conflib.wait_init(function() {
        if (single_client_instance) {
          cassandra_client = single_client_instance;
        } else {
          var conf = conflib.load().cassandra;
          cassandra_client = new cass_drv.Client(conf); 
          single_client_instance = cassandra_client;
        }
      });
    } else {
      cassandra_client = single_client_instance;
    }
  } else if (!single_client_instance) {
    single_client_instance = cassandra_client;
  }

  return function(service_context, request, response) {
    return cassandra_client;
  };
}