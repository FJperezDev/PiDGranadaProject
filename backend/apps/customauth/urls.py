from django.urls import path
from rest_framework import routers
from .views import TeacherViewSet, RegisterView, LogoutView, LoggedUserView, LoginView, ChangePasswordView
from django.conf import settings
from django.conf.urls.static import static

# from django.contrib.auth.views import LoginView, LogoutView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = 'customauth'
router = routers.DefaultRouter()

# ViewSet for User model
router.register(r'users', TeacherViewSet, basename='user')

urlpatterns = router.urls

urlpatterns += [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]

urlpatterns += [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]

urlpatterns += [
    path('register/', RegisterView.as_view(), name='register'),
]

urlpatterns += [
    path('account/profile/', LoggedUserView.as_view(), name='profile'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# This will automatically create the URL patterns for the ProjectViewSet, allowing CRUD operations on the Project model.
