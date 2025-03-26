from django.db import models
from datetime import date
from django.contrib.auth.models import User

STATUS_CHOICES = (
    ("Active", "Active"),
    ("Inactive", "Inactive")
)

MANAGER_REQUEST_STATUS = (
    ('Additional Info','Additional Info'),
    ("Approved", "Approved"),
    ("Rejected", "Rejected"),
    ("Not Responded", "Not Responded")
)

MODE_OF_TRAVEL = (
    ("Bus", "Bus"),
    ("Train", "Train"),
    ("Flight", "Flight"),
    ("Ship", "Ship")
)
ADMIN_STATUS=(
    ("Open", "Open"),
    ("Closed", "Closed"),
    ('Requested Info',"Requested Info")
)

EMPLOYEE_STATUS_CHOICES = [
        ("applied", "Applied"),
        ("canceled", "Canceled"),
        ("resubmitted","Resubmitted")
    ]


class Department(models.Model):
    name = models.CharField(max_length=100) #required

class Manager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to User model
    department = models.ForeignKey(Department, on_delete=models.CASCADE)  # Required
    date_of_joining = models.DateField(default=date.today)
    first_name = models.CharField(max_length=30)  # Required
    last_name = models.CharField(max_length=30)  # Required
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to User model
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    date_of_joining = models.DateField(default=date.today)
    first_name = models.CharField(max_length=30)  # Required
    last_name = models.CharField(max_length=30)  # Required
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")

class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to User model
    date_of_joining = models.DateField(default=date.today)
    first_name = models.CharField(max_length=30)  # Required
    last_name = models.CharField(max_length=30)  # Required
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")



class TicketRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE) #required
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE) #required
    apply_date = models.DateField(auto_now_add=True)
    request_updation_date = models.DateField(auto_now=True)

    from_location = models.CharField(max_length=200) #required
    to_location = models.CharField(max_length=200) #required
    travel_from = models.DateField() #required
    travel_to = models.DateField() #required
    preferred_mode_of_travel = models.CharField(max_length=30, choices=MODE_OF_TRAVEL, default="Flight")
    is_lodging_required = models.BooleanField(default=False)
    preferred_lodge = models.CharField(max_length=200, blank=True, null=True)
    purpose_of_travel = models.TextField() #required
    employee_status = models.CharField(max_length=15, choices=EMPLOYEE_STATUS_CHOICES, default="applied")  # New field

    manager_status = models.CharField(max_length=20, choices=MANAGER_REQUEST_STATUS, default="Not Responded")
    manager_note = models.TextField(blank=True, null=True)
    manager_additional_request = models.TextField(blank=True, null=True)

    admin_status = models.CharField(max_length=20,choices=ADMIN_STATUS,default="Open")
    admin_note = models.TextField(blank=True, null=True)
    employee_response_to_admin = models.TextField(blank=True, null=True) 

    employee_response_to_manager = models.TextField(blank=True, null=True)  
