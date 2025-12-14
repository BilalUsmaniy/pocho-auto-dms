from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'vehicles', InventoryViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]