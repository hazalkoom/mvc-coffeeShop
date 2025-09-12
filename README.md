# Coffee Shop MVC Application

A full-stack **MVC (Model-View-Controller)** web application for a coffee shop built with Node.js, Express, and dual database support (MongoDB + MySQL).

## Features

### Customer Features
- **User Authentication**: Registration and login system with session management
- **Product Management**: Browse and view coffee products with categories
- **Shopping Cart**: Add products to cart and manage quantities
- **Product Reviews & Ratings**: 5-star rating system with user reviews
- **User Dashboard**: Personal dashboard with account overview
- **User Profile**: Editable profile management
- **Order History**: View past orders and order status

### Admin Features 🆕
- **Admin Dashboard**: Comprehensive admin panel with data visualization
- **Analytics & Charts**: Visual insights with charts for sales, orders, and user activity
- **Product CRUD Operations**: Complete product management (Create, Read, Update, Delete)
- **Order Management**: View, edit, and update order status
- **Sales Reports**: Track revenue and performance metrics
- **Inventory Management**: Monitor and update product stock levels
- **User Management**: View and manage customer accounts

### Technical Features
- **Responsive Design**: Modern UI with EJS templating
- **Dual Database**: MongoDB for users, MySQL for products and reviews
- **Flash Messages**: User feedback system
- **Role-Based Access**: Separate customer and admin interfaces

## Tech Stack

- **Backend**: Node.js, Express.js
- **Architecture**: MVC (Model-View-Controller) Pattern
- **Databases**: MongoDB (users) + MySQL (products, reviews, orders)
- **Template Engine**: EJS
- **Authentication**: Express Session, bcryptjs
- **File Upload**: Multer
- **Charts & Analytics**: Chart.js / D3.js
- **Styling**: Bootstrap 5 + Custom CSS
- **Icons**: Font Awesome

## Project Structure

```
coffeShop/
├── controllers/          # Business logic controllers (MVC)
│              # Admin controllers 🆕
│   ├── adminController.js
│   ├── checkoutController.js
│   ├── favoritesController.js
│   ├── cartController.js
│   ├── productsController.js
│   └── usersController.js
├── models/              # Database models and connections (MVC)
│   ├── mongoConnection.js
│   ├── mySqlConnection.js
│   ├── proudctsModel.js
│   ├── usersModel.js
│   ├── reviewsModel.js
│   └── ordersModel.js   # 🆕
|   └── adminModel.js
├── routes/              # Express routes (MVC)
│   ├── admin.js         # Admin routes 🆕
│   ├── cart.js
│   ├── users.js
│   └── web.js
│   ├── checkout.js
│   ├── favorites.js
│   └── orders.js
├── views/               # EJS templates (MVC)
│   ├── admin/           # Admin views 🆕
│   │   ├── dashboard.ejs
│   │   ├── products/
│   │   │   ├── list.ejs
│   │   │   ├── create.ejs
│   │   │   └── edit.ejs
│   │   └── orders/
│   │       ├── list.ejs
│   │       └── detail.ejs
│   ├── pages/           # Main pages
│   │   ├── index.ejs
│   │   ├── product-detail.ejs
│   │   ├── dashboard.ejs
│   │   ├── profile.ejs
│   │   └── ...
│   └── partials/        # Reusable components
│       ├── header.ejs
│       ├── footer.ejs
│       ├── admin-sidebar.ejs  # 🆕
│       └── products-grid.ejs
├── public/              # Static assets
│   ├── css/
│   ├── js/
│   │   └── admin/       # Admin scripts 🆕
│   │       └── charts.js
│   └── img/
├── database/            # Database schemas
│   ├── reviews_table.sql
│   └── orders_table.sql  # 🆕
├── middleware/          # Custom middleware 🆕
│   └── adminAuth.js     # Admin authentication
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
ADMIN_EMAIL=admin@coffeeshop.com
ADMIN_PASSWORD=your_admin_password
```

4. Set up your databases:
   - **MongoDB**: For user authentication and management
   - **MySQL**: For products, reviews, and orders (run SQL scripts in `/database/`)

5. Start the application:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Usage

### For Customers
1. Navigate to `http://localhost:3001` in your browser
2. Register a new account or login
3. Browse coffee products with star ratings
4. View product details and reviews
5. Add items to your cart
6. Submit product reviews and ratings
7. Manage your profile and dashboard
8. Checkout your cart
9. View order history

### For Administrators 🆕
1. Navigate to `http://localhost:3001/admin` in your browser
2. Login with admin credentials
3. Access the admin dashboard with analytics
4. Manage products (add, edit, delete)
5. View and manage customer orders
6. Monitor sales and performance metrics
7. Update inventory levels
8. Generate reports

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
- `GET /users/orders` - View order history

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
- `POST /cart/checkout` - Process checkout

### Admin Routes 🆕
#### Dashboard
- `GET /admin` - Admin login page
- `POST /admin/login` - Process admin login
- `GET /admin/dashboard` - Admin dashboard with charts
- `GET /admin/logout` - Admin logout

#### Product Management
- `GET /admin/products` - List all products
- `GET /admin/products/create` - Show create product form
- `POST /admin/products/create` - Create new product
- `GET /admin/products/:id/edit` - Show edit product form
- `POST /admin/products/:id/update` - Update product
- `POST /admin/products/:id/delete` - Delete product

#### Order Management
- `GET /admin/orders` - List all orders
- `GET /admin/orders/:id` - View order details
- `POST /admin/orders/:id/status` - Update order status
- `GET /admin/orders/export` - Export orders report

## MVC Architecture

This application follows the **Model-View-Controller (MVC)** pattern:

### **Models** (`/models/`)
- **`usersModel.js`** - User data operations (MongoDB)
- **`proudctsModel.js`** - Product data operations (MySQL)
- **`reviewsModel.js`** - Review and rating operations (MySQL)
- **`ordersModel.js`** - Order management operations (MySQL) 🆕
- **`mongoConnection.js`** - MongoDB connection
- **`mySqlConnection.js`** - MySQL connection

### **Views** (`/views/`)
- **EJS Templates** for server-side rendering
- **Customer Pages**: `index.ejs`, `product-detail.ejs`, `dashboard.ejs`, `profile.ejs`
- **Admin Pages**: Dashboard, Product Management, Order Management 🆕
- **Partials**: `header.ejs`, `footer.ejs`, `products-grid.ejs`, `admin-sidebar.ejs`
- **Responsive design** with Bootstrap 5

### **Controllers** (`/controllers/`)
- **`usersController.js`** - User authentication and profile management
- **`productsController.js`** - Product display and review handling
- **`cartController.js`** - Shopping cart operations
- **Admin Controllers** 🆕:
  - **`dashboardController.js`** - Admin dashboard and analytics
  - **`productManagementController.js`** - CRUD operations for products
  - **`orderManagementController.js`** - Order viewing and management

### **Routes** (`/routes/`)
- **Traditional web routes** (not APIs)
- **Form-based interactions** with server-side rendering
- **Session-based authentication**
- **Role-based access control** for admin routes 🆕
- **Flash message system** for user feedback

## Key Features

### **Admin Dashboard** 🆕
- 📊 **Analytics Charts**: Visual representation of sales, orders, and user data
- 📈 **Performance Metrics**: Real-time sales and revenue tracking
- 📉 **Trend Analysis**: Historical data visualization
- 🎯 **Quick Stats**: Key performance indicators at a glance
- 📅 **Date Range Filtering**: Analyze data for specific periods

### **Product Management (Admin)** 🆕
- ➕ **Create Products**: Add new products with images
- ✏️ **Edit Products**: Update product details, prices, and stock
- 🗑️ **Delete Products**: Remove products from catalog
- 📸 **Image Upload**: Multiple image support for products
- 📦 **Inventory Tracking**: Stock level management
- 🏷️ **Category Management**: Organize products by categories

### **Order Management (Admin)** 🆕
- 📋 **Order List**: View all customer orders
- 🔍 **Order Details**: Detailed view of each order
- 🚚 **Status Updates**: Track order progress (Pending, Processing, Shipped, Delivered)
- 💰 **Payment Status**: Monitor payment confirmations
- 📧 **Customer Communication**: Order update notifications
- 📊 **Order Analytics**: Sales reports and statistics

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
- 👮 **Role-based access** (Customer/Admin)

### **Shopping Experience**
- 🛒 **Shopping cart** functionality
- 📱 **Responsive design** for all devices
- 🎨 **Modern UI** with Bootstrap 5
- 💬 **Flash messages** for feedback
- 📦 **Order tracking** for customers

## Security Features

- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Secure session handling
- **Admin Authentication**: Separate admin login system
- **CSRF Protection**: Protection against cross-site request forgery
- **Input Validation**: Server-side validation for all forms
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Output escaping in templates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Loyalty program
- [ ] Mobile app API
- [ ] Real-time order tracking
- [ ] Multi-language support
- [ ] Social media integration

## License

This project is licensed under the ISC License.

## Author

Created by [hazalkoom](https://github.com/hazalkoom)
