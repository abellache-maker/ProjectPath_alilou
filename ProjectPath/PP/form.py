from django import forms
from PP.models import projet
from PP.models import Besoin
from PP.models import CompteEtudiant
from PP.models import message

from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.forms import SetPasswordForm

class CustomFKF(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        nom_complet = obj.last_name + " " + obj.first_name
        return "%s" % nom_complet

class CreateProject(forms.ModelForm):
    class Meta:
        model = projet
        exclude =  ('statut','participants',)

class requestNeed(forms.ModelForm):
    class Meta:
        model = Besoin
        exclude =  ('statut',"participant")

    def clean_projet_concerne(self):
        project = self.cleaned_data.get('projet_concerne')

        if not projet.objects.filter(nom_projet=project).exists():
            raise forms.ValidationError("Ce projet n'existe pas.")

        return project

class CreateAccount(UserCreationForm):
    class Meta:
        model = get_user_model()
        fields = ['username', 'matricule', 'first_name' ,'last_name', 'email','niveau_etude' ,'telephone']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and not email.endswith('@estin.dz'):
            raise forms.ValidationError("L'adresse mail doit être du domaine 'ESTIN' (@estin.dz).")
        
        # Check if email is already taken by another user
        User = get_user_model()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Il semblerait que cette adresse email soit déjà utilisée par un autre compte.")
            
        return email

class authentification_Student(forms.Form):
    username = forms.CharField(max_length=100)
    password = forms.CharField(max_length=100, widget=forms.PasswordInput)

class ModifyStudentAccount(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ['username','matricule', 'first_name' ,'last_name', 'email' ,'niveau_etude' ,'telephone']

class ModifyAdminAccount(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ['username', 'matricule', 'first_name' ,'last_name', 'email','niveau_etude' ,'telephone']

class message_form(forms.ModelForm):
    class Meta:
        model = message
        exclude = ('vu','emetteur', 'receveur', "project", "request")

class ResetPasswordForm(SetPasswordForm):
    """User enters new password"""
    new_password1 = forms.CharField(
        label="Nouveau mot de passe",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez le nouveau mot de passe',
            'required': True
        }),
        min_length=8
    )
    new_password2 = forms.CharField(
        label="Confirmer le mot de passe",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirmez le mot de passe',
            'required': True
        }),
        min_length=8
    )
