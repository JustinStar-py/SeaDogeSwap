from django.shortcuts import render
from django.shortcuts import HttpResponse
from .models import nft_article
# Create your views here.
def swapping(request):
    return render(request,'swap/swapping.html')

def nft(request):
    nft_articles = {
        "NFTs": nft_article.objects.filter(status="p") 
    }
    return render(request,'nft/nft-room.html',nft_articles)