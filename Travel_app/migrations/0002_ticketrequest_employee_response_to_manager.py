# Generated by Django 4.2 on 2025-03-14 02:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Travel_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticketrequest',
            name='employee_response_to_manager',
            field=models.TextField(blank=True, null=True),
        ),
    ]
