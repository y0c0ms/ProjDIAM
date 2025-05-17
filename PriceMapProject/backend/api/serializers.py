'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Location, PriceInfo, Comment, UserProfile, PriceValidation
from django.db.models import Count, Q

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model
    """
    class Meta:
        model = UserProfile
        fields = ['profile_image', 'bio', 'phone']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for Django User model with nested profile data
    """
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'is_staff', 'date_joined', 'is_active']

class PriceValidationSerializer(serializers.ModelSerializer):
    """
    Serializer for price validations with nested user data
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PriceValidation
        fields = ['id', 'validation_type', 'created_at', 'user']

class PriceInfoSerializer(serializers.ModelSerializer):
    """
    Serializer for price information with additional computed fields
    Includes validation counts and status information
    """
    reported_by = UserSerializer(read_only=True)
    accurate_count = serializers.SerializerMethodField()
    inaccurate_count = serializers.SerializerMethodField()
    last_validation_date = serializers.SerializerMethodField()
    current_user_validation = serializers.SerializerMethodField()
    last_validation_inaccurate = serializers.SerializerMethodField()
    price_status = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = PriceInfo
        fields = ['id', 'product_name', 'price', 'date_reported', 'reported_by', 
                 'accurate_count', 'inaccurate_count', 'last_validation_date', 
                 'current_user_validation', 'last_validation_inaccurate', 'price_status',
                 'location', 'location_name']
        read_only_fields = ['reported_by', 'date_reported', 'location_name']
    
    def get_accurate_count(self, obj):
        """Returns the count of accurate validations for this price"""
        return obj.validations.filter(validation_type=PriceValidation.ACCURATE).count()
    
    def get_inaccurate_count(self, obj):
        """Returns the count of inaccurate validations for this price"""
        return obj.validations.filter(validation_type=PriceValidation.INACCURATE).count()
    
    def get_last_validation_date(self, obj):
        """Returns the date of the most recent validation"""
        latest = obj.validations.order_by('-created_at').first()
        return latest.created_at if latest else None
    
    def get_current_user_validation(self, obj):
        """
        Returns the current user's validation type for this price
        Used to show the user's current vote in the UI
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validation = obj.validations.filter(user=request.user).first()
            if validation:
                return validation.validation_type
        return None
    
    def get_location_name(self, obj):
        """Returns the name of the location this price belongs to"""
        return obj.location.name if obj.location else None
        
    def get_last_validation_inaccurate(self, obj):
        """Returns True if the most recent validation was inaccurate"""
        latest = obj.validations.order_by('-created_at').first()
        return latest and latest.validation_type == PriceValidation.INACCURATE
    
    def get_price_status(self, obj):
        """
        Determine the status of the price:
        - 'current': No validations or more accurate than inaccurate
        - 'outdated': More inaccurate than accurate validations
        - 'unvalidated': No validations yet
        This status is used for UI indicators (color coding, badges, etc.)
        """
        accurate = self.get_accurate_count(obj)
        inaccurate = self.get_inaccurate_count(obj)
        
        if accurate == 0 and inaccurate == 0:
            return 'unvalidated'
        elif inaccurate > accurate:
            return 'outdated'
        else:
            return 'current'

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for comments with nested user data
    Includes simplified location data
    """
    user = UserSerializer(read_only=True)
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'rating', 'created_at', 'user', 'location']
        
    def get_location(self, obj):
        """Returns simplified location data for the comment"""
        if obj.location:
            return {
                'id': obj.location.id,
                'name': obj.location.name
            }
        return None

class LocationSerializer(serializers.ModelSerializer):
    """
    Serializer for locations with nested price and comment data
    Includes full price history and all comments for the location
    """
    created_by = UserSerializer(read_only=True)
    prices = serializers.SerializerMethodField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude', 'address', 
                  'created_at', 'updated_at', 'created_by', 'prices', 'comments']
    
    def get_prices(self, obj):
        """
        Get only prices that belong to this location
        Ensures prices are properly filtered by location
        """
        prices = obj.prices.all()
        return PriceInfoSerializer(prices, many=True, context=self.context).data 