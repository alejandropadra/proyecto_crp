from threading import Thread
from flask_mail import Message

from flask import current_app, render_template

from . import mail, app
from .consts import CORREOS


def send_async_mail(message):
    with app.app_context():
        mail.send(message)


def obtener_destinatarios(correos_produccion):
    if CORREOS: 
        return correos_produccion
    else:
        devs = ["eliezer_chirino@corimon.com", "alejandro_padra@corimon.com", "juan_valery@corimon.com", "william_leon@corimon.com"]
        return list(set(devs))
    
def welcome_mail(user):
    recipients = obtener_destinatarios([user.email])
    message = Message('Bienvenido al aplicativo web de Corimon Pinturas',
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)

    message.html = render_template('email/bienvenido.html', user=user)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def comprobante_mail(user,comprobante):
    recipients = obtener_destinatarios([user.email])
    message = Message('Registro de Comprobante de Retención ' +' '+ str(comprobante),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)

    message.html = render_template('email/retencion_cliente.html', user=user, comprobante = comprobante)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def pago_mail(user, pago, pagos):
    recipients = obtener_destinatarios([user.email])
    message = Message('Pago Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)

    message.html = render_template('email/registro_pago.html', user=user, pago=pago, pagos = pagos)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def comprobante_crm_mail(user,comprobante, post_imagen, nombre_imagen):
    recipients = obtener_destinatarios(['retenciones_corimonpinturas@corimon.com'])
    message = Message('Comprobante de Retención' +' '+ str(comprobante),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)
    #"retenciones_corimonpinturas@corimon.com"
    message.html = render_template('email/retencion_cliente.html', user=user, comprobante = comprobante)
    try:
        with app.open_resource(post_imagen) as adjunto:
            message.attach(nombre_imagen,'application/pdf', adjunto.read())
    except:
        pass
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def pago_crm_mail(user, pago,post_imagen,nombre_imagen, pagos):
    recipients = obtener_destinatarios(['credito_cobranza@corimon.com'])
    message = Message('Pago Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)
    message.html = render_template('email/registro_pago_crm.html', user=user, pago=pago, pagos=pagos)
    try:
        with app.open_resource(post_imagen) as adjunto:
            message.attach(nombre_imagen,'application/pdf', adjunto.read())
    except:
        pass
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()
    
    
def prepago_crm_mail(user, datos,post_imagen,nombre_imagen):
    recipients = obtener_destinatarios(['credito_cobranza@corimon.com'])
    message = Message('Pago Registrado Referencia'+' '+ datos.get('ref'),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)
    message.html = render_template('email/registro_prepago_crm.html', user=user, datos= datos, )
    try:
        with app.open_resource(post_imagen) as adjunto:
            message.attach(nombre_imagen,'application/pdf', adjunto.read())
    except:
        pass
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()
    

def prepago_mail(user, datos):
    recipients = obtener_destinatarios([user.email])
    message = Message('Pago Registrado Referencia'+' '+ datos.get('ref'),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)
    message.html = render_template('email/registro_prepago_crm.html', user=user, datos= datos, )
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()
    
def letra_cambio_mail(user, datos):
    lista_ideal = [user.email, "credito_cobranza@corimon.com", "gabriela_briceno@corimon.com"]
    recipients = obtener_destinatarios(lista_ideal)
    message = Message('Pago de letra de cambio registrado. Referencia'+' '+ datos.get('ref'),
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)
    message.html = render_template('email/letra_cambio_cliente.html', user=user, datos= datos, )
    thread = Thread(target=send_async_mail, args=[message])
    thread.start()
    
    
    

def pago_iva_mail(user, pago, pagos):
    recipients = obtener_destinatarios([user.email])
    message = Message('Pago Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)
    message.html = render_template('email/correo_iva_cliente.html', user=user, pago=pago, pagos = pagos)

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()

def pago_iva_crm_mail(user, pago, post_imagen, nombre_imagen, pagos):
    recipients = obtener_destinatarios(['credito_cobranza@corimon.com'])
    message = Message('Pago Iva Registrado Referencia'+' '+ pago['XBLNR'],
                    sender=current_app.config['MAIL_USERNAME'],
                    recipients=recipients)

    message.html = render_template('email/correo_iva_crm.html', user=user, pago=pago, pagos = pagos)

    try:
        with app.open_resource(post_imagen) as adjunto:
            message.attach(nombre_imagen,'application/pdf', adjunto.read())
    except:
        pass

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()
    
    
def contacto_email(datos, archivo=None):
    """Envía el correo de contacto, opcionalmente con un adjunto."""

    # Destinatarios según motivo
    destinatarios_por_motivo = {
        'Ventas': ['eliezer_chirino@corimon.com'],
        'Particular': ['eliezer_chirino@corimon.com'],
        'Compras': ['alejandro_padra@corimon.com'],
        'Empleo': ['alejandro_padra@corimon.com'],
    }

    recipients = destinatarios_por_motivo.get(datos['motivo'], ['contacto@corimonpinturas.com'])

    message = Message(
        subject=f"[Web Contacto] {datos['motivo']} — {datos['nombre']}",
        sender=current_app.config['MAIL_USERNAME'],
        recipients=recipients,
        reply_to=datos['email']
    )
    message.html = render_template('email/contacto.html', datos=datos, tiene_adjunto=bool(archivo))

    # Adjuntar archivo si existe
    if archivo:
        message.attach(
            filename=archivo['filename'],
            content_type=archivo['mimetype'],
            data=archivo['content']
        )

    thread = Thread(target=send_async_mail, args=[message])
    thread.start()