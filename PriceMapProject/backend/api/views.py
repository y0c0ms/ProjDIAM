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

# Admin permission class
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
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'reported_by'):
            return obj.reported_by == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        return False

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Removed IsOwnerOrReadOnly to allow any logged-in user to add prices/comments
    
    def get_serializer_context(self):
        """
        Pass request to serializer context so we can get the current user
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        # Try to get address from coordinates if not provided
        data = self.request.data
        address = data.get('address')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not address and latitude and longitude:
            # Try to get address from coordinates using OpenStreetMap Nominatim API
            address = self.get_address_from_coordinates(latitude, longitude)
        
        serializer.save(created_by=self.request.user, address=address)
    
    def get_address_from_coordinates(self, latitude, longitude):
        """
        Uses OpenStreetMap's Nominatim API to get an address from coordinates
        """
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1"
            headers = {
                'User-Agent': 'PriceMapApp/1.0'  # Nominatim requires a user agent
            }
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
        Endpoint to get an address from latitude and longitude
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
        location = self.get_object()
        serializer = PriceInfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(location=location, reported_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        location = self.get_object()
        
        # Get rating from request data with a default of 1
        rating = request.data.get('rating', 1)
        try:
            # Ensure rating is an integer between 1 and 5
            rating = int(rating)
            if rating < 1 or rating > 5:
                rating = 1
        except (ValueError, TypeError):
            rating = 1
            
        # Create comment data with text and rating
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
    queryset = PriceInfo.objects.all()
    serializer_class = PriceInfoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_context(self):
        """
        Pass request to serializer context so we can get the current user
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """
        Add or update a validation for a price
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
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Décorateur para tornar todas as funções isentas de CSRF
@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(f"Registration request received: {request.data}")
        print(f"Headers: {request.headers}")
        
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            
            print(f"Parsed data - username: {username}, email: {email}, first_name: {first_name}, last_name: {last_name}")
            
            # Validate required fields
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
            
            # Create user
            try:    
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                    
                token, created = Token.objects.get_or_create(user=user)
                
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
            except Exception as create_error:
                print(f"Error creating user: {str(create_error)}")
                return Response({'error': str(create_error)}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    renderer_classes = [renderers.JSONRenderer]  # Force JSON responses only

    def post(self, request):
        print(f"Login request received: {request.data}")
        print(f"Login Headers: {request.headers}")
        print(f"Content-Type: {request.content_type}")
        
        try:
            # Ensure we're getting data from the request properly
            if hasattr(request, 'data'):
                data = request.data
            else:
                # Fallback for when DRF doesn't parse the data correctly
                data = json.loads(request.body.decode('utf-8'))
                
            username = data.get('username')
            password = data.get('password')
            
            print(f"Login attempt for username: {username}")
            
            if not username or not password:
                print(f"Missing username or password in request")
                return Response(
                    {'error': 'Username and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = authenticate(username=username, password=password)
            
            if not user:
                print(f"Authentication failed for username: {username}")
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            print(f"Authentication successful for username: {username}")
            token, created = Token.objects.get_or_create(user=user)
            print(f"Token for {username}: {token.key}")
            
            # Get or create profile if it doesn't exist
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            }
            
            print(f"Returning user data and token to client")
            response_data = {
                'token': token.key,
                'user': user_data
            }
            print(f"Response data: {response_data}")
            return Response(response_data)
            
        except Exception as e:
            print(f"Login error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        
        # Update user data
        user_data = {
            'first_name': request.data.get('first_name', user.first_name),
            'last_name': request.data.get('last_name', user.last_name),
            'email': request.data.get('email', user.email)
        }
        
        user_serializer = UserSerializer(user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
            
            # Get or create user profile
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Update profile data
            profile_data = {
                'bio': request.data.get('bio', profile.bio),
                'phone': request.data.get('phone', profile.phone)
            }
            
            # Handle profile image upload
            if 'profile_image' in request.FILES:
                profile_data['profile_image'] = request.FILES['profile_image']
            
            profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()
                
                # Return combined user and profile data
                return Response(UserSerializer(user).data)
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User management viewset for admins
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        # Filter out superusers from the list to prevent accidental deletion
        return User.objects.filter(is_superuser=False)
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Prevent admins from deleting themselves
        if user == request.user:
            return Response(
                {"error": "You cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def toggle_admin(self, request, pk=None):
        user = self.get_object()
        # Prevent admins from removing their own admin status
        if user == request.user:
            return Response(
                {"error": "You cannot change your own admin status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_staff = not user.is_staff
        user.save()
        return Response({"status": "success", "is_admin": user.is_staff})
