'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class UserProfile(models.Model):
    """
    Extended user profile model that contains additional user information
    Links one-to-one with Django's built-in User model
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"

class Location(models.Model):
    """
    Represents a physical location where prices can be reported
    Contains geographical coordinates and address information
    """
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')

    def __str__(self):
        return self.name
    
class PriceInfo(models.Model):
    """
    Stores product prices at specific locations
    Each entry represents a product's price at a particular location
    Prices can be validated by users to confirm accuracy
    """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='prices')
    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_reported = models.DateTimeField(auto_now_add=True)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_prices')
    
    def __str__(self):
        return f"{self.product_name} - {self.price} at {self.location.name}"

class PriceValidation(models.Model):
    """
    Tracks user validations of reported prices
    Users can mark prices as accurate or inaccurate
    Each user can have only one validation per price (enforced by unique_together)
    """
    ACCURATE = 'accurate'
    INACCURATE = 'inaccurate'
    
    VALIDATION_CHOICES = [
        (ACCURATE, 'Accurate'),
        (INACCURATE, 'Inaccurate'),
    ]
    
    price = models.ForeignKey(PriceInfo, on_delete=models.CASCADE, related_name='validations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='price_validations')
    validation_type = models.CharField(max_length=20, choices=VALIDATION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Ensure each user can only have one validation per price
        unique_together = ('price', 'user')
    
    def __str__(self):
        return f"{self.get_validation_type_display()} validation by {self.user.username} for {self.price}"

class Comment(models.Model):
    """
    Stores user comments and ratings for locations
    Each comment includes a rating from 1-5 stars
    """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    rating = models.IntegerField(
        default=1,
        validators=[
            MinValueValidator(1, message="Rating must be at least 1"),
            MaxValueValidator(5, message="Rating cannot be more than 5")
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.location.name}"
