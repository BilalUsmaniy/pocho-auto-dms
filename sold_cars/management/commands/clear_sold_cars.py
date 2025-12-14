# python manage.py clear_sold_cars

from django.core.management.base import BaseCommand
from sold_cars.models import SoldVehicle


class Command(BaseCommand):
    help = 'Deletes ALL sold vehicle records'

    def handle(self, *args, **kwargs):
        count = SoldVehicle.objects.count()
        # Delete all records
        SoldVehicle.objects.all().delete()

        self.stdout.write(self.style.WARNING(f'Successfully deleted {count} sold vehicle records.'))