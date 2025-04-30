from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Location, PriceInfo, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class PriceInfoSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    
    class Meta:
        model = PriceInfo
        fields = ['id', 'product_name', 'price', 'date_reported', 'reported_by']
        
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'created_at', 'user']

class LocationSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    prices = PriceInfoSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude', 'address', 
                  'created_at', 'updated_at', 'created_by', 'prices', 'comments'] 