

# Create your views here.
from django.shortcuts import get_object_or_404

from .serializers import ChatSerializer
from .models import *
from rest_framework.generics import ListAPIView,RetrieveAPIView, CreateAPIView, UpdateAPIView
from rest_framework import permissions
from django.contrib.auth import get_user_model
User = get_user_model()


from rest_framework.decorators import api_view


import email
from django.shortcuts import render
from requests import request

# Create your views here.

from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response 
from rest_framework.generics import ListAPIView, RetrieveAPIView

from django.contrib.auth import get_user_model
User = get_user_model()

from .serializers import *
from .models import *

import random
import math
from django.utils.timezone import make_aware

from django.core.mail import send_mail

from django.contrib.postgres.search import SearchQuery,  SearchVector

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self,request, format=None):
        data = request.data

        username = data['username']
        email = data['email']
        email = email.lower()
        password = data['password']
        re_password = data['re_password']

        if password == re_password:
            if len(password) >=6:
                if not User.objects.filter(username=username).exists():
                    if not User.objects.filter(email=email).exists():
                    

                        User.objects.create_user(username=username, email=email, password=password)
                        return Response(
                                    {'success': 'User created successfully'},
                                    status=status.HTTP_201_CREATED
                                )
                    else:
                        return Response(
                            {'error': 'User with this email already exists'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                         
                else:
                    return Response(
                            {'error': 'Username already taken'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    

            else:
                return Response(
                        {'error': 'Password must be at least 6 characters long'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        else:
            return Response(
                    {'error': 'Passwords do not match'},
                    status=status.HTTP_400_BAD_REQUEST
                )


#get user details
class RetrieveUserView(APIView):
    def get(self, request, format=None):
        try:

            user = request.user
            
            user = UserSerializer(user)
            return Response(
                {'user': user.data},
                status=status.HTTP_200_OK
            )

        except:
            return Response(
                {'error': 'Something went wrong when retrieving the user details'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class ChatListView(ListAPIView):
  
    def get(self,request, username):
        
        queryset = []
        if username is not None :
            user = get_object_or_404(User, username=username)
            
            if user != request.user:
                return Response(
                        {'error': 'Request already created'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            querys = Chat.objects.all().order_by("-chat_updated")
            
            for query in querys:
                if(query.user1 == user or query.user2 == user):
                    queryset.append(query)
                    
        chats = []
        for query in queryset:
            username1=query.user1.username
            username2 = query.user2.username
            chats.append({"id":query.id, "chat_updated":query.chat_updated, "user1":username1, "user2":username2})
        
        return Response(chats)

class ChatDetailView(RetrieveAPIView):
    
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.AllowAny,)


class GetUsers(APIView):
    def get(self,request):
        queryset = []
        current_user = request.user
        users = User.objects.all()
        for user in users:
            if(user != current_user):
                queryset.append(user)
        
        friends = Friends.objects.filter(user=current_user)
       
        for user in users:
             for friend in friends:
                if(user == friend.friend):
                   
                    try:
                        queryset.remove(user)
                    except ValueError:
                        
                        pass

        
        print(queryset)
        serialize = UserSerializer(queryset, many=True)
        return Response(serialize.data)

    def post(self, request, format=None):
        data = request.data
        queryset = []
        current_user = request.user
      
        search = data['search']
        vector = SearchVector('username')
        query = SearchQuery(search)

        users = []
        if search == "":
             users = User.objects.all()
        else:
            users = User.objects.annotate( search=vector).filter(search=query)

        for user in users:
            if(user != current_user):
                queryset.append(user)
        
        friends = Friends.objects.filter(user=current_user)
      
        for user in users:
             for friend in friends:
                if(user == friend.friend):                  
                    try:
                        queryset.remove(user)
                    except ValueError:
                        
                        pass

        
        
        queryset = UserSerializer(queryset, many=True)
        return Response(
            {'users': queryset.data},
            status=status.HTTP_200_OK
        )
   
class HandleRequests(APIView):
    def get(self, request):
        current_user = request.user
        requests = Request.objects.filter(sent_to=current_user, status='Pending')
        queryset = []
        for request in requests:
            username1=request.sent_by.username
            
            queryset.append({"id":request.id, "sent_by":username1})
        
        return Response(queryset)

       
    def post(self , request):
        data = request.data
        sent_to = data['sent_to']
        sent_to = User.objects.get(username=sent_to)
        sent_by = request.user
       
        if not Request.objects.filter(sent_to=sent_to, sent_by=sent_by).exists():
            request = Request.objects.create(sent_to=sent_to, sent_by=sent_by, status='Pending')

        else:
            return Response(
                            {'error': 'Request already created'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

        return Response(
                            {'success': ' Request updated '},
                            status=status.HTTP_200_OK
                        )
      
       
    def put(self,request):
        data = request.data
        id = data['id']
        user = request.user
        request  =  Request.objects.get(id=id, sent_to=user, status='Pending')

        user1 = User.objects.get(id=request.sent_by.id)
        user2 = User.objects.get(id=request.sent_to.id)

        Friends.objects.create(user=user1,friend=user2)
        Friends.objects.create(user=user2,friend=user1)

        Chat.objects.create(user1=user1,user2=user2)

        request.status = 'Accepted'
        request.save()

        return Response(
                            {'success': ' Request updated '},
                            status=status.HTTP_200_OK
                        )
      