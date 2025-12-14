# python manage.py clear_inventory


from django.core.management.base import BaseCommand
from inventory.models import VehicleInventory


class Command(BaseCommand):
    help = 'Deletes ALL vehicles from inventory'

    def handle(self, *args, **kwargs):
        count = VehicleInventory.objects.count()
        VehicleInventory.objects.all().delete()

        self.stdout.write(self.style.WARNING(f'Successfully deleted {count} vehicles from inventory.'))