'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pricemap.settings')
django.setup()

# Now import models and database connection
from django.db import connection
from api.models import Location, PriceInfo
from django.db.models import Count

def fix_locations_direct():
    print("=== DIRECT LOCATION FIX SCRIPT ===")
    
    # Check for any prices without location IDs
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_priceinfo WHERE location_id IS NULL")
        null_count = cursor.fetchone()[0]
        print(f"Prices with NULL location_id: {null_count}")
        
        if null_count > 0:
            # Get the first location ID to use as default
            cursor.execute("SELECT id FROM api_location LIMIT 1")
            result = cursor.fetchone()
            
            if not result:
                print("ERROR: No locations found in database")
                return
                
            default_location_id = result[0]
            print(f"Using location ID {default_location_id} as default")
            
            # Update all null locations with default location
            cursor.execute(
                "UPDATE api_priceinfo SET location_id = %s WHERE location_id IS NULL",
                [default_location_id]
            )
            print(f"Fixed {null_count} prices with NULL location_id")
    
    # Check for any locations with broken foreign keys
    broken_prices = 0
    for price in PriceInfo.objects.all():
        try:
            # This will raise an exception if the relationship is broken
            location_name = price.location.name
        except Exception as e:
            broken_prices += 1
            print(f"Price ID {price.id} has broken location reference: {e}")
            
            # Get default location
            default_location = Location.objects.first()
            if default_location:
                price.location = default_location
                price.save()
                print(f"  Fixed by assigning to location: {default_location.name}")
    
    print(f"Found and fixed {broken_prices} prices with broken location references")
    
    # Count prices by location for verification
    location_counts = PriceInfo.objects.values('location__name').annotate(count=Count('id'))
    print("\nPrice counts by location:")
    for loc in location_counts:
        loc_name = loc['location__name'] or 'None'
        print(f"  {loc_name}: {loc['count']} prices")
    
    print("\nDone!")

if __name__ == "__main__":
    fix_locations_direct() 