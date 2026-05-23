from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser, UserManager, PermissionsMixin
from django.core.validators import FileExtensionValidator


def Validate_email_adress(value):
    if not value.endswith('@estin.dz'):
        raise ValidationError("L'adresse mail ne fait pas parti du domaine 'ESTIN'.")

def Validate_matricule(value):
     if value >= 1000000000000 or value < 100000000000:
        raise ValidationError("La matricule doit contenir 12 chiffres.")

def Validate_telephone(value):
    if value >= 1000000000 or value < 100000000:
        raise ValidationError("Le numero de telephone doit contenir au moins 9 chiffre (sans compte le 0)")

import os

def Validate_fichier(value):
    ext = os.path.splitext(value.name)[1]  # gets '.pdf'
    valid_extensions = ['.pdf', '.docx', '.txt']
    if not ext.lower() in valid_extensions:
        raise ValidationError("Le fichier dois être un PDF.")

class CompteEtudiant(AbstractUser, PermissionsMixin):
    matricule = models.fields.IntegerField(unique=True, validators= [Validate_matricule], default = "123889357")
    class Niveau(models.TextChoices):
        one = "1CP", "1CP"
        two = "2CP", "2CP"
        three = "1CS" , "1CS"
        four = "2CS" , "2CS"
        five = "3CS", "3CS"

    niveau_etude = models.fields.CharField(max_length = 5 , choices = Niveau.choices, default = "1CP")
    telephone = models.fields.IntegerField(validators=[Validate_telephone], default=42)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def get_fields(self):
        return([self.matricule,self.niveau_etude, self.last_name, self.first_name, 
                self.password, self.email, self.telephone, self.username])


class Statut(models.TextChoices):
    NON_VUE = "NonVue"
    EN_ATTENTE = "EnAttente" 
    ACCEPTE =  "Accepte"
    REFUSE =  "Refuse"
    DOCUMENT_MAQUANT = "DocumentManquant"

class Besoin(models.Model):

    projet_concerne = models.fields.CharField(max_length=100)
    class TypeDeBesoin(models.TextChoices):
        Materiel = "Materiel" ,'Materiel'
        Budget = "Budget", 'Budget'
        Encadrement = "Encadrement", 'Encadrement'
        Laboratoire = "Laboratoire", 'Laboratoire'
        Support_Technique = "Support Technique", 'Support Technique'
        Formation = "Formation", 'Formation'
        Networking = "Networking", 'Networking'


    typeDeBesoin = models.fields.CharField(max_length = 20 , choices = TypeDeBesoin.choices, default = "MATERIEL") #si ça se trouve tu dois choisir parmi une liste
    class priorite(models.TextChoices):
        Basse = "Basse"
        Moyenne = "Moyenne"
        Eleve = "Elevee"

    priority = models.fields.CharField(max_length = 50, choices =priorite.choices, default = "Elevee")
    description = models.fields.CharField(max_length = 1000)
    participant = models.ForeignKey(CompteEtudiant, on_delete = models.CASCADE, null = True, blank = True)
    justification = models.fields.CharField(max_length=1000)
    file_path = models.FileField(upload_to="files/", null = True ,blank = True ,verbose_name="", validators=[Validate_fichier])
    statut = models.fields.CharField(max_length = 20, choices = Statut.choices, default = "NonVue")
    created_at = models.DateTimeField(auto_now_add=True)

class projet(models.Model):
    nom_projet= models.fields.CharField(max_length=100)
    description = models.fields.CharField(max_length=1000)
    participants = models.ForeignKey(CompteEtudiant, on_delete = models.CASCADE, null = True, blank=True)
    equipe = models.TextField(blank = True)
    probleme_resolu = models.fields.CharField(max_length=200)

    class Domaine(models.TextChoices):
        Technologie_et_sante = "Technologie et sante", "Technologie et sante"
        Technologie_et_finances = "Technologie et finances", "Technologie et finances"
        Technologie_et_Environement = "Technologie et environement", "Technologie et environement"
        E_commerce = "E-commerce", "E-commerce"
        Technologie_et_agriculture = "Technologie et agriculture", "Technologie et agriculture"
        Autre = "Autre", "Autre"

    domaine = models.CharField(max_length=30, choices= Domaine.choices, default="Autre")
    objectif = models.CharField(max_length=200)
    file_path = models.FileField(upload_to="files/", null = False,verbose_name="",validators=[Validate_fichier])
    statut = models.fields.CharField(max_length = 20, choices = Statut.choices, default = "NonVue")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class message(models.Model):
    contenu = models.fields.CharField(max_length=1500)
    emetteur = models.ForeignKey(CompteEtudiant, on_delete= models.SET_NULL, null= True, related_name='messages_envoyes')
    receveur = models.ForeignKey(CompteEtudiant, on_delete= models.SET_NULL, null= True, related_name='messages_recu')
    project = models.ForeignKey(projet, on_delete = models.CASCADE, null = True, blank = True)
    request = models.ForeignKey(Besoin, on_delete= models.CASCADE, null =  True, blank = True)
    created_at = models.DateTimeField(auto_now_add=True)
    vu = models.fields.BooleanField(default = False)

