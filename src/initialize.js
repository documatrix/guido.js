(function (window, $) {

    var bodyElem = $("body");

    bodyElem.on("contentComplete", function () {

    });

    bodyElem.on("hbsLoaded", function () {
        var fetchedData;
        var initDeferreds = [];

        initDeferreds.push(
            /*
             updates the server with the new collapsed navigation settings
             */
            Guido.Request.request({
                func: 'get_user_settings',
                data: {
                    elem_id: "Navigation"
                }
            }, function (response) {
                // TODO: refactor to where responses are handled e.g. general.js
                // we already get json because of response handling in general.js: GuidoObj.ajax
                //response = JSON.parse(response);

                Guido.navigation = response.navigation;
                Guido.settings = response.settings;
                Guido.menuCollapsed = ( String(response.settings.collapsed) === 'true' );

                Guido.activeMenuEntries = [];

                if(response.breadcrumbs) {
                    $.each(response.breadcrumbs.parents, function (index, value) {
                        Guido.activeMenuEntries.push(value);
                    });
                    Guido.activeMenuEntries.push(response.breadcrumbs.target);
                }
            })
        );


        /**
         * NOTE:
         * The .done function is called, as soon as all async operations
         * ( which are passed as an array) are finished )
         */
        $.when
            .apply($, initDeferreds)
            .done(function () {
                $("#Content").append(Guido.templateContent);
                bodyElem.trigger("contentComplete");
            });


    });


    //Helpers.getComponents(Guido.components);
    //Guido.View.init();

})(window, window.jQuery);
