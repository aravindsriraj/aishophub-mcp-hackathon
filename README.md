# AI Shopping Hub

An AI-powered shopping hub that can search products using semantic search. Operations like adding to cart, adding to wishlist, checkout, list previous orders and various other operations can be performed using the APIs (read openapi.yaml to know more). All these APIs have been deployed as MCP server using Cequence AI gateway.

## Team Information

**Team:** AI-Samurai  
**Member:** Aravindan

## Hackathon Challenge

**Theme 2:** Build a Secure MCP Server for Agents (w/ Cequence)

## What We Built

AI Shopping Hub is a comprehensive e-commerce platform with all API endpoints exposed as an MCP (Model Context Protocol) server. Users can shop through the website performing AI-powered semantic search, adding to cart, adding to wishlist, checkout, completing orders - all operations detailed in the OpenAPI specification. Users can access these capabilities through any MCP client like Claude Desktop, Cursor, etc.

**🌐 Live Demo**: The website has been deployed on Replit and is accessible at [https://aishophub.replit.app](https://aishophub.replit.app)

**🔍 Semantic Search Service**: The AI-powered semantic search is implemented as a separate Python FastAPI application, deployed on Replit at [https://product-search.replit.app/docs](https://product-search.replit.app/docs). The semantic search codebase is available at [https://github.com/aravindsriraj/aishophub-semantic-search-fastapi](https://github.com/aravindsriraj/aishophub-semantic-search-fastapi)

### Key Features:
- **AI-Powered Semantic Search**: Natural language product search capabilities powered by dedicated FastAPI service
- **MCP Server Integration**: All APIs accessible through Model Context Protocol
- **Secure API Gateway**: Deployed using Cequence AI gateway for enhanced security
- **Cloud Deployment**: Fully deployed and accessible on Replit platform
- **Microservices Architecture**: Separate semantic search service for enhanced performance

## How to Use with Claude Desktop

1. **Login to the platform**: Visit [aishophub.replit.app](https://aishophub.replit.app)
2. **Navigate to Settings**: Go to the settings page in your account
3. **Generate API Token**: Create a new API token for MCP access
4. **Configure Claude Desktop**: Add the MCP server configuration to your `claude_desktop_config.json`
5. **Add MCP Server Configuration**:

```json
"mcp-server-bearer": {
  "command": "npx",
  "args": [
    "mcp-remote",
    "https://ztaip-cuk221kt-4xp4r634bq-uc.a.run.app/mcp",
    "--header",
    "Authorization: Bearer <YOUR_API_TOKEN>",
    "--transport",
    "http-only"
  ]
}
```

6. **Restart Claude Desktop**: Restart the application to load the new MCP server

## Tech Stack

### Required Technologies
- **MCP (Model Context Protocol)**: Server implementation for agent interactions
- **Cequence AI Gateway**: Secure API gateway for MCP server deployment

### Frontend Technologies
- **React**: Modern UI library with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library for smooth interactions

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **PostgreSQL**: Relational database
- **Drizzle ORM**: TypeScript ORM for database operations
- **bcrypt**: Password hashing and authentication
- **express-session**: Session management middleware
- **Swagger/OpenAPI**: API documentation and specification

### AI & Search Technologies
- **FastAPI Semantic Search Service**: Dedicated Python-based microservice for AI-powered product search
- **OpenAI API**: AI-powered semantic search capabilities
- **Python FastAPI**: High-performance API framework for semantic search service

### Development & Build Tools
- **ESBuild**: Fast JavaScript bundler
- **tsx**: TypeScript execution engine
- **drizzle-kit**: Database migration and schema management
- **Swagger UI Express**: Interactive API documentation

### Additional Libraries
- **Stripe**: Payment processing integration
- **csv-parse**: CSV data import functionality
- **zod**: Schema validation
- **date-fns**: Date manipulation utilities
- **jsPDF**: PDF generation for invoices

## Demo Video

🎥 **[Demo Video Link - Coming Soon]**  
*A comprehensive walkthrough of AI Shopping Hub's MCP server capabilities and semantic search features*

## What We'd Do With More Time

Given additional development time, we would enhance AI Shopping Hub with:

### Advanced MCP Server Features
- **Multi-Agent Collaboration**: Support for multiple AI agents working together on shopping tasks
- **Persistent Shopping Sessions**: Long-term memory for AI agents across multiple interactions
- **Advanced Tool Capabilities**: More sophisticated MCP tools for complex shopping workflows


### Enhanced AI Capabilities
- **Conversational Shopping Assistant**: Natural language shopping conversations with context awareness
- **Visual Product Search**: AI-powered image-based product discovery
- **Personalized Recommendations**: Machine learning-based product suggestions


### E-commerce Platform Enhancements
- **Advanced Search Filters**: More granular product filtering and sorting


## MCP Server Architecture

The AI Shopping Hub is deployed as a secure MCP (Model Context Protocol) server, enabling AI agents and clients to interact with e-commerce functionality through standardized protocols.

### System Architecture
- **Main Application**: Node.js/Express e-commerce platform (deployed on Replit)
- **Semantic Search Service**: Python FastAPI microservice for AI-powered search
  - **API Documentation**: [https://product-search.replit.app/docs](https://product-search.replit.app/docs)
  - **Source Code**: [https://github.com/aravindsriraj/aishophub-semantic-search-fastapi](https://github.com/aravindsriraj/aishophub-semantic-search-fastapi)
- **MCP Gateway**: Cequence AI gateway for secure API access

### MCP Integration Features
- **Standardized Tool Interface**: All shopping operations exposed as MCP tools
- **Secure Authentication**: Bearer token-based access control
- **Real-time Responses**: Immediate feedback for all shopping operations
- **Error Handling**: Comprehensive error responses for better agent experience

### Available MCP Tools
- **Product Search**: Semantic and traditional product discovery
- **Cart Management**: Add, remove, and update cart items
- **Wishlist Operations**: Manage user wishlists
- **Order Processing**: Complete checkout and order management
- **User Authentication**: Secure login and token management

## API Documentation

Full API documentation is available in the [OpenAPI specification](./openapi.yaml) which includes:

- **Authentication Endpoints**: User login, registration, and token management
- **Product Catalog**: Search, filtering, and product details
- **Shopping Cart**: Cart operations and management
- **Wishlist**: Wishlist functionality
- **Order Management**: Checkout and order history
- **Semantic Search**: AI-powered natural language product search

**Built with ❤️ by Team AI-Samurai for the MCP Hackathon**