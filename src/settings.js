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
    navigation: {
      render: true,
      target: '#navigation',
      tpl: 'navigation'
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
    },
    dialog: {
      render: false,
      target: 'body',
      tpl: 'dialog',
      mode: 'append'
    },
    footer: {
      render: false,
      target: 'footer.doc-switcher',
      tpl: 'footer',
      mode: 'replace'
    }
  },
};

Guido.config.basePath = window.location.origin + "/mobile";
Guido.config.modulePath = window.location.origin + "/assets/mobile";
Guido.config.templatePath = Guido.config.basePath + "/templates";
Guido.config.requestPath = window.location.origin + "/";
