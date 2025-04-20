const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rumah Yatim API Documentation',
      version: '1.0.0',
      description: 'API documentation for Rumah Yatim Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            name: {
              type: 'string',
              description: 'Full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Password'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        RumahYatim: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Orphanage ID'
            },
            nama_panti: {
              type: 'string',
              description: 'Orphanage name'
            },
            nama_kota: {
              type: 'string',
              description: 'City name'
            },
            nama_pengurus: {
              type: 'string',
              description: 'Manager name'
            },
            alamat: {
              type: 'string',
              description: 'Address'
            },
            foto: {
              type: 'string',
              description: 'Photo URL'
            },
            deskripsi: {
              type: 'string',
              description: 'Description'
            },
            jumlah_anak: {
              type: 'integer',
              description: 'Number of children'
            },
            kapasitas: {
              type: 'integer',
              description: 'Capacity'
            },
            kontak: {
              type: 'string',
              description: 'Contact information'
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Latitude coordinate'
            },
            longtitude: {
              type: 'number',
              format: 'float',
              description: 'Longitude coordinate'
            }
          }
        },
        Donation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Donation ID'
            },
            user_id: {
              type: 'integer',
              description: 'Donor user ID'
            },
            rumah_yatim_id: {
              type: 'integer',
              description: 'Recipient orphanage ID'
            },
            amount: {
              type: 'number',
              description: 'Donation amount'
            },
            payment_method: {
              type: 'string',
              description: 'Payment method'
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Completed', 'Failed'],
              description: 'Transaction status'
            },
            transaction_id: {
              type: 'string',
              description: 'Transaction ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Bookmark: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Bookmark ID'
            },
            user_id: {
              type: 'integer',
              description: 'User ID'
            },
            rumah_yatim_id: {
              type: 'integer',
              description: 'Orphanage ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Doa: {
          type: 'object',
          properties: {
            id_doa: {
              type: 'integer',
              description: 'Prayer ID'
            },
            nama_doa: {
              type: 'string',
              description: 'Prayer name'
            },
            isi_doa: {
              type: 'string',
              description: 'Prayer content in Arabic'
            },
            latin: {
              type: 'string',
              description: 'Latin transliteration'
            },
            arti: {
              type: 'string',
              description: 'Translation'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './cacheRoutes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 