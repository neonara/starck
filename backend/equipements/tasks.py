import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
from celery import shared_task
from .models import Equipement

@shared_task
def generate_qr_code_task(equipement_id):
    try:
        equipement = Equipement.objects.get(id=equipement_id)
        if not equipement.code_unique:
            return 

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        url = f"http://192.168.1.109:5173/equipements/equipements/scan/{equipement.code_unique}"

        qr.add_data(url)


        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = BytesIO()
        img.save(buffer)
        file_name = f"{equipement.code_unique}.png"

        equipement.qr_code_image.save(file_name, ContentFile(buffer.getvalue()), save=True)

    except Equipement.DoesNotExist:
        pass
