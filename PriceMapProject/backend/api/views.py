'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.shortcuts import render
from rest_framework import viewsets, permissions, status, renderers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from .models import Location, PriceInfo, Comment, UserProfile, PriceValidation
from .serializers import LocationSerializer, PriceInfoSerializer, CommentSerializer, UserSerializer, UserProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
import json
import requests

# Create your views here.

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    This endpoint is used solely for setting the CSRF cookie.
    """
    return Response({"message": "CSRF cookie set"})

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check for ownership attribute on the object
        for attr in ['created_by', 'reported_by', 'user']:
            if hasattr(obj, attr):
                return getattr(obj, attr) == request.user
        return False

class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing location data
    Provides CRUD operations and custom actions for prices and comments
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_context(self):
        """
        Pass request to serializer context for current user access
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        """
        Override create to automatically add address from coordinates and set the creator
        """
        data = self.request.data
        address = data.get('address')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not address and latitude and longitude:
            # Get address from coordinates using geocoding
            address = self.get_address_from_coordinates(latitude, longitude)
        
        serializer.save(created_by=self.request.user, address=address)
    
    def get_address_from_coordinates(self, latitude, longitude):
        """
        Uses OpenStreetMap's Nominatim API for reverse geocoding
        
        Args:
            latitude (float): Location latitude
            longitude (float): Location longitude
            
        Returns:
            str: Human-readable address or None if geocoding fails
        """
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1"
            headers = {'User-Agent': 'PriceMapApp/1.0'}  # Required by Nominatim
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if 'display_name' in result:
                    return result['display_name']
            return None
        except Exception as e:
            print(f"Error getting address from coordinates: {str(e)}")
            return None
    
    @action(detail=False, methods=['post'])
    def get_address(self, request):
        """
        Endpoint to get an address from latitude and longitude coordinates
        Used by the frontend map interface when selecting locations
        """
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if not latitude or not longitude:
            return Response(
                {'error': 'Latitude and longitude are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        address = self.get_address_from_coordinates(latitude, longitude)
        
        if address:
            return Response({'address': address})
        else:
            return Response(
                {'error': 'Could not determine address from the provided coordinates'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
    @action(detail=True, methods=['post'])
    def add_price(self, request, pk=None):
        """
        Add a new price for a product at this location
        
        If a price for this product already exists, it will be replaced
        per the price update policy (newer prices replace older ones)
        """
        location = self.get_object()
        serializer = PriceInfoSerializer(data=request.data)
        
        if serializer.is_valid():
            product_name = serializer.validated_data['product_name']
            
            # Delete existing prices for this product at this location
            old_prices = PriceInfo.objects.filter(
                location=location, 
                product_name=product_name
            )
            
            if old_prices.exists():
                print(f"Replacing {old_prices.count()} existing price(s) for '{product_name}' at {location.name}")
                old_prices.delete()
            
            # Save the new price
            new_price = serializer.save(location=location, reported_by=request.user)
            print(f"Added new price for '{product_name}': €{new_price.price} at {location.name}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """
        Add a comment with rating to a location
        
        Rating is validated to ensure it's between 1-5 stars
        """
        location = self.get_object()
        
        # Validate and normalize rating
        rating = request.data.get('rating', 1)
        try:
            rating = max(1, min(int(rating), 5))  # Ensure rating between 1-5
        except (ValueError, TypeError):
            rating = 1
            
        comment_data = {
            'text': request.data.get('text', ''),
            'rating': rating
        }
        
        serializer = CommentSerializer(data=comment_data)
        if serializer.is_valid():
            serializer.save(location=location, user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class PriceInfoViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing price information
    """
    queryset = PriceInfo.objects.all()
    serializer_class = PriceInfoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_context(self):
        """
        Pass request to serializer context for current user access
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """
        Add or update a price validation
        
        Implements the community validation system where users can mark
        prices as accurate or inaccurate, helping ensure data quality
        """
        price = self.get_object()
        validation_type = request.data.get('validation_type')
        
        if validation_type not in [PriceValidation.ACCURATE, PriceValidation.INACCURATE]:
            return Response(
                {'error': 'Invalid validation type. Must be "accurate" or "inaccurate"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or update the validation
        validation, created = PriceValidation.objects.update_or_create(
            price=price,
            user=request.user,
            defaults={'validation_type': validation_type}
        )
        
        # Get updated price data with new validation counts
        serializer = self.get_serializer(price)
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing location comments
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    """
    API endpoint for user registration
    Creates both user account and profile with token authentication
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Handle user registration with validation
        
        Returns authentication token for immediate login
        """
        try:
            # Extract registration data
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            
            # Basic validation
            errors = {}
            if not username:
                errors['username'] = ['Username is required']
            if not password:
                errors['password'] = ['Password is required']
            
            # Check for existing username
            if User.objects.filter(username=username).exists():
                errors['username'] = ['Username already exists']
            
            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user and profile
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
                
            token, _ = Token.objects.get_or_create(user=user)
            
            # Create user profile
            UserProfile.objects.create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    """
    API endpoint for user login
    Handles authentication and returns tokens
    """
    permission_classes = [permissions.AllowAny]
    renderer_classes = [renderers.JSONRenderer]  # Force JSON responses only

    def post(self, request):
        """
        Handle user login with multiple request format support
        """
        try:
            # Extract login data with flexible request format handling
            data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return Response(
                    {'error': 'Username and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if not user:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get or create auth token
            token, _ = Token.objects.get_or_create(user=user)
            
            # Get or create user profile
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            # Return user data and token
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff
                }
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(APIView):
    """
    API endpoint for user profile management
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        """
        Get the authenticated user's profile
        """
        user = request.user
        serializer = UserSerializer(user)
        
        # Get additional profile fields
        profile = UserProfile.objects.get(user=user)
        profile_serializer = UserProfileSerializer(profile)
        
        # Combine profile and user data
        data = serializer.data
        data.update(profile_serializer.data)
        
        return Response(data)
        
    def put(self, request):
        """
        Update the authenticated user's profile
        Handles both User model fields and UserProfile fields
        """
        user = request.user
        profile = UserProfile.objects.get(user=user)
        
        # Update User model fields
        user_data = {}
        for field in ['first_name', 'last_name', 'email']:
            if field in request.data:
                user_data[field] = request.data[field]
                
        if user_data:
            user_serializer = UserSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update profile fields
        profile_data = {}
        for field in ['bio', 'avatar']:
            if field in request.data:
                profile_data[field] = request.data[field]
                
        if profile_data:
            profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return the updated data
        combined_serializer = UserSerializer(user)
        profile_serializer = UserProfileSerializer(profile)
        
        data = combined_serializer.data
        data.update(profile_serializer.data)
        
        return Response(data)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for admin user management
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        """
        Limit users list to non-superusers for safety
        """
        # Exclude superusers from the list for safety
        return User.objects.filter(is_superuser=False)
    
    def destroy(self, request, *args, **kwargs):
        """
        Safely delete users, preventing self-deletion
        """
        user = self.get_object()
        
        # Prevent admins from deleting themselves
        if user == request.user:
            return Response(
                {'error': 'You cannot delete your own account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def toggle_admin(self, request, pk=None):
        """
        Toggle staff status for a user
        """
        user = self.get_object()
        
        # Prevent toggling your own admin status
        if user == request.user:
            return Response(
                {'error': 'You cannot change your own admin status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Toggle is_staff
        user.is_staff = not user.is_staff
        user.save()
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
