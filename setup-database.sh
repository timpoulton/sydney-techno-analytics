#!/bin/bash

echo "🚀 PostgreSQL Setup Script for Sydney Techno Analytics"
echo "======================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Option 1: Install PostgreSQL locally (if you have sudo access)
install_postgresql_local() {
    echo -e "${YELLOW}Installing PostgreSQL locally...${NC}"
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo service postgresql start

    # Create database and user
    sudo -u postgres psql << EOF
CREATE USER technouser WITH PASSWORD 'technopass123';
CREATE DATABASE techno_analytics OWNER technouser;
GRANT ALL PRIVILEGES ON DATABASE techno_analytics TO technouser;
EOF

    echo -e "${GREEN}✓ PostgreSQL installed and configured locally${NC}"
    echo "Connection string: postgresql://technouser:technopass123@localhost:5432/techno_analytics"
}

# Option 2: Use Docker (recommended if Docker is available)
setup_postgresql_docker() {
    echo -e "${YELLOW}Setting up PostgreSQL with Docker...${NC}"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        return 1
    fi

    # Run PostgreSQL container
    docker run -d \
        --name techno-postgres \
        -e POSTGRES_USER=technouser \
        -e POSTGRES_PASSWORD=technopass123 \
        -e POSTGRES_DB=techno_analytics \
        -p 5432:5432 \
        postgres:15

    echo -e "${GREEN}✓ PostgreSQL Docker container started${NC}"
    echo "Connection string: postgresql://technouser:technopass123@localhost:5432/techno_analytics"
}

# Option 3: Use SQLite for development (no installation needed)
setup_sqlite_fallback() {
    echo -e "${YELLOW}Setting up SQLite as a fallback option...${NC}"

    # Update .env.local for SQLite
    cat > .env.local << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-with-openssl-rand-base64-32"
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@technoanalytics.com"
STORAGE_PATH="./storage/uploads"
EOF

    # Update Prisma schema for SQLite
    sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

    echo -e "${GREEN}✓ SQLite configured as database${NC}"
    echo "Note: Some features may be limited with SQLite"
}

# Option 4: Use a free cloud PostgreSQL service
setup_cloud_postgresql() {
    echo -e "${YELLOW}Free Cloud PostgreSQL Options:${NC}"
    echo ""
    echo "1. Supabase (https://supabase.com)"
    echo "   - Sign up for free account"
    echo "   - Create new project"
    echo "   - Get connection string from Settings > Database"
    echo ""
    echo "2. Neon (https://neon.tech)"
    echo "   - Sign up for free account"
    echo "   - Create database"
    echo "   - Copy connection string"
    echo ""
    echo "3. Aiven (https://aiven.io)"
    echo "   - Free trial available"
    echo "   - Create PostgreSQL service"
    echo ""
    echo "Once you have a connection string, update .env.local with:"
    echo "DATABASE_URL=\"your-connection-string-here\""
}

# Main menu
echo ""
echo "Choose your PostgreSQL setup option:"
echo "1) Install PostgreSQL locally (requires sudo)"
echo "2) Use Docker container (recommended)"
echo "3) Use SQLite for development (easiest)"
echo "4) Use cloud PostgreSQL service (free tier)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        install_postgresql_local
        ;;
    2)
        setup_postgresql_docker
        ;;
    3)
        setup_sqlite_fallback
        ;;
    4)
        setup_cloud_postgresql
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "Next steps:"
echo "1. Update .env.local with your database connection string"
echo "2. Run: npx prisma migrate dev --name init"
echo "3. Run: npm run dev"