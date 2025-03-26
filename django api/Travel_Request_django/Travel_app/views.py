from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from django.db.models import Q
from django.contrib.auth.models  import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from .permissions import IsManager,IsAdmin, IsEmployee
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_user_counts(request):
    manager_count = User.objects.filter(is_staff=True).count()
    employee_count = User.objects.filter(is_superuser=False, is_staff=False).count()
    department_count = Department.objects.all().count()

    data = [
        {"key": "managers", "value": manager_count},
        {"key": "employees", "value": employee_count},
        {"key": "departments", "value": department_count}
    ]

    return Response(data)



@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAdmin])
def create_entity(request):
    """
    Creates a new entity (Department, Employee, Manager, or Admin).
    """
    creation_data=request.data
    entity_type = creation_data.get("type")
    logger.info(f"Received request to create a new entity of type: {entity_type}")

    if entity_type == "department":
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Department created successfully.")
            return Response({"message": "Department added successfully"}, HTTP_200_OK)
        logger.warning("Department creation failed due to validation errors.")
        return Response(serializer.errors, HTTP_400_BAD_REQUEST)

    elif entity_type in ["employee", "manager", "admin"]:
        # Step 1: Create a User instance
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response({"error": "Username, email, and password are required"}, HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            logger.warning(f"Username '{username}' already exists.")
            return Response({"error": "Username already exists"}, HTTP_400_BAD_REQUEST)

        # Create User instance
        user = User.objects.create_user(username=username, email=email, password=password)
        logger.info(f"User '{username}' created successfully.")

        # Set permissions based on entity type
        if entity_type == "admin":
            user.is_superuser = True
            user.is_staff = False
        elif entity_type == "manager":
            user.is_staff = True
        else:  
            user.is_superuser = False
            user.is_staff = False

        user.save()

        # Step 2: Link User with Employee/Manager/Admin model
        extra_data = request.data.copy()
        extra_data["user"] = user.id  # Associate user with the entity

        serializer_class = {
            "employee": EmployeeSerializer,
            "manager": ManagerSerializer,
            "admin": AdminSerializer,
        }.get(entity_type)

        serializer = serializer_class(data=extra_data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"{entity_type.capitalize()} added successfully"}, HTTP_200_OK)
        else:
            user.delete()  # Delete user if entity creation fails
            logger.error(f"Failed to create {entity_type.capitalize()} '{username}' due to validation errors.")
            return Response(serializer.errors, HTTP_400_BAD_REQUEST)

    logger.error(f"Invalid entity type: {entity_type}.")
    return Response({"error": "Invalid type. Use department, employee, manager, or admin."}, HTTP_400_BAD_REQUEST)
    
@api_view(["POST"])
def login(request):
    """
    Handles user authentication and ensures login based on selected role.
    """
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")  # Role from frontend (employee, manager, admin)

    if not username or not password or not role:
        logger.warning("Login attempt failed: Missing username, password, or role.")
        return Response({"error": "Please provide username, password, and role"}, status=HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        logger.warning(f"Login failed for username: {username}. Invalid credentials.")
        return Response({"error": "Invalid credentials"}, status=HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        logger.warning(f"Login attempt failed: Inactive account for username: {username}.")
        return Response({"error": "Account is inactive. Please contact admin."}, status=HTTP_401_UNAUTHORIZED)

    # Role-based authentication
    if role == "employee" and not hasattr(user, "employee"):
        return Response({"error": "You are not an employee."}, status=HTTP_403_FORBIDDEN)

    if role == "manager" and not hasattr(user, "manager"):
        return Response({"error": "You are not a manager."}, status=HTTP_403_FORBIDDEN)

    if role == "admin" and not user.is_superuser:
        return Response({"error": "You are not an admin."}, status=HTTP_403_FORBIDDEN)

    # Get or create authentication token
    token, _ = Token.objects.get_or_create(user=user)

    logger.info(f"User '{username}' logged in successfully as {role}.")
    return Response({"token": token.key, "role": role}, status=HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logs out the authenticated user by deleting their authentication token.
    """
    request.user.auth_token.delete()
    logger.info(f"User '{request.user.username}' logged out successfully.")
    return Response({"message": "Successfully logged out"}, status=HTTP_200_OK)

@api_view(['GET'])
def get_managers(request):
    """
    Retrieves a list of all managers from the Manager table.
    """
    managers = Manager.objects.select_related("user").values('id', 'user__username')
    return Response(managers, status=HTTP_200_OK)

@api_view(['GET'])
def get_department(request):
    """
    Retrieves a list of all managers.
    """
    dept=Department.objects.all() 
    serializer = DepartmentSerializer(dept,many=True)
    print(serializer)
    return Response(serializer.data, status=HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsEmployee])
def create_request(request):
    """
    Allows an employee to create a new travel request.
    """
    try:
        # Get the logged-in employee
        employee = Employee.objects.get(user=request.user)
        logger.info(f"Employee '{request.user.username}' is creating a new travel request.")

    except Employee.DoesNotExist:
        logger.error(f"Employee record not found for user '{request.user.username}'.")
        return Response({"error": "Employee record not found."}, status=HTTP_400_BAD_REQUEST)
    
    # Get the manager from the employee record
    manager = employee.manager
    request_data = request.data.copy()
    request_data["employee"] = employee.id
    request_data["manager"] = manager.id
    logger.info(f"Request Data: {request_data}") #log the request data.

    serializer = TicketRequestSerializer(data=request_data)
    if serializer.is_valid():
        ticket_request=serializer.save()
        logger.info(f"Travel request {ticket_request.id} created successfully by '{request.user.username}'.")
        # Send email to Manager
        send_notification_email(
            "New Travel Request Submitted",
            ticket_request.manager.user.email,
            "emails/new_request_email.html",
            {"manager_name": ticket_request.manager.first_name,  # Pass manager's name
             "employee_name": ticket_request.employee.first_name,  # Pass employee's name
             "request_details": f"From: {ticket_request.from_location} to {ticket_request.to_location}, Dates: {ticket_request.travel_from} - {ticket_request.travel_to}"
            }
                )
        return Response({
            "message":"Form data added successfully"
        },HTTP_200_OK)
    else:
        logger.warning(f"Validation failed for travel request by '{request.user.username}': {serializer.errors}")
        return Response(serializer.errors,HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsEmployee])
def employee_request_history(request):
    """
    Retrieves the request history for an employee.
    """
    employee = request.user.employee 
    history_list = TicketRequest.objects.filter(employee=employee).select_related("manager")
    serializer = EmployeeRequestHistorySerializer(history_list, many=True)
    logger.info(f"Fetching request history for employee '{request.user.username}'.")
    return Response(serializer.data,HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsEmployee])
def retrieve_request(request, request_id):
    """
    Retrieves a specific travel request for an employee.
    """
    try:
        ticket_request = get_object_or_404(TicketRequest, id=request_id, employee=request.user.employee)
        print(f"Request found: {ticket_request}")  # Debugging
        logger.info(f"Employee '{request.user.username}' retrieved request ID {request_id}.")
        serializer = EmployeeRequestHistorySerializer(ticket_request)
        return Response(serializer.data, HTTP_200_OK)
    except Exception as e:
        print(f"Error: {e}")  # Debugging
        logger.error(f"Error retrieving request ID {request_id} for '{request.user.username}': {str(e)}")
        return Response({"error": "Request not found."}, status=HTTP_400_BAD_REQUEST)



@api_view(["PUT"])
@permission_classes([IsEmployee])
def edit_request(request, request_id):
    """Allows an employee to edit a request before manager's response (Pending state only)"""
    ticket_request = get_object_or_404(TicketRequest, id=request_id, employee=request.user.employee)

    if ticket_request.manager_status != "Not Responded":
        logger.warning(f"Employee '{request.user.username}' attempted to edit request ID {request_id}, but it's already processed.")
        return Response({"error": "Request cannot be edited at this stage"}, status=HTTP_400_BAD_REQUEST)

    serializer = TicketRequestSerializer(ticket_request, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        logger.info(f"Employee '{request.user.username}' successfully edited request ID {request_id}.")
        return Response({"message": "Request updated successfully"}, status=HTTP_200_OK)
    
    send_notification_email(
            "Travel Request Updated",
            ticket_request.manager.user.email,
            "emails/request_updated_email.html",
            {
                "ticket_request": ticket_request,
                "employee_name": f"{ticket_request.employee.first_name} {ticket_request.employee.last_name}",
                "manager_name": f"{ticket_request.manager.first_name} {ticket_request.manager.last_name}",
            },
        )
    logger.warning(f"Validation failed while '{request.user.username}' attempted to edit request ID {request_id}: {serializer.errors}")
    return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([IsEmployee])
def cancel_request(request, request_id):
    """
    Allows an employee to cancel a travel request.
    """
    ticket_request = TicketRequest.objects.get(id=request_id, employee=request.user.employee)

    if ticket_request.manager_status in ["approved", "rejected"]:
        logger.warning(f"Employee '{request.user.username}' attempted to cancel request ID {request_id}, but it's already processed.")
        return Response({"error": "Request cannot be cancelled as it is already processed"}, status=HTTP_400_BAD_REQUEST)

    ticket_request.employee_status = "cancelled"
    ticket_request.save()
    logger.info(f"Employee '{request.user.username}' successfully canceled request ID {request_id}.")

    return Response({"message": "Request canceled successfully"}, status=HTTP_200_OK)   


@api_view(["PUT"])
@permission_classes([IsEmployee])
def resubmit_request(request, request_id):
        """
        Allows an employee to resubmit a travel request after making required edits.
        """
        ticket_request = TicketRequest.objects.get(id=request_id, employee=request.user.employee)

        if ticket_request.manager_status != "Additional Info":
            logger.warning(f"Employee '{request.user.username}' attempted to resubmit request ID {request_id}, but it's not in 'Additional Info' state.")
            return Response({"error": "Request cannot be resubmitted at this stage"}, status=HTTP_400_BAD_REQUEST)

        serializer = TicketRequestSerializer(ticket_request, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(employee_status="resubmitted")
            employee_response = request.data.get("employee_response_to_manager", "")
            send_notification_email(
            subject="Travel Request Resubmitted",
            recipient_email=ticket_request.manager.user.email,
            template_name="emails/resubmitted_request_email.html",
            context={
                "ticket_request": ticket_request,
                "employee_name": f"{ticket_request.employee.first_name} {ticket_request.employee.last_name}",
                "manager_name": f"{ticket_request.manager.first_name} {ticket_request.manager.last_name}",
                "employee_response": employee_response,
            }
        )
            logger.info(f"Employee '{request.user.username}' successfully resubmitted request ID {request_id}.")
            return Response({"employee_response_to_manager":request.data.get("employee_response_to_manager")}, status=HTTP_200_OK)
        
        logger.warning(f"Validation failed while '{request.user.username}' attempted to resubmit request ID {request_id}: {serializer.errors}")
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsEmployee]) 
def employee_reply_to_admin(request, request_id):
    """
    Allows an employee to reply to an admin's request for additional information.
    """
    ticket_request = get_object_or_404(TicketRequest, id=request_id)

    if ticket_request.admin_status != "Requested Info":
        logger.warning(f"Employee '{request.user.username}' attempted to reply to admin for request ID {request_id}, but it's not in 'Requested Info' state.")
        return Response(
            {"error": "You can only reply when admin requested additional info"},
            status=HTTP_400_BAD_REQUEST
        )

    employee_response = request.data.get("employee_response", "").strip()

    if not employee_response:
        logger.warning(f"Employee '{request.user.username}' attempted to reply to admin for request ID {request_id}, but no response was provided.")
        return Response(
            {"error": "Please provide your response"},
            status=HTTP_400_BAD_REQUEST
        )

    ticket_request.employee_response_to_admin = employee_response
    ticket_request.admin_status = "Open"  
    ticket_request.save()

    send_notification_email(
        subject="Employee Response to Requested Information",
        recipient_email="admin1@example.com", 
        template_name="emails/employee_response_admin.html",
        context={
            "admin_name": "Admin", 
            "employee_name": f"{ticket_request.employee.first_name} {ticket_request.employee.last_name}",
            "employee_response": employee_response,
            "ticket_id": ticket_request.id,
        }
    )
    logger.info(f"Employee '{request.user.username}' replied to admin for request ID {request_id}.")
    return Response(
        {"message": "Response submitted to admin"},
        status=HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsManager])
def manager_request_history(request):
    """
    Retrieves the request history for a manager with optional filters and sorting.
    """
    logger.info(f"User: {request.user}, Authenticated: {request.user.is_authenticated}, Staff: {request.user.is_staff}")

    manager = request.user.manager
    data = request.data 

    search_query = data.get("search", "")
    status_filter = data.get("status", "")
    from_date = data.get("from_date", "")
    to_date = data.get("to_date", "")
    sort_by = data.get("sort_by", "")

    history_list = TicketRequest.objects.filter(manager=manager).select_related("employee")
    logger.info(f"Manager '{request.user.username}' is retrieving request history.")

    # Search by employee name
    if search_query:
        history_list = history_list.filter(
            Q(employee__first_name__icontains=search_query) | 
            Q(employee__last_name__icontains=search_query)
        )
        if not history_list.exists():
            logger.info(f"Manager '{request.user.username}' searched for '{search_query}', but no results found.")
            return Response({"message": "No requests found for the searched employee."}, HTTP_200_OK)

    # Filter by status
    if status_filter:
        history_list = history_list.filter(manager_status=status_filter)
        if not history_list.exists():
            logger.info(f"Manager '{request.user.username}' filtered by status '{status_filter}', but no results found.")
            return Response({"message": "No requests available for the selected status."}, HTTP_200_OK)
    # Filter by date range
    if from_date and to_date:
        history_list = history_list.filter(travel_from__gte=from_date, travel_to__lte=to_date)
    elif from_date:
        history_list = history_list.filter(travel_from__gte=from_date)
    elif to_date:
        history_list = history_list.filter(travel_to__lte=to_date)
        if not history_list.exists():
            logger.info(f"Manager '{request.user.username}' filtered by date range '{from_date} to {to_date}', but no results found.")
            return Response({"message": "No requests found within the selected date range."}, HTTP_200_OK)
    # Sorting
    sort_options = {
        "name_asc": "employee__first_name",
        "name_desc": "-employee__first_name",
        "date_asc": "travel_from",
        "date_desc": "-travel_from",
    }
    
    if sort_by in sort_options:
        history_list = history_list.order_by(sort_options[sort_by])

    serializer = ManagerRequestHistorySerializer(history_list, many=True)
    return Response(serializer.data,HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsManager])
def manager_view_request(request, request_id):
    """
    Allows a manager to view details of a specific travel request.
    """
    ticket_request = get_object_or_404(TicketRequest, id=request_id, manager=request.user.manager)
    serializer = EmployeeRequestHistorySerializer(ticket_request)
    logger.info(f"Manager '{request.user.username}' viewed request ID {request_id}.")
    return Response(serializer.data, HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsManager])  
def process_travel_request(request, request_id):
    """Allows the manager to approve, reject, or request more info for a travel request."""
    ticket_request = get_object_or_404(TicketRequest, id=request_id)

    # If request is already processed, do not allow additional request info
    if ticket_request.manager_status in ["Approved", "Rejected"] or ticket_request.admin_status == "Closed":
        return Response(
            {"error": "This request is already processed and cannot request additional information."},
            status=HTTP_400_BAD_REQUEST
        )

    if ticket_request.employee_status.lower() == "cancelled":
        logger.warning(f"Manager '{request.user.username}' attempted to process a canceled request ID {request_id}.")
        return Response({"error": "This request has been canceled by the employee and cannot be processed."},
                        status=HTTP_400_BAD_REQUEST)

    action = request.data.get("action")  
    note = request.data.get("note", "").strip()
    additional_request = request.data.get("additional_request", "").strip()  

    if action not in ["approve", "reject", "request_more_info"]:
        logger.warning(f"Manager '{request.user.username}' provided an invalid action '{action}' for request ID {request_id}.")
        return Response({"error": "Invalid action. Choose 'approve', 'reject', or 'request_more_info'"},
                        status=HTTP_400_BAD_REQUEST)

    # Define email details
    email_context = {
        "ticket_request": ticket_request,
        "manager_name": f"{request.user.first_name} {request.user.last_name}",
        "employee_name": f"{ticket_request.employee.first_name} {ticket_request.employee.last_name}",
        "note": note,
        "additional_request": additional_request,
    }

    if action == "approve":
        ticket_request.manager_status = "Approved"
        ticket_request.manager_note = note
        ticket_request.manager_additional_request = None  # Clear additional request
        
        subject = "Your Travel Request has been Approved"
        employee_template = "emails/approved_email.html"
        admin_subject = "A Travel Request has been Approved"
        admin_template = "emails/approved_request_admin.html"

        logger.info(f"Manager '{request.user.username}' approved request ID {request_id}.")
    elif action == "reject":
        ticket_request.manager_status = "Rejected"
        ticket_request.manager_note = note
        ticket_request.manager_additional_request = None  # Clear additional request
        
        subject = "Your Travel Request has been Rejected"
        employee_template = "emails/rejected_email.html"

        logger.info(f"Manager '{request.user.username}' rejected request ID {request_id}.")

    elif action == "request_more_info":
        ticket_request.manager_status = "Additional Info"
        ticket_request.manager_additional_request = additional_request
        ticket_request.manager_note = None  # Clear manager note
        
        subject = "Additional Information Required for Your Travel Request"
        employee_template = "emails/request_more_info_email.html"

        logger.info(f"Manager '{request.user.username}' requested more info for request ID {request_id}.")
    ticket_request.save()

    # Send email to the employee
    send_notification_email(
        subject=subject,
        recipient_email=ticket_request.employee.user.email,
        template_name=employee_template,
        context=email_context
    )

    # Send email to the admin
    if action in ["approve", "reject"]:
        send_notification_email(
            subject=admin_subject,
            recipient_email="admin1@example.com",
            template_name=admin_template,
            context=email_context
        )
    
    return Response({"message": ticket_request.manager_status.lower()}, status=HTTP_200_OK)


@api_view(['POST'])
def admin_request_history(request):
    """
    Retrieves the request history for the admin with optional search, filtering, and sorting.
    """
    data = request.data 
    search_query = data.get("search", "")
    status_filter = data.get("status", "")
    from_date = data.get("from_date", "")
    to_date = data.get("to_date", "")
    sort_by = data.get("sort_by", "")
    
    
    history_list = TicketRequest.objects.filter(manager_status="Approved" ).exclude(admin_status="closed").select_related("employee", "manager")
    logger.info("Admin fetching request history")

     # Search by employee name
    if search_query:
        history_list = history_list.filter(
            Q(employee__first_name__icontains=search_query) | 
            Q(employee__last_name__icontains=search_query)
        )
        if not history_list.exists():
            logger.info(f"No requests found for search query: {search_query}")
            return Response({"message": "No requests found for the searched employee."}, HTTP_200_OK)

    # Filter by status
    if status_filter:
        history_list = history_list.filter(Q(admin_status=status_filter) | Q(manager_status=status_filter))
        if not history_list.exists():
            logger.info(f"No requests found for status: {status_filter}")
            return Response({"message": "No requests available for the selected status."}, HTTP_200_OK)
    # Filter by date range
    if from_date and to_date:
        history_list = history_list.filter(travel_from__gte=from_date, travel_to__lte=to_date)
        if not history_list.exists():
            logger.info(f"No requests found from {from_date} to {to_date}")
            return Response({"message": "No requests found within the selected date range."}, HTTP_200_OK)
    # Sorting
    sort_options = {
        "name_asc": "employee__first_name",
        "name_desc": "-employee__first_name",
        "date_asc": "travel_from",
        "date_desc": "-travel_from",
    }
    
    if sort_by in sort_options:
        history_list = history_list.order_by(sort_options[sort_by])
    
    serializer = EmployeeRequestHistorySerializer(history_list, many=True)
    return Response(serializer.data,HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAdmin]) 
def admin_request_additional_info(request, request_id):
    """
    Allows an admin to request additional information from an employee regarding a travel request.
    """
    ticket_request = get_object_or_404(TicketRequest, id=request_id)

    if ticket_request.admin_status != "Open":
        logger.warning(f"Admin '{request.user.username}' attempted to request info for request ID {request_id}, but status is not Open.")
        return Response(
            {"error": "Admin can only request info if status is Open"},
            status=HTTP_400_BAD_REQUEST
        )

    admin_note = request.data.get("admin_note", "").strip()

    if not admin_note:
        logger.warning(f"Admin '{request.user.username}' did not provide a note for request ID {request_id}.")
        return Response(
            {"error": "Please provide a note for the additional information request"},
            status=HTTP_400_BAD_REQUEST
        )

    ticket_request.admin_status = "Requested Info"
    ticket_request.admin_note = admin_note 
    ticket_request.save(update_fields=["admin_status", "admin_note"])

    logger.info(f"Admin '{request.user.username}' requested additional info for request ID {request_id}.")
    email_context = {
        "ticket_request": ticket_request,
        "employee_name": f"{ticket_request.employee.first_name} {ticket_request.employee.last_name}",
        "admin_name": f"{request.user.first_name} {request.user.last_name}",
        "admin_note": admin_note,
    }

    # Send email notification to the employee
    send_notification_email(
        subject="Admin Requested Additional Information",
        recipient_email=ticket_request.employee.user.email,
        template_name="emails/admin_requested_info.html",
        context=email_context
    )

    return Response(
        {"message": "Additional info requested from employee"},
        status=HTTP_200_OK
    )
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_view_request(request, request_id):
    """
    Allows a admin to view details of a specific travel request.
    """
    ticket_request = get_object_or_404(TicketRequest, id=request_id)
    serializer = EmployeeRequestHistorySerializer(ticket_request)
    logger.info(f"Admin '{request.user.username}' viewed request ID {request_id}.")
    return Response(serializer.data, HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAdmin])
def admin_close_request(request, request_id):
    """Allows an admin to close an approved travel request."""
    ticket_request = get_object_or_404(TicketRequest, id=request_id)

    if ticket_request.manager_status != "Approved":
        logger.warning(f"Admin '{request.user.username}' attempted to close request ID {request_id} which is not approved.")
        return Response(
            {"error": "Only approved requests can be closed"},
            status=HTTP_400_BAD_REQUEST
        )

    # Check if the previous status was "Requested Info"
    send_email = ticket_request.admin_status == "Requested Info"

    # Update status
    ticket_request.admin_status = "Closed"
    ticket_request.save()
    logger.info(f"Admin '{request.user.username}' closed request ID {request_id}.")

    # Send email only if the previous status was "Requested Info"
    if send_email:
        email_context = {
            "employee_name": f"{ticket_request.employee.first_name} {ticket_request.employee.last_name}",
            "request_id": ticket_request.id,
        }

        send_notification_email(
            subject="Your Travel Request has been Closed",
            recipient_email=ticket_request.employee.user.email,
            template_name="emails/request_closed.html",
            context=email_context
        )

    return Response(
        {"message": "Request has been closed successfully"},
        status=HTTP_200_OK
    )

@api_view(['GET'])
def admin_view_manager(request):
    """Fetch all managers with department details"""
    manager_list = Manager.objects.select_related("department").all()
    serializer = ManagerDetailsSerializer(manager_list, many=True)
    logger.info("Admin fetching manager list")
    return Response(serializer.data, HTTP_200_OK)

@api_view(['GET'])
def admin_view_employee(request):
    """Fetch all employees with their assigned manager details"""
    employee_list = Employee.objects.select_related("manager").all()
    serializer = EmployeeDetailsSerializer(employee_list, many=True)
    logger.info("Admin fetching employee list")
    return Response(serializer.data, HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_view_list(request):
    """
    Fetch managers, employees, or departments based on query parameters.
    Example usage: `/admin/view-list?type=managers`
    """
    entity_type = request.query_params.get("type", "").lower()

    entity_mapping = {
        "managers": (Manager, ManagerDetailsSerializer, "Admin fetching manager list"),
        "employees": (Employee, EmployeeDetailsSerializer, "Admin fetching employee list"),
        "departments": (Department, DepartmentSerializer, "Admin fetching department list"),
    }

    if entity_type not in entity_mapping:
        return Response({"error": "Invalid type. Choose 'managers', 'employees', or 'departments'."}, status=400)

    model, serializer_class, log_message = entity_mapping[entity_type]
    queryset = model.objects.all()
    serializer = serializer_class(queryset, many=True)
    logger.info(log_message)

    return Response(serializer.data, status=HTTP_200_OK)

def send_notification_email(subject, recipient_email, template_name, context):
    """
    Sends an email notification to the specified recipient using a template.
    """
    logger.info(f"Sending email to {recipient_email} with subject '{subject}'")
    html_message = render_to_string(template_name, context)
    plain_message = strip_tags(html_message)
    from_email = "noreply@example.com"  
    
    send_mail(
        subject,
        plain_message,
        from_email,
        [recipient_email],
        html_message=html_message,
    )