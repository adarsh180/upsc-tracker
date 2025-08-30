# Security Guidelines

## Overview
This document outlines the security measures implemented in the UPSC Tracker application and provides guidelines for maintaining security.

## Security Fixes Applied

### 1. Authentication Security
- **Fixed**: Removed hardcoded credentials from source code
- **Implementation**: Moved credentials to environment variables with bcrypt hashing
- **Environment Variables Required**:
  - `ADMIN_EMAIL`: Admin email address
  - `ADMIN_PASSWORD_HASH`: Bcrypt hashed password

### 2. SQL Injection Prevention
- **Fixed**: Implemented field name whitelisting for dynamic queries
- **Implementation**: All dynamic field names are validated against predefined whitelists
- **Files Updated**: All API routes with dynamic SQL queries

### 3. Database Security
- **Fixed**: Enhanced connection security with SSL/TLS
- **Implementation**: Added connection timeouts, charset specification, and proper error handling
- **Features**: Automatic connection cleanup and session security settings

### 4. Enhanced Security Headers
- **Fixed**: Added comprehensive security headers
- **Implementation**: CSP, HSTS, Permissions Policy, and enhanced CORS
- **Protection**: XSS, clickjacking, MIME sniffing, and other attacks

### 5. Input Validation
- **Fixed**: Added comprehensive input validation utilities
- **Implementation**: Email, password, numeric, and date validation
- **Protection**: Prevents malformed data from reaching the database

## Environment Setup

### Required Environment Variables
```bash
# Database Configuration
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=upsc_tracker

# Authentication
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password

# API Keys
GROQ_API_KEY=your_groq_api_key

# Security
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

### Password Hashing
To generate a password hash for the admin account:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your_secure_password';
const hash = bcrypt.hashSync(password, 12);
console.log('Password hash:', hash);
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate API keys regularly
- Use different credentials for different environments

### 2. Database Security
- Use SSL/TLS connections
- Implement proper connection pooling
- Regular security updates
- Monitor for suspicious activity

### 3. API Security
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Log security events

### 4. Deployment Security
- Use HTTPS in production
- Set secure headers
- Regular security audits
- Monitor logs for anomalies

## Security Monitoring

### Logs to Monitor
- Failed authentication attempts
- Database connection errors
- Invalid input attempts
- Rate limit violations

### Recommended Tools
- Application monitoring (e.g., Sentry)
- Database monitoring
- Security scanning tools
- Log aggregation services

## Incident Response

### In Case of Security Breach
1. Immediately rotate all credentials
2. Review access logs
3. Update affected users
4. Patch vulnerabilities
5. Document lessons learned

## Regular Security Tasks

### Weekly
- Review authentication logs
- Check for failed login attempts
- Monitor database performance

### Monthly
- Update dependencies
- Review security headers
- Audit user access

### Quarterly
- Security penetration testing
- Credential rotation
- Security training updates

## Contact
For security concerns or to report vulnerabilities, please contact the development team immediately.