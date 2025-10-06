# Docker Compose Commands

## Production Build and Run
```bash
# Build and start the production container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f virtualsnap-app

# Stop containers
docker-compose down
```

## Development Build and Run
```bash
# Start development environment with hot reloading
docker-compose --profile development up --build

# Or specifically target the dev service
docker-compose up --build virtualsnap-dev
```

## Production with Traefik (Reverse Proxy)
```bash
# Start with Traefik reverse proxy
docker-compose --profile production up -d

# Access Traefik dashboard at http://localhost:8088
```

## Environment Setup
1. Copy `.env.example` to `.env`
2. Add your Gemini API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Build Optimizations Included

### Multi-stage Build
- **Builder stage**: Installs dependencies and builds the application
- **Production stage**: Uses lightweight nginx:alpine image with only built assets

### Layer Caching
- Package files copied first for better Docker layer caching
- Dependencies installed before copying source code

### Security Features
- Non-root user execution
- Security headers in nginx configuration
- Resource limits in docker-compose

### Performance Optimizations
- Gzip compression enabled
- Static asset caching with long expiry
- Nginx optimized for serving static files
- Health checks for container monitoring

### Size Optimization
- `.dockerignore` file excludes unnecessary files
- Multi-stage build reduces final image size
- Alpine Linux base images for smaller footprint

## Accessing the Application
- **Production**: http://localhost:8080
- **Development**: http://localhost:3000
- **Traefik Dashboard**: http://localhost:8088 (when using production profile)

## Monitoring
- Health checks configured for both services
- Resource limits set to prevent container resource exhaustion
- Proper logging configuration for debugging