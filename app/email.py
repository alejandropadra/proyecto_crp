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

def comprobante_mail(user,comprobante):
    message = Message('Registro de Comprobante de Reteción ' +' '+ str(comprobante),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=[current_app.config['MAIL_TEST']])

    message.html = render_template('email/retencion_cliente.html', user=user, comprobante = comprobante)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def pago_mail(user, pago):
    message = Message('Pago Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=[current_app.config['MAIL_TEST']])#[user.email])

    message.html = render_template('email/registro_pago.html', user=user, pago=pago)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def comprobante_crm_mail(user,comprobante, post_imagen, nombre_imagen):
    message = Message('Comprobante de Reteción' +' '+ str(comprobante),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=['juan_valery@corimon.com'])
    #"retenciones_corimonpinturas@corimon.com"
    message.html = render_template('email/retencion_cliente.html', user=user, comprobante = comprobante)
    try:
        with app.open_resource(post_imagen) as adjunto:
            message.attach(nombre_imagen,'application/pdf', adjunto.read())
    except:
        pass
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def pago_crm_mail(user, pago,post_imagen,nombre_imagen):
    if user.zona == 'Centro':
        correo = 'cxc_crp_centro@corimon.com'
    elif user.zona == 'Occidente':
        correo = 'cxc_crp_occidente@corimon.com'
    elif user.zona == 'Oriente':
        correo = 'cxc_crp_oriente@corimon.com'
    elif user.zona == 'Capital':
        correo = 'cxc_crp_capital@corimon.com'

    message = Message('Pago Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=['juan_valery@corimon.com'])
    message.html = render_template('email/registro_pago_crm.html', user=user, pago=pago)
    try:
        with app.open_resource(post_imagen) as adjunto:
            message.attach(nombre_imagen,'application/pdf', adjunto.read())
    except:
        pass
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def pago_iva(user, pago):
    message = Message('Pago Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=[current_app.config['MAIL_TEST']])#[user.email])

    message.html = render_template('email/correo_iva_cliente.html', user=user, pago=pago)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()