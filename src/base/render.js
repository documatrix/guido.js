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
    this.dom( Guido.config.content.target, this.stateTemplate( options || {} ) );

    for( var component in Guido.config.components ) {
      this.renderComponent( Guido.config.components[ component ], options );
    }

    Guido.Event.fire( 'guido:rendered', this );
  },

  rendered: function() {
    // do nothing...
  },

  renderComponent: function( config, options, replace ) {
    if( !config.render ) {
      return;
    }

    context = _.extend( {}, config.options, options );
    component = this.stateComponent( config, context );
    // component = Guido.View.$template( config.tpl, context );

    replace = _.isUndefined( replace ) ? config.replace : replace;

    return this.dom( config.target, component, replace );
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
