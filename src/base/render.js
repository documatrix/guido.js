/* istanbul ignore if */
if( typeof Guido === 'undefined' ) {
  Guido = {}
}

/* istanbul ignore if */
if( typeof Guido.Base === 'undefined' ) {
  Guido.Base = {};
}

Guido.Base.Render = {

  render: function(options) {
    var options   = options || {};

    // change to new state
    //this.changeState(state);

    // top nav
    this.renderTopNav(options);

    // render notification
    this.notifications.render();

    // content
    $('#content').html(this.stateTemplate(options));

    var tableOptions = this.stateTableOptions();
    if(tableOptions) {
      this.table = new Guido.TableView(tableOptions, this);
    }
  },

  reloadTable: function() {
    if(this.table) {
      this.table.reload();
    }
  },

  /**
   * Render the top navigation
   * @param {object} interpolation dynamic values for the title
   * @param {boolean} withCart specifies if the cart should be rendered or not
   */
  renderTopNav: function(interpolation, withCart) {

    var title = this.stateTitleName();
    actions = this.ACTIONS[this.state] || [];

    var data = {
      title: Guido.t(title, interpolation),
      actions: actions,
      withCart: false,
      icon: Guido.View.ICON[ this.state ] || Guido.View.ICON[ this.name ]
    };

    if(_.isObject(this.cart)) {
      data.withCart = _.isBoolean(withCart) ? withCart : this.withCart;
      data.count = this.cart.size();
    }

    $('title').html('Guido - ' + data.title);

    if( this.state === Guido.View.STATE.INDEX ) {
      Guido.View.replaceTemplate( '#top-nav', 'top_nav', data );
    } else {
      Guido.View.replaceTemplate( '#top-nav', 'top_nav_detail', data );
    }
  },

  renderToolbar: function( actions ) {
    var $toolbar = Guido.View.$template( 'toolbar', this.renderActions( actions ) );
    $("#toolbar").html( $toolbar );
  },

  renderActions: function( actions ) {
    var rendered = "";

    for( var i = 0; i < actions.length; i++ ) {
      action = actions[ i ];

      if( action.type === 'group' ) {
        group = this.renderActions( action.actions );
        rendered += Guido.View.template( 'btn_group', group );
        //rendered += Guido.View.template( 'btn_group', action.actions );
      } else if( action.type === 'dropdown' ) {
        rendered += Guido.View.template( 'btn_dropdown', action );
      } else {
        rendered += Guido.View.template( 'btn_action', action );
      }
    }

    return rendered;

  },

  toggleSelect: function( id, args, e ) {
    this.table.toggleSelect( id );
    var $icon = $(e.currentTarget).find('.glyphicon')
    if( this.isRecordSelected( id ) ) {
      $icon.removeClass('glyphicon-ok').addClass('glyphicon-remove');
    } else {
      $icon.removeClass('glyphicon-remove').addClass('glyphicon-ok');
    }
  },

  toggleCartItem: function(id, action) {
    var record = this.getRecord(id),
        item = this.cart.get(id);
    if(!record) {
      return;
    }

    if(item && item.action === action) {
      $('#' + this.cartActionId(id, action)).removeClass('active');
      this.cart.remove(id);
      $('#' + this.cartReasonId(id)).addClass('inactive').focus();
    } else {
      var $el = $('#' + this.cartActionId(id, action));
      $el.closest('tr').find('.table-action a').removeClass('active');
      $el.addClass('active');
      this.cart.add(id, record, action);
      $('#' + this.cartReasonId(id)).removeClass('inactive').focus();
    }

    return true;
  },
};
