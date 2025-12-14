# python manage.py populate_sold
# python manage.py clear_sold_cars


import random
import string
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from sold_cars.models import SoldVehicle


class Command(BaseCommand):
    help = 'Adds 50 random records to Sales History'

    def handle(self, *args, **kwargs):
        makes_models = {
            'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
            'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
            'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3'],
            'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'S-Class'],
            'Ford': ['F-150', 'Mustang', 'Explorer'],
            'Chevrolet': ['Silverado', 'Malibu', 'Corvette'],
            'Audi': ['A4', 'A6', 'Q5', 'Q7'],
            'Lexus': ['RX 350', 'ES 350', 'IS 300']
        }

        customers = ['John Doe', 'Alice Smith', 'Bob Johnson', 'Emma Brown', 'Michael Lee', 'Sarah Wilson',
                     'David Clark']
        auctions = ['Manheim', 'Copart', 'Adesa', 'CarMax Auction']

        for i in range(50):
            # 1. Vehicle Details
            make = random.choice(list(makes_models.keys()))
            model = random.choice(makes_models[make])
            year = random.randint(2015, 2025)
            vin = ''.join(random.choices(string.ascii_uppercase + string.digits, k=17))
            odometer = random.randint(10000, 120000)

            # 2. Financials (Random logic to ensure profit)
            purchase_price = random.randint(5000, 45000)
            expenses = random.randint(0, 2000)
            net_cost = purchase_price + expenses

            # Profit between $500 and $5000
            profit_margin = random.randint(500, 5000)
            sale_price = net_cost + profit_margin

            # Tax (approx 8%)
            tax_amount = round(sale_price * 0.08, 2)

            # 3. Dates
            days_ago_sold = random.randint(1, 60)  # Sold in last 2 months
            sale_date = date.today() - timedelta(days=days_ago_sold)

            # Bought 10-30 days before selling
            purchase_date = sale_date - timedelta(days=random.randint(10, 30))

            # 4. Create Record
            SoldVehicle.objects.create(
                year=year,
                make=make,
                model=model,
                vin=vin,
                odometer=odometer,

                # Origin Info
                original_purchase_date=purchase_date,
                auction_name=random.choice(auctions),

                # Money
                purchase_price=purchase_price,
                total_expenses=expenses,
                net_cost=net_cost,
                sale_price=sale_price,
                tax_amount=tax_amount,
                profit=profit_margin,

                # Sale Info
                sale_date=sale_date,
                customer_name=random.choice(customers)
            )

        self.stdout.write(self.style.SUCCESS('Successfully added 50 sold cars!'))