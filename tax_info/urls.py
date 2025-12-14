from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaxRecordViewSet

router = DefaultRouter()
router.register(r'records', TaxRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]