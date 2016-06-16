/* istanbul ignore if */
if( typeof Guido === 'undefined' ) {
  Guido = {}
}

/* istanbul ignore if */
if( typeof Guido.Base === 'undefined' ) {
  Guido.Base = {};
}

Guido.Base.Render = {

  render: function( options ) {
    // Guido.View.replaceTemplate( Guido.config.content.target,
    //                             this.stateTemplateName(),
    //                             options || {} );

    this.dom( Guido.config.content.target, this.stateTemplate( options || {} ) );


    this.renderComponent( 'notifications', this.notifications.notifications, true );

    this.renderComponent( 'toolbar', this.renderActions() );
  },

  renderComponent: function( name, options, replace ) {
    config = Guido.config.components[ name ];

    if( !config.render ) {
      return;
    }

    context = _.extend( {}, config.options, options );
    component = Guido.View.$template( config.tpl, context );

    replace = _.isUndefined( replace ) ? config.replace : replace;

    this.dom( config.target, component, replace );
  },

  dom: function( target, html, replace ) {
    if( replace ) {
      $( target ).replaceWith( html );
    } else {
      $( target ).html( html );
    }
  },

  renderActions: function( actions ) {
    var rendered = "";

    actions = actions || this.stateActions();

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
};
