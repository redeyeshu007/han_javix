from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Check database connection"

    def handle(self, *args, **options):
        db_conn = connections['default']
        try:
            c = db_conn.cursor()
            c.execute("SELECT 1;")
            c.fetchone()
            
            host = db_conn.settings_dict.get('HOST', 'Unknown')
            port = db_conn.settings_dict.get('PORT', 'Unknown')
            engine = db_conn.settings_dict.get('ENGINE', 'Unknown').split('.')[-1]
            
            if engine == 'postgresql':
                engine_name = 'PostgreSQL'
            else:
                engine_name = engine
                
            self.stdout.write(self.style.SUCCESS("Database connection: OK"))
            self.stdout.write(f"Database engine: {engine_name}")
            self.stdout.write(f"Database host: {host}")
            self.stdout.write(f"Database port: {port}")
            
        except OperationalError as e:
            self.stderr.write(self.style.ERROR("Database connection: FAILED"))
            logger.error(f"Database connection failed: {str(e)}")
        except Exception as e:
            self.stderr.write(self.style.ERROR("Database connection: FAILED"))
            logger.error(f"Unexpected error: {str(e)}")
