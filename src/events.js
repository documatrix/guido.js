var Guido = Guido || {};

Guido.Event = (function ($, _) {

  var module = {},
      events = {};

  var module = {

    listen: function (options) {
      var usedEvents = _.isArray(options) ? options : _.keys(events);

      usedEvents.forEach( function( name ) {
        events[ name ]();
      });
    },

    detach: function(options) {
      // off events
    },

    delegate: function(event, action, func) {
      //if(_.isUndefined(func)) { Guido.Request.toHistory(action); }

      var func  = func || Guido,
          child = _.first(_.trim(action).match(/^@?[a-zA-Z]+/));

      if(_.isUndefined(child)) {
        this.exec(func, event);
//        if(_.isFunction(func)) {
//          var attrs = this.extractFromTag(event);
//          func(attrs.id, attrs.args, event);
//          this.exec(func, event);
//        }
      } else {
        if(_.startsWith(action, '@')) {
          // call a instance function
          this.exec(action.substring(1), event, Guido.View.currentView);
        } else {
          // + 1: also get rid of the trailing dot of the current child
          var next =  action.substring(child.length + 1, action.length);
          this.delegate(event, next, func[child]);
        }
      }
    },

    exec: function(func, event, scope) {

      if( !(_.isFunction(func) || (_.isObject(scope) && _.isFunction(scope[func])) )) {
        return;
      }

      var attrs = this.extractFromTag(event);


      if(scope) {
        scope.saveLastState();
        scope[func](attrs.id, attrs.args, event);
      } else {
        func(attrs.id, attrs.args, event);
      }
    },

    extractFromTag: function(event) {
      if(_.isUndefined(event) || _.isUndefined(event.currentTarget)) {
        return {};
      }

      var $el = $(event.currentTarget),
          id  = $el.data('id') || null,
          args = $el.data('args') || {};

      return { id: id, args: args };
    }
  };

  events = {
    click: function() {
      $(document).on('click', 'button, a', function(event) {
        var $el    = $(event.currentTarget),
            action = $el.data('action');

            console.log("clicked");

        if(action) {
          //Guido.Request.toHistory(action);
          Guido.Event.delegate(event, action);
          // return false does preventDefault + stopPropagation
          // TODO: other events firing on the currentTarget?
          return false;
        }
      });
      // hide popover when clicking
      $(document).on('click', function(e) {
        $('.popover').popover('hide');
      });
    },
    inputAction: function() {
      $(document).on('blur', ':input[data-action]:not(:button), span[contenteditable="true"][data-action]', function(event) {
        Guido.Event.delegate(event, $(event.currentTarget).data('action'));
        return false;
      });
    },
    toggle: function() {
      $(document).on('click', '.jtable-title', function(event) {
        Guido.currentTable.toggle($(event.currentTarget));
      });

      $(document).on("click", '.panel-heading.toggable', function () {
        $(this).find(".headerIcon")
          .toggleClass("fa-arrow-down")
          .toggleClass("fa-arrow-right");
        $(this).next(".panel-body").slideToggle(500);
      });
    },
    mousedown: function() {

    },

    sidebar: function() {
      $('#Sidebar').on( 'click', 'a.leaf', function( e ) {
        var url, module;

        e.preventDefault();
        e.stopPropagation();

        // NOTE: last state is saved in Guido.View.instance
        // if( Guido.View.currentView ) {
        //   Guido.View.currentView.saveLastState();
        // }

        url = $(e.currentTarget).attr('href');
        module = Guido.View.getModuleFromURL(url);
        Guido.View.instance( module ).index();
      });
    },
    onpopstate: function() {
      window.onpopstate = function(event) {
        var module, historyState;

        module = _.isObject(event.state) ? event.state.name : undefined;

        if( !module ) {
          module = Guido.View.getModuleFromURL();
        }

        // NOTE: last state is saved in Guido.View.instance
        // if( Guido.View.currentView ) {
        //   Guido.View.currentView.saveLastState();
        // }

        Guido.View.instance( module ).load();
      }
    }
  };

  return module;


})(jQuery, _);

