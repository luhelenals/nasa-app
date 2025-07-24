from django.db import models
from datetime import date

# Create your models here.
class Asteroid(models.Model):
    name = models.CharField(max_length=255)
    estimated_diameter_min_meters = models.FloatField()
    estimated_diameter_max_meters = models.FloatField()
    relative_velocity_km_per_second = models.FloatField()
    absolute_magnitude_h = models.FloatField()
    is_potentially_hazardous_asteroid = models.BooleanField()
    is_sentry_object = models.BooleanField()
    imported_date = models.DateField(default=date.today)

    def __str__(self):
        return self.name