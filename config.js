const config = {
  app: {
    port: 3000
  },
  fileFolderLocationToIndex: {
    path: "./files-to-index"  //relative server.js file
  },
  pagination: {
    rowsPerPage: 25
  },
  elasticsearch: {
    server: {
      host: 'https://localhost',
      port: 9200,
      user: 'elastic',
      password: 'U6pOoJanL=jGzV6F67lq'
    },
    mainIndexName: 'arabic_example',
    indexProperties: {
      "mappings": {
        "properties": {
          "name": {"type": "keyword"},
          "description": {"type": "text"},
        }
      },
      "settings": {
        "analysis": {
          "filter": {
            "arabic_stop": {
              "type": "stop",
              "stopwords": "_arabic_"
            },
            "arabic_keywords": {
              "type": "keyword_marker",
              "keywords": []
            },
            "arabic_stemmer": {
              "type": "stemmer",
              "language": "arabic"
            }
          },
          "analyzer": {
            "rebuilt_arabic": {
              "tokenizer": "standard",
              "filter": [
                "lowercase",
                "decimal_digit",
                "arabic_stop",
                "arabic_normalization",
                "arabic_keywords",
                "arabic_stemmer"
              ]
            }
          }
        }
      }
    }
  }
};


module.exports = config;
