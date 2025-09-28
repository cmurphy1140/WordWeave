import json
import boto3
import logging
from datetime import datetime
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Health check Lambda function for WordWeave services
    
    Returns service status and dependency health
    """
    
    try:
        logger.info("Starting health check")
        
        # Check if this is a scheduled warmup call
        if event.get('source') == 'aws.events':
            logger.info("Warmup ping received")
            return create_response(200, {
                'status': 'warm',
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Health check results
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'environment': context.function_name.split('-')[-1] if '-' in context.function_name else 'unknown',
            'services': {}
        }
        
        # Check DynamoDB tables
        poem_table_status = check_dynamodb_table(
            os.environ.get('POEM_TABLE_NAME', 'wordweave-poems-dev')
        )
        theme_table_status = check_dynamodb_table(
            os.environ.get('THEME_TABLE_NAME', 'wordweave-themes-dev')
        )
        
        health_status['services']['poem_cache'] = poem_table_status
        health_status['services']['theme_cache'] = theme_table_status
        
        # Check Bedrock availability (basic check)
        bedrock_status = check_bedrock_service()
        health_status['services']['bedrock'] = bedrock_status
        
        # Determine overall status
        service_statuses = [
            poem_table_status['status'],
            theme_table_status['status'],
            bedrock_status['status']
        ]
        
        if all(status == 'healthy' for status in service_statuses):
            health_status['status'] = 'healthy'
            status_code = 200
        elif any(status == 'healthy' for status in service_statuses):
            health_status['status'] = 'degraded'
            status_code = 200
        else:
            health_status['status'] = 'unhealthy'
            status_code = 503
        
        # Add performance metrics
        health_status['metrics'] = {
            'memory_used_mb': context.memory_limit_in_mb,
            'remaining_time_ms': context.get_remaining_time_in_millis(),
            'request_id': context.aws_request_id
        }
        
        logger.info(f"Health check completed with status: {health_status['status']}")
        
        return create_response(status_code, health_status)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}", exc_info=True)
        
        error_response = {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return create_response(503, error_response)

def check_dynamodb_table(table_name: str) -> Dict[str, Any]:
    """
    Check DynamoDB table health
    
    Args:
        table_name: Name of the DynamoDB table to check
        
    Returns:
        Dictionary with table health status
    """
    try:
        table = dynamodb.Table(table_name)
        
        # Get table description to check if it exists and is active
        response = table.meta.client.describe_table(TableName=table_name)
        table_status = response['Table']['TableStatus']
        
        # Get basic metrics
        item_count = response['Table'].get('ItemCount', 0)
        table_size = response['Table'].get('TableSizeBytes', 0)
        
        if table_status == 'ACTIVE':
            return {
                'status': 'healthy',
                'table_status': table_status,
                'item_count': item_count,
                'size_bytes': table_size,
                'last_checked': datetime.utcnow().isoformat()
            }
        else:
            return {
                'status': 'degraded',
                'table_status': table_status,
                'message': f'Table is in {table_status} state',
                'last_checked': datetime.utcnow().isoformat()
            }
            
    except Exception as e:
        logger.error(f"DynamoDB health check failed for {table_name}: {str(e)}")
        return {
            'status': 'unhealthy',
            'error': str(e),
            'last_checked': datetime.utcnow().isoformat()
        }

def check_bedrock_service() -> Dict[str, Any]:
    """
    Check AWS Bedrock service availability
    
    Returns:
        Dictionary with Bedrock service health status
    """
    try:
        # Initialize Bedrock client
        bedrock = boto3.client('bedrock', region_name='us-east-1')
        
        # Try to list foundation models (lightweight check)
        response = bedrock.list_foundation_models(
            byProvider='anthropic',
            maxResults=1
        )
        
        model_count = len(response.get('modelSummaries', []))
        
        return {
            'status': 'healthy',
            'available_models': model_count,
            'region': 'us-east-1',
            'last_checked': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Bedrock health check failed: {str(e)}")
        return {
            'status': 'unhealthy',
            'error': str(e),
            'region': 'us-east-1',
            'last_checked': datetime.utcnow().isoformat()
        }

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create API Gateway response with CORS headers
    
    Args:
        status_code: HTTP status code
        body: Response body
    
    Returns:
        API Gateway response format
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-API-Key,Authorization',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        'body': json.dumps(body, default=str)
    }

# Import os for environment variables
import os
