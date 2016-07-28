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
    basePath: rootPath + '/',
    modulePath: rootPath + '/modules',
    tempaltePath: rootPath_ + '/templates',
    requestPath: rootPath_ + '/'
  };

})();