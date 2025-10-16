from django.contrib import admin
from .models import CustomTeacher

# Register your models here.

# The CustomUser model is registered to allow management through the admin interface.
admin.site.register(CustomTeacher)