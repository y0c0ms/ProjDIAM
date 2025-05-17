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

def fix_admin_locations():
    print("=== ADMIN LOCATION FIX SCRIPT ===")
    
    # Print all locations for reference
    print("Available locations in database:")
    for loc in Location.objects.all():
        print(f"  ID: {loc.id}, Name: {loc.name}")
    
    print("\nDirect database price-location connections:")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.id, 
                p.product_name, 
                p.price, 
                p.location_id, 
                l.name 
            FROM 
                api_priceinfo p
            LEFT JOIN 
                api_location l ON p.location_id = l.id
        """)
        rows = cursor.fetchall()
        
        for row in rows:
            price_id, product, price, location_id, location_name = row
            print(f"  Price ID: {price_id}, Product: {product}, Price: {price}, Location ID: {location_id}, Location: {location_name}")
    
    # Get default location for fixes
    default_location = None
    if Location.objects.exists():
        default_location = Location.objects.first()
        print(f"\nUsing default location: {default_location.name} (ID: {default_location.id})")
    else:
        print("Error: No locations found in database")
        return
    
    # Fix each price individually
    print("\nFixing individual prices:")
    for price in PriceInfo.objects.all():
        print(f"  Checking Price ID: {price.id}, {price.product_name}, ${price.price}")
        
        # Direct SQL check
        with connection.cursor() as cursor:
            cursor.execute("SELECT location_id FROM api_priceinfo WHERE id = %s", [price.id])
            location_id = cursor.fetchone()[0]
            
            if location_id is None:
                print(f"    Missing location_id - fixing...")
                cursor.execute(
                    "UPDATE api_priceinfo SET location_id = %s WHERE id = %s",
                    [default_location.id, price.id]
                )
                print(f"    Fixed: Set location_id to {default_location.id}")
            else:
                # Verify location exists
                cursor.execute("SELECT COUNT(*) FROM api_location WHERE id = %s", [location_id])
                loc_exists = cursor.fetchone()[0] > 0
                
                if not loc_exists:
                    print(f"    Invalid location_id {location_id} - fixing...")
                    cursor.execute(
                        "UPDATE api_priceinfo SET location_id = %s WHERE id = %s",
                        [default_location.id, price.id]
                    )
                    print(f"    Fixed: Set location_id to {default_location.id}")
                else:
                    cursor.execute("SELECT name FROM api_location WHERE id = %s", [location_id])
                    loc_name = cursor.fetchone()[0]
                    print(f"    Location OK: {loc_name} (ID: {location_id})")
    
    print("\nDone!")

if __name__ == "__main__":
    fix_admin_locations() 