"""
URL configuration for ProjectPath project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from PP import views
from PP import views_user
from PP import views_message

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views_user.index),
    path("logout/", views_user.logingout, name="logout"),

    path('staff_dashboard/<int:user_id>', views_user.staff_Dashboard, name = "Staff_DashBoard"),

    path('add_project/<int:user_id>', views.add_project, name = "add_project"),
    path("project_details/<int:project_id>/<int:user_id>/<int:user_type>", views.project_details, name="project_details"),
    path("project_details/update/<int:project_id>/<int:user_id>", views.modify_project, name="modify_Project"),

    path("add_request/<int:user_id>", views.add_request, name = "add_request"),
    path("request_details/update/<int:b_id>/<int:user_id>", views.modify_request, name = "modify_request"),

    path("message/<int:user_id>",views_message.message_student , name="message_etudiant"),
    path("message_staff/<int:user_id>", views_user.message_staff, name = "message_staff"),

    path("user/<int:user_id>", views_user.user_details, name="user_details"),
    path("user/update/<int:user_id>", views_user.modify_user_account, name = "modify_user_account"),
    path("home/<int:user_id>", views.home, name= "home"),
    path("authentification/", views_user.student_authentification, name = "authentification"),
    path("sign_in/",views_user.sign_in, name = 'sign_in'),

    path("staff/<int:user_id>", views_user.staff_details, name="staff_details"),
 
]+static(settings.MEDIA_URL, document_root= settings.MEDIA_ROOT)
