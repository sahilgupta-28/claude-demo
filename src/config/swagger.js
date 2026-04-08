// OpenAPI 3.0 specification. Annotations live in each *.routes.js file.
// Components (schemas, securitySchemes) are declared here to be $ref'd everywhere.

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Demo API',
      version:     '1.0.0',
      description: 'User Registration API',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Success' },
            data:    { type: 'object',  nullable: true },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code:    { type: 'string',  example: 'VALIDATION_ERROR' },
            message: { type: 'string',  example: 'email must be a valid email address' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            name:      { type: 'string',  example: 'John Doe' },
            email:     { type: 'string',  format: 'email', example: 'john.doe@example.com' },
            phone:     { type: 'string',  example: '1234567890' },
            address:   { type: 'string',  nullable: true, example: '123 Main St, Anytown, USA' },
            role:      { type: 'string',  enum: ['user', 'admin'] },
            isActive:  { type: 'boolean', example: true },
            createdAt: { type: 'string',  format: 'date-time' },
            updatedAt: { type: 'string',  format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec };
