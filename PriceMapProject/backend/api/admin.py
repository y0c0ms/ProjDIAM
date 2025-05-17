'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.contrib import admin
from .models import Location, PriceInfo, Comment, UserProfile, PriceValidation
from django.utils.html import format_html

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'created_by', 'created_at')
    search_fields = ('name', 'address')
    list_filter = ('created_at',)

@admin.register(PriceInfo)
class PriceInfoAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_name', 'price', 'location_name_direct', 'location_id_field', 'reported_by')
    list_display_links = ('id', 'product_name')
    search_fields = ('product_name', 'location__name')
    list_filter = ('location',)
    readonly_fields = ('location_name_direct',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Ensure location dropdown has a default selection"""
        if db_field.name == "location":
            from api.models import Location
            if not kwargs.get("initial") and Location.objects.exists():
                kwargs["initial"] = Location.objects.first().pk
            kwargs["queryset"] = Location.objects.all().order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def location_name_direct(self, obj):
        """Direct SQL method to get location name"""
        try:
            if obj.location_id:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT name FROM api_location WHERE id = %s", [obj.location_id])
                    result = cursor.fetchone()
                    if result:
                        return format_html("<b>{}</b>", result[0])
                    else:
                        # Try to get the location directly through ORM
                        try:
                            if obj.location and obj.location.name:
                                return format_html("<b>{}</b>", obj.location.name)
                        except:
                            pass
            return format_html("<span style='color:red'>Missing Location</span>")
        except Exception as e:
            return format_html("<span style='color:red'>Error: {}</span>", str(e))
    
    location_name_direct.short_description = 'Location'
    
    def location_id_field(self, obj):
        """Simple field to show the raw location ID"""
        return obj.location_id
    
    location_id_field.short_description = 'Location ID'
    
    def save_model(self, request, obj, form, change):
        """Ensure location is set before saving"""
        if not obj.location_id:
            from api.models import Location
            if Location.objects.exists():
                obj.location = Location.objects.first()
                
        # Force an update of location relation in database
        if obj.id:  # Only run this part if the object has an ID (not a new object)
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE api_priceinfo SET location_id = %s WHERE id = %s",
                    [obj.location_id, obj.id]
                )
            
        super().save_model(request, obj, form, change)

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
