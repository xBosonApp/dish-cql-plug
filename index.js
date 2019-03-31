
module.exports = {
  createfilter  : require('./lib/base.js'),
};


mount('./lib/tools.js');
mount('./lib/client-strategy.js');


function mount(libname) {
  var lib = require(libname);
  for (var name in lib) {
    if (module.exports[name])
      throw new Error('conflict ' + name);
    module.exports[name] = lib[name];
  }
}