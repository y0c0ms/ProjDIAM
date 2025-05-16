'''
Code made by:
- Manuel Santos nº 111087
- Alexandre Mendes nº 111026
- Vlad Ganta nº 110672
'''

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, 
    PriceInfoViewSet, 
    CommentViewSet, 
    UserRegistrationView, 
    UserLoginView, 
    UserProfileView,
    UserViewSet,
    get_csrf_token
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'prices', PriceInfoViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/token-login/', UserLoginView.as_view(), name='token_login'),
    path('auth/user/', UserProfileView.as_view(), name='user_profile'),
    path('auth/profile/update/', UserProfileView.as_view(), name='update_profile'),
    path('csrf/', get_csrf_token, name='csrf'),
] 