# Project Structure

## Directory Layout
```server/
├── Documentation/     # Project documentation
├── storage/          # Database Storage related files
├── utils/           # Utility functions
├── services/        # Business logic services
├── schema/          # Data validation schemas
├── models/          # Database models
├── routes/          # API route definitions
├── middlewares/     # Custom middleware functions
├── logs/           # Application logs
├── details/        # Additional details about firestore and gcp credentials
└── main.py         # Application entry point
```

## Key Components
- **main.py**: Entry point of the application
- **routes/**: Contains all API route definitions
- **models/**: Database models and schemas
- **services/**: Business logic implementation
- **middlewares/**: Custom middleware functions
- **utils/**: Helper functions and utilities 
- **details/**: Details folder which is not being pushed on github since it consist of sensitive data like JSON key file for GCP service