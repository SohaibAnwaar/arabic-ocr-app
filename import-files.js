const fs = require('fs');
var globalHelperFn = require("./backend/helpers");
const nReadlines = require('n-readlines');

const config = require('./config');
const {Client} = require('@elastic/elasticsearch');
const elasticsearchClient = new Client({node: 'http://localhost:9200'});
var async = require("async");

var LineByLineReader = require('line-by-line');

module.exports = function (app) {

  app.get('/reIndexData', function (req, res) {

    (async () => {
      await deleteAndCreateIndex();

      insertBulkStart();


      await sleep(1000*30);


      res.send("success");


    })().catch(err => {
      res.send("fail");
      console.error(err);
    });

  });

};


let line;
let lineNumber = 1;


var client = elasticsearchClient;
var indexName = config.elasticsearch.mainIndexName;

const deleteAndCreateIndex = async function (indexName) {

  try {
    await elasticsearchClient.indices.delete({index: config.elasticsearch.mainIndexName});
    console.log("Deleting Index");
  } catch (err) {
    // catch in case the index doesn't already exist
  }

  await sleep(5000);

  console.log("Creating Index");
  try {
    return await client.indices.create({
      index: config.elasticsearch.mainIndexName,
      body: config.elasticsearch.indexProperties
    });
  } catch (err) {
    console.log(err);
  }
};


function sleep(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x);
    }, x);
  });
}


function insertBulkStart() {

  fs.readdirSync(config.fileFolderLocationToIndex.path).filter(globalHelperFn.isNotJunkFile).forEach(fileName => {
    console.log(`Inserting ${fileName}`);


    var lr = new LineByLineReader(`${config.fileFolderLocationToIndex.path}/${fileName}`);

    var lineNumber = 0;

    var bulkDocsBody = [];

    lr.on('error', function (err) {
      // 'err' contains error object
      console.log("error while reading file " + `${fileName}`)
    });

    lr.on('line', function (line) {
      // pause emitting of lines...

      lineNumber++;
      // lr.pause();

      try {
        var lineJSON = JSON.parse(line);

        if (lineJSON['index'] == undefined) {

          bulkDocsBody.push(lineJSON);
          // console.log(lineNumber + " " + lineJSON['name'] + " " + lineJSON['page_num']);
        }
      } catch (e) {
        console.log("error at line" + lineNumber);
        console.log(`Line ${lineNumber} has: ${line}`);
        process.exit(0);
      }


      if (lineNumber % 20000 == 0) {

        lr.pause();

        console.log(lineNumber + " " + lineJSON['name'] + " " + lineJSON['page_num']);
        bulkInsertIntoElasticSearch(bulkDocsBody);
        bulkDocsBody = [];

        setTimeout(function () {
          lr.resume();
        }, 0.01);

      }
    });

    lr.on('end', function () {
      // All lines are read, file is closed now.
      bulkInsertIntoElasticSearch(bulkDocsBody);
      console.log("All lines are read, file is closed now: " + `${fileName}` + " remaining " + bulkDocsBody.length)
    });


  });

}

function bulkInsertIntoElasticSearch(bulkDocsBody) {

  bulkDocsBody = bulkDocsBody.flatMap(doc => [{index: {_index: config.elasticsearch.mainIndexName}}, doc]);


  elasticsearchClient.bulk({
    refresh: true,
    body: bulkDocsBody
  }, function (err, resp) {
    console.log(resp, err);
  })

}
