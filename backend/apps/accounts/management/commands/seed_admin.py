from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Seeds the initial Super Admin account for development.'

    def handle(self, *args, **options):
        User = get_user_model()
        
        email = 'admin@handoverly.com'
        # Defaulting username to email
        username = 'admin@handoverly.com'
        password = 'Admin@1234'
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Super Admin account "{email}" already exists. Skipping.'))
            return
        
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING('A Super Admin account already exists in the system. Skipping creation to avoid duplicates.'))
            return

        try:
            # Create the superuser
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created Super Admin account: {email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to create Super Admin account: {e}'))
