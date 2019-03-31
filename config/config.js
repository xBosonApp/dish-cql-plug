module.exports = {

  logger : {
    logLevel      : 'ALL',
    log_dir       : './logs',
    log_size      : 5 * 1024 * 1024,
    reserve_count : 30
  },

  cassandra : {
    contactPoints : ['192.168.1.102'],
    keyspace      : '',
    debug_log     : true,
  },

};
