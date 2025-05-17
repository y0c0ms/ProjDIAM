'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.core.management.base import BaseCommand
from django.db import connection
from api.models import Location, PriceInfo

class Command(BaseCommand):
    help = 'Fix missing or invalid location references in price data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== FIXING LOCATION REFERENCES ==='))
        
        # Get default location
        if not Location.objects.exists():
            self.stdout.write(self.style.ERROR('No locations found in database. Please create at least one location.'))
            return
            
        default_location = Location.objects.first()
        self.stdout.write(f'Using default location: {default_location.name} (ID: {default_location.id})')
        
        # Check all prices
        self.stdout.write(self.style.SUCCESS('\nScanning prices for location issues:'))
        fixed_count = 0
        
        for price in PriceInfo.objects.all():
            self.stdout.write(f'  Checking price: {price.id} - {price.product_name} (€{price.price})')
            
            # Check if location reference is broken
            location_ok = False
            location_id = None
            
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT location_id FROM api_priceinfo WHERE id = %s", [price.id])
                    result = cursor.fetchone()
                    if result:
                        location_id = result[0]
                        if location_id is not None:
                            # Verify location exists
                            cursor.execute("SELECT COUNT(*) FROM api_location WHERE id = %s", [location_id])
                            if cursor.fetchone()[0] > 0:
                                location_ok = True
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    SQL Error: {str(e)}'))
            
            # Fix if needed
            if not location_ok:
                fixed_count += 1
                if location_id is None:
                    self.stdout.write(self.style.WARNING(f'    Missing location_id - fixing...'))
                else:
                    self.stdout.write(self.style.WARNING(f'    Invalid location_id {location_id} - fixing...'))
                    
                # Update directly in database
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE api_priceinfo SET location_id = %s WHERE id = %s",
                        [default_location.id, price.id]
                    )
                
                # Also update through ORM for cache consistency
                price.location = default_location
                price.save(update_fields=['location'])
                
                self.stdout.write(self.style.SUCCESS(f'    Fixed: Set location to {default_location.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'    Location OK (ID: {location_id})'))
        
        # Summary
        if fixed_count > 0:
            self.stdout.write(self.style.SUCCESS(f'\nFixed {fixed_count} prices with location issues'))
        else:
            self.stdout.write(self.style.SUCCESS('\nNo location issues found')) 