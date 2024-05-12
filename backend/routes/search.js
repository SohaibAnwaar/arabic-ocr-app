var path = require('path');
const config = require('../../config');
// var db = require('./../../backend/db');
var moment = require('moment');
var async = require("async");
var globalHelperFn = require("../helpers");
const fs = require('fs');

const {Client} = require('@elastic/elasticsearch');
const elasticsearchClient = new Client({
node: 'https://elasticsearch:9200',
  auth: {
    username: 'elastic',
    password: 'U6pOoJanL=jGzV6F67lq'
  },
  tls: {
    ca: fs.readFileSync('/app/sharedVolume/certs/http_ca.crt'),
    rejectUnauthorized: false
  }});



module.exports = function (app) {
  /* SEARCH ROUTES STARTS */


  app.get('/search', function (req, res) {
    


    let currentPageNo = (+req.query.pageNo);
    let searchTerm = req.query.q;

    let pagination = {
      currentPageNo: isNaN(currentPageNo) ? 1 : +currentPageNo,
      rowsPerPage: config.pagination.rowsPerPage,
      baseUrl: [],
      onlyQueryParams: {}
    };


    //update baseUrl for next pagination starts

    let queryObjCopy = Object.assign({}, req.query);
    delete queryObjCopy['pageNo'];

    for (var key in (queryObjCopy)) {
      pagination.baseUrl.push(`${key}=${queryObjCopy[key]}`);
    }
    pagination.baseUrl = pagination.onlyQueryParams = pagination.baseUrl.join('&');
    pagination.baseUrl = `/search?${pagination.baseUrl}`;


    //update baseUrl for next pagination ends


    //check if searchTerm Have any wildcard characters

    var elasticsearchSearchBodyQuery = {};


    if (searchTerm.indexOf('*') > -1 || searchTerm.indexOf('?') > -1) {

      elasticsearchSearchBodyQuery = {
        "wildcard": {
          "text": {
            "value": searchTerm
          }
        }
      };

    } else if (req.query.searchTextType == 'standardFullTextSearch') {
      elasticsearchSearchBodyQuery = {
        "match": {
          "text": {
            "query": searchTerm, //المضمون,
            "fuzziness": req.query.sft_fuzziness,
            "operator": req.query.sft_boolean_operator,
            "fuzzy_transpositions": req.query.sft_fuzzy_transpositions == 'on' ? true : false
          }
        }
      };
    } else if (req.query.searchTextType == 'exactMatchSearch') {
      elasticsearchSearchBodyQuery = {
        "match_phrase":
          {
            "text": {
              "query": searchTerm, //المضمون,
              "slop": req.query.ems_slop
            }
          }
      };
    }

    query = {
      index: [config.elasticsearch.mainIndexName],
      body: {
        "query": elasticsearchSearchBodyQuery,
        "highlight": {
          "fields": {
            "text": {"type": "plain"}
          }
        },
        size: pagination.rowsPerPage,
        from: (pagination.currentPageNo - 1) * pagination.rowsPerPage
      }
    };
    console.log("Here is query ", JSON.stringify(query))
    elasticsearchClient.ping().then(
      (result) => {
        console.log(result)
        console.log("Elasticsearch is up and running")
      }
    ).catch((err) => {
      console.log("Elasticsearch is down")
    })


    elasticsearchClient.search(query).then(
      (result) => {

        console.log("---<", result);

        var finalSearchResult = result.hits.hits.map(function (m) {

          return {
            id: m['_id'],
            heading: `${m['_source']['name']} (Page: ${m['_source']['page_num']})`,
            subheading: m['highlight']['text'],
            searchScore:m['_score']
          };

        });

        pagination.totalRowsCount = result.hits.total.value;
        pagination.totalPages = Math.ceil(pagination.totalRowsCount / pagination.rowsPerPage);


        res.render('search/search-result', {
          query: req.query,
          resultData: {
            searchData: {
              rows: finalSearchResult,
              pagination: pagination
            }
          }
        });


      }).catch((err) => {
      console.log("\n\n\n I got errors here")
      console.log(err);
      res.render('search/search-result', {
        query: req.query,
        resultData: {
          searchData: {
            rows: [],
            pagination: pagination
          }
        }
      });
    })


  });


  app.get('/search-doc/:docID', function (req, res) {

    let docID = req.params.docID;

    let currentPageNo = (+req.query.pageNo);
    let searchTerm = req.query.q;


    var elasticsearchSearchBodyQuery = {};


    if (searchTerm.indexOf('*') > -1 || searchTerm.indexOf('?') > -1) {

      elasticsearchSearchBodyQuery = {
        "bool": {
          "must": [
            {"match": {"_id": docID}},
            {
              "wildcard": {
                "text": {
                  "value": searchTerm
                }
              }
            }
          ]
        }
      }


    } else if (req.query.searchTextType == 'standardFullTextSearch') {
      elasticsearchSearchBodyQuery = {
        "bool": {
          "must": [
            {"match": {"_id": docID}},
            {
              "match": {
                "text": {
                  "query": searchTerm, //المضمون,
                  "fuzziness": req.query.sft_fuzziness,
                  "operator": req.query.sft_boolean_operator,
                  "fuzzy_transpositions": req.query.sft_fuzzy_transpositions == 'on' ? true : false
                }
              }
            }
          ]
        }
      };

    } else if (req.query.searchTextType == 'exactMatchSearch') {
      elasticsearchSearchBodyQuery = {
        "bool": {
          "must": [
            {"match": {"_id": docID}},
            {
              "match_phrase":
                {
                  "text": {
                    "query": searchTerm, //المضمون,
                    "slop": req.query.ems_slop
                  }
                }
            }
          ]
        }
      };


    }


    elasticsearchClient.search({
      index: [config.elasticsearch.mainIndexName],
      body: {
        "query": elasticsearchSearchBodyQuery,
        "highlight": {
          "fields": {
            "text": {
              "type": "plain",
              "fragment_size": 2147483647
            }
          }
        }
      }
    }).then(
      (result) => {

        // console.log(result);

        var finalSearchResult = result.hits.hits.map(function (m) {


          return {
            id: m['_id'],
            heading: `${m['_source']['name']} (Page: ${m['_source']['page_num']})`,
            subheading: m['highlight']['text'],
            searchScore:m['_score']
          };

        });


        res.render('search/search-result-single-doc', {
          query: req.query,
          resultData: {
            searchData: {
              rows: finalSearchResult
            }
          }
        });


      }).catch((err) => {
      // console.log(err);
      res.render('search/search-result-single-doc', {
        query: req.query,
        resultData: {
          searchData: {
            rows: {}
          }
        }
      });
    })


  });


  /* SEARCH ROUTES ENDS */
};