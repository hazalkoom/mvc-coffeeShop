const usersModel = require('../models/usersModel');
const bcrypt = require('bcryptjs');

// Render register page
async function showRegister(req, res) {
    return res.render('pages/register', {
        title: 'Register',
        isAuthenticated: req.session && req.session.userId ? true : false,
        user: null,
        error: null
    });
}

// Handle register POST (simple, no hashing yet)
async function handleRegister(req, res) {
    try {
        const { email, password, first_name, last_name } = req.body;
        if (!email || !password) {
            return res.status(400).render('pages/register', {
                title: 'Register',
                isAuthenticated: false,
                user: null,
                error: 'Email and password are required.'
            });
        }
        const existing = await usersModel.findUserByEmail(email);
        if (existing) {
            return res.status(409).render('pages/register', {
                title: 'Register',
                isAuthenticated: false,
                user: null,
                error: 'Email already registered.'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await usersModel.createUser({ email, password: hashedPassword, first_name, last_name, role: 'user' });
        req.session.userId = String(user._id);
        req.session.user = { _id: String(user._id), email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role };
        return res.redirect('/');
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).render('pages/register', {
            title: 'Register',
            isAuthenticated: false,
            user: null,
            error: 'Internal server error.'
        });
    }
}

// Render login page
async function showLogin(req, res) {
    return res.render('pages/login', {
        title: 'Login',
        isAuthenticated: req.session && req.session.userId ? true : false,
        user: null,
        error: null
    });
}

// Handle login POST (simple, no hashing yet)
async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;
        const user = await usersModel.findUserByEmail(email);
        const isValid = user ? await bcrypt.compare(password, user.password || '') : false;
        if (!user || !isValid) {
            return res.status(401).render('pages/login', {
                title: 'Login',
                isAuthenticated: false,
                user: null,
                error: 'Invalid credentials.'
            });
        }
        req.session.userId = String(user._id);
        req.session.user = { _id: String(user._id), email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role };
        return res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).render('pages/login', {
            title: 'Login',
            isAuthenticated: false,
            user: null,
            error: 'Internal server error.'
        });
    }
}

// Handle logout
async function handleLogout(req, res) {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

module.exports = {
    showRegister,
    handleRegister,
    showLogin,
    handleLogin,
    handleLogout
};


