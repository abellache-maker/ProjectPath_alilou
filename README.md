# Project-Path:

This is a School project. It is something that helps student with their administrative procedure in our School Incubator.

There is two sets of users, Students, and Staff.
 . The Students have access to their dashboard, their messages, and have the possibility to submit a project, declare a need associated to that project (through "projet_concerne"), and update their account informations.
They can also follow the progress of their submition.
 . The Staff has access to their dashboard, their messages, and their profile. They can accept or refuse a project.

# How to install the application and deploy:
 . downland the code 
 . create a virtual environement (python3 venv env)
 . downland the requirements (listed on requirements.txt) with pip.
 . run the server using python3 manage.py runserver.
There is a dummy database already set, you do not need to run migrations.
The project is also already deployed on Render (https://projectpath-2890.onrender.com/)

# How the web-app works:
It is a Django web-app, using html/css and some js as a frontend (presentation layer), and SQL (sqlite) as a database.
It adopts a client-server model (the database is within the server, and the front end is executed by the navigator).
It has some microservices: authentification, inscription, creation of a project/need, consulation of their progress, modification of the user account and a message box.

 # How to migrate:
 Write these two lines of codes in your terminal:
. python3 manage.py makemigrations
. python3 manage.py migrate
