from django.core.management.base import BaseCommand
from django.conf import settings
import redis
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Check Redis connection"

    def handle(self, *args, **options):
        redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
        try:
            r = redis.from_url(redis_url)
            r.ping()
            self.stdout.write(self.style.SUCCESS("Redis connection: OK"))
        except redis.ConnectionError as e:
            self.stderr.write(self.style.ERROR("Redis connection: FAILED"))
            logger.error(f"Redis connection failed: {str(e)}")
        except Exception as e:
            self.stderr.write(self.style.ERROR("Redis connection: FAILED"))
            logger.error(f"Unexpected Redis error: {str(e)}")
