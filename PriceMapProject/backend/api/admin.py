from django.contrib import admin
from .models import Location, PriceInfo, Comment

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
    list_display = ('user', 'location', 'created_at')
    search_fields = ('text',)
    list_filter = ('created_at',)
