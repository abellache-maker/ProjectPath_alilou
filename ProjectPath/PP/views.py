from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404

from PP.models import projet
from PP.form import CreateProject

from PP.models import Besoin
from PP.form import requestNeed

from PP.models import CompteEtudiant

from PP.models import message
from django.contrib.auth.decorators import login_required

#Project CRUD

@login_required
def add_project(request,user_id):
    if request.user.id != user_id:
        return redirect("logout")
    if request.method =="POST":
        form = CreateProject(request.POST, request.FILES)
        if form.is_valid():
            p  = form.save()
            user = CompteEtudiant.objects.get(id = user_id)
            p.participants = user
            p.save()
            return redirect("home", user_id)
    else:
        form = CreateProject()
    return render(request, "Student/add_project.html", {'form' : form ,"user_id": user_id})

from PP.form import message_form
@login_required
def project_details(request, project_id,user_id,user_type):
    if request.user.id != user_id:
        return redirect("logout")
    projett =  projet.objects.get(id = project_id)
    user = CompteEtudiant.objects.get(id = user_id)
    messages = message.objects.filter(project = projett)
    message_nbr = messages.count()
    etudiants = projett.participants
    besoin = Besoin.objects.filter(projet_concerne = projett.nom_projet)
    if user_type == 1:
        #Making all the besoin and project to en attente
        if projett.statut == "NonVue":
            projett.statut = "EnAttente"
            projett.save()
        for b in besoin:
            if b.statut == "NonVue":
                b.statut = "enAttente"
                b.save()
        if request.method == "POST":
            action = request.POST.get("action")
            obj_id = request.POST.get("id")
            if action == "send_message":
                form = message_form(request.POST)
                if form.is_valid():
                    m = form.save()
                    m.project = projett
                    m.emetteur = user
                    m.receveur = projett.participants
                    m.save()
                    return redirect("project_details", project_id, user_id, 1)
                else:
                    print(form.errors)
            else:
                return accept_refuse_form(action, obj_id, project_id,user_id)
        else:
            form = message_form()

        return render(request, "Admin/project_details.html", {"p" : projett , "etudiants" : etudiants ,
                                                    "user_id": user_id, "message" : messages,"message_nb":message_nbr ,
                                                    "user_type":user_type, "besoin": besoin, "user": user, "form": form})
    elif user_type == 0:
        document_manquant = False
        if projett.statut == "DocumentManquant":
            document_manquant = True
        
        if request.method == "POST":
            form = message_form(request.POST)
            if form.is_valid():
                m = form.save()
                m.project = projett
                m.emetteur = user
                m.save()
                return redirect("project_details", project_id, user_id, 0)
        else:
            form = message_form()
        return render(request, "Student/project_details.html", {"p" : projett ,"user_id": user_id, "message" : messages, 
                                                    "user_type":user_type, "etudiants": etudiants, 
                                                    "document_manquant": document_manquant, "form": form, "besoin": besoin})


def accept_refuse_form(action,obj_id,project_id, user_id):
    if action == "approve_need":
        need = get_object_or_404(Besoin, id=obj_id)
        need.statut = "Accepte"
        need.save()
        m = message.objects.create(contenu = "Un des besoin rataché au projet "+ need.projet_concerne +" a été accepté",
                                   receveur = need.participant)

    elif action == "reject_need":
        need = get_object_or_404(Besoin, id=obj_id)
        need.statut = "Refuse"
        need.save()
        m = message.objects.create(contenu = "Un des besoin rataché au projet "+ need.projet_concerne +" a été refusé",
                                   receveur = need.participant)

    elif action == "approve_project":
        project = get_object_or_404(projet, id=project_id)
        project.statut = "Accepte"
        project.save()
        m = message.objects.create(contenu = "Le projet "+ project.nom_projet +" a été accepté.",
                                   receveur = project.participants)

    elif action == "reject_project":
        project = get_object_or_404(projet, id=project_id)
        project.statut = "Refuse"
        project.save()
        m = message.objects.create(contenu = "Le projet "+ project.nom_projet +" a été refusé.",
                                   receveur = project.participants)

    elif action == "missing_doc":
        project = get_object_or_404(projet, id=project_id)
        project.statut = "DocumentManquant"
        project.save()
        m = message.objects.create(contenu = "Le projet "+ project.nom_projet +" a un document manquant.",
                                   receveur = project.participants)
        
    return redirect("project_details", project_id, user_id, 1)

@login_required
def modify_project(request,project_id,user_id):
    if request.user.id != user_id:
        return redirect("logout")
    p = projet.objects.get(id= project_id)
    if request.method == "POST":
        form = CreateProject(request.POST, request.FILES, instance = p )
        if form.is_valid():
            p = form.save()
            p.statut = "NonVue"
            p.save()
            return redirect("project_details",project_id, user_id,0)
    else:
        form = CreateProject(instance=p)
    return render(request,"Student/add_project.html", {"form" : form ,"user_id": user_id})




#Request CRUD

@login_required
def home(request,user_id):
    if request.user.id != user_id:
        return redirect("logout")
    user = CompteEtudiant.objects.get(id = user_id) 
    user_projects = user.projet_set.all()
    user_request = user.besoin_set.all()

    project_nbr = user_projects.count()
    prj_enAtt = projet.objects.filter(statut = "EnAttente",  participants = user).count()
    prj_valide = projet.objects.filter(statut = "Accepte",  participants = user).count()
    prj_refuse = projet.objects.filter(statut = "DocumentManquant",  participants = user).count()
    
    besoin_nbr = user_request.count()
    bs_enAtt = Besoin.objects.filter(statut = "EnAttente", participant = user).count()
    bs_valide = Besoin.objects.filter(statut = "Accepte", participant = user).count()
    bs_refuse = Besoin.objects.filter(statut = "DocumentManquant",  participant = user).count()
    

    return render(request,"Student/home.html",{"user" : user, "user_projects": user_projects,
                                               "user_request":user_request ,"user_id": user_id,
                                               "prj_nb": project_nbr, "prj_enAtt": prj_enAtt,
                                               "prj_valide": prj_valide, "prj_refuse": prj_refuse,
                                                "bs_nb": besoin_nbr, "bs_enAtt": bs_enAtt, "bs_valide": bs_valide,
                                                "bs_refuse": bs_refuse})


@login_required
def add_request(request, user_id):
    if request.user.id != user_id:
        return redirect("logout")
    if request.method =="POST":
        form = requestNeed(request.POST, request.FILES)
        if form.is_valid():
            p  = form.save()
            user = CompteEtudiant.objects.get(id = user_id)
            p.participant = user
            p.save()
            return redirect("home", user_id)
        else:
            print(form.errors)
    else:
        form = requestNeed()
    return render(request, "Student/add_besoin.html", {"form" : form ,"user_id": user_id})

@login_required
def modify_request(request, b_id,user_id):
    if request.user.id != user_id:
        return redirect("logout")
    besoin = Besoin.objects.get(id = b_id)
    if request.method == "POST":
        form = requestNeed(request.POST, request.FILES,instance = besoin)
        if form.is_valid():
            b = form.save()
            b.statut = "NonVue"
            b.save()
            return redirect("home",user_id)
    else:
        form = requestNeed(instance= besoin)
    return render(request, "Student/add_besoin.html", {"form" : form,"user_id": user_id})
