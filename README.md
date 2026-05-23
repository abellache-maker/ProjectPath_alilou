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

# Recent changes (May 23, 2026)

This section summarizes all the changes done in this session and explains, line by line, the code that was added.

## 1) Block a need if the project is not accepted

Files touched:
- ProjectPath/PP/views.py

### A. add_request (need creation)

Added code:
```
user = CompteEtudiant.objects.get(id = user_id)
project_name = form.cleaned_data.get("projet_concerne")
project_is_accepted = projet.objects.filter(
	nom_projet=project_name,
	participants=user,
	statut="Accepte",
).exists()
if not project_is_accepted:
	form.add_error(
		"projet_concerne",
		"Votre projet doit etre accepte avant d'envoyer un besoin.",
	)
else:
	p  = form.save()
	p.participant = user
	p.save()
	return redirect("home", user_id)
```

Line by line:
1. `user = CompteEtudiant.objects.get(id = user_id)` gets the connected student.
2. `project_name = form.cleaned_data.get("projet_concerne")` reads the project name from the validated form.
3. `project_is_accepted = projet.objects.filter(...).exists()` checks if the project exists, belongs to the student, and is accepted.
4. `if not project_is_accepted:` verifies the rule before saving the need.
5. `form.add_error(...)` attaches a field error under "projet_concerne" so it shows in the form.
6. `else:` continues only when the project is accepted.
7. `p  = form.save()` creates the need object.
8. `p.participant = user` links the need to the student.
9. `p.save()` persists the relation.
10. `return redirect("home", user_id)` sends the student back to the dashboard.

### B. modify_request (need update)

Added code:
```
user = CompteEtudiant.objects.get(id = user_id)
project_name = form.cleaned_data.get("projet_concerne")
project_is_accepted = projet.objects.filter(
	nom_projet=project_name,
	participants=user,
	statut="Accepte",
).exists()
if not project_is_accepted:
	form.add_error(
		"projet_concerne",
		"Votre projet doit etre accepte avant de modifier un besoin.",
	)
else:
	besoin = form.save()
	besoin.statut = "NonVue"
	besoin.save()
	return redirect("home",user_id)
```

Line by line:
1. `user = CompteEtudiant.objects.get(id = user_id)` gets the connected student.
2. `project_name = form.cleaned_data.get("projet_concerne")` reads the project name from the validated form.
3. `project_is_accepted = projet.objects.filter(...).exists()` verifies ownership and accepted status.
4. `if not project_is_accepted:` blocks editing when the project is not accepted.
5. `form.add_error(...)` shows the error under the project field.
6. `else:` continues only when the project is accepted.
7. `besoin = form.save()` updates the need.
8. `besoin.statut = "NonVue"` resets status to force revalidation.
9. `besoin.save()` persists changes.
10. `return redirect("home",user_id)` redirects to the dashboard.

## 2) Admin can approve or رفضuse needs from the dashboard (server-side)

Files touched:
- ProjectPath/PP/views_user.py
- ProjectPath/ProjectPath/urls.py
- ProjectPath/PP/template/Admin/dashboard.html
- ProjectPath/PP/static/js/admin.js

### A. New staff endpoint

Added code:
```
@login_required
@user_passes_test(is_staff_user)
def update_need_status(request, user_id, need_id):
	if request.user.id != user_id:
		return redirect("logout")
	if request.method != "POST":
		return redirect("Staff_DashBoard", user_id)

	action = request.POST.get("action")
	need = get_object_or_404(Besoin, id=need_id)

	if action == "approve_need":
		need.statut = "Accepte"
		need.save()
		message.objects.create(
			contenu="Un des besoin ratache au projet " + need.projet_concerne + " a ete accepte",
			receveur=need.participant,
		)
	elif action == "reject_need":
		need.statut = "Refuse"
		need.save()
		message.objects.create(
			contenu="Un des besoin ratache au projet " + need.projet_concerne + " a ete refuse",
			receveur=need.participant,
		)

	return redirect("Staff_DashBoard", user_id)
```

Line by line:
1. `@login_required` forces authentication.
2. `@user_passes_test(is_staff_user)` ensures only staff can call it.
3. `def update_need_status(...)` declares the handler with `user_id` and `need_id`.
4. `if request.user.id != user_id:` blocks access if the URL user is not the logged user.
5. `return redirect("logout")` logs out on mismatch.
6. `if request.method != "POST":` prevents status updates on GET.
7. `return redirect("Staff_DashBoard", user_id)` sends back to dashboard.
8. `action = request.POST.get("action")` reads which button was clicked.
9. `need = get_object_or_404(Besoin, id=need_id)` fetches the need safely.
10. `if action == "approve_need":` handles approval.
11. `need.statut = "Accepte"` sets the status.
12. `need.save()` writes the change.
13. `message.objects.create(...)` notifies the student.
14. `elif action == "reject_need":` handles rejection.
15. `need.statut = "Refuse"` sets the status.
16. `need.save()` writes the change.
17. `message.objects.create(...)` notifies the student.
18. `return redirect("Staff_DashBoard", user_id)` returns to admin dashboard.

### B. New URL route

Added code:
```
path('need_action/<int:user_id>/<int:need_id>', views_user.update_need_status, name = "update_need_status"),
```

Line by line:
1. `path('need_action/...')` defines the endpoint for need actions.
2. `views_user.update_need_status` connects the URL to the view.
3. `name = "update_need_status"` makes it reusable in templates.

### C. CSRF token for JS-generated forms

Added code:
```
<meta name="csrf-token" content="{{ csrf_token }}">
```

Line by line:
1. Adds a meta tag that exposes the CSRF token to JavaScript.
2. The token is used to build secure POST forms in JS.

### D. Admin dashboard needs form (JS)

Added code:
```
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfTokenMeta && csrfTokenMeta.getAttribute('content') !== 'NOTPROVIDED'
  ? csrfTokenMeta.getAttribute('content')
  : getCookie('csrftoken');
```

Line by line:
1. `function getCookie(name)` reads a cookie by name.
2. `const value = ...` builds a searchable string of cookies.
3. `const parts = ...` splits to locate the cookie.
4. `if (parts.length === 2) return ...` returns the cookie value if found.
5. `return ''` falls back to empty if not found.
6. `const csrfTokenMeta = ...` finds the meta tag in the HTML.
7. `const csrfToken = ...` prefers meta token, or cookie as fallback.

Also added in the needs list rendering:
```
${['EnAttente', 'NonVue'].includes(need.fields.statut) ? `
  <form class="need-actions" method="POST" action="/need_action/${user_id}/${need.pk}">
	<input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
	<button class="btn btn-approve" type="submit" name="action" value="approve_need">
	  ✅ Approuver
	</button>
	<button class="btn btn-reject" type="submit" name="action" value="reject_need">
	  ❌ Refuser
	</button>
  </form>
` : ''}
```

Line by line:
1. `['EnAttente', 'NonVue'].includes(...)` shows actions only for pending needs.
2. `<form ... action="/need_action/...">` posts to the new endpoint.
3. `csrfmiddlewaretoken` input protects against CSRF.
4. Approve button posts `action=approve_need`.
5. Reject button posts `action=reject_need`.

## 3) Student dashboard badges like admin

File touched:
- ProjectPath/PP/template/Student/home.html

### A. Project status badge

Added code:
```
<span class="badge
{% if p.statut == 'Accepte' %}badge-green
{% elif p.statut == 'EnAttente' or p.statut == 'NonVue' %}badge-yellow
{% elif p.statut == 'DocumentManquant' %}badge-orange
{% else %}badge-red{% endif %}">
	{{p.statut}}
</span>
```

Line by line:
1. `badge` applies the base pill style.
2. `badge-green` is for accepted projects.
3. `badge-yellow` is for pending or unseen projects.
4. `badge-orange` is for missing document.
5. `badge-red` is for refused projects.
6. `{{p.statut}}` prints the status text.

### B. Need status + priority badges

Added code:
```
<span class="badge
{% if b.statut == 'Accepte' %}badge-green
{% elif b.statut == 'EnAttente' or b.statut == 'NonVue' %}badge-yellow
{% else %}badge-red{% endif %}">
	{{b.statut}}
</span>
<span class="badge
{% if 'Elevee' in b.priority %}badge-priority
{% elif 'Moyenne' in b.priority %}badge-priority-medium
{% else %}badge-outline{% endif %}">
	{{b.priority}}
</span>
```

Line by line:
1. First `span` shows the need status with green/yellow/red.
2. Second `span` shows priority with red (high), yellow (medium), or outline (low).
3. `{{b.statut}}` and `{{b.priority}}` print labels.

## 4) Import update for the new view

File touched:
- ProjectPath/PP/views_user.py

Added code:
```
from django.shortcuts import redirect, get_object_or_404
from PP.models import message
```

Line by line:
1. `get_object_or_404` is required to fetch needs safely in `update_need_status`.
2. `message` is used to notify the student when a need is approved/refused.
