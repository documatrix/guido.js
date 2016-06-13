var Guido = Guido || {};

Guido.Cart = function() {
  this.items = {};
}

/**
 *
 */
Guido.Cart.prototype = (function ($, _) {

  var module = {

    /**
     * Cart Object of cart items:
     * A cart item is an Object with: id: {
     *  record: Object
     *  action: <action_name>
     * }
     */
    items: {},

    contains: function(id) {
      return this.items[id] ? true : false;
    },

    get: function(id) {
      return this.items[id];
    },

    size: function() {
      return _.size(this.items);
    },

    /**
     * Add a record to the cart to perform the action on it.
     * @param {number|String} id id of record to be added
     * @param action the action to be performed on the cart item
     */
    add: function(id, record, action) {
      this.items[id] = {
        record: record,
        action: action,
        cap_action: Guido.t(this.capAction(action))
      };
      this.updateButton();
    },

    addReason: function(id, reason) {
      if(this.items[id]) {
        this.items[id].record.reason = reason;
      }
    },

    getReason: function(id) {
      if(this.items[id]) {
        return this.items[id].record.reason;
      } else {
        return '';
      }
    },

    remove: function(id) {
      delete this.items[id];
    },

    updateButton: function() {
      Guido.View.$template('cart_button', { count: _.size(this.items) }).replaceAll('#cart-button');
    },

    capAction: function(action) {
      var cap = 'CAP_CART_ACTION_' + action;
      return cap.toUpperCase();
    }
  };

  return module;

})(jQuery, _);
