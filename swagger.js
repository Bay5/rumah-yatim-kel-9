// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dokumentasi API Rumah Yatim',
      version: '1.0.0',
      description: 'Dokumentasi API untuk sistem informasi Rumah Yatim.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js', './cacheRoutes/*.js'], // semua file di folder routes akan dibaca untuk komentar Swagger
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
