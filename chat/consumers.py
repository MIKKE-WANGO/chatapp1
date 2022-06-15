
from email import message
import json
from operator import contains
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from .models import Message, Chat


from django.contrib.auth import get_user_model
User = get_user_model()



def last_10_messages(chatId):
        chat = get_object_or_404(Chat, id=chatId)
        return chat.message_set.all().order_by("timestamp").all()[:10]
   
class ChatConsumer(WebsocketConsumer):


    
    def fetch_messages(self, data):
        messages = last_10_messages(data['chatId'])
        content = {
            'messages': self.messages_to_json(messages)
        }
        self.send_chat_message(content)

    def messages_to_json(self, messages):
        result = []

        for message in messages:
            result.append(self.message_to_json(message))
        
        return result

    def message_to_json(self, message):
        return{
            'contact':message.user.username,
            'content':message.content,
            'timestamp': str(message.timestamp),
            'chat': message.chat.id
        }

    def new_message(self, data):
        contact = data['from']
        user = User.objects.filter(username=contact)[0]
        chat = Chat.objects.get(id=data["chatId"])
        message = Message.objects.create(user=user, content=data['message'], chat=chat )
        chat.chat_updated = message.timestamp
        chat.save()

        content = {
            'messages': [self.message_to_json(message)]
        }
        return self.send_chat_message(content)
    

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message
    }

    def connect(self):
        user = self.scope['user']
       
        if user == 'AnonymousUser':
            
            self.close()
        else:
            self.room_name = self.scope['url_route']['kwargs']['id']
            self.room_group_name = 'chat_%s' % self.room_name
            # Join room group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    #receives message and sends it to chat room
    def send_chat_message(self, message):
       
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )


    def send_message(self, message):
        self.send(text_data=json.dumps(message))

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps(message))