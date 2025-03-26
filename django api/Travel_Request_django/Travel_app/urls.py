from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path("login", views.login),
    path("logout", views.logout),
    path('departments',views.get_department),
    path('count', views.get_user_counts),

    # Employee Routes
    path("employee/new_request", views.create_request),
    path("employee/home", views.employee_request_history),
    path("employee/request/<int:request_id>", views.retrieve_request),
    path("employee/edit_request/<int:request_id>", views.edit_request),
    path("employee/cancel_request/<int:request_id>", views.cancel_request),
    path("employee/resubmit_request/<int:request_id>", views.resubmit_request),
    path("employee/reply_admin/<int:request_id>", views.employee_reply_to_admin),

    # Manager Routes
    path("manager/home", views.manager_request_history),
    path("manager/request/<int:request_id>", views.manager_view_request),
    path("manager/process_request/<int:request_id>", views.process_travel_request),

    # Admin Routes
    path("admin/home", views.admin_request_history),
    path('admin/view-list/', views.admin_view_list),
    path("admin/new_entity", views.create_entity),
    path("admin/manager", views.admin_view_manager),
    path("admin/employee", views.admin_view_employee),
    path("admin/get_managers", views.get_managers),
    path("admin/request/<int:request_id>", views.admin_view_request),
    path("admin/request_additional_info/<int:request_id>", views.admin_request_additional_info),
    path("admin/close_request/<int:request_id>", views.admin_close_request),
]
