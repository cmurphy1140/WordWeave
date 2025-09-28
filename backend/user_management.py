"""
WordWeave User Management Lambda Function
Handles user authentication, registration, and profile management
"""

import json
import boto3
import os
import hashlib
import jwt
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# AWS clients
dynamodb = boto3.resource('dynamodb')
ssm = boto3.client('ssm')

# Configuration
USER_TABLE_NAME = os.environ.get('USER_TABLE_NAME')
JWT_SECRET_PARAM = os.environ.get('JWT_SECRET_PARAM', '/wordweave/prod/jwt-secret')

# Initialize DynamoDB table
try:
    user_table = dynamodb.Table(USER_TABLE_NAME)
except Exception as e:
    logger.error(f"Failed to initialize DynamoDB table: {e}")
    user_table = None

def get_jwt_secret() -> str:
    """Get JWT secret from SSM Parameter Store"""
    try:
        response = ssm.get_parameter(Name=JWT_SECRET_PARAM, WithDecryption=True)
        return response['Parameter']['Value']
    except Exception as e:
        logger.error(f"Failed to get JWT secret: {e}")
        # Fallback for development (should not be used in production)
        return os.environ.get('JWT_SECRET', 'dev-secret-key')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_jwt_token(user_id: str, email: str) -> str:
    """Generate JWT token for user"""
    secret = get_jwt_secret()
    payload = {
        'user_id': user_id,
        'email': email,
        'iat': int(time.time()),
        'exp': int(time.time()) + (24 * 60 * 60)  # 24 hours
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token and return payload"""
    try:
        secret = get_jwt_secret()
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        return None

def generate_user_id(email: str) -> str:
    """Generate unique user ID from email"""
    return hashlib.md5(email.lower().encode()).hexdigest()

def create_cors_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create CORS-enabled response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body)
    }

def handle_preflight(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle OPTIONS preflight request"""
    return create_cors_response(200, {'message': 'CORS preflight'})

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    """Register a new user"""
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').lower().strip()
        password = body.get('password', '')
        full_name = body.get('full_name', '').strip()

        # Validation
        if not email or not password or not full_name:
            return create_cors_response(400, {
                'error': 'Email, password, and full name are required'
            })

        if len(password) < 8:
            return create_cors_response(400, {
                'error': 'Password must be at least 8 characters long'
            })

        user_id = generate_user_id(email)

        # Check if user already exists
        try:
            response = user_table.get_item(Key={'user_id': user_id})
            if 'Item' in response:
                return create_cors_response(409, {
                    'error': 'User already exists'
                })
        except Exception as e:
            logger.error(f"Error checking existing user: {e}")
            return create_cors_response(500, {
                'error': 'Database error'
            })

        # Create new user
        user_data = {
            'user_id': user_id,
            'email': email,
            'full_name': full_name,
            'password_hash': hash_password(password),
            'created_at': datetime.utcnow().isoformat(),
            'last_login': None,
            'poem_count': 0,
            'favorite_poems': [],
            'settings': {
                'theme_preference': 'auto',
                'animation_preference': 'normal',
                'email_notifications': True
            }
        }

        user_table.put_item(Item=user_data)

        # Generate JWT token
        token = generate_jwt_token(user_id, email)

        logger.info(f"User registered successfully: {email}")

        return create_cors_response(201, {
            'message': 'User registered successfully',
            'user': {
                'user_id': user_id,
                'email': email,
                'full_name': full_name,
                'created_at': user_data['created_at']
            },
            'token': token
        })

    except json.JSONDecodeError:
        return create_cors_response(400, {'error': 'Invalid JSON'})
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return create_cors_response(500, {'error': 'Internal server error'})

def login_user(event: Dict[str, Any]) -> Dict[str, Any]:
    """Authenticate user login"""
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').lower().strip()
        password = body.get('password', '')

        if not email or not password:
            return create_cors_response(400, {
                'error': 'Email and password are required'
            })

        user_id = generate_user_id(email)

        # Get user from database
        try:
            response = user_table.get_item(Key={'user_id': user_id})
            if 'Item' not in response:
                return create_cors_response(401, {
                    'error': 'Invalid credentials'
                })

            user = response['Item']
        except Exception as e:
            logger.error(f"Error retrieving user: {e}")
            return create_cors_response(500, {
                'error': 'Database error'
            })

        # Verify password
        if user['password_hash'] != hash_password(password):
            return create_cors_response(401, {
                'error': 'Invalid credentials'
            })

        # Update last login
        try:
            user_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression='SET last_login = :timestamp',
                ExpressionAttributeValues={
                    ':timestamp': datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            logger.warning(f"Failed to update last login: {e}")

        # Generate JWT token
        token = generate_jwt_token(user_id, email)

        logger.info(f"User logged in successfully: {email}")

        return create_cors_response(200, {
            'message': 'Login successful',
            'user': {
                'user_id': user_id,
                'email': user['email'],
                'full_name': user['full_name'],
                'poem_count': user.get('poem_count', 0),
                'settings': user.get('settings', {})
            },
            'token': token
        })

    except json.JSONDecodeError:
        return create_cors_response(400, {'error': 'Invalid JSON'})
    except Exception as e:
        logger.error(f"Login error: {e}")
        return create_cors_response(500, {'error': 'Internal server error'})

def get_user_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    """Get user profile (requires authentication)"""
    try:
        # Extract JWT token from Authorization header
        headers = event.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return create_cors_response(401, {
                'error': 'Missing or invalid authorization header'
            })

        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)

        if not payload:
            return create_cors_response(401, {
                'error': 'Invalid or expired token'
            })

        user_id = payload['user_id']

        # Get user from database
        try:
            response = user_table.get_item(Key={'user_id': user_id})
            if 'Item' not in response:
                return create_cors_response(404, {
                    'error': 'User not found'
                })

            user = response['Item']
        except Exception as e:
            logger.error(f"Error retrieving user profile: {e}")
            return create_cors_response(500, {
                'error': 'Database error'
            })

        # Return user profile (without password hash)
        profile = {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'created_at': user['created_at'],
            'last_login': user.get('last_login'),
            'poem_count': user.get('poem_count', 0),
            'favorite_poems': user.get('favorite_poems', []),
            'settings': user.get('settings', {})
        }

        return create_cors_response(200, {
            'user': profile
        })

    except Exception as e:
        logger.error(f"Profile retrieval error: {e}")
        return create_cors_response(500, {'error': 'Internal server error'})

def update_user_settings(event: Dict[str, Any]) -> Dict[str, Any]:
    """Update user settings (requires authentication)"""
    try:
        # Extract JWT token
        headers = event.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return create_cors_response(401, {
                'error': 'Missing or invalid authorization header'
            })

        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)

        if not payload:
            return create_cors_response(401, {
                'error': 'Invalid or expired token'
            })

        user_id = payload['user_id']

        # Parse request body
        body = json.loads(event.get('body', '{}'))
        settings = body.get('settings', {})

        # Validate settings
        valid_settings = {
            'theme_preference': ['auto', 'light', 'dark'],
            'animation_preference': ['minimal', 'normal', 'enhanced'],
            'email_notifications': [True, False]
        }

        for key, value in settings.items():
            if key in valid_settings and value not in valid_settings[key]:
                return create_cors_response(400, {
                    'error': f'Invalid value for {key}: {value}'
                })

        # Update user settings
        try:
            user_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression='SET settings = :settings',
                ExpressionAttributeValues={
                    ':settings': settings
                }
            )
        except Exception as e:
            logger.error(f"Error updating user settings: {e}")
            return create_cors_response(500, {
                'error': 'Database error'
            })

        logger.info(f"User settings updated: {user_id}")

        return create_cors_response(200, {
            'message': 'Settings updated successfully',
            'settings': settings
        })

    except json.JSONDecodeError:
        return create_cors_response(400, {'error': 'Invalid JSON'})
    except Exception as e:
        logger.error(f"Settings update error: {e}")
        return create_cors_response(500, {'error': 'Internal server error'})

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Main Lambda handler for user management"""
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return handle_preflight(event)

        # Extract path and method
        path = event.get('pathParameters', {}).get('proxy', '')
        method = event.get('httpMethod', 'GET')

        logger.info(f"User management request: {method} /{path}")

        # Route requests
        if path == 'register' and method == 'POST':
            return register_user(event)
        elif path == 'login' and method == 'POST':
            return login_user(event)
        elif path == 'profile' and method == 'GET':
            return get_user_profile(event)
        elif path == 'settings' and method == 'PUT':
            return update_user_settings(event)
        else:
            return create_cors_response(404, {
                'error': f'Not found: {method} /{path}'
            })

    except Exception as e:
        logger.error(f"Unexpected error in user management: {e}")
        return create_cors_response(500, {
            'error': 'Internal server error'
        })