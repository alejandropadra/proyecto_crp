from threading import Thread
from flask_mail import Message

from flask import current_app, render_template

from . import mail, app

def send_async_mail(message):
    with app.app_context():
        mail.send(message)

def welcome_mail(user):
    message = Message('Bienvendio al aplicativo web de Corimon Pinturas',
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=[user.email])

    message.html = render_template('email/bienvenido.html', user=user)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()