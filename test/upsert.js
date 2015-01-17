var test  = require('tape');
var chalk = require('chalk');
var faker = require('faker');

var CREATE = require('../lib/create.js');
var READ = require('../lib/read.js');
var UPDATE = require('../lib/update.js');

test(chalk.cyan('UPDATE a record'), function (t) {
  var record = {
    type: 'tweet',
    index: 'twitter',
    id: Math.floor(Math.random() * (1000000)),
    message: faker.hacker.phrase()
  }

  var rec = {}; // make a copy of rec for later.
  for(var key in record) {
    if(record.hasOwnProperty(key)) {
      rec[key] = record[key];
    }
  }
  CREATE(record, function(res) {
    t.equal(res.created, true, chalk.green("✓ Record Created " +rec.id));

    READ(rec, function (res2) {
      rec.message = "my new message"; // change message
      // update record in ES
      UPDATE(rec, function(res3) {
        t.equal(res3._version, 2, chalk.green("✓ Record updated (version: "+res3._version +")"));
        // read back the record to confirm it was updated:
        READ(rec, function(res4){
          t.equal(res4._source.message, rec.message, chalk.green("✓ Record message updated to: ")+chalk.cyan(rec.message));
          t.end();
        })
      });
    });
  });
});
