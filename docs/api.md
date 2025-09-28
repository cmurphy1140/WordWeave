# WordWeave API Documentation

## Overview

WordWeave provides a RESTful API for poem generation, theme analysis, and user management. The API is built on AWS serverless architecture and secured with JWT authentication.

**Base URL (Production)**: `https://api.wordweave.app`
**Base URL (Development)**: `http://localhost:3001`

## Authentication

WordWeave uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.

```bash
Authorization: Bearer <jwt_token>
```

### Authentication Flow

1. **Register** or **Login** to get a JWT token
2. **Include token** in subsequent API requests
3. **Token expires** after 24 hours (configurable)
4. **Refresh** by logging in again

## Rate Limiting

WordWeave implements rate limiting to ensure fair usage and system stability.

### Rate Limit Headers

All responses include rate limit information:

```bash
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1632841200
X-RateLimit-Window: 3600
```

### Rate Limit Tiers

| User Type | Poems/Hour | Theme Analysis/Hour | Total Requests/Hour |
|-----------|------------|-------------------|-----------------|
| Anonymous | 10 | 20 | 50 |
| Authenticated | 100 | 200 | 500 |
| Premium | 500 | 1000 | 2000 |

## Endpoints

### POST /generate

Generate a poem and theme based on three input words.

#### Request

```json
{
  "verb": "whisper",
  "adjective": "ancient",
  "noun": "forest"
}
```

**Parameters:**
- `verb` (string, required): Action word for the poem
- `adjective` (string, required): Descriptive word
- `noun` (string, required): Subject/object word

#### Response

```json
{
  "success": true,
  "data": {
    "poem": "In ancient woods where shadows dance,\nWhispers carry nature's trance...",
    "theme": {
      "colors": {
        "primary": "#2d5a3d",
        "secondary": "#4a7c59",
        "accent": "#7aa874",
        "background": "#1a3d2e",
        "gradient": ["#1a3d2e", "#4a7c59", "#7aa874"]
      },
      "animations": {
        "style": "mystical",
        "duration": 2000,
        "stagger": 100
      },
      "typography": {
        "mood": "elegant",
        "scale": 1.2
      }
    },
    "metadata": {
      "id": "poem-12345",
      "wordCount": 24,
      "sentiment": "mysterious",
      "emotion": "wonder",
      "generationTime": 1.2
    }
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Verb field is required",
    "details": {
      "field": "verb",
      "value": null,
      "constraints": ["required", "string", "length:1-50"]
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /health

Health check endpoint for monitoring service status.

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "services": {
      "bedrock": "connected",
      "dynamodb": "connected",
      "elasticache": "connected"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /poems/{id}

Retrieve a previously generated poem by ID. Requires authentication for user-specific poems.

#### Headers
```bash
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "poem": "Ancient whispers in the forest...",
    "theme": { /* theme object */ },
    "metadata": { /* metadata object */ },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "userId": "user_12345",
    "isFavorite": false
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Authentication Endpoints

### POST /auth/register

Register a new user account.

#### Request

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "poetryLover"
}
```

**Parameters:**
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `username` (string, required): 3-30 characters, alphanumeric

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_12345",
      "email": "user@example.com",
      "username": "poetryLover",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST /auth/login

Authenticate user and get JWT token.

#### Request

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_12345",
      "email": "user@example.com",
      "username": "poetryLover",
      "lastLogin": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /auth/profile

Get current user profile. Requires authentication.

#### Headers
```bash
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_12345",
      "email": "user@example.com",
      "username": "poetryLover",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "poemsGenerated": 42,
      "favoritePoems": 8
    },
    "settings": {
      "theme": "dark",
      "animationSpeed": "normal",
      "notifications": true
    }
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### PUT /auth/profile

Update user profile. Requires authentication.

#### Headers
```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request

```json
{
  "username": "newUsername",
  "settings": {
    "theme": "light",
    "animationSpeed": "fast",
    "notifications": false
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_12345",
      "email": "user@example.com",
      "username": "newUsername",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST /auth/logout

Logout user and invalidate token. Requires authentication.

#### Headers
```bash
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## User Poem Management

### GET /user/poems

Get user's poem history. Requires authentication.

#### Headers
```bash
Authorization: Bearer <jwt_token>
```

#### Query Parameters
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `favorites` (boolean, optional): Filter for favorite poems only

#### Response

```json
{
  "success": true,
  "data": {
    "poems": [
      {
        "id": "poem-12345",
        "poem": "Ancient whispers in the forest...",
        "theme": { /* theme object */ },
        "metadata": { /* metadata object */ },
        "createdAt": "2024-01-01T12:00:00.000Z",
        "isFavorite": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "pages": 3
    }
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST /user/poems/{id}/favorite

Add poem to favorites. Requires authentication.

#### Headers
```bash
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Poem added to favorites",
    "isFavorite": true
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /user/poems/{id}/favorite

Remove poem from favorites. Requires authentication.

#### Headers
```bash
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Poem removed from favorites",
    "isFavorite": false
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `BEDROCK_TIMEOUT` | AI service timeout |
| `INTERNAL_ERROR` | Server error |
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `USER_EXISTS` | Email already registered |
| `INVALID_CREDENTIALS` | Wrong email/password |
| `TOKEN_EXPIRED` | JWT token has expired |
| `CONTENT_FILTERED` | Content blocked by filters |
| `USER_NOT_FOUND` | User account not found |
| `POEM_NOT_FOUND` | Requested poem not found |

## Response Schema

### Theme Object

```typescript
interface Theme {
  colors: {
    primary: string;      // Main theme color
    secondary: string;    // Complementary color
    accent: string;       // Highlight color
    background: string;   // Background color
    gradient: string[];   // Array of gradient colors
  };
  animations: {
    style: 'calm' | 'energetic' | 'dramatic' | 'mystical';
    duration: number;     // Animation duration in ms
    stagger: number;      // Stagger delay between elements
  };
  typography: {
    mood: 'modern' | 'classic' | 'playful' | 'elegant';
    scale: number;        // Font size multiplier
  };
}
```

### Metadata Object

```typescript
interface Metadata {
  id: string;           // Unique poem identifier
  wordCount: number;    // Number of words in poem
  sentiment: string;    // Overall sentiment analysis
  emotion: string;      // Detected primary emotion
  generationTime: number; // Time taken to generate (seconds)
  cacheHit?: boolean;   // Whether response was cached
}
```

## Examples

### Basic Poem Generation

```bash
curl -X POST https://api.wordweave.app/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "verb": "dance",
    "adjective": "ethereal",
    "noun": "moonlight"
  }'
```

### JavaScript/React Example

```javascript
const generatePoem = async (verb, adjective, noun) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify({ verb, adjective, noun }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Failed to generate poem:', error);
    throw error;
  }
};
```

## Testing

Use the provided test credentials for development:

```
API Key: test_key_12345
Base URL: https://dev-api.wordweave.app
```

## Support

For API support, please contact:
- Email: api-support@wordweave.app
- Documentation: https://docs.wordweave.app
- GitHub Issues: https://github.com/yourusername/wordweave/issues

