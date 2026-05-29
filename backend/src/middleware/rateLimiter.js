const rateLimitStore = new Map();

// Periodic cleanup task to prevent memory leaks by removing inactive IPs
setInterval(() => {
  const now = Date.now();
  const threshold = now - 60000;
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < threshold) {
      rateLimitStore.delete(ip);
    }
  }
}, 300000);

// Sliding Window Log Rate Limiter middleware
function slidingWindowLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const threshold = now - 60000;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  let timestamps = rateLimitStore.get(ip);
  timestamps = timestamps.filter(time => time > threshold);
  
  if (timestamps.length >= 5) {
    rateLimitStore.set(ip, timestamps);
    const retryAfter = Math.ceil((timestamps[0] + 60000 - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: `Too Many Requests. Rate limit of 5 requests per minute exceeded. Please try again in ${retryAfter} seconds.`
    });
  }

  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  next();
}

module.exports = slidingWindowLimiter;
