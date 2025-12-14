from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SoldVehicleViewSet
from .dashboard_views import dashboard_stats  # <--- Import from your new file

router = DefaultRouter()
router.register(r'records', SoldVehicleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', dashboard_stats),  # The endpoint remains the same
]