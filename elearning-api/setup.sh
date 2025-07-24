#!/bin/bash

# Jordan eLearning API Setup Script
echo "🎓 Setting up Jordan eLearning API Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher."
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis v6 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding!"
else
    echo "✅ Environment file already exists"
fi

# Create logs directory
mkdir -p logs
echo "📁 Created logs directory"

# Create uploads directory
mkdir -p uploads
echo "📁 Created uploads directory"

# Check if database exists
echo "🗄️  Checking database connection..."
DB_NAME=${DB_NAME:-jordan_elearning}

# Create database if it doesn't exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "🔧 Creating database: $DB_NAME"
    createdb $DB_NAME
else
    echo "✅ Database $DB_NAME already exists"
fi

echo "🚀 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run migrate' to set up database tables"
echo "3. Run 'npm run seed' to add sample data (optional)"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 Documentation: http://localhost:3000/api-docs"
echo "🏥 Health Check: http://localhost:3000/health"
echo ""
echo "Happy coding! 🎉"