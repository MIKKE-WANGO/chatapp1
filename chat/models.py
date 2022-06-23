from datetime import datetime, timedelta
from statistics import mean
from django.conf import settings
from django.db import models

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from cloudinary.models import CloudinaryField
from django.core.mail import send_mail

# Create your models here.

#custom user manager
class UserAccountManager(BaseUserManager):

    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError('Users must have email address')

        #ensure emails are consistent
        email = self.normalize_email(email)
        email = email.lower()

        #create user
        user = self.model(
            email = email,
            username = username,
           
        )
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, username, password=None):
        
        user = self.create_user(email, username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user

    
class UserAccount(AbstractBaseUser, PermissionsMixin):
    class Status(models.TextChoices):
        ONLINE = 'Online'
        OFFLINE = 'Offline'
    
    #i can add any other fields i would want a user to have such as phone number
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255,  unique=True)
    
    status =  models.CharField(max_length=20, choices=Status.choices, default=Status.OFFLINE)
    

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    #determine what default login will be 
    #Normally it is 'username' but i want to use email
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email',  ]

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username
    

    def __str__(self):
        return self.username




class Chat(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user2', on_delete=models.CASCADE)
    chat_updated = models.DateTimeField(auto_now_add=True)

    def __str__(self):
       return  "{}".format(self.pk)



class Message(models.Model):
    class Status(models.TextChoices):
        READ = 'Read'
        UNREAD = 'Unread'
        
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNREAD)
    
    def __str__(self):
       return  "{}".format(self.pk)

class Friends(models.Model):
    user =  models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    friend =  models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='friend', null=True)
 
    def __str__(self):
       return  self.user.username


class Request(models.Model):
    class Status(models.TextChoices):
        DENIED = 'Denied'
        ACCEPTED = 'Accepted'
        PENDING = 'Pending'
        
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='by')
    sent_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE , related_name='to')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    def __str__(self):
       return  "{}".format(self.pk)
