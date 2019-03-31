var logger = require('logger-lib')('cass-dish-filter');


module.exports = {
  format_cql : format_cql,
  cql_logger : cql_logger,
};


function cql_logger(err) {
  if (err) {
    if (err.info) {
      logger.error(err.info, '[', err.coordinator,
        "]\n\t", err.message, '-', err.code, "\n\t", err.query);
    } else {
      logger.error(err);
    }
    return err;
  }
}


//
// 返回一个格式化好的 cql/sql
//
function format_cql(_in) {
  var TAB_CH = '  ';
  var out    = [];
  var sp     = 0;
  var tab    = 0;

  for (var i=0, e=_in.length; i < e; ++i) {
    var c = _in[i];
    if (c == "\n") { continue; }
    if (c == "\t") { c = ' '; }
    if (c == ' ') {
      if (++sp > 1) { continue; }
    } else { sp = 0; }

    out.push(c);

    if (c == ',') {
      out.push("\n");
      push_tab();
    } else if (c == '(') {
      var ss = _in.indexOf(')', i);
      if ((ss >=0) && (ss - i > 8)) {
        out.push("\n");
        ++tab;
        push_tab();
      }
    }
  }

  function push_tab() {
    for (var i=tab; i>0; --i) {
      out.push(TAB_CH);
    }
  }

  return out.join('');
}
