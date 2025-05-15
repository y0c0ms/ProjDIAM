# PriceMap Project

A collaborative platform for users to share and compare product prices at different locations.

## Overview

PriceMap allows users to find the best prices for products in their area. Users can:
- View price data for various products across different locations
- Add new locations to the map
- Add price information for products at specific locations
- Validate price accuracy or flag outdated prices
- Leave comments and ratings for locations

## Features

### For All Users
- Browse the map to see all registered locations
- View price information for products at each location
- View comments and ratings for locations

### For Registered Users
- Add new locations to the map
- Report prices for products at specific locations
- Validate or invalidate prices (mark as accurate or outdated)
- Add comments and ratings to locations
- Update personal profile information

### For Administrators
- Manage users (activate/deactivate accounts, grant admin privileges)
- Manage all content (locations, prices, comments)

## Recent Updates

- **Price Updates**: When adding a new price for a product at a location, any older price for the same product is automatically removed, ensuring only the most recent price is displayed.
- **Price Validation**: Users can mark prices as accurate or inaccurate. Prices marked as inaccurate will display an "Outdated" indicator.
- **Rating Summary**: Locations now display the average star rating and the total number of reviews to help users quickly assess location quality.
- **Improved Dark Mode**: The application now fully supports dark mode with improved form styling across all pages.

## Project Structure

The project is divided into two main parts:

### Backend (Django REST API)
- Built with Django and Django REST Framework
- Provides API endpoints for all functionality
- Handles data storage and business logic

### Frontend (React)
- Built with React
- Uses Leaflet for interactive maps
- Responsive design for both desktop and mobile users

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd PriceMapProject/backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser (for admin access):
   ```
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

The backend API will be available at http://localhost:8000/api/

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd PriceMapProject/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend application will be available at http://localhost:3000/

## API Documentation

### Authentication
- POST `/api/register/` - User registration
- POST `/api/login/` - User login
- GET `/api/profile/` - Get user profile
- PUT `/api/profile/` - Update user profile

### Locations
- GET `/api/locations/` - List all locations
- POST `/api/locations/` - Create a new location
- GET `/api/locations/{id}/` - Get location details
- POST `/api/locations/{id}/add_price/` - Add a price to a location
- POST `/api/locations/{id}/add_comment/` - Add a comment to a location

### Prices
- POST `/api/prices/{id}/validate/` - Validate a price (mark as accurate or inaccurate)

## Using the Price Validation Feature

1. When viewing a location's details, each product price displays validation buttons (✓ and ✗)
2. Click ✓ to mark a price as accurate, increasing its accurate count
3. Click ✗ to mark a price as inaccurate, increasing its inaccurate count
4. When a price has more ✗ than ✓, it's marked as "Outdated"
5. Submitting a new price for a product automatically removes any older prices for that product

## License

MIT License

## Contributors

- [Your Name] 