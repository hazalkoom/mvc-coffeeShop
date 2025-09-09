# Coffee Shop MVC Application

A full-stack **MVC (Model-View-Controller)** web application for a coffee shop built with Node.js, Express, and dual database support (MongoDB + MySQL).

## Features

- **User Authentication**: Registration and login system with session management
- **Product Management**: Browse and view coffee products with categories
- **Shopping Cart**: Add products to cart and manage quantities
- **Product Reviews & Ratings**: 5-star rating system with user reviews
- **User Dashboard**: Personal dashboard with account overview
- **User Profile**: Editable profile management
- **Responsive Design**: Modern UI with EJS templating
- **Dual Database**: MongoDB for users, MySQL for products and reviews
- **Flash Messages**: User feedback system

## Tech Stack

- **Backend**: Node.js, Express.js
- **Architecture**: MVC (Model-View-Controller) Pattern
- **Databases**: MongoDB (users) + MySQL (products, reviews)
- **Template Engine**: EJS
- **Authentication**: Express Session, bcryptjs
- **File Upload**: Multer
- **Styling**: Bootstrap 5 + Custom CSS
- **Icons**: Font Awesome

## Project Structure

```
coffeShop/
├── controllers/          # Business logic controllers (MVC)
│   ├── cartController.js
│   ├── productsController.js
│   └── usersController.js
├── models/              # Database models and connections (MVC)
│   ├── mongoConnection.js
│   ├── mySqlConnection.js
│   ├── proudctsModel.js
│   ├── usersModel.js
│   └── reviewsModel.js
├── routes/              # Express routes (MVC)
│   ├── cart.js
│   ├── users.js
│   └── web.js
├── views/               # EJS templates (MVC)
│   ├── pages/           # Main pages
│   │   ├── index.ejs
│   │   ├── product-detail.ejs
│   │   ├── dashboard.ejs
│   │   ├── profile.ejs
│   │   └── ...
│   └── partials/        # Reusable components
│       ├── header.ejs
│       ├── footer.ejs
│       └── products-grid.ejs
├── public/              # Static assets
│   ├── css/
│   └── img/
├── database/            # Database schemas
│   └── reviews_table.sql
└── index.js             # Application entry point
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hazalkoom/mvc-coffeeShop.git
cd mvc-coffeeShop
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/coffeUsers
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=coffeeshop
SESSION_SECRET=your_session_secret
```

4. Set up your databases:
   - **MongoDB**: For user authentication and management
   - **MySQL**: For products and reviews (run `database/reviews_table.sql`)

5. Start the application:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Usage

1. Navigate to `http://localhost:3001` in your browser
2. Register a new account or login
3. Browse coffee products with star ratings
4. View product details and reviews
5. Add items to your cart
6. Submit product reviews and ratings
7. Manage your profile and dashboard
8. Checkout your cart

## MVC Routes (Traditional Web Routes)

### Authentication Routes
- `GET /users/register` - Show registration form
- `POST /users/register` - Process registration
- `GET /users/login` - Show login form
- `POST /users/login` - Process login
- `GET /users/logout` - Logout user
- `POST /users/logout` - Logout user

### User Management Routes
- `GET /users/dashboard` - User dashboard
- `GET /users/profile` - Show profile page
- `POST /users/profile` - Update profile

### Product Routes
- `GET /` - Home page with featured products
- `GET /products` - All products page with pagination
- `GET /products/:id` - Product details with reviews
- `GET /about` - About page
- `GET /contact` - Contact page

### Review Routes
- `POST /reviews/submit` - Submit product review
- `POST /reviews/:reviewId/update` - Update review
- `GET /reviews/:reviewId/delete` - Delete review

### Cart Routes
- `GET /cart` - View shopping cart
- `POST /cart/add` - Add item to cart
- `POST /cart/update` - Update cart item quantity
- `POST /cart/remove` - Remove item from cart

## MVC Architecture

This application follows the **Model-View-Controller (MVC)** pattern:

### **Models** (`/models/`)
- **`usersModel.js`** - User data operations (MongoDB)
- **`proudctsModel.js`** - Product data operations (MySQL)
- **`reviewsModel.js`** - Review and rating operations (MySQL)
- **`mongoConnection.js`** - MongoDB connection
- **`mySqlConnection.js`** - MySQL connection

### **Views** (`/views/`)
- **EJS Templates** for server-side rendering
- **Pages**: `index.ejs`, `product-detail.ejs`, `dashboard.ejs`, `profile.ejs`
- **Partials**: `header.ejs`, `footer.ejs`, `products-grid.ejs`
- **Responsive design** with Bootstrap 5

### **Controllers** (`/controllers/`)
- **`usersController.js`** - User authentication and profile management
- **`productsController.js`** - Product display and review handling
- **`cartController.js`** - Shopping cart operations

### **Routes** (`/routes/`)
- **Traditional web routes** (not APIs)
- **Form-based interactions** with server-side rendering
- **Session-based authentication**
- **Flash message system** for user feedback

## Key Features

### **Product Reviews & Ratings**
- ⭐ **5-star rating system**
- 📝 **User reviews with comments**
- ✏️ **Edit/delete own reviews**
- 📊 **Average rating calculations**
- 🎨 **Visual star displays**

### **User Management**
- 🔐 **Secure authentication** with bcrypt
- 👤 **User dashboard** with overview
- ⚙️ **Profile management** with editing
- 🔒 **Session-based security**

### **Shopping Experience**
- 🛒 **Shopping cart** functionality
- 📱 **Responsive design** for all devices
- 🎨 **Modern UI** with Bootstrap 5
- 💬 **Flash messages** for feedback

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Created by [hazalkoom](https://github.com/hazalkoom)
