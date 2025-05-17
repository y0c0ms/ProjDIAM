'''
Emergency direct SQL fix to correct location relationships
'''

import sqlite3

# Connect directly to database to bypass Django layer
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("== Direct DB Fix ==")

# 1. Get all price records
cursor.execute("SELECT id, product_name, price, location_id FROM api_priceinfo")
prices = cursor.fetchall()
print(f"Found {len(prices)} price records")

# 2. Get a default location
cursor.execute("SELECT id, name FROM api_location LIMIT 1")
default_loc = cursor.fetchone()
if not default_loc:
    print("Error: No locations in database!")
    conn.close()
    exit(1)
    
default_loc_id, default_loc_name = default_loc
print(f"Using default location: {default_loc_name} (ID: {default_loc_id})")

# 3. Fix each price record
updated = 0
for price_id, product, price, loc_id in prices:
    print(f"Checking price {price_id}: {product}, €{price}, Location ID: {loc_id}")
    
    # If location is missing, set to default
    if loc_id is None:
        cursor.execute(
            "UPDATE api_priceinfo SET location_id = ? WHERE id = ?",
            (default_loc_id, price_id)
        )
        print(f"  Updated price {price_id} to use location ID {default_loc_id}")
        updated += 1
    else:
        # Verify location exists
        cursor.execute("SELECT COUNT(*) FROM api_location WHERE id = ?", (loc_id,))
        loc_exists = cursor.fetchone()[0] > 0
        
        if not loc_exists:
            cursor.execute(
                "UPDATE api_priceinfo SET location_id = ? WHERE id = ?",
                (default_loc_id, price_id)
            )
            print(f"  Changed invalid location ID {loc_id} to {default_loc_id}")
            updated += 1
        else:
            # Get location name for confirmation
            cursor.execute("SELECT name FROM api_location WHERE id = ?", (loc_id,))
            loc_name = cursor.fetchone()[0]
            print(f"  OK: Location is {loc_name} (ID: {loc_id})")

# Commit changes
conn.commit()
print(f"Fixed {updated} price records")

# Close connection
conn.close()
print("Done!") 