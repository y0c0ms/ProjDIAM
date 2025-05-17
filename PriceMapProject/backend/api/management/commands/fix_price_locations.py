'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.core.management.base import BaseCommand
from api.models import PriceInfo, Location
from django.db.models import F, Q

class Command(BaseCommand):
    help = 'Fixes prices with missing location references'

    def handle(self, *args, **options):
        # Check for prices with null locations
        null_location_prices = PriceInfo.objects.filter(location__isnull=True)
        
        self.stdout.write(f"Found {null_location_prices.count()} prices with null locations")
        
        # Get first location (as fallback)
        default_location = None
        if Location.objects.exists():
            default_location = Location.objects.first()
            
        if not default_location:
            self.stdout.write(self.style.ERROR("No locations exist in the database. Please create at least one location."))
            return
            
        # Fix prices with null locations
        updated_count = 0
        for price in null_location_prices:
            price.location = default_location
            price.save()
            updated_count += 1
            self.stdout.write(f"Fixed price ID {price.id} ({price.product_name}): assigned to {default_location.name}")
            
        self.stdout.write(self.style.SUCCESS(f"Successfully fixed {updated_count} prices")) 