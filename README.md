# AI Shop Hub - MCP Hackathon

An AI-powered e-commerce platform that automatically generates product images using AI when no product images are available. Built for the MCP (Model Context Protocol) Hackathon.

## 🌟 Features

- **AI-Generated Product Images**: Automatically generates product images using AI when no image is available
- **E-commerce Platform**: Full-featured shopping experience with cart, wishlist, and order management
- **User Authentication**: Secure login and registration system
- **Product Management**: Browse products imported from CSV data
- **Responsive Design**: Modern UI built with React and TailwindCSS
- **Database Integration**: PostgreSQL with Drizzle ORM

## 🚀 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Radix UI** for components
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **AI Image Generation** for product images
- **Swagger** for API documentation

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/aravindsriraj/aishophub-mcp-hackathon.git
cd aishophub-mcp-hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and AI service keys
```

4. Set up the database:
```bash
npm run db:push
```

5. Import sample products (optional):
```bash
npm run import-products
```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```
This starts both the frontend and backend in development mode.

### Production
```bash
npm run build
npm start
```

## 🎯 Key Features Explained

### AI Image Generation
When a product doesn't have an image, the system automatically:
1. Generates a descriptive prompt based on the product name and category
2. Creates an AI-generated product image
3. Stores the image locally and updates the database
4. Serves the generated image to users

### Product Data Import
The system can import products from CSV files with fields like:
- Product Name
- Category
- Pricing information
- Ratings
- Product descriptions

### User Management
- Secure authentication with bcrypt
- User profiles and settings
- Order history tracking
- Wishlist functionality

## 📁 Project Structure

```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared TypeScript schemas
├── attached_assets/ # Static files and generated images
└── docs/           # API documentation
```

## 🌐 API Endpoints

The API provides endpoints for:
- User authentication (`/api/auth/*`)
- Product management (`/api/products/*`)
- Cart operations (`/api/cart/*`)
- Order processing (`/api/orders/*`)
- Image generation (`/api/images/*`)

Full API documentation is available at `/api-docs` when running the server.

## 🤝 Contributing

This project was built for the MCP Hackathon. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Project

This project was created for the MCP (Model Context Protocol) Hackathon, demonstrating innovative use of AI for e-commerce applications.