const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffeeshop'
};

// Product images by category
const productImages = {
    coffee: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop'
    ],
    tea: [
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop'
    ],
    smoothie: [
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop'
    ],
    pastry: [
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop'
    ]
};

function getImageForCategory(category, index) {
    const categoryLower = category.toLowerCase();
    
    let images;
    if (categoryLower.includes('coffee')) {
        images = productImages.coffee;
    } else if (categoryLower.includes('tea')) {
        images = productImages.tea;
    } else if (categoryLower.includes('smoothie') || categoryLower.includes('juice') || categoryLower.includes('drink')) {
        images = productImages.smoothie;
    } else if (categoryLower.includes('pastry') || categoryLower.includes('cake') || categoryLower.includes('bread') || categoryLower.includes('dessert')) {
        images = productImages.pastry;
    } else {
        images = productImages.coffee; // Default
    }
    
    return images[index % images.length];
}

async function updateProductImages() {
    let connection;
    
    try {
        console.log('🚀 Starting Product Image Update...');
        
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');
        
        // Get all products
        const [products] = await connection.execute(
            'SELECT product_id, product_name, category FROM products ORDER BY category, product_id'
        );
        
        if (products.length === 0) {
            console.log('❌ No products found in database');
            return;
        }
        
        console.log(`📊 Found ${products.length} products to update`);
        
        // Group by category for better organization
        const categories = {};
        products.forEach(product => {
            const category = product.category.toLowerCase();
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });
        
        let totalUpdated = 0;
        
        // Process each category
        for (const [category, categoryProducts] of Object.entries(categories)) {
            console.log(`\n📂 Processing ${category.toUpperCase()} category (${categoryProducts.length} products)`);
            
            for (let i = 0; i < categoryProducts.length; i++) {
                const product = categoryProducts[i];
                const imageUrl = getImageForCategory(category, i);
                
                try {
                    await connection.execute(
                        'UPDATE products SET image_url = ? WHERE product_id = ?',
                        [imageUrl, product.product_id]
                    );
                    
                    console.log(`  ✅ Updated: ${product.product_name} (ID: ${product.product_id})`);
                    totalUpdated++;
                } catch (error) {
                    console.log(`  ❌ Failed: ${product.product_name} (ID: ${product.product_id}) - ${error.message}`);
                }
                
                // Small delay
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`\n🎉 Image update completed!`);
        console.log(`📊 Total products updated: ${totalUpdated}`);
        console.log(`📂 Categories processed: ${Object.keys(categories).length}`);
        
        // Show summary
        console.log(`\n📋 Summary by category:`);
        for (const [category, products] of Object.entries(categories)) {
            console.log(`  • ${category.toUpperCase()}: ${products.length} products`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
console.log('⚠️  This script will update ALL product images in your database!');
console.log('📝 Make sure you have a backup of your database before proceeding.');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('\n🤔 Do you want to continue? (y/N): ', (answer) => {
    if (answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes') {
        updateProductImages();
    } else {
        console.log('❌ Operation cancelled by user');
    }
    rl.close();
});
