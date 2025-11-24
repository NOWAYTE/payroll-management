#!/usr/bin/env python
"""
Check what users exist in the database
"""
import os
import sys
import pymysql
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_users():
    """Check users in database"""
    try:
        # Parse DATABASE_URL using urllib.parse
        database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/payroll_db')
        print(f"Database URL: {database_url}")
        
        # Parse the URL properly
        parsed = urlparse(database_url)
        
        user = parsed.username or 'root'
        password = parsed.password or ''
        host = parsed.hostname or 'localhost'
        port = parsed.port or 3306
        database = parsed.path.lstrip('/') or 'payroll_db'
        
        print(f"Connecting to: {user}@{host}:{port}/{database}")
        
        # Connect to MySQL
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Get all users
        cursor.execute("SELECT id, email, role, created_at FROM users")
        users = cursor.fetchall()
        
        print("\nUsers in database:")
        print("-" * 60)
        for user_data in users:
            print(f"ID: {user_data[0]}, Email: {user_data[1]}, Role: {user_data[2]}, Created: {user_data[3]}")
        
        cursor.close()
        connection.close()
        
        print(f"\nTotal users: {len(users)}")
        return True
        
    except Exception as e:
        print(f"✗ Error checking users: {e}")
        return False

if __name__ == "__main__":
    check_users()