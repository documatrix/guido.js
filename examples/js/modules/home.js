window.Guido = window.Guido || {};

window.Guido.Home = (function ($, _) {

  var module = {

    ACTIONS: {

      INDEX: [
        { action: '@sayHello', icon: 'plus', caption: "hello world" },
      ]
    },

    defaultObject: {
    },

    tableOptions: {
    },

    buttons: {

      sayHello: {
        dataAction: '@sayHello',
        btnClasses: 'btn-primary btn-ok',
        caption: 'CAP_BTN_SAVE'
      }
    },

    // Actions
    sayHello: function( e ) {
      console.log(e);
      alert('say WAAAT?!');
    }

  };

  return module;
})(jQuery, _);
