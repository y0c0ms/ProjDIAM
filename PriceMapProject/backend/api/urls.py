from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, 
    PriceInfoViewSet, 
    CommentViewSet, 
    UserRegistrationView, 
    UserLoginView, 
    get_csrf_token
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'prices', PriceInfoViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls')),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('csrf/', get_csrf_token, name='csrf'),
] 