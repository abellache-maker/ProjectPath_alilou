from PP.models import CompteEtudiant
from PP.models import message

from django.shortcuts import render
from django.shortcuts import redirect



def message_student(request, user_id):
    if request.user.id != user_id:
        return redirect("logout")
    
    user = CompteEtudiant.objects.get(id = user_id)

    messages = message.objects.filter(emetteur= user) | message.objects.filter(receveur = user)
    nbr_message_de_etudiant =messages.filter(emetteur= user).count()
    nbr_message_de_admin = messages.filter(receveur= user).count()
    nbr_message = nbr_message_de_admin+nbr_message_de_etudiant

    message_non_lu = messages.filter(vu = False)
    nbr_message_non_lu =messages.filter(vu = False).count()
  
    messages = [
        {
            "pk": m.pk,
            "fields" : {
                "contenu": m.contenu,
                "emetteur": getattr(m.emetteur, "username", None),
                "receveur": getattr(m.receveur, "username", None),
                "projet": getattr(m.project, "nom_projet", None),
                "created_at": m.created_at,
                "vu": m.vu
            }
        }
        for m in messages
    ]

    for m in message_non_lu:
        m.vu = True
        m.save()
    
    print(messages)
        
    return render(request, "Student/Message/message.html", {"user_id": user_id, "message": messages, 
                                                            "nbr_admin":nbr_message_de_admin, 
                                                            "nbr_etudiant":nbr_message_de_etudiant,
                                                            "nbr_message_non_vu": nbr_message_non_lu,
                                                            "nbr_message":nbr_message})

