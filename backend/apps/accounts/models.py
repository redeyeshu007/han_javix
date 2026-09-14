from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model for Handoverly AI.
    Currently minimal, but prepares for future role/company relationships.
    """
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'Super Admin'),
        ('BUILDER_OWNER', 'Builder Owner'),
        ('PROJECT_ADMIN', 'Project Admin'),
        ('SITE_ENGINEER', 'Site Engineer'),
        ('ACCOUNTS', 'Accounts'),
        ('CONTRACTOR', 'Contractor'),
        ('CUSTOMER', 'Customer'),
        ('ASSOCIATION_REPRESENTATIVE', 'Association Representative'),
    ]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='CUSTOMER')

    def save(self, *args, **kwargs):
        if self.is_superuser and self.role == 'CUSTOMER':
            self.role = 'SUPER_ADMIN'
        super().save(*args, **kwargs)

    builder_company = models.ForeignKey(
        'builders.BuilderCompany',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff'
    )
    assigned_projects = models.ManyToManyField(
        'projects.Project', blank=True, related_name='assigned_staff'
    )
    phone = models.CharField(max_length=20, blank=True)
    trade = models.CharField(max_length=120, blank=True)
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username
