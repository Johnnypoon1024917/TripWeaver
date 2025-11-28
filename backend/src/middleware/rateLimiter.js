class RateLimiter {
    store = {};
    maxRequests;
    windowMs;
    constructor(maxRequests = 100, windowMs = 15 * 60 * 1000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }
    middleware = (req, res, next) => {
        const identifier = this.getIdentifier(req);
        const now = Date.now();
        if (!this.store[identifier]) {
            this.store[identifier] = {
                count: 1,
                resetTime: now + this.windowMs,
            };
            this.setHeaders(res, this.maxRequests - 1, this.windowMs);
            next();
            return;
        }
        const record = this.store[identifier];
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.windowMs;
            this.setHeaders(res, this.maxRequests - 1, this.windowMs);
            next();
            return;
        }
        record.count++;
        if (record.count > this.maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            res.status(429).json({
                message: 'Too many requests, please try again later',
                retryAfter,
            });
            return;
        }
        this.setHeaders(res, this.maxRequests - record.count, record.resetTime - now);
        next();
    };
    getIdentifier(req) {
        // Use IP address or user ID if authenticated
        const userId = req.user?.userId;
        if (userId) {
            return `user:${userId}`;
        }
        return `ip:${req.ip || req.connection.remoteAddress}`;
    }
    setHeaders(res, remaining, resetMs) {
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + resetMs).toISOString());
    }
    cleanup() {
        const now = Date.now();
        Object.keys(this.store).forEach((key) => {
            if (now > this.store[key].resetTime) {
                delete this.store[key];
            }
        });
    }
}
export const rateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const strictRateLimiter = new RateLimiter(10, 60 * 1000); // 10 requests per minute
export default rateLimiter;
