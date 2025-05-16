# PriceMap: Collaborative Price Comparison Platform

A web-based platform that allows users to share, compare, and find the best prices for products across different locations.

## Table of Contents

1. [About the Project](#about-the-project)
2. [Features](#features)
3. [How to Run the Project](#how-to-run-the-project)
4. [Project Structure](#project-structure)
5. [API Documentation](#api-documentation)
6. [Recent Updates](#recent-updates)
7. [Team Information](#team-information)
8. [License](#license)

## About the Project

PriceMap is an interactive web application that enables users to discover and share price information for various products at different locations. Using a map-based interface, users can easily find the best deals in their area and contribute to a community-driven database of price information.

The platform aims to help consumers make informed purchasing decisions while building a collaborative ecosystem where price transparency benefits everyone.

## Features

### For All Users (Non-registered)
- Interactive map showing all registered locations
- View price information for products at different locations
- Filter locations by type or region
- Browse comments and ratings for locations
- Register for an account to access additional features

### For Registered Users
- Add new locations to the map by selecting a position
- Report prices for products at specific locations
- Validate or flag prices as outdated
- Add comments and ratings to locations
- Update personal profile information
- Create favorite lists for products and locations
- Receive notifications about price changes of interest
- Send messages to other users
- Participate in discussion forums by product category
- Follow other users and receive updates

### For Administrators
- Validate and moderate user-submitted content
- Manage users (activate/deactivate accounts, grant admin privileges)
- Access statistics and usage reports
- Manage product categories and location types
- Moderate forums and messages

## How to Run the Project

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd PriceMapProject/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   
   # On Windows:
   env\Scripts\activate
   
   # On macOS/Linux:
   source env/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create an admin user:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the Django server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at http://localhost:8000/api/

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd PriceMapProject/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend application will be available at http://localhost:3000/

## Project Structure

The project consists of two main components:

### Backend (Django REST API)
- Built with Django and Django REST Framework
- Provides API endpoints for all functionality
- Handles data storage and business logic
- Located in `/PriceMapProject/backend/`

### Frontend (React)
- Built with React.js
- Uses Leaflet for interactive maps
- Responsive design for both desktop and mobile users
- Located in `/PriceMapProject/frontend/`

## API Documentation

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token-login/` - User login
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Locations
- `GET /api/locations/` - List all locations
- `POST /api/locations/` - Create a new location
- `GET /api/locations/{id}/` - Get location details
- `POST /api/locations/get_address/` - Get address from coordinates

### Prices
- `GET /api/prices/` - List prices (filterable by location)
- `POST /api/prices/` - Create a new price entry
- `POST /api/prices/{id}/validate/` - Validate a price (mark as accurate or inaccurate)

### Comments
- `POST /api/comments/` - Create a new comment for a location
- `GET /api/comments/{id}/` - Get comment details

## Recent Updates

- **Price Updates**: When adding a new price for a product at a location, any older price for the same product is marked as outdated.
- **Price Validation**: Users can mark prices as accurate or inaccurate, helping maintain data quality.
- **Rating Summary**: Locations now display the average star rating and total number of reviews.
- **Improved UI**: Enhanced responsive design with better mobile support.
- **Map Enhancements**: Improved map controls with animated scroll indicators.
- **Dark Theme Support**: The application now fully supports dark mode for better user experience.

## Team Information

This project was developed as part of the DIAM course by:
- [Manuel Santos]
- [Alexandre Mendes]
- [Vlad Ganta]

## License

[MIT License](LICENSE) 