# AI Shop Hub

An intelligent e-commerce platform that leverages AI to automatically generate product images when none are available, creating a seamless shopping experience with rich visual content for every product.

## Team Information

**Team:** AI-Samurai  
**Member:** Aravindan

## Hackathon Challenge

**Theme 2:** Building AI-powered applications that enhance user experience through intelligent automation and content generation.

## What We Built

AI Shop Hub is a full-stack e-commerce platform that intelligently generates product images using AI when original product images are missing or unavailable. The platform includes:

- **Smart Image Generation**: Automatically creates contextual product images based on product names and categories
- **Complete E-commerce Experience**: User authentication, product browsing, cart management, wishlist, and order processing
- **Intelligent Product Management**: CSV data import with automatic image enhancement
- **Modern User Interface**: Responsive design with dark/light theme support
- **RESTful API**: Well-documented backend with Swagger integration

## How to Run

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- AI image generation service API key

### Setup Instructions

1. **Clone the repository:**
```bash
git clone https://github.com/aravindsriraj/aishophub-mcp-hackathon.git
cd aishophub-mcp-hackathon
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
cp .env.example .env
# Configure your database URL and AI service credentials in .env
```

4. **Database Setup:**
```bash
npm run db:push
```

5. **Import Sample Data (Optional):**
```bash
npm run import-products
```

6. **Start Development Server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Deployment
```bash
npm run build
npm start
```

## Tech Stack

### Required Technologies
- **Frontend:** React, TypeScript, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Drizzle ORM
- **AI Integration:** Image generation APIs

### Additional Technologies
- **Build Tools:** Vite, ESBuild
- **UI Components:** Radix UI
- **State Management:** React Query
- **Routing:** Wouter
- **Documentation:** Swagger/OpenAPI
- **Authentication:** bcrypt for password hashing

## Demo Video

🎥 **[Demo Video Link - Coming Soon]**  
*A comprehensive walkthrough of AI Shop Hub's features and AI image generation capabilities*

## What We'd Do With More Time

Given additional development time, we would enhance AI Shop Hub with:

### Advanced AI Features
- **Multi-style Image Generation**: Allow users to choose different artistic styles for product images
- **Image Customization**: Enable real-time editing and refinement of generated images
- **Smart Product Descriptions**: AI-generated product descriptions based on images and specifications
- **Visual Search**: Allow users to search products using uploaded images

### Enhanced E-commerce Features
- **Advanced Recommendation Engine**: AI-powered product recommendations based on user behavior
- **Dynamic Pricing**: Intelligent pricing suggestions based on market analysis
- **Inventory Management**: Automated stock level monitoring and reorder suggestions
- **Multi-vendor Support**: Platform for multiple sellers with AI-assisted store management

### Technical Improvements
- **Performance Optimization**: Image caching, CDN integration, and database optimization
- **Mobile App**: React Native application for iOS and Android
- **Real-time Features**: Live chat support, real-time inventory updates
- **Analytics Dashboard**: Comprehensive business intelligence and user behavior analytics
- **Internationalization**: Multi-language and multi-currency support

### AI Integration Expansion
- **Computer Vision**: Automatic product categorization from uploaded images
- **Sentiment Analysis**: AI-powered review analysis and quality insights
- **Chatbot Integration**: Intelligent customer support with product recommendations
- **Fraud Detection**: AI-powered transaction monitoring and security

## Project Architecture

### Frontend Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   └── styles/        # Global styles
```

### Backend Structure
```
server/
├── routes.ts          # API endpoint definitions
├── db.ts             # Database configuration
├── image-generator.ts # AI image generation logic
├── import-products.ts # CSV data import utilities
└── swagger.ts        # API documentation
```

## API Endpoints

- `GET /api/products` - Retrieve products with AI-generated images
- `POST /api/products/:id/generate-image` - Generate image for specific product
- `POST /api/auth/login` - User authentication
- `GET /api/cart` - Cart management
- `POST /api/orders` - Order processing
- `GET /api-docs` - Interactive API documentation

## Contributing

This project was built for the MCP Hackathon. Future contributions welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ by Team AI-Samurai for the MCP Hackathon**