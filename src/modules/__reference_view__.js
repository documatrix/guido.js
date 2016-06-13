window.Guido = window.Guido || {};

/**
 * MODULE_NAME view.
 * @param  {[type]} $ jQuery
 * @param  {Object} _ lodash
 * @return {Object} The system variable view.
 */
window.Guido.MODULE_NAME = (function ($, _) {

  var module = {

    /**
     * TopNav actions
     */
    ACTIONS: {
      INDEX: [
        { action: '@openForm', icon: 'plus', caption: Guido.t( 'CAP_BTN_NEU' ) }
      ],
      NEW: [
        { action: '@closeForm', icon: 'arrow-left', caption: Guido.t( 'CAP_BTN_BACK' ) }
      ],
      EDIT: [
        { action: '@closeForm', icon: 'arrow-left', caption: Guido.t( 'CAP_BTN_BACK' ) }
      ]
    },

    defaultObject: {
    },

    /**
     * JTable options.
     * @type {Object}
     */
    tableOptions: {
      index: {
        paging: false,
        defaultSorting: '',
        selectOnRowClick: false,
        selecting: true,
        multiselect: true,

        // NOTE: it is not get_clients as this identifier is used for closed loop!
        request: 'system_variables_get_all',
        rowInserted: function(event, data) {
        },
        fields: {
        }
      }
    },


    /**
     * Return SYV_NAME for state url generation.
     * @return {Hash} Parameters for state url generation.
     */
    toParams: function() {
      var params = _.pick(this.formObject, 'SYV_NAME');
      return _.extend(this._toParams(), this.withoutEmpty(params));
    },

    serialize: function() {
      var obj = this._serialize();
      if( this.state === Guido.View.STATE.NEW ) {
        obj.object = null;
        obj.formObject = null;
      }
      return obj;
    }
  };

  return module;
})(jQuery, _);
