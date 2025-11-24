#!/usr/bin/env python
"""
Test authentication endpoints
"""
import requests
import json

def test_auth():
    base_url = "http://localhost:5000"
    
    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "password123",
        "role": "admin"
    }
    
    print("Testing Authentication Endpoints...")
    print("=" * 50)
    
    # Test registration
    print("1. Testing Registration...")
    try:
        reg_response = requests.post(f"{base_url}/api/auth/register", 
                                   json=test_user,
                                   headers={"Content-Type": "application/json"})
        print(f"Registration Status: {reg_response.status_code}")
        print(f"Registration Response: {reg_response.text}")
    except Exception as e:
        print(f"Registration Error: {e}")
    
    print("\n" + "-" * 50)
    
    # Test login
    print("2. Testing Login...")
    try:
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        login_response = requests.post(f"{base_url}/api/auth/login",
                                     json=login_data,
                                     headers={"Content-Type": "application/json"})
        print(f"Login Status: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
        if login_response.status_code == 200:
            data = login_response.json()
            if 'access_token' in data:
                print("✓ Login successful!")
                print(f"User: {data.get('user', {})}")
            else:
                print("✗ No access token in response")
        else:
            print("✗ Login failed")
            
    except Exception as e:
        print(f"Login Error: {e}")

if __name__ == "__main__":
    test_auth()