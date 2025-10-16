from django.urls import path
from rest_framework import routers
from .views import UserViewSet, RegisterView, LogoutView, LoggedUserView, LoginView, LogoutAllView

# from django.contrib.auth.views import LoginView, LogoutView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()

# ViewSet for User model
router.register(r'users', UserViewSet, basename='user')

urlpatterns = router.urls

urlpatterns += [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]

urlpatterns += [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('logout_all/', LogoutAllView.as_view(), name='logout_all'),
]

urlpatterns += [
    path('register/', RegisterView.as_view(), name='register'),
]

urlpatterns += [
    path('account/profile/', LoggedUserView.as_view(), name='profile'),
]


# This will automatically create the URL patterns for the ProjectViewSet, allowing CRUD operations on the Project model.