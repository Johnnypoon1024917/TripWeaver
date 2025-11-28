import crypto from 'crypto';
/**
 * GDPR Compliance Middleware
 */
export const gdprCompliance = (req, res, next) => {
    // Add GDPR headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
};
/**
 * Data encryption for sensitive fields
 */
export class DataEncryption {
    algorithm = 'aes-256-cbc';
    key;
    constructor(secretKey) {
        this.key = crypto.scryptSync(secretKey, 'salt', 32);
    }
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    decrypt(encryptedData) {
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
/**
 * Input sanitization
 */
export const sanitizeInput = (input) => {
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};
/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};
/**
 * Request logging for security audit
 */
export const securityLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.userId || 'anonymous';
    console.log(`[Security Log] ${timestamp} | ${method} ${path} | User: ${userId} | IP: ${ip}`);
    next();
};
/**
 * CORS configuration
 */
export const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:8081', // Expo web
        'http://localhost:19006', // Expo web alternative
        'http://localhost:19000' // Expo DevTools
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
export default {
    gdprCompliance,
    DataEncryption,
    sanitizeInput,
    isValidEmail,
    isStrongPassword,
    securityLogger,
    corsOptions,
};
