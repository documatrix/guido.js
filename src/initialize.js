(function (window, $) {

    var bodyElem = $("body");

    bodyElem.on("contentComplete", function () {

        // accordian menu
        //Navigation.initialize();

        // makes jtable toggable
        //$(".jtable-title").click(function () {
        //    $(this).find(".headerIcon")
        //        .toggleClass("fa-arrow-down")
        //        .toggleClass("fa-arrow-right");
        //    //
        //    var newHeight;
        //
        //    if ($(this).find(".headerIcon").hasClass("fa-arrow-down")) {
        //        newHeight = $(this).next(".jtable-outer").find(".jtable").height();
        //    } else {
        //        newHeight = 0;
        //    }
        //
        //    $(this).next(".jtable-outer").animate({
        //        height: newHeight
        //    }, 500);
        //
        //    //$(this).parent().find(".jtable-bottom-panel").slideToggle(500);
        //});
        //
        //
        //$(document).on("click", '.panel-heading.toggable', function () {
        //    $(this).find(".headerIcon")
        //        .toggleClass("fa-arrow-down")
        //        .toggleClass("fa-arrow-right");
        //    $(this).next(".panel-body").slideToggle(500);
        //});
        //
        //$('.modal')
        //    .on('shown.bs.modal', function () {
        //        $(this).find('.modal-body').find("input").first().focus();
        //    })
        //    .on('hide.bs.modal', function(e) {
        //        $(e.target).find('#error-messages').remove();
        //    });
    });

    bodyElem.on("hbsLoaded", function () {
        var fetchedData;
        var initDeferreds = [];

        //Guido.fetchDataUrl = Guido.templateContent.match(/<meta[^>]+name="fetchDataUrl"[^>]+content="([^")]*)"/mi)[1];


        //initDeferreds.push(
        //    Guido.request({
        //        func: Guido.fetchDataUrl,
        //        data: {}
        //    }, function (response) {
        //
        //        // TODO: refactor to where responses are handled e.g. general.js
        //        // we already get json because of response handling in general.js: GuidoObj.ajax
        //        Guido.fetchedData = response;
        //        //fetchedData = JSON.parse(response);
        //        //Guido.fetchedData = JSON.parse(response);
        //    })
        //);

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
                // TODO: We should only pass the fetchedData to the template method
                //var baseData = $.extend({}, Guido.fetchedData, Guido);
                //
                //var template = Handlebars.compile($("#baseTemplate").html());
                //bodyElem.append(template(baseData));

                //Navigation.initialize();

                //if (Guido.menuCollapsed) {
                //    $("body").addClass("collapsedMenu");
                //} else {
                //    $("body").removeClass("collapsedMenu");
                //}
                //
                //if (Guido.menuCollapsed) {
                //    Navigation.instantCollapseMenu();
                //}

                // TODO: this generates handlebars but if we have a template
                // inside the template this is precompiled too!!
                // bad for form data setting!
                //var contentTpl = Handlebars.compile(Guido.templateContent);
                //$("#Content").append(contentTpl(Guido.fetchedData));


                $("#Content").append(Guido.templateContent);

                bodyElem.trigger("contentComplete");
            });


    });


    //Helpers.getComponents(Guido.components);
    //Guido.View.init();

})(window, window.jQuery);
