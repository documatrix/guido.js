if( typeof Guido === 'undefined' ) { Guido = {} }

(function() {

  var rootPath_ = window.location.origin;

  Guido.config = {
    basePath: '/',
    defaults: {
      module: 'home',
      fallback: '_default_view'
    },
    content: {
      target: '#content',
    },
    components: {
    },
    basePath: rootPath_ + '/',
    modulePath: rootPath_ + '/modules',
    tempaltePath: rootPath_ + '/templates',
    requestPath: rootPath_ + '/'
  };

})();