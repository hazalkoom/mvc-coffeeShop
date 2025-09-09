const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/register', usersController.showRegister);
router.post('/register', usersController.handleRegister);

router.get('/login', usersController.showLogin);
router.post('/login', usersController.handleLogin);

router.get('/logout', usersController.handleLogout);
router.post('/logout', usersController.handleLogout);

module.exports = router;


