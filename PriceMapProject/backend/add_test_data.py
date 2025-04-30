import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pricemap.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Location, PriceInfo, Comment

def create_test_data():
    # Get superuser
    try:
        admin_user = User.objects.get(username='user')
    except User.DoesNotExist:
        print("Admin user not found. Make sure you've created a superuser.")
        return
    
    # Create a test location
    location = Location.objects.create(
        name="Café Central",
        latitude=38.736946,
        longitude=-9.142685,
        address="Praça do Comércio, Lisboa",
        created_by=admin_user
    )
    print(f"Created location: {location}")
    
    # Add some prices
    coffee = PriceInfo.objects.create(
        location=location,
        product_name="Coffee",
        price=1.20,
        reported_by=admin_user
    )
    print(f"Added price: {coffee}")
    
    pastel = PriceInfo.objects.create(
        location=location,
        product_name="Pastel de Nata",
        price=1.50,
        reported_by=admin_user
    )
    print(f"Added price: {pastel}")
    
    # Add a comment
    comment = Comment.objects.create(
        location=location,
        user=admin_user,
        text="Great place with friendly staff and reasonable prices!"
    )
    print(f"Added comment: {comment}")
    
    print("Test data created successfully!")

if __name__ == "__main__":
    create_test_data() 