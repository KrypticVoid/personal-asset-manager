# Authentication Architecture Specification

## 1. System Components

### 1.1 Client Application
- Frontend application implementing Privy.io widget
- Handles token management and storage
- Implements secure token transmission

### 1.2 Privy.io Authentication Service
- Provides OAuth 2.0 compliant authentication
- Supports multiple authentication methods:
  * Web3 wallet connections
  * Social authentication
  * Email/password combinations
- Issues cryptographically signed JWTs

### 1.3 Backend API Service
- NestJS application with JWT authentication
- Implements token exchange and verification
- Manages user sessions and access control

### 1.4 Database Layer
- PostgreSQL database
- Stores user records and associations
- Maintains authentication audit logs

## 2. Authentication Flow

### 2.1 Initial Authentication
```
Step 1: Client Initialization
- Client integrates Privy widget
- Configures Privy with app-specific parameters
- Initializes secure storage for tokens

Step 2: User Authentication
- User triggers authentication via Privy widget
- Privy handles authentication flow
- Returns signed JWT containing user information
```

### 2.2 Token Exchange
```
Step 3: Privy Token Processing
Input: Privy JWT
Process:
- Validate token format
- Verify signature using Privy public key
- Extract user identifier and claims
Output: Verified token payload

Step 4: User Management
Input: Verified user information
Process:
- Check existing user records
- Create or update user entry
- Generate session metadata
Output: Internal user record

Step 5: Application Token Generation
Input: User record
Process:
- Generate application-specific JWT
- Include necessary authorization claims
- Sign with application secret
Output: Application JWT
```

## 3. Security Considerations

### 3.1 Token Security
```
JWT Configuration:
- Short expiration time (24 hours)
- Includes necessary claims only
- Signed using strong algorithm (HS256)

Required Claims:
{
  "sub": "user_id",
  "privyId": "privy_user_id",
  "iat": timestamp,
  "exp": timestamp
}
```

### 3.2 API Security
```
Endpoint Protection:
- All routes except /auth require valid JWT
- Rate limiting implemented
- CORS properly configured

Header Requirements:
Authorization: Bearer <token>
Content-Type: application/json
```

## 4. Implementation Notes

### 4.1 Token Verification
```typescript
// Privy token verification
const verifyPrivyToken = async (token: string): Promise<TokenPayload> => {
  try {
    // Verify using Privy public key
    const verified = await verifyWithPrivyKey(token);
    if (!verified) throw new UnauthorizedException();
    return verified;
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
};
```

### 4.2 Token Exchange
```typescript
// Application token generation
const generateAppToken = (user: User): string => {
  const payload = {
    sub: user.id,
    privyId: user.privyId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };
  return jwt.sign(payload, JWT_SECRET);
};
```

## 5. Error Handling

### 5.1 Common Error Scenarios
```
Token Validation Errors:
- Invalid signature
- Expired token
- Malformed token
- Missing required claims

API Response Codes:
401 - Unauthorized: Invalid or expired token
403 - Forbidden: Valid token but insufficient permissions
400 - Bad Request: Malformed request or invalid parameters
```

## 6. Performance Considerations

### 6.1 Optimization Strategies
```
- Token caching
- Database connection pooling
- Efficient user lookup
- Proper indexing on user tables
```

## 7. Monitoring and Logging

### 7.1 Security Events
```
Events to Monitor:
- Failed authentication attempts
- Token validation failures
- User creation/updates
- Suspicious activity patterns
```

## 8. Future Improvements

### 8.1 Potential Enhancements
```
- Implement refresh token mechanism
- Add token revocation capability
- Enhance audit logging
- Add multi-factor authentication
```

