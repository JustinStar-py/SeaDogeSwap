from django.urls import path
from .views import swapping,nft

urlpatterns = [
    path('', swapping,name="home"),
    path('nft-room',nft,name='nft')
]