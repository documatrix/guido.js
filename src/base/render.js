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
    Guido.Event.fire( 'guido:beforeRender', this );

    this.dom( Guido.config.content.target, this.stateTemplate( options || {} ) );

    for( var component in Guido.config.components ) {
      // var component =  ;
      // if( !!component ) {
        this.renderComponent( Guido.config.components[ component ] , options );
      // }
    }

    Guido.Event.fire( 'guido:rendered', this );
  },

  rendered: function() {
    // do nothing...
  },

  renderComponent: function( config, options, mode ) {
    if( !config.render || _.isFunction(config.render) && !config.render.call(this) ) {
      return;
    }

    context = _.extend( {}, config.options, options );
    component = this.stateComponent( config, context );
    // component = Guido.View.$template( config.tpl, context );

    mode = _.isUndefined( mode ) ? config.mode : mode;

    return this.dom( config.target, component, mode );
  },

  dom: function( target, html, mode ) {
    if( mode === 'replace' ) {
      $( target ).replaceWith( html );
    } else if( mode === 'append' ) {
      $( target ).append( html );
    } else {
      $( target ).html( html );
    }
  },

  /**
   * Render the template for the current state.
   * When the module's state template cannot be found, fallback to the
   * default state template.
   * @param {object} options template options
   * @returns {String} The state template as a String
   */
  stateTemplate: function(options) {
    var name = this.stateTemplateName();

    if(_.isFunction(Guido.View.templates[name])) {
      return Guido.View.template(this.stateTemplateName(), options);
    }

    return Guido.View.template(this.defaultStateTemplateName(), options);
  },

  stateComponent: function( config, options ) {
    return (
      Guido.View.template( this.stateComponentName( config.tpl ), options ) ||
      Guido.View.template( this.defaultViewComponentName( config.tpl ), options ) ||
      Guido.View.template( this.defaultStateComponentName( config.tpl ), options ) ||
      Guido.View.template( this.defaultComponentName( config.tpl ), options )
    );
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
