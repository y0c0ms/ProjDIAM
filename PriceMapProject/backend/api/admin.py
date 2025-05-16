'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.contrib import admin
from .models import Location, PriceInfo, Comment, UserProfile, PriceValidation

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'created_by', 'created_at')
    search_fields = ('name', 'address')
    list_filter = ('created_at',)

@admin.register(PriceInfo)
class PriceInfoAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'price', 'location', 'reported_by', 'date_reported')
    search_fields = ('product_name',)
    list_filter = ('date_reported',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'rating', 'created_at')
    search_fields = ('text',)
    list_filter = ('created_at', 'rating')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone')
    search_fields = ('user__username', 'user__email', 'phone')

@admin.register(PriceValidation)
class PriceValidationAdmin(admin.ModelAdmin):
    list_display = ('price', 'user', 'validation_type', 'created_at')
    list_filter = ('validation_type', 'created_at')
    search_fields = ('price__product_name', 'user__username')
