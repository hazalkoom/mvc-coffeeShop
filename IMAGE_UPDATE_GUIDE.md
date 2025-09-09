# Product Image Update Guide

This guide helps you update your product images with appropriate coffee/tea/drinks/pastry images.

## 🚀 Quick Start

### Option 1: Node.js Script (Recommended)
```bash
node update_images.js
```

### Option 2: Python Script
```bash
python update_product_images.py
```

## 📋 What the Scripts Do

### ✅ Smart Category Matching
- **Coffee products** → Coffee images
- **Tea products** → Tea images  
- **Smoothie/Juice/Drink products** → Smoothie images
- **Pastry/Cake/Bread/Dessert products** → Pastry images
- **Unknown categories** → Default to coffee images

### 🖼️ High-Quality Images
- **Source**: Unsplash (free, high-quality stock photos)
- **Size**: 400x400 pixels, optimized for web
- **Format**: JPG with proper cropping
- **License**: Free for commercial use

### 🔄 Smart Distribution
- **Cycles through images** - No duplicate images in same category
- **Maintains variety** - Different images for different products
- **Preserves order** - Products keep their relative positions

## ⚠️ Important Notes

### Before Running:
1. **Backup your database** - Always backup before making changes
2. **Check your .env file** - Ensure database credentials are correct
3. **Test on a copy** - Consider testing on a development database first

### Database Requirements:
- MySQL database with `products` table
- Table must have: `product_id`, `product_name`, `category`, `image_url` columns
- Proper database credentials in `.env` file

## 🛠️ Configuration

### Environment Variables (.env):
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=coffeeshop
```

### Python Requirements:
```bash
pip install mysql-connector-python requests
```

### Node.js Requirements:
```bash
npm install mysql2 dotenv
```

## 📊 Expected Results

After running the script, you should see:
- ✅ All products updated with appropriate images
- 📊 Summary of updated products by category
- 🎨 Professional-looking product images
- 🚀 Better user experience on your website

## 🔧 Troubleshooting

### Common Issues:
1. **Database connection failed** → Check .env credentials
2. **No products found** → Verify products table exists
3. **Permission denied** → Check MySQL user permissions
4. **Images not loading** → Check internet connection for Unsplash

### Manual Verification:
```sql
SELECT product_id, product_name, category, image_url 
FROM products 
WHERE category = 'coffee' 
LIMIT 5;
```

## 🎯 Customization

To add more image categories or change images:
1. Edit the `productImages` object in the script
2. Add new category mappings in `getImageForCategory` function
3. Use high-quality, properly licensed images

## 📝 Example Output

```
🚀 Starting Product Image Update...
✅ Connected to MySQL database
📊 Found 24 products to update

📂 Processing COFFEE category (8 products)
  ✅ Updated: Espresso Blend (ID: 1)
  ✅ Updated: Dark Roast (ID: 2)
  ...

📂 Processing TEA category (6 products)
  ✅ Updated: Green Tea (ID: 9)
  ✅ Updated: Chamomile (ID: 10)
  ...

🎉 Image update completed!
📊 Total products updated: 24
📂 Categories processed: 4

📋 Summary by category:
  • COFFEE: 8 products
  • TEA: 6 products
  • SMOOTHIE: 5 products
  • PASTRY: 5 products
```
