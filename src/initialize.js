(function (window, $) {

  var bodyElem = $("body");

  bodyElem.on("contentComplete", function () {

  });

  bodyElem.on("hbsLoaded", function () {
    var fetchedData;
    var initDeferreds = [];

    /**
     * NOTE:
     * The .done function is called, as soon as all async operations
     * ( which are passed as an array) are finished )
     */
    $("#Content").append(Guido.templateContent);
        bodyElem.trigger("contentComplete");
  });

  //Helpers.getComponents(Guido.components);
  //Guido.View.init();

})(window, window.jQuery);
