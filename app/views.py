from flask import Blueprint
from flask import render_template, request, flash, redirect, url_for, abort
from werkzeug.utils import secure_filename

from flask_login import login_user,logout_user,login_required, current_user
from .forms import LoginForm, RegisterForm, RegistroPagoForm,EditForm,PerfilForm,ContactForm
from .models import User, Cobranza
from . import login_manager
from .consts import *
from .email import welcome_mail

import requests
from bs4 import BeautifulSoup

import os
local_adj = 'app\\static\\adj\\{}'
server_adj = 'app/static/adj/{}'
#sdfsdf
page = Blueprint('page', __name__)

@login_manager.user_loader
def load_user(rif):
    return User.get_by_rif(rif)

@page.route('/logout')
def logout():
    logout_user()
    flash(LOGOUT)
    return redirect(url_for('.login'))

@page.app_errorhandler(404)
def page_not_found(error):
    flash(ERROR_404)
    return render_template('/errors/404.html'),404

@page.route("/login", methods = ["GET","POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('.dashboard'))
    
    login_form = LoginForm(request.form)
    if request.method == "POST":
        rif = login_form.rif.data
        n_rif =login_form.n_rif.data
        usuario = rif+""+n_rif
        clave = login_form.clave.data
        user = User.get_by_rif(usuario)
        if user and user.verify_password(clave):
            login_user(user)
            flash(LOGIN)
            return redirect(url_for('.dashboard'))
        else:
            flash(ERROR_USER_PASSWORD ,'error')
    return render_template("auth/login.html", form = login_form, titulo = "Login")

@page.route("/registro", methods = ["GET", "POST"])
#@login_required
def registroUsuario():
    #if current_user.nivel == "cliente":
     #  return redirect(url_for(".panel"))
    registro_form = RegisterForm(request.form)
    if request.method == "POST" and registro_form.validate():
        rif = registro_form.rif.data
        n_rif = registro_form.n_rif.data
        empresa = registro_form.username.data
        correo = registro_form.email.data
        password = registro_form.password.data
        zona = registro_form.zona.data
        nivel = registro_form.nivel.data
        argumentos = (rif+""+n_rif,empresa, password,correo,zona)
        print(argumentos)
        registro = User.create_element(rif+""+n_rif,empresa, password,correo,zona,nivel)
        try:
            mensaje = USER_CREATED
            flash(mensaje)
            welcome_mail(registro)
        except:
            mensaje = "No se registro usuario"
            flash(mensaje)
    return render_template("auth/register_user.html", form = registro_form, titulo = "Registro usuario")

@page.route("/usuario/perfil", methods=['POST','GET'])
@login_required
def perfil():
    rif = current_user.rif
    form = PerfilForm(request.form)
    if request.method == 'POST':
        password = form.password.data
        email = form.email.data
        verify_email = form.verify_email.data
        if password:
            update = User.update_password(rif,password)

        if email:
            #if email == verify_email:
            #flash(P_CONFIRM)
            #   print(email)
            update_email = User.update_email(rif,email)
            print(update_email)

    return render_template("auth/perfil.html",titulo="Cambiar clave",form = form) 

@page.route("/usuarios")
@login_required
def usuarios():
    if current_user.nivel == "Cliente":
        return redirect(url_for('.dashboard'))
    titulo = "Lista usuarios"
    users = User.query.all()
    return render_template("auth/list_users.html",titulo="Usuarios",users=users)

@page.route("/usuario/<rif>", methods = ["GET","POST"])
@login_required
def usuario(rif):
    datos = User.get_by_rif(rif)
    edit_form = EditForm(request.form,obj=datos)
    if request.method == "POST" and edit_form.validate():
        rif = edit_form.rif.data
        empresa = edit_form.username.data
        correo = edit_form.email.data
        zona = edit_form.zona.data
        nivel = edit_form.nivel.data
        codigo = edit_form.codigo.data
        edit = User.update_user(rif,empresa,correo,zona,nivel,codigo)
        mensaje = USER_EDIT
        flash(mensaje)
    return render_template("auth/edit_user.html",titulo="Info usuario", form=edit_form)

@page.route("/reporte-pago", methods=["GET","POST"])
@login_required
def cobranza():
    control_form = RegistroPagoForm(request.form)
    if request.method == "POST":
        rif = current_user.rif
        banco_emisor = control_form.banco_emisor.data
        if control_form.banco_receptor.data:
            banco_receptor = control_form.banco_receptor.data
        elif control_form.banco_receptor_dolar.data:
            banco_receptor = control_form.banco_receptor_dolar.data
        elif control_form.banco_receptor_ppv.data:
            banco_receptor = control_form.banco_receptor_ppv.data 
        elif control_form.banco_receptor_dolar_ppv.data:
            banco_receptor = control_form.banco_receptor_dolar_ppv.data 
        fecha_deposito = control_form.fecha_deposito.data
        n_deposito =  control_form.n_deposito.data
        comprobante = control_form.comprobante.data
        monto = control_form.monto.data
        empresa = current_user.username
        dolares = control_form.dolares.data
        bolivares = control_form.bolivares.data
        estado = 0
        observacion = control_form.observaciones.data
        beneficiario = control_form.empresa_beneficiaria.data
        """f = request.files['archivo']
        filename = secure_filename(f.filename)
        f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))"""
        if  request.files['archivo']:
            imagen = request.files['archivo']
            nombre_imagen = secure_filename(current_user.username + '_' + str(n_deposito)+'_'+imagen.filename)
            ruta_imagen = os.path.abspath(server_adj.format(nombre_imagen))
            ruta_html = '{}'.format(nombre_imagen)
            imagen.save(ruta_imagen)
            if imagen.filename != '':
                post_imagen = ruta_html
                print(post_imagen)
            else:
                pass
        else:
            post_imagen = ""
        print(beneficiario)
        if dolares:
            divisa = "$"
        elif bolivares:
            divisa = "Bs"
        else:
            flash(VALIDATE_FORM)
        print(beneficiario)
        pago = Cobranza.create_element(rif, empresa, banco_emisor, banco_receptor, fecha_deposito, n_deposito ,monto, divisa, comprobante, estado, observacion,beneficiario,rif,post_imagen)
        if pago:
            flash(PAGO_CREADO)
            return redirect(url_for('.dashboard'))
    return render_template("collections/cobranza.html",form = control_form,titulo = 'reporte pago')

@page.route("/Dashboard", methods=["GET","POST"])
@login_required
def dashboard():
    #pagos = current_user.pago
    pagos = Cobranza.get_pagos_order(current_user.rif)
    pago_t = pagos[:3]

    
    # Obtener la página web del Banco Central de Venezuela
    url = "https://www.bcv.org.ve/"
    try:
        r = requests.get(url)

        # Parsear la página web usando BeautifulSoup
        soup = BeautifulSoup(r.content, "html.parser")

        # Encontrar la tabla con la tasa del dólar
        table = soup.find_all("div", class_="col-sm-6 col-xs-6 centrado")
        # Obtener la tasa del dólar
        rate = table[4].text
        #rate = round(float(rate),2)
        rate=float(rate.replace(",", "."))
    except:
        rate = "##"

    return render_template("collections/dashboard.html", titulo = "Dashboard", pagos=pagos, pago_t = pago_t,rate=rate)


@page.route("/lista", methods=["GET","POST"])
@login_required
def lista_cobranza():
    if current_user.nivel == "cliente":
        pagos = Cobranza.get_pagos_order(current_user.rif)
    elif current_user.nivel == "vendedor":
        pagos = Cobranza.get_deposito_by_seller(current_user.user)
    else:
        zona = current_user.zona
        pagos = Cobranza.get_deposito_by_zona(zona)

    return render_template("collections/tabla_cobranza.html", titulo = "Lista Cobranzas", pagos=pagos)

@page.route("/deposito/<int:n>")
@login_required
def deposito(n):
    datos = Cobranza.query.get_or_404(n)

    #datos = Cobranza.get_by_deposito(n)
    return render_template("collections/info_pago.html", titulo = "Deposito",datos=datos)

@page.route("/editar/<int:n>", methods=["GET","POST"])
@login_required
def editar(n):
    datos = Cobranza.get_by_deposito(n)

    #datos = Cobranza.get_by_deposito(n)
    control_form = RegistroPagoForm(request.form, obj=datos)
    form = RegistroPagoForm(request.form,obj=datos)
    if request.method == 'POST':
        datos = Cobranza.update_element(datos.rif, datos.empresa, datos.banco_emisor, datos.banco_receptor, datos.fecha_deposito,datos.n_deposito ,datos.monto, datos.divisa, datos.comprobante, datos.estado, datos.observaciones,datos.rif)
        if datos:
          flash(TASK_UPDATED)    
    
    return render_template("collections/editar.html", titulo = "Editar usuario", form = control_form)


@page.route("/eliminar/<int:n>")
@login_required
def eliminar(n):
    registro = Cobranza.query.get_or_404(n)
    print(registro.n_deposito)

    if Cobranza.delete_element(registro.n_deposito):
        flash(TASK_DELETED)
    
    return redirect(url_for('.lista_cobranza'))

@page.route("/<estado>/<int:n>")
@login_required
def aprobar(estado,n):
    
    registro = Cobranza.query.get_or_404(n)
    print(registro.n_deposito)

    if estado == "aprobado":
        edo = 1
        mensaje = "Pago "+ str(n) + "aprobado"
    elif estado == "negado":
        edo = 2
        mensaje = "Pago "+ str(n) + "rechazado"

    if Cobranza.update_estado(registro.n_deposito,edo):
        flash(mensaje)
    
    return redirect(url_for('.lista_cobranza'))

@page.route("/")
def index():

    return render_template("/landing/index.html",titulo = "Inicio")

@page.route("/nosotros")
def nosotros():

    return render_template("/landing/nosotros.html",titulo = "Nosotros")

@page.route("/soon")
def soon():

    return render_template("/errors/soon.html",titulo = "En construccion")

@page.route("/contacto")
def contacto():
    contact_form = ContactForm(request.form)
    return render_template("/landing/contacto.html",titulo = "Contactanos", form =contact_form)