function loader(options) {


  if (options.visibility === "show") {

    $("#loaderDivWrap").remove();

    var html = `<div id="loaderDivWrap" style="display:none;position: fixed;top: 55px;right: 0;left: 0;z-index: 1050;outline: 0;">
                        <div class="container">
                            <div class="progress" style="height: 20px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                                     aria-valuenow="0"
                                     aria-valuemin="0" aria-valuemax="100" style="width: 2%;">Saving</div>
                            </div>
                        </div>
                    </div>`;


    $('body').append(html);

    $("#loaderDivWrap").fadeIn();

  } else if (options.visibility === "hide") {
    // $("#loaderDivWrap").hide();
    $("#loaderDivWrap").fadeOut(options.fadeSpeed != undefined ? options.fadeSpeed : 2000);
  }


  if (options.percentage != undefined) {
    $("#loaderDivWrap .progress-bar").css("width", options.percentage + '%')
  }

  if (options.statusText != undefined) {
    $("#loaderDivWrap .progress-bar").text(options.statusText);
  }

  if (options.showError == true) {
    $("#loaderDivWrap .progress-bar").addClass("bg-danger");
  } else {
    $("#loaderDivWrap .progress-bar").removeClass("bg-danger");
  }


}