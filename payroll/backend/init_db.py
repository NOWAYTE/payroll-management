#!/usr/bin/env python
"""
Database initialization script
Run this after creating the database to set up the schema
"""
import os
import sys
import pymysql
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_database():
    """Initialize database with schema"""
    try:
        # Parse DATABASE_URL using urllib.parse
        database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/payroll_db')
        print(f"Original DATABASE_URL: {database_url}")
        
        # Parse the URL properly
        parsed = urlparse(database_url)
        
        user = parsed.username or 'root'
        password = parsed.password or ''
        host = parsed.hostname or 'localhost'
        port = parsed.port or 3306
        database = parsed.path.lstrip('/') or 'payroll_db'
        
        print(f"Connecting to MySQL: {user}@{host}:{port}/{database}")
        
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
        
        # Read and execute SQL file
        sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', '001_init_database.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"SQL file not found: {sql_file_path}")
            return False
        
        with open(sql_file_path, 'r') as file:
            sql_content = file.read()
        
        # Split and execute SQL statements
        statements = sql_content.split(';')
        for statement in statements:
            statement = statement.strip()
            if statement:
                try:
                    cursor.execute(statement)
                    print(f"✓ Executed: {statement[:50]}...")
                except Exception as e:
                    print(f"✗ Error executing statement: {e}")
                    print(f"  Statement: {statement[:100]}...")
        
        connection.commit()
        print("✓ Database schema initialized successfully!")
        
        cursor.close()
        connection.close()
        return True
        
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("Initializing database schema...")
    success = init_database()
    sys.exit(0 if success else 1)