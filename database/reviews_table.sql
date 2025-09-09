-- Create reviews table for the coffee shop application
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (assuming you have users and products tables)
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    
    -- Ensure a user can only review a product once
    UNIQUE KEY unique_user_product_review (user_id, product_id),
    
    -- Indexes for better performance
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Insert some sample reviews (optional - for testing)
-- INSERT INTO reviews (user_id, product_id, rating, comment, user_name, user_email) VALUES
-- (1, 1, 5, 'Amazing coffee! Best I\'ve ever had.', 'John Doe', 'john@example.com'),
-- (2, 1, 4, 'Great quality, would recommend.', 'Jane Smith', 'jane@example.com'),
-- (1, 2, 3, 'Good but could be better.', 'John Doe', 'john@example.com');
