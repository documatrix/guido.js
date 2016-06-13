(function () {

    String.prototype.startsWith = function (start) {
        return this.substring(0, start.length) === start;
    };

    Date.parseDate = function (input, format) {
        return moment(input, format).toDate();
    };
    Date.prototype.dateFormat = function (format) {
        return moment(this).format(format);
    };

    var Helpers = {
        debugMode: true,
        // This function is responsible for retrieving all components.
        // The function is executed immediately. After all components are
        // saved as Handlebars partials, the 'hbsLoaded' event will be triggered.
        getComponents: function (tplData) {

            var docFragment = document.createDocumentFragment();
            $(docFragment)
                .append(tplData)
                .children()
                .each(function () {
                    Handlebars.registerPartial(this.id, $(this).html());
                }
            );

            $("body").trigger("hbsLoaded");
        },

        /*
         shows a FlashMessage with the passed data
         */
        showFlashMessages: function (msgObj, selector) {
            selector = selector || "#Content";

            var template = Handlebars.compile(Handlebars.partials['FlashMessages']);

            $(selector).prepend(template(msgObj));
        },

        getURLParameter: function () {
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            var arr;
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                } else if (typeof query_string[pair[0]] === "string") {
                    arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                    query_string[pair[0]] = arr;
                } else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        }
    };

    // Helper methods for request
    var GuidoObj = {
        base_url: "/",

        defAjaxOptions: {
            url: this.base_url,
            dataType: 'text',
            contentType: 'application/json',
            data: {},
            type: 'POST'
        },


        buildGetParams: function (data, base_url) {
            base_url = base_url || GuidoObj.base_url;

            var url = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    url.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                }
            }
            return base_url + '?' + url.join('&');
        },

        buildUrl: function(options) {
            var url   = GuidoObj.base_url,
                parts = [];

            for(var key in options) {
                if(key !== 'data') {
                    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(options[key]));
                }
            }

            return url + '?' + parts.join('&');
        },

        correctUrl: function (url) {
            if (!url.startsWith(this.base_url) && !url.startsWith('/')) {
                url = this.base_url + '/' + url;
            }
        },
        load: function(options, callback) {
            var params = $.extend({}, options);
            params.url = GuidoObj.base_url + '?func=' + params.func;
            return GuidoObj.ajax(params, callback);
        },
        /*
            Recommended short function to make request.
            If you need to change ajax params (like type, content...),
            use Guido.ajax method.
         */
        request: function (passedOptions, callback) {
            var _this = this;

            var options = $.extend({}, Guido.defAjaxOptions );

            options.session_id = options.session_id || Guido.sessionID;

            options.data = $.extend({}, options.data, passedOptions);

            return GuidoObj.ajax( options, callback);
        },

        /*
            Only recommended, when you need to change ajax params (like type, content...).
            Otherwise use request method.
         */
        ajax: function (passedOptions, callback) {
            var _this = this;

            passedOptions.data.session_id = passedOptions.data.session_id || Guido.sessionID;
            passedOptions.data = JSON.stringify(passedOptions.data);
            passedOptions = $.extend({}, Guido.defAjaxOptions, passedOptions);

            passedOptions.error = function (jqXHR, exception) {
                var res = {
                    response_status: jqXHR.status,
                    request: passedOptions
                };
                if (jqXHR.status === 0) {
                    console.error('Not connected. Verify Network.');
                } else if (jqXHR.status === 404) {
                    res.response_message = 'Requested page not found [404]';
                } else if (jqXHR.status === 500) {
                    console.log("internal server error");
                    res.response_message = 'Internal server error [500]';
                } else if (exception === 'parsererror') {
                    res.response_message = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    res.response_message = 'Time out error.';
                } else if (exception === 'abort') {
                    res.response_message = 'Ajax request aborted.';
                } else {
                    res.response_message = 'Uncaught Error.n' + jqXHR.responseText;
                }

                Guido.sendError(res);
            };

            // return the ajax function to provide promise functionality ($.when) for jQuery
            return $.ajax(passedOptions).done(function(data, status, response) {
                var json = {};

                if(response.getResponseHeader('content-type') === 'text/json') {
                    json = $.parseJSON(data);
                } else {
                    console.log('[ERROR] Request: ' + this.url + ' is not docPIPE4 ready! The response type is not text/json.');
                    return;
                }

                // validation errors present?
                if(typeof json.errors === 'object') {
                    Guido.displayErrors(json.errors);
                    return;
                }

                if(response.status === 200 && typeof callback === 'function') {
                    callback(json, status, response);
                }
            })
            .fail( function(data) {
                // TODO: when errors are returned with other status code than 200, e.g. 403
                // handle it here...
                Guido.sendError(data);
            });
        },
        displayErrors: function(messages) {

            var template = Handlebars.compile(Handlebars.partials['tpl-error-messages']),
                errors   = {};

            for(var key in messages) {
                // TODO: we dont have the captions yet
                //field = Guido.initialCaptions['CAP_' + key];
                field = 'CAP_' + key;
                errors[field] = messages[key];
            }

            $('#error-messages').remove();

            // TODO: this shows errors in modals! do we want this?
            // nice option would be in sitemap: attention coloring of top border/bg
            // below the sitemap div add a error box with the messages
            $('.modal.fade.in .modal-body').prepend(template({ errors: errors }));
        },
        sendError: function (errorData, callback) {

            try {
                errorData = {
                    response_status: errorData.response_status || 500,
                    response_message: errorData.response_message || "Internal Server error...",
                    request: errorData.request || "unknown request"
                };
            } catch (err) {
                if (Helpers.debugMode) {
                    debugger;
                    throw err;
                } else {
                    errorData = {
                        response_status: 500,
                        response_message: "Wrong parameter passed for logging to the server",
                        response_data: errorData
                    };
                }
            }

            var options = {
                data: {
                    'func': 'error',
                    'SESSID': '',
                    'data_type': 'json',
                    'data': errorData
                }
            };
            options = $.extend({}, Guido.defAjaxOptions, options);

            if (typeof callback !== "undefined") {
                return $.ajax(options).done(callback);
            } else {
                return $.ajax(options);
            }
        }
    };


    var PageHelper = {

        fillPageSection: function (selector, url, data) {
            var _this = this;
            var callback = function (tplData) {
                _this.fillTpl(selector, data, tplData);
            };

            return Guido.ajax({
                url: url,
                func: url,
                params: data
            }, callback);
        },
        fillTpl: function (selector, pageData, data) {
            var tpl = Handlebars.compile(data);
            var html = tpl(pageData);
            $(selector).empty().append(html);
        }
    };

    // TODO: check if still used. 
    var ModalMngr = {

        /*
         * modal-close function
         */
        closeFunc: function (selector) {
            ModalMngr.hide(selector);
        },
        /*
         *  hides the modal dialog
         */
        hide: function (selector) {
            $("#lean_overlay").fadeOut(200);
            $(selector).css("display", "none");
        },

        /**
         * unbinds and rebinds closeFunc, so that the event handler is registered
         * only once
         */
        rebindCloseFunc: function (selector) {
            var onCloseFunc = function () {
                ModalMngr.closeFunc(selector);
            };

            $(document)
                .off("click", "#lean_overlay, .modal_close", onCloseFunc)
                .on("click", "#lean_overlay, .modal_close", onCloseFunc);

            return this;
        },

        /**
         * append overlay if not exists
         */
        appendOverlay: function () {
            var overlayElem = $('#lean_overlay');
            // append,  if not exists, the html snippet of the modal dialog
            if (overlayElem.length === 0) {
                overlay = $("<div id='lean_overlay'></div>");

                $("body").append(overlay);
            }
            return this;
        },

        /*
         *  shows the modal dialog
         */
        show: function (selector, options) {


            options.css = options.css || {};


            // rebind event handler and append overlay if not exists
            ModalMngr
                .rebindCloseFunc(selector)
                .appendOverlay();


            var overlayElem = $('#lean_overlay');
            var modalElem = $(selector);

            // compute center position of the modalElem
            var modal_height = modalElem.outerHeight();
            var modal_width = modalElem.outerWidth();


            // when message is passed
            if (typeof options.msg !== 'undefined') {
                title = title || '<TMPL_VAR NAME=CAP_LPR_ERRMSG>';
                // set title and message
                modalElem.find('.title').text(options.title);
                modalElem.find('.msg').text(options.msg);
            }

            // fade effect
            overlayElem
                .css({'display': 'block', opacity: 0})
                .fadeTo(200, 0.5);

            var defaultCss = {
                'display': 'block',
                'position': 'fixed',
                'opacity': 0,
                'z-index': 11000,
                'left': '50%',
                'margin-left': -(modal_width / 2) + "px",
                'top': "200px"
            };

            // merge defaultCssProps into cssProps
            options.css = $.extend({}, defaultCss, options.css);

            modalElem
                .css(options.css)
                .fadeTo(200, 1);
        }

    };


    /* Last stop before browser responds to error */
    window.onerror = function (msg, url, line) {
        // when debug mode enabled-> error should be thrown from the browser
        if (Helpers.debugMode) {
            return false;
        } else {
            GuidoObj.sendError({
                response_message: msg
            });
        }
        return true;
    };

    window.Guido = window.Guido || {};

    window.Guido = $.extend({}, window.Guido, GuidoObj);

    window.ModalMngr = ModalMngr;

    window.PageHelper = PageHelper;

    window.Helpers = window.Helpers || Helpers;

})();
