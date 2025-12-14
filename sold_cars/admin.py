from django.contrib import admin
from .models import SoldVehicle

@admin.register(SoldVehicle)
class SoldVehicleAdmin(admin.ModelAdmin):
    list_display = ('sale_date', 'year', 'make', 'model', 'customer_name', 'sale_price', 'profit')
    list_filter = ('make', 'sale_date')
    search_fields = ('vin', 'customer_name', 'make', 'model')