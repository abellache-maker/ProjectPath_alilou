from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages

#Student authentification

from PP.models import CompteEtudiant
from PP.models import message
from PP.form import CreateAccount
from PP.form import authentification_Student, ModifyStudentAccount

from django.contrib.auth import authenticate ,login, logout
from django.contrib.auth.decorators import login_required, user_passes_test

def logingout(request):
    logout(request)
    return redirect('authentification')

def student_authentification(request):
    if request.method == "POST":
        form = authentification_Student(request.POST)
        
        if form.is_valid():
            if form.is_valid():
                return authentificate_user(request, form)
        else: 
            messages.error(request, "Nom d'utilisateur ou mot de passe incorects.")
    else:
        form = authentification_Student()
    return render(request, "Student/authentification.html", {"form": form})

def authentificate_user(request,form):
    user_name = form.cleaned_data['username']
    password = form.cleaned_data['password']
    user = authenticate(request,username =user_name, password =password)

    if user is not None :
        login(request, user)
        user_id = user.id
        if user.is_staff:
            return redirect("Staff_DashBoard", user_id)
        else:
            return redirect("home", user_id)
    else:
        messages.error(request, "Nom d'utilisateur ou mot de passe incorects.")
    return redirect("authentification")

def sign_in(request):
    if request.method == "POST":
        form = CreateAccount(request.POST)
        if form.is_valid():
            return sign_up(request, form)
    else:
        form = CreateAccount()
    return render(request, "Student/sign_in.html", {"form": form})

def sign_up(request, form):
    user = form.save()
    login(request, user)
    user_id = user.id
    return redirect("home", user_id)

@login_required
def user_details(request, user_id):
    if request.user.id != user_id:
        return redirect("logout")
    user = CompteEtudiant.objects.get(id = user_id)
    return render(request, "Student/user.html", {"user": user, "user_id": user_id})

@login_required
def modify_user_account(request, user_id):
    if request.user.id != user_id:
        return redirect("logout")
    user = CompteEtudiant.objects.get(id = user_id)
    if request.method == "POST":
        form = ModifyStudentAccount(request.POST, instance = user)
        if form.is_valid():
            user = form.save()
            return redirect("user_details", user.id)
    else:
        form = ModifyStudentAccount(instance= user)
    return render(request, "Student/modify_user_account.html", {"form": form, "user": user, "user_id": user_id})
#ça change pas le mot de passe.


#STAFF authetification

from PP.models import projet
from PP.models import Besoin

def is_staff_user(user):
    return user.is_staff

from django.core.serializers import serialize

@login_required
@user_passes_test(is_staff_user)
def staff_Dashboard(request, user_id):

    if request.user.id != user_id:
        return redirect("logout")

    project = projet.objects.all().order_by('-updated_at')
    prj_nbr = project.count()
    prj_enAtt = projet.objects.filter(statut__in=["EnAttente", "NonVue"]).count()
    prj_accepte =projet.objects.filter(statut = "Accepte").count()
    bs_enAtt = Besoin.objects.filter(statut__in=["EnAttente", "NonVue"]).count()
    project = serialize("json", project)
    print(project)

    user = CompteEtudiant.objects.get(id = user_id)

    besoin = Besoin.objects.all().order_by("-created_at")
    bs_nbr = besoin.count()
    besoin = serialize("json",besoin)


    return render(request, "Admin/dashboard.html",{"user_id": user_id, "project": project, "besoin": besoin,
                                                    "prj_enAtt": prj_enAtt, "prj_accepte": prj_accepte,
                                                    "bs_enAtt":bs_enAtt, "prj_nbr":prj_nbr, "bs_nbr":bs_nbr,
                                                    "user": user})

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
            contenu="Un des besoin rataché au projet " + need.projet_concerne + " a été accepté",
            receveur=need.participant,
        )
    elif action == "reject_need":
        need.statut = "Refuse"
        need.save()
        message.objects.create(
            contenu="Un des besoin rataché au projet " + need.projet_concerne + " a été refusé",
            receveur=need.participant,
        )

    return redirect("Staff_DashBoard", user_id)

from json import dumps

@login_required
@user_passes_test(is_staff_user)
def message_staff(request, user_id):
    if request.user.id != user_id:
        return redirect("logout")
    
    user = CompteEtudiant.objects.get(id = user_id)
    mes = message.objects.all().order_by("-created_at")
    mes_envoye = mes.filter(emetteur = user).count()
    mes_recu = mes.filter(receveur__isnull = True).count()
    mes_total = mes_recu + mes_envoye
    mes = [
        {
            "pk": m.pk,
            "fields" : {
                "contenu": m.contenu,
                "emetteur": getattr(m.emetteur, "username", None),
                "receveur": getattr(m.receveur, "username", None),
                "projet": getattr(m.project, "nom_projet", None),
                "created_at": m.created_at
            }
        }
        for m in mes
    ]
    
    return render(request, "Admin/message.html",{"user_id": user_id, "user": user, "message": mes,
                                                "mes_envoye": mes_envoye, "mes_recu": mes_recu, "mes": mes_total})


from PP.form import ModifyAdminAccount
from PP.form import ResetPasswordForm

@login_required
@user_passes_test(is_staff_user)    
def staff_details(request, user_id):
    if request.user.id != user_id:
        return redirect("logout")
    user = CompteEtudiant.objects.get(id = user_id)
    if request.method == "POST":
        form = ModifyAdminAccount(request.POST, instance = user)
        form_password = ResetPasswordForm(user,request.POST)
        if form.is_valid():
            user = form.save()
            return redirect("user_details", user.id)
        if form_password.is_valid():
            form_password.save()
            return redirect("user_details", user.id)
        elif not form_password.is_valid():
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")

    else:
        form = ModifyAdminAccount(instance= user)
        form_password = ResetPasswordForm(user)
    return render(request, "Admin/user.html", {"user": user, "user_id": user_id, "form": form, 
                                               "form_password":form_password}) 
    
#Other stuff

def index(request):
    return render(request, "Student/index.html")