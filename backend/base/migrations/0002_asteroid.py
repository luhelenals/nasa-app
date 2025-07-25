# Generated by Django 5.2.4 on 2025-07-24 21:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Asteroid',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('estimated_diameter_min_meters', models.FloatField()),
                ('estimated_diameter_max_meters', models.FloatField()),
                ('relative_velocity_km_per_second', models.FloatField()),
                ('absolute_magnitude_h', models.FloatField()),
                ('is_potentially_hazardous_asteroid', models.BooleanField()),
                ('is_sentry_object', models.BooleanField()),
                ('date', models.DateField()),
            ],
        ),
    ]
