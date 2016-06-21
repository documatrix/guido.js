if( typeof Guido === 'undefined' ) { Guido = {} }


Guido.config = {
  basePath: '/',
  defaults: {
    module: 'draft',
    fallback: '_default_view'
  },
  content: {
    target: '#content',
  },
  components: {
    header: {
      render: true,
      target: "#header",
      tpl: "header"
    },
    notifications: {
      render: true,
      target: '#notifications',
      tpl: 'notifications'
    },
    toolbar: {
      render: true,
      target: '#toolbar',
      tpl: 'toolbar'
    }
  },
};

Guido.config.basePath = window.location.origin + "/mobile";
Guido.config.modulePath = window.location.origin + "/assets/mobile";
Guido.config.templatePath = Guido.config.basePath + "/templates";
Guido.config.requestPath = window.location.origin + "/";
