function isNotEmpty(str) {
  if ((typeof str == "undefined")) {
    return false;
  }

  if (str) {
    return true;
  } else {
    return false;
  }
}


var mainSearchObj = {
  init: function () {

    var self = this;
    $("#main-header-search-input,.data-search-input").typeahead({
        hint: false,
        highlight: true,
        minLength: 1,
      },
      {
        name: 'a',
        display: 'heading',
        // source: ajaxCall
        source: function (query, syncResults, asyncResults) {
          $.get({
            url: '/search/autocomplete?q=' + query,
            cache: false
          }).then(function (response) {
            asyncResults(response.data);
          });

        },
        limit: 1000
      })
      .on('typeahead:selected', function (e, datum) {
        // window.location = `/${datum.entity_type}/${datum.id}`;
      });


    self.updateParametersView();
    $("#searchTextType").on("change", function () {
      self.updateParametersView();
    });

  },
  updateParametersView: function () {
    var self = this;

    var searchTextType = $("#searchTextType").val();

    if (searchTextType == 'standardFullTextSearch') {

      $("#StandardFullTextSearchOptions").removeClass("hidden");
      $("#exactMatchSearchOptions").addClass("hidden");

    } else {
      $("#StandardFullTextSearchOptions").addClass("hidden");
      $("#exactMatchSearchOptions").removeClass("hidden");
    }

  }
};


function initReIndexBtn() {
  // alert("called");
  $("#reIndexDataBtn").on("click", function (event) {
    event.preventDefault();


    var text;
    if (confirm("Are you sure you want to reIndex Data?") == true) {
      // text = "You pressed OK!";


      $('#reIndexDataBtn').prop('disabled', true);
      $("#reIndexDataBtn .spinner-grow").show();

      var jqxhr = $.get("/reIndexData", function (response) {
        if (response == "success") {
          alert("Successfully ReIndexed Data!");
        } else {
          alert("Some error occurred! Please check.");
        }


      })
        .fail(function () {
          alert("Some error occurred! Please check.");
        }).always(function () {
          $('#reIndexDataBtn').prop('disabled', false);
          $("#reIndexDataBtn .spinner-grow").hide();
        });


    }


  });

}

$(document).ready(function () {

  // initMainHeaderSearch();
  mainSearchObj.init();

  initReIndexBtn();


});