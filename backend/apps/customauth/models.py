from django.contrib.auth.models import AbstractUser, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.apps import apps

class CustomTeacher(AbstractUser):
    username = models.CharField(max_length=100, blank=True, unique=True)
    email = models.EmailField(unique=True)
    is_super = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username sigue siendo obligatorio si usas AbstractUser

    def save(self, *args, **kwargs):

        if self.is_super:
            self.is_superuser = True
            self.is_staff = True
        else:
            self.is_staff = True
            self.is_superuser = False

        super().save(*args, **kwargs)

        # After saving we add view only permissions
        if not self.is_super:
            self.user_permissions.clear()  # Clear permissions

            for model in apps.get_models():
                ct = ContentType.objects.get_for_model(model)
                try:
                    perm = Permission.objects.get(
                        content_type=ct,
                        codename=f'view_{model._meta.model_name}'
                    )
                    self.user_permissions.add(perm)
                except Permission.DoesNotExist:
                    continue 

    def __str__(self):
        return self.username
