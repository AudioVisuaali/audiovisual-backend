const app = require('./app');

const port = process.env.PORT || 3001;

const application = new app(port);
application.start();
