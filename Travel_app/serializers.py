from rest_framework import serializers
from .models import Department, Manager, Admin, Employee, TicketRequest

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = '__all__'


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class ManagerNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = ["id", "first_name","last_name"]

class EmployeeNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["id", "first_name","last_name"]

class TicketRequestSerializer(serializers.ModelSerializer):
    # employee = EmployeeNameSerializer(read_only=True)  # Nested Employee Data
    # employee_id = serializers.PrimaryKeyRelatedField
    class Meta:
        model = TicketRequest
        fields = '__all__'

class ManagerRequestHistorySerializer(serializers.ModelSerializer):
    employee = EmployeeNameSerializer(read_only=True)  # Nested Employee Data
    request_id = serializers.IntegerField(source="id")

    class Meta:
        model = TicketRequest
        fields = [
            "request_id",
            "employee",
            "manager",
            "from_location",
            "to_location",
            "preferred_mode_of_travel",
            "travel_from",
            "travel_to",
            "manager_status",
            "purpose_of_travel",
            "admin_status",
            "employee_status",
            "employee_response_to_manager"
        ]


class EmployeeRequestHistorySerializer(serializers.ModelSerializer):
    manager = ManagerNameSerializer(read_only=True)
    employee= EmployeeNameSerializer(read_only=True)
    request_id = serializers.IntegerField(source="id")

    class Meta:
        model = TicketRequest
        fields = [
            "request_id",
            "manager",
            "employee",
            "from_location",
            "to_location",
            "preferred_mode_of_travel",
            "is_lodging_required",
            "travel_from",
            "travel_to",
            "manager_status",
            "admin_status",
            "manager_additional_request",
            "manager_note",
            "admin_note",
            "purpose_of_travel",
            "apply_date",
            "preferred_lodge",
            "employee_response_to_admin",
            "employee_response_to_manager"
        ]


class ManagerDetailsSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source="department.name")  # Fetch Department Name
    email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        model = Manager
        fields = ["id", "first_name", "last_name", "email", "department"]

class EmployeeDetailsSerializer(serializers.ModelSerializer):
    manager_id = serializers.IntegerField(source="manager.id", read_only=True)
    manager_name = serializers.CharField(source="manager.first_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True) 

    class Meta:
        model = Employee
        fields = ["id", "first_name", "last_name", "email", "manager_id","manager_name"] 