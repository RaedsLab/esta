var fs = require('fs');
var path = require('path');

var dataDir = __dirname + '/../_data'; //
dataDir = path.resolve(dataDir);

// check if the local filesytem is writeable
function dataDirExists (callback) {
  fs.exists(dataDir, function (exists) {
    // util.debug(exists ? "it's there" : "no _data dir");
    callback(null, exists);
  });
}

function createDataDir (callback) {
  fs.mkdir(dataDir, function() {
    callback(null, true);
  });
}

function createDataDirIfNotExists (callback) {
  dataDirExists(function(err, exists) {
    if (!exists) {
      createDataDir(function(err, created) {
        callback(err, created);
      })
    } else {
      callback(err, false);
    }
  });
}

function recordName(record, count) {
  // console.log('COUNT: '+count);
  count = (count === 0 || count === undefined) ? '' : '-'+count;
  return dataDir + '/' + record.index + '_'
  + record.type + '_' + record.id +count +'.json';
}

function fileExists(record, callback) {
  var file = recordName(record);
  fs.exists(file, function (exists) {
    callback(null, exists);
  });
}

// recursive filename generator
function fileNameGenerator(record, count, callback) {
  var filename;

  if(typeof count === 'function') {
    callback = count;
    count = 0;
    filename = recordName(record);
  } else {
    filename = recordName(record, count);
  }

  fs.exists(filename, function (exists) {
    if(exists){
      fileNameGenerator(record, count+1, callback);
    } else {
      callback(filename);
    }
  });
}

function saveFile(record, callback) {
  createDataDirIfNotExists( function() {
    // ensure we NEVER over-write an existing version
    fileNameGenerator(record, function(filename) {
      record = JSON.stringify(record);
      fs.writeFile(filename, record, function(err) {
        callback(err, filename);
      });
    });
  });
}

module.exports = {
  dataDirExists : dataDirExists,
  createDataDir : createDataDir,
  createDataDirIfNotExists : createDataDirIfNotExists,
  fileExists : fileExists,
  saveFile : saveFile
}