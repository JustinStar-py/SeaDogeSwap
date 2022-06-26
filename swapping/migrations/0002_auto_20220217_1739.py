# Generated by Django 3.2.8 on 2022-02-17 14:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('swapping', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='nft_article',
            name='description',
        ),
        migrations.AlterField(
            model_name='nft_article',
            name='status',
            field=models.CharField(choices=[('d', 'Draft'), ('p', 'Published')], default='d', max_length=1),
        ),
    ]