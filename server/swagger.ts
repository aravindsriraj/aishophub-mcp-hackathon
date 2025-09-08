import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for the e-commerce platform with authentication and shopping features',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'https://aishophub.replit.app',
        description: 'AI Shop Hub Production Server'
      },
      {
        url: 'https://0c266820-54a5-4fae-91bf-588b13fb49c7-00-2xj80jb8edwel.worf.replit.dev',
        description: 'Development Server (Replit)'
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the API token generated from Settings page (starts with ak_)'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productName: { type: 'string' },
            category: { type: 'string' },
            discountedPrice: { type: 'string' },
            actualPrice: { type: 'string' },
            discountPercentage: { type: 'string' },
            rating: { type: 'string' },
            ratingCount: { type: 'string' },
            aboutProduct: { type: 'string' },
            imgLink: { type: 'string' },
            productLink: { type: 'string' }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            productId: { type: 'string' },
            quantity: { type: 'number' },
            product: { $ref: '#/components/schemas/Product' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            totalAmount: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  productName: { type: 'string' },
                  price: { type: 'string' },
                  quantity: { type: 'number' },
                  totalPrice: { type: 'string' }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Products',
        description: 'Product catalog operations'
      },
      {
        name: 'Cart',
        description: 'Shopping cart management'
      },
      {
        name: 'Wishlist',
        description: 'Wishlist management'
      },
      {
        name: 'Orders',
        description: 'Order management'
      },
      {
        name: 'Categories',
        description: 'Product categories'
      }
    ]
  },
  apis: ['./server/routes.ts', './server/swagger-docs.ts']
};

export const swaggerSpec = swaggerJsdoc(options);