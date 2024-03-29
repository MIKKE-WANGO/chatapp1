
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from .models import Message, Chat


from django.contrib.auth import get_user_model
User = get_user_model()



def last_15_messages(chatId):
        chat = get_object_or_404(Chat, id=chatId)
        #return chat.message_set.all().order_by("timestamp").all()[:10]
        return chat.message_set.all().order_by("-timestamp").all()[:15][::-1]

#see if user is a member of the chat
def auth_test(chatId,user_id):
    chat = get_object_or_404(Chat, id=chatId)
    user = User.objects.get(id=user_id)

    if chat.user1 == user:
        return True
    elif chat.user2 == user:
        return True
    else:
        return False
    

class ChatConsumer(WebsocketConsumer):

    user_id = None


    def fetch_messages(self, data):
        messages = last_15_messages(data['chatId'])
        content = {
            'messages': self.messages_to_json(messages),
            'to':'user'
        }
        self.send_chat_message(content)

    def messages_to_json(self, messages):
        result = []

        for message in messages:
            result.append(self.message_to_json(message))
        
        return result

    def message_to_json(self, message):
        return{
            'id':message.id,
            'contact':message.user.username,
            'content':message.content,
            'timestamp': str(message.timestamp),
            'chat': message.chat.id,
            'status': message.status
        }

    def new_message(self, data):
        contact = data['from']
        user = User.objects.filter(username=contact)[0]
        chat = Chat.objects.get(id=data["chatId"])
        message = Message.objects.create(user=user, content=data['message'], chat=chat, status='Unread' )
        chat.chat_updated = message.timestamp
        chat.save()

        content = {
            'messages': [self.message_to_json(message)],
            'to':'all'
        }
        return self.send_chat_message(content)
    

    def typing(self,data):
        username = data['from']
        chatId = data['chatId']
        user = User.objects.get(username=username)
        if auth_test(chatId, user.id):
            content = {
                'user': username,
                'to':'typing'
            }
            return self.send_chat_message(content)
        
    def video_call(self,data):
        username = data['from']
        chatId = data['chatId']
        user = User.objects.get(username=username)
        if auth_test(chatId, user.id):
            content = {
            'user': username,
            'to':'calling'
            }
            return self.send_chat_message(content)
    

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message,
        'typing': typing,
        'video_calling': video_call
        
    }

    def connect(self):
        user_id = self.scope['user']
       
        if user_id == 'AnonymousUser':
            
            self.close()
        else:



            self.room_name = self.scope['url_route']['kwargs']['id']
            self.room_group_name = 'chat_%s' % self.room_name
            # Join room group

            
            if auth_test(self.room_name, user_id):

                async_to_sync(self.channel_layer.group_add)(
                    self.room_group_name,
                    self.channel_name
                )
                self.accept()
            else:
                 self.close()


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
                'message': message,
                
            }
        )


    def send_message(self, message):
        self.send(text_data=json.dumps(message))

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps(message))

class  OnlineConsumer(WebsocketConsumer):
    user_id = ''
    user = ''
    def connect(self):
        user_id = self.scope['user']
       
        if user_id == 'AnonymousUser':
            
            self.close()
        else:
            
            user = User.objects.get(id=user_id)
            user.status = 'Online'
            user.save()
            print('online')
            self.accept()

    def receive(self, text_data=None, bytes_data=None):
        pass

    def disconnect(self, close_code):
        user_id = self.scope['user']
       
        user = User.objects.get(id=user_id)

        user.status = 'Offline'
        user.save()
        print('offline')

