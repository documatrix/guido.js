Guido.config = {
  basePath: '/',
  defaults: {
    module: 'drafts',
    fallback: '_default_view'
  },
  content: {
    target: '#content',
  },
  components: {
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