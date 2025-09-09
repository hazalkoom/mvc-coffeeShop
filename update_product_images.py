#!/usr/bin/env python3
"""
Product Image Updater for Coffee Shop
Updates product images in MySQL database with appropriate coffee/tea/drinks/pastry images
"""

import mysql.connector
import os
import sys
from urllib.parse import urlparse
import requests
import time

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # Update with your MySQL username
    'password': '',  # Update with your MySQL password
    'database': 'coffeeshop'
}

# Image URLs organized by category
PRODUCT_IMAGES = {
    'coffee': [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop'
    ],
    'tea': [
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop'
    ],
    'smoothie': [
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop'
    ],
    'pastry': [
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop'
    ]
}

def connect_to_database():
    """Connect to MySQL database"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print("✅ Connected to MySQL database")
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        return None

def get_products_by_category(connection):
    """Get all products grouped by category"""
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT product_id, product_name, category FROM products ORDER BY category, product_id")
        products = cursor.fetchall()
        cursor.close()
        
        # Group products by category
        categories = {}
        for product in products:
            category = product['category'].lower()
            if category not in categories:
                categories[category] = []
            categories[category].append(product)
        
        return categories
    except mysql.connector.Error as err:
        print(f"❌ Error fetching products: {err}")
        return {}

def update_product_image(connection, product_id, image_url):
    """Update product image URL in database"""
    try:
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE products SET image_url = %s WHERE product_id = %s",
            (image_url, product_id)
        )
        connection.commit()
        cursor.close()
        return True
    except mysql.connector.Error as err:
        print(f"❌ Error updating product {product_id}: {err}")
        return False

def get_image_for_category(category, index):
    """Get appropriate image URL for category and index"""
    category_lower = category.lower()
    
    # Map category variations to our image categories
    if 'coffee' in category_lower:
        images = PRODUCT_IMAGES['coffee']
    elif 'tea' in category_lower:
        images = PRODUCT_IMAGES['tea']
    elif 'smoothie' in category_lower or 'juice' in category_lower or 'drink' in category_lower:
        images = PRODUCT_IMAGES['smoothie']
    elif 'pastry' in category_lower or 'cake' in category_lower or 'bread' in category_lower or 'dessert' in category_lower:
        images = PRODUCT_IMAGES['pastry']
    else:
        # Default to coffee images for unknown categories
        images = PRODUCT_IMAGES['coffee']
    
    # Use modulo to cycle through images
    return images[index % len(images)]

def main():
    """Main function to update product images"""
    print("🚀 Starting Product Image Update...")
    
    # Connect to database
    connection = connect_to_database()
    if not connection:
        sys.exit(1)
    
    try:
        # Get products by category
        categories = get_products_by_category(connection)
        if not categories:
            print("❌ No products found in database")
            return
        
        total_updated = 0
        
        # Process each category
        for category, products in categories.items():
            print(f"\n📂 Processing {category.upper()} category ({len(products)} products)")
            
            for index, product in enumerate(products):
                # Get appropriate image for this product
                image_url = get_image_for_category(category, index)
                
                # Update the product image
                if update_product_image(connection, product['product_id'], image_url):
                    print(f"  ✅ Updated: {product['product_name']} (ID: {product['product_id']})")
                    total_updated += 1
                else:
                    print(f"  ❌ Failed: {product['product_name']} (ID: {product['product_id']})")
                
                # Small delay to be respectful to image servers
                time.sleep(0.1)
        
        print(f"\n🎉 Image update completed!")
        print(f"📊 Total products updated: {total_updated}")
        print(f"📂 Categories processed: {len(categories)}")
        
        # Show summary by category
        print(f"\n📋 Summary by category:")
        for category, products in categories.items():
            print(f"  • {category.upper()}: {len(products)} products")
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    finally:
        connection.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    # Check if user wants to proceed
    print("⚠️  This script will update ALL product images in your database!")
    print("📝 Make sure you have a backup of your database before proceeding.")
    
    response = input("\n🤔 Do you want to continue? (y/N): ").strip().lower()
    if response in ['y', 'yes']:
        main()
    else:
        print("❌ Operation cancelled by user")
        sys.exit(0)
