from django.contrib import admin
from .models import TaxRecord

@admin.register(TaxRecord)
class TaxRecordAdmin(admin.ModelAdmin):
    list_display = ('vin', 'year', 'make', 'sbs_sale_price', 'sbs_tax_collected', 'sbs_pnl')
    search_fields = ('vin', 'make')