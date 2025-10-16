from django.contrib import admin
from .models import CustomUser

# Register your models here.

# The CustomUser model is registered to allow management through the admin interface.
admin.site.register(CustomUser)