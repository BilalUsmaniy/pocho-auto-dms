from django.contrib import admin
from .models import VehicleInventory, VehicleExpense


class ExpenseInline(admin.TabularInline):
    model = VehicleExpense
    extra = 1


@admin.register(VehicleInventory)
class VehicleInventoryAdmin(admin.ModelAdmin):
    list_display = ('year', 'make', 'model', 'status', 'purchase_price', 'total_expenses', 'net_cost')

    # UPDATE THIS LINE:
    list_editable = ('status', 'purchase_price')

    inlines = [ExpenseInline]
    list_filter = ('status', 'make')
    search_fields = ('vin', 'make', 'model')