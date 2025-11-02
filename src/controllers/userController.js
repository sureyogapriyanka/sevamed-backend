const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { username, password, role, name, email, age, gender, phone, address, bloodGroup, department, specialization, profileImage } = req.body;

        console.log('Registration request body:', req.body); // Debug log

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with all provided data including profile image
        const user = new User({
            username,
            password: hashedPassword,
            role,
            name,
            email,
            age,
            gender,
            phone,
            address,
            bloodGroup,
            department,
            specialization,
            profileImage // Include the profile image data
        });

        console.log('User object to be saved:', user); // Debug log

        await user.save();

        console.log('User saved successfully:', user); // Debug log

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'sevaonline_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            age: user.age,
            gender: user.gender,
            phone: user.phone,
            address: user.address,
            bloodGroup: user.bloodGroup,
            profileImage: user.profileImage,
            token
        });
    } catch (error) {
        console.error('Registration error:', error); // Debug log
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'sevaonline_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            age: user.age,
            gender: user.gender,
            phone: user.phone,
            address: user.address,
            bloodGroup: user.bloodGroup,
            profileImage: user.profileImage, // Include profile image in login response
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { name, email, age, gender, phone, address, bloodGroup, department, specialization, profileImage } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.age = age || user.age;
        user.gender = gender || user.gender;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.bloodGroup = bloodGroup || user.bloodGroup;
        user.department = department || user.department;
        user.specialization = specialization || user.specialization;
        user.profileImage = profileImage || user.profileImage; // Include profile image update

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            role: updatedUser.role,
            name: updatedUser.name,
            email: updatedUser.email,
            age: updatedUser.age,
            gender: updatedUser.gender,
            phone: updatedUser.phone,
            address: updatedUser.address,
            bloodGroup: updatedUser.bloodGroup,
            profileImage: updatedUser.profileImage // Include profile image in response
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user by username (public endpoint for profile preview)
const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username but exclude password field
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        // Only admin can get all users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get users by role (admin only)
const getUsersByRole = async (req, res) => {
    try {
        // Only admin can get users by role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { role } = req.params;
        const users = await User.find({ role }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user by ID (admin only)
const updateUserById = async (req, res) => {
    try {
        // Only admin can update users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { name, email, age, gender, phone, address, bloodGroup, department, specialization, profileImage, role, username } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (age !== undefined) user.age = age;
        if (gender !== undefined) user.gender = gender;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
        if (department !== undefined) user.department = department;
        if (specialization !== undefined) user.specialization = specialization;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (role !== undefined) user.role = role;
        if (username !== undefined) user.username = username;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            role: updatedUser.role,
            name: updatedUser.name,
            email: updatedUser.email,
            age: updatedUser.age,
            gender: updatedUser.gender,
            phone: updatedUser.phone,
            address: updatedUser.address,
            bloodGroup: updatedUser.bloodGroup,
            profileImage: updatedUser.profileImage
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserByUsername,
    getAllUsers,
    getUsersByRole,
    updateUserById
};