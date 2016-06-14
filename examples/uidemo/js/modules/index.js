window.Guido = window.Guido || {};

window.Guido.Index = (function ($, _) {

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
    index: function() {
      this._index();
      alert('index')
    }

  };

  return module;
})(jQuery, _);
