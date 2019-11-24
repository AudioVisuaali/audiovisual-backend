const dotenv = require('dotenv');
const app = require('./app');

// Set environment

const isProduction = process.env.NODE_ENV === 'production';
const environment = isProduction ? 'production' : 'default';

const { error } = dotenv.config({ path: `environment.${environment}.env` });
if (error) throw error;

// Config app

const port = process.env.PORT || 3000;

const application = new app(port);
application.start();
