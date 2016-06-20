Guido.config = {
  basePath: '/',
  defaults: {
    module: 'drafts'
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