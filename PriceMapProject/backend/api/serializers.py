from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Location, PriceInfo, Comment, UserProfile, PriceValidation
from django.db.models import Count, Q

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_image', 'bio', 'phone']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'is_staff', 'date_joined', 'is_active']

class PriceValidationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PriceValidation
        fields = ['id', 'validation_type', 'created_at', 'user']

class PriceInfoSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    accurate_count = serializers.SerializerMethodField()
    inaccurate_count = serializers.SerializerMethodField()
    last_validation_date = serializers.SerializerMethodField()
    current_user_validation = serializers.SerializerMethodField()
    last_validation_inaccurate = serializers.SerializerMethodField()
    price_status = serializers.SerializerMethodField()
    
    class Meta:
        model = PriceInfo
        fields = ['id', 'product_name', 'price', 'date_reported', 'reported_by', 
                 'accurate_count', 'inaccurate_count', 'last_validation_date', 
                 'current_user_validation', 'last_validation_inaccurate', 'price_status']
    
    def get_accurate_count(self, obj):
        return obj.validations.filter(validation_type=PriceValidation.ACCURATE).count()
    
    def get_inaccurate_count(self, obj):
        return obj.validations.filter(validation_type=PriceValidation.INACCURATE).count()
    
    def get_last_validation_date(self, obj):
        latest = obj.validations.order_by('-created_at').first()
        return latest.created_at if latest else None
    
    def get_current_user_validation(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validation = obj.validations.filter(user=request.user).first()
            if validation:
                return validation.validation_type
        return None
        
    def get_last_validation_inaccurate(self, obj):
        latest = obj.validations.order_by('-created_at').first()
        return latest and latest.validation_type == PriceValidation.INACCURATE
    
    def get_price_status(self, obj):
        """
        Determine the status of the price:
        - 'current': No validations or more accurate than inaccurate
        - 'outdated': More inaccurate than accurate validations
        - 'unvalidated': No validations yet
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
    user = UserSerializer(read_only=True)
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'rating', 'created_at', 'user', 'location']
        
    def get_location(self, obj):
        if obj.location:
            return {
                'id': obj.location.id,
                'name': obj.location.name
            }
        return None

class LocationSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    prices = PriceInfoSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude', 'address', 
                  'created_at', 'updated_at', 'created_by', 'prices', 'comments'] 