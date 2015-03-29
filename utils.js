module.exports.shutdownSafely = function(){
  process.stdin.destroy();
  process.exit(0);
};

module.exports.logError = function(err) {
  console.log(err.red);
  process.stdin.destroy();
  process.exit(0);
};