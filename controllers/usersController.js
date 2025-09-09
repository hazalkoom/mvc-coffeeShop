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

// Show dashboard
async function showDashboard(req, res) {
    try {
        // Check if user is authenticated
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        // Get user data from database for fresh information
        const user = await usersModel.findUserById(req.session.userId);
        if (!user) {
            req.session.destroy(() => {
                return res.redirect('/login');
            });
            return;
        }

        // Get user's cart items count
        const cart = await usersModel.getCart(req.session.userId);
        const cartItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        
        res.render('pages/dashboard', {
            title: 'Dashboard',
            isAuthenticated: true,
            user: req.session.user,
            userData: user,
            recentOrders: [],
            cartItems: cartItems,
            totalSpent: 0
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('pages/error', {
            message: 'Error loading dashboard',
            error: error
        });
    }
}

// Show profile page
async function showProfile(req, res) {
    try {
        // Check if user is authenticated
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        // Get fresh user data from database
        const user = await usersModel.findUserById(req.session.userId);
        if (!user) {
            req.session.destroy(() => {
                return res.redirect('/login');
            });
            return;
        }

        res.render('pages/profile', {
            title: 'Profile',
            isAuthenticated: true,
            user: req.session.user,
            userData: user,
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('pages/error', {
            message: 'Error loading profile',
            error: error
        });
    }
}

// Update profile
async function updateProfile(req, res) {
    try {
        // Check if user is authenticated
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        const { first_name, last_name, email, current_password, new_password } = req.body;
        const userId = req.session.userId;

        // Get current user data
        const currentUser = await usersModel.findUserById(userId);
        if (!currentUser) {
            return res.redirect('/login');
        }

        // Validate current password if trying to change password
        if (new_password && new_password.trim() !== '') {
            if (!current_password) {
                return res.render('pages/profile', {
                    title: 'Profile',
                    isAuthenticated: true,
                    user: req.session.user,
                    userData: currentUser,
                    error: 'Current password is required to change password.',
                    success: null
                });
            }

            const isValidPassword = await bcrypt.compare(current_password, currentUser.password);
            if (!isValidPassword) {
                return res.render('pages/profile', {
                    title: 'Profile',
                    isAuthenticated: true,
                    user: req.session.user,
                    userData: currentUser,
                    error: 'Current password is incorrect.',
                    success: null
                });
            }
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== currentUser.email) {
            const existingUser = await usersModel.findUserByEmail(email);
            if (existingUser) {
                return res.render('pages/profile', {
                    title: 'Profile',
                    isAuthenticated: true,
                    user: req.session.user,
                    userData: currentUser,
                    error: 'Email is already taken by another user.',
                    success: null
                });
            }
        }

        // Prepare update data
        const updateData = {};
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (email) updateData.email = email;
        if (new_password && new_password.trim() !== '') {
            updateData.password = await bcrypt.hash(new_password, 10);
        }

        // Update user
        const updatedUser = await usersModel.updateUser(userId, updateData);
        
        // Check if update was successful
        if (!updatedUser) {
            return res.render('pages/profile', {
                title: 'Profile',
                isAuthenticated: true,
                user: req.session.user,
                userData: currentUser,
                error: 'Failed to update profile. Please try again.',
                success: null
            });
        }
        
        // Update session with new data
        req.session.user = {
            _id: String(updatedUser._id),
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            role: updatedUser.role
        };

        res.render('pages/profile', {
            title: 'Profile',
            isAuthenticated: true,
            user: req.session.user,
            userData: updatedUser,
            error: null,
            success: 'Profile updated successfully!'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).render('pages/error', {
            message: 'Error updating profile',
            error: error
        });
    }
}

module.exports = {
    showRegister,
    handleRegister,
    showLogin,
    handleLogin,
    handleLogout,
    showDashboard,
    showProfile,
    updateProfile
};


