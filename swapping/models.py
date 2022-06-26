from re import M
from django.db import models

class nft_article(models.Model):
    STATUS_CHOICES =(
        ('d','Draft'),
       ('p','Published'),
    )
    nft_name = models.CharField(max_length=100)
    designer_name = models.CharField(max_length=50)
    nft_image = models.ImageField(upload_to='media')
    published_time = models.DateTimeField(auto_now_add=True)
    price = models.FloatField()
    url_buy = models.CharField(verbose_name="URL Link (OpenSea , SuperRare , Rarible",max_length=400)
    status = models.CharField(max_length=1,choices=STATUS_CHOICES,default="d")
    
    def __str__(self):
        return self.nft_name