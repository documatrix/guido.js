window.Guido = window.Guido || {};

window.Guido.Index = (function ($, _) {

  var module = {

    params: [ "id" ],

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
      console.log('this is index')
    },

    blue: function() {
      this.changeState('blue');
      this.render()
      console.log('this is blue')
    }

  };

  return module;
})(jQuery, _);
