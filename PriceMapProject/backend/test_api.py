import requests
import json

BASE_URL = 'http://localhost:8000/api/'

def test_register():
    print("\n=== Testing Registration ===")
    url = BASE_URL + 'auth/register/'
    
    # Create a test user
    data = {
        'username': 'testuser123',
        'email': 'test@example.com',
        'password': 'testpassword123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    print(f"Sending request to: {url}")
    print(f"Data: {data}")
    
    response = requests.post(url, json=data)
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("Registration successful!")
        return response.json()
    else:
        print("Registration failed!")
        return None

def test_login(username='testuser123', password='testpassword123'):
    print("\n=== Testing Login ===")
    url = BASE_URL + 'auth/login/'
    
    data = {
        'username': username,
        'password': password
    }
    
    print(f"Sending request to: {url}")
    print(f"Data: {data}")
    
    response = requests.post(url, json=data)
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Login successful!")
        return response.json()
    else:
        print("Login failed!")
        return None

def test_get_locations(token=None):
    print("\n=== Testing Get Locations ===")
    url = BASE_URL + 'locations/'
    
    headers = {}
    if token:
        headers['Authorization'] = f'Token {token}'
    
    print(f"Sending request to: {url}")
    print(f"Headers: {headers}")
    
    response = requests.get(url, headers=headers)
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text[:500]}...")  # Truncate long responses
    
    if response.status_code == 200:
        print("Get locations successful!")
        return response.json()
    else:
        print("Get locations failed!")
        return None

if __name__ == "__main__":
    # Try to register (this may fail if the user already exists)
    register_data = test_register()
    
    # Try to login
    login_data = test_login()
    
    if login_data and 'token' in login_data:
        # Test getting locations with token
        test_get_locations(login_data['token'])
    else:
        # Test getting locations without token
        test_get_locations() 