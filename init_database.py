import sqlite3
import os

def init_database(database_path='database.db', schema_path='database_schema.sql'):
    """Initialize the database with the complete schema"""
    
    # Remove existing database for fresh start
    if os.path.exists(database_path):
        print(f"Removing existing database: {database_path}")
        os.remove(database_path)
    
    # Create new database
    print(f"Creating new database: {database_path}")
    conn = sqlite3.connect(database_path)
    conn.row_factory = sqlite3.Row
    
    try:
        # Read and execute schema
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        print("Executing database schema...")
        conn.executescript(schema_sql)
        conn.commit()
        
        print("Database initialized successfully!")
        
        # Verify tables were created
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        
        print(f"\nCreated {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
            
        return True
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = init_database()
    if success:
        print("\nDatabase ready for use!")
    else:
        print("\nDatabase initialization failed!")
