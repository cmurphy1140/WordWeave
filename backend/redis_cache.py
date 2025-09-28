"""
Redis caching implementation for WordWeave Lambda functions
"""
import json
import hashlib
import logging
from typing import Any, Optional, Dict, Union
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class RedisCacheManager:
    """Redis cache manager for Lambda functions"""
    
    def __init__(self, redis_endpoint: str, port: int = 6379):
        self.redis_endpoint = redis_endpoint
        self.port = port
        self.connection = None
        self.cache_prefix = "wordweave:"
        self.default_ttl = 3600  # 1 hour
        
        # Cache configuration
        self.cache_configs = {
            'poem': {
                'ttl': 24 * 3600,  # 24 hours
                'max_size': 1000,
            },
            'theme_analysis': {
                'ttl': 12 * 3600,  # 12 hours
                'max_size': 500,
            },
            'user_preferences': {
                'ttl': 7 * 24 * 3600,  # 7 days
                'max_size': 100,
            },
            'popular_words': {
                'ttl': 3600,  # 1 hour
                'max_size': 50,
            }
        }
    
    def get_connection(self):
        """Get Redis connection (using ElastiCache Redis)"""
        if self.connection is None:
            try:
                import redis
                self.connection = redis.Redis(
                    host=self.redis_endpoint,
                    port=self.port,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                self.connection.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise
        return self.connection
    
    def generate_cache_key(self, cache_type: str, identifier: str) -> str:
        """Generate a cache key"""
        # Create a hash of the identifier for consistent key length
        identifier_hash = hashlib.md5(identifier.encode()).hexdigest()
        return f"{self.cache_prefix}{cache_type}:{identifier_hash}"
    
    def get(self, cache_type: str, identifier: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            connection = self.get_connection()
            key = self.generate_cache_key(cache_type, identifier)
            
            cached_data = connection.get(key)
            if cached_data:
                data = json.loads(cached_data)
                logger.info(f"Cache hit for {cache_type}: {identifier[:20]}...")
                return data
            else:
                logger.info(f"Cache miss for {cache_type}: {identifier[:20]}...")
                return None
                
        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
            return None
    
    def set(self, cache_type: str, identifier: str, data: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        try:
            connection = self.get_connection()
            key = self.generate_cache_key(cache_type, identifier)
            
            # Use configured TTL or default
            cache_ttl = ttl or self.cache_configs.get(cache_type, {}).get('ttl', self.default_ttl)
            
            # Serialize data
            serialized_data = json.dumps(data, default=str)
            
            # Set with expiration
            result = connection.setex(key, cache_ttl, serialized_data)
            
            if result:
                logger.info(f"Cached {cache_type}: {identifier[:20]}... (TTL: {cache_ttl}s)")
                
                # Cleanup old entries if needed
                self._cleanup_cache(cache_type)
                
                return True
            else:
                logger.warning(f"Failed to cache {cache_type}: {identifier[:20]}...")
                return False
                
        except Exception as e:
            logger.error(f"Error setting cache: {e}")
            return False
    
    def delete(self, cache_type: str, identifier: str) -> bool:
        """Delete value from cache"""
        try:
            connection = self.get_connection()
            key = self.generate_cache_key(cache_type, identifier)
            
            result = connection.delete(key)
            if result:
                logger.info(f"Deleted cache entry for {cache_type}: {identifier[:20]}...")
                return True
            else:
                logger.info(f"Cache entry not found for {cache_type}: {identifier[:20]}...")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")
            return False
    
    def clear_cache_type(self, cache_type: str) -> bool:
        """Clear all entries of a specific cache type"""
        try:
            connection = self.get_connection()
            pattern = f"{self.cache_prefix}{cache_type}:*"
            
            keys = connection.keys(pattern)
            if keys:
                result = connection.delete(*keys)
                logger.info(f"Cleared {result} entries for cache type: {cache_type}")
                return True
            else:
                logger.info(f"No entries found for cache type: {cache_type}")
                return True
                
        except Exception as e:
            logger.error(f"Error clearing cache type {cache_type}: {e}")
            return False
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            connection = self.get_connection()
            stats = {}
            
            for cache_type in self.cache_configs.keys():
                pattern = f"{self.cache_prefix}{cache_type}:*"
                keys = connection.keys(pattern)
                stats[cache_type] = len(keys)
            
            # Get Redis info
            info = connection.info()
            stats['redis_info'] = {
                'used_memory': info.get('used_memory_human', 'Unknown'),
                'connected_clients': info.get('connected_clients', 0),
                'total_commands_processed': info.get('total_commands_processed', 0),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}
    
    def _cleanup_cache(self, cache_type: str):
        """Cleanup old entries if cache size exceeds limit"""
        try:
            connection = self.get_connection()
            pattern = f"{self.cache_prefix}{cache_type}:*"
            
            keys = connection.keys(pattern)
            max_size = self.cache_configs.get(cache_type, {}).get('max_size', 100)
            
            if len(keys) > max_size:
                # Sort by TTL (oldest first)
                key_ttls = [(key, connection.ttl(key)) for key in keys]
                key_ttls.sort(key=lambda x: x[1])
                
                # Remove oldest entries
                keys_to_remove = key_ttls[:len(keys) - max_size]
                for key, _ in keys_to_remove:
                    connection.delete(key)
                
                logger.info(f"Cleaned up {len(keys_to_remove)} old entries for {cache_type}")
                
        except Exception as e:
            logger.error(f"Error during cache cleanup: {e}")
    
    def warm_cache(self, cache_type: str, data_items: Dict[str, Any]):
        """Warm cache with predefined data"""
        try:
            for identifier, data in data_items.items():
                self.set(cache_type, identifier, data)
            
            logger.info(f"Warmed cache for {cache_type} with {len(data_items)} items")
            
        except Exception as e:
            logger.error(f"Error warming cache: {e}")


class PoemCacheManager:
    """Specialized cache manager for poems"""
    
    def __init__(self, redis_manager: RedisCacheManager):
        self.redis = redis_manager
    
    def cache_poem(self, inputs: Dict[str, str], poem_data: Dict[str, Any]) -> bool:
        """Cache generated poem"""
        identifier = self._create_input_hash(inputs)
        return self.redis.set('poem', identifier, poem_data)
    
    def get_cached_poem(self, inputs: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Get cached poem"""
        identifier = self._create_input_hash(inputs)
        return self.redis.get('poem', identifier)
    
    def cache_theme_analysis(self, inputs: Dict[str, str], theme_analysis: Dict[str, Any]) -> bool:
        """Cache theme analysis"""
        identifier = self._create_input_hash(inputs)
        return self.redis.set('theme_analysis', identifier, theme_analysis)
    
    def get_cached_theme_analysis(self, inputs: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Get cached theme analysis"""
        identifier = self._create_input_hash(inputs)
        return self.redis.get('theme_analysis', identifier)
    
    def _create_input_hash(self, inputs: Dict[str, str]) -> str:
        """Create consistent hash from input words"""
        # Sort inputs to ensure consistent hashing
        sorted_inputs = sorted(inputs.items())
        input_string = f"{sorted_inputs[0][1]}_{sorted_inputs[1][1]}_{sorted_inputs[2][1]}"
        return hashlib.md5(input_string.lower().encode()).hexdigest()


# Cache invalidation strategies
class CacheInvalidationManager:
    """Manage cache invalidation strategies"""
    
    def __init__(self, redis_manager: RedisCacheManager):
        self.redis = redis_manager
    
    def invalidate_by_pattern(self, pattern: str) -> bool:
        """Invalidate cache entries matching pattern"""
        try:
            connection = self.redis.get_connection()
            keys = connection.keys(pattern)
            if keys:
                result = connection.delete(*keys)
                logger.info(f"Invalidated {result} cache entries matching pattern: {pattern}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error invalidating cache by pattern: {e}")
            return False
    
    def invalidate_user_data(self, user_id: str) -> bool:
        """Invalidate all user-related cache entries"""
        patterns = [
            f"{self.redis.cache_prefix}poem:*",
            f"{self.redis.cache_prefix}theme_analysis:*",
            f"{self.redis.cache_prefix}user_preferences:{user_id}",
        ]
        
        results = []
        for pattern in patterns:
            results.append(self.invalidate_by_pattern(pattern))
        
        return all(results)
    
    def invalidate_after_model_update(self, model_version: str) -> bool:
        """Invalidate cache after model updates"""
        # Clear all poem and theme analysis caches when model is updated
        patterns = [
            f"{self.redis.cache_prefix}poem:*",
            f"{self.redis.cache_prefix}theme_analysis:*",
        ]
        
        results = []
        for pattern in patterns:
            results.append(self.invalidate_by_pattern(pattern))
        
        logger.info(f"Invalidated cache after model update to version: {model_version}")
        return all(results)


# Initialize cache manager (will be configured via environment variables)
def get_cache_manager() -> Optional[RedisCacheManager]:
    """Get configured cache manager"""
    try:
        redis_endpoint = os.environ.get('REDIS_ENDPOINT')
        if not redis_endpoint:
            logger.warning("Redis endpoint not configured, caching disabled")
            return None
        
        return RedisCacheManager(redis_endpoint)
    except Exception as e:
        logger.error(f"Failed to initialize cache manager: {e}")
        return None


def get_poem_cache_manager() -> Optional[PoemCacheManager]:
    """Get poem cache manager"""
    cache_manager = get_cache_manager()
    if cache_manager:
        return PoemCacheManager(cache_manager)
    return None


# Example usage in Lambda functions
def cached_poem_generation(inputs: Dict[str, str], cache_manager: PoemCacheManager):
    """Example of cached poem generation"""
    # Check cache first
    cached_poem = cache_manager.get_cached_poem(inputs)
    if cached_poem:
        return {
            'statusCode': 200,
            'body': json.dumps({
                'poem': cached_poem,
                'cached': True,
                'cache_timestamp': datetime.now().isoformat()
            })
        }
    
    # Generate new poem (your existing logic here)
    # poem_data = generate_poem_logic(inputs)
    
    # Cache the result
    # cache_manager.cache_poem(inputs, poem_data)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'poem': {},  # poem_data,
            'cached': False,
            'generation_timestamp': datetime.now().isoformat()
        })
    }
