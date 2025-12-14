from django.db import models

class TaxRecord(models.Model):
    year = models.IntegerField()
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    vin = models.CharField(max_length=17)
    sbs_sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sbs_tax_collected = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sbs_pnl = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Tax Info: {self.vin}"