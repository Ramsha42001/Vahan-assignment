# Project Structure

## Key Directories and Files Explained

### Documentation/
- Contains project documentation files including this project structure document
- Helps maintain project documentation and guidelines

### public/
- Contains static assets that are served directly
- Place for favicon, images, and other public resources

### src/
- Main source code directory
- Contains all React components, styles, and application logic

### Configuration Files
- **vite.config.js**: Configuration for Vite build tool and development server
- **tailwind.config.js**: Customization settings for Tailwind CSS framework
- **postcss.config.js**: PostCSS configuration for CSS processing
- **eslint.config.js**: JavaScript/React code linting rules
- **package.json**: Project metadata and dependencies
- **index.html**: Main HTML entry point for the application

### DevOps Files
- **dockerfile**: Contains instructions for building Docker container
- **cloudbuild.yaml**: Configuration for Google Cloud Build CI/CD pipeline

## Development Setup

To set up the project locally:

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Build Process

To build the project for production:
```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Additional Notes

- The project uses Vite as the build tool for faster development experience
- Tailwind CSS is configured for styling
- ESLint is set up for code quality maintenance
- Docker support is available for containerization
- Google Cloud Build integration is configured for CI/CD
