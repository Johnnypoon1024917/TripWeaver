import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken, } from '../utils/auth';
import redisClient from '../config/redis';
const userRepository = AppDataSource.getRepository(User);
export const register = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const hashedPassword = await hashPassword(password);
        // Create new user
        const user = userRepository.create({
            email,
            password: hashedPassword,
            displayName,
        });
        await userRepository.save(user);
        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
        // Store refresh token in database
        user.refreshToken = refreshToken;
        await userRepository.save(user);
        // Store refresh token in Redis with expiration (7 days)
        await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
        // Update refresh token
        user.refreshToken = refreshToken;
        await userRepository.save(user);
        // Store refresh token in Redis
        await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Refresh token required' });
            return;
        }
        // Verify refresh token
        const decoded = verifyRefreshToken(token);
        // Check if token exists in Redis
        const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
        if (storedToken !== token) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        // Generate new access token
        const accessToken = generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
        });
        res.json({ accessToken });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
export const logout = async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            // Remove refresh token from Redis
            await redisClient.del(`refresh_token:${userId}`);
            // Remove refresh token from database
            await userRepository.update({ id: userId }, { refreshToken: undefined });
        }
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
