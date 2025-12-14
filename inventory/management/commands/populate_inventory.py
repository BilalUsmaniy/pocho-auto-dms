
# python manage.py populate_inventory

import random
import string
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from inventory.models import VehicleInventory


class Command(BaseCommand):
    help = 'Adds 15 random cars to the inventory'

    def handle(self, *args, **kwargs):
        makes_models = {
            'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
            'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
            'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
            'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape'],
            'Chevrolet': ['Silverado', 'Malibu', 'Equinox', 'Tahoe'],
            'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE']
        }

        locations = ['Lot A', 'Lot B', 'Showroom', 'Warehouse', 'Front Line']
        auctions = ['Manheim', 'Copart', 'Adesa', 'CarMax Auction']

        for i in range(15):
            make = random.choice(list(makes_models.keys()))
            model = random.choice(makes_models[make])
            year = random.randint(2015, 2025)

            # Generate random VIN (17 chars)
            vin = ''.join(random.choices(string.ascii_uppercase + string.digits, k=17))

            odometer = random.randint(5000, 150000)
            price = random.randint(5000, 55000)

            # Random date within last 30 days
            purchase_date = date.today() - timedelta(days=random.randint(1, 30))

            VehicleInventory.objects.create(
                year=year,
                make=make,
                model=model,
                vin=vin,
                odometer=odometer,
                purchase_price=price,
                status='READY',
                location=random.choice(locations),
                auction_name=random.choice(auctions),
                purchase_date=purchase_date
            )

        self.stdout.write(self.style.SUCCESS('Successfully added 15 random cars!'))