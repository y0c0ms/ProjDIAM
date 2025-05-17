'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pricemap.settings')
django.setup()

# Now import models
from api.models import PriceInfo, Location

def fix_prices():
    # Count prices with null locations
    null_prices = PriceInfo.objects.filter(location__isnull=True)
    count = null_prices.count()
    print(f"Found {count} prices with null locations")
    
    if count == 0:
        print("No prices need to be fixed")
        return
    
    # Get default location
    if not Location.objects.exists():
        print("Error: No locations exist in the database")
        return
        
    default_location = Location.objects.first()
    print(f"Using '{default_location.name}' as default location")
    
    # Update all null location prices
    for price in null_prices:
        price.location = default_location
        price.save()
        print(f"Fixed price: {price.product_name} (ID: {price.id})")
    
    print(f"Successfully fixed {count} prices")

if __name__ == "__main__":
    fix_prices() 