# Coffee Shop MVC Application

A full-stack web application for a coffee shop built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Registration and login system with session management
- **Product Management**: Browse and view coffee products
- **Shopping Cart**: Add products to cart and manage quantities
- **Responsive Design**: Modern UI with EJS templating
- **Database Integration**: MongoDB for data persistence

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Template Engine**: EJS
- **Authentication**: Express Session, bcryptjs
- **File Upload**: Multer
- **Styling**: CSS

## Project Structure

```
coffeShop/
├── controllers/          # Business logic controllers
│   ├── cartController.js
│   ├── productsController.js
│   └── usersController.js
├── models/              # Database models and connections
│   ├── mongoConnection.js
│   ├── mySqlConnection.js
│   ├── proudctsModel.js
│   └── usersModel.js
├── routes/              # Express routes
│   ├── cart.js
│   ├── users.js
│   └── web.js
├── views/               # EJS templates
│   ├── pages/           # Main pages
│   └── partials/        # Reusable components
├── public/              # Static assets
│   ├── css/
│   └── img/
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
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

4. Start the application:
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
3. Browse coffee products
4. Add items to your cart
5. Manage your cart and checkout

## MVC ROUTES

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `POST /users/logout` - User logout

### Products
- `GET /` - Home page with products
- `GET /product/:id` - Product details

### Cart
- `POST /cart/add` - Add item to cart
- `POST /cart/update` - Update cart item quantity
- `POST /cart/remove` - Remove item from cart
- `GET /cart` - View cart

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
