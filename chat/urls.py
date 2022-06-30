
from django.urls import path, re_path

from .views import *

urlpatterns = [
   
    path('list/<str:username>', ChatListView.as_view()),
    path('register', RegisterView.as_view()),
    path('get-token', GetToken.as_view()),
    path('requests', HandleRequests.as_view()),
    path('user-details', RetrieveUserView.as_view()),
    path('messages', UpdateMessage.as_view()),
    path('status', GetStatus.as_view()),
    path('users', GetUsers.as_view()),
    path('<pk>', ChatDetailView.as_view() ),
    
   
]