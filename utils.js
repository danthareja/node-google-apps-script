require('colors');

module.exports.shutdownSafely = function(){
  process.stdin.destroy();
  process.exit(0);
};

module.exports.logError = function(err) {
  console.log(err.red);
  process.stdin.destroy();
  process.exit(0);
};

module.exports.getArgumentFromCli = function(idx, err) {
  err = err || ('Could not find argument number ' + idx);
  var arg = process.argv[idx]
  if (!arg) throw new Error(err);
  return arg;
};