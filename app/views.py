from flask import Blueprint
from flask import render_template, request, flash, redirect, url_for, abort
from werkzeug.utils import secure_filename
from flask import jsonify
from flask_login import login_user,logout_user,login_required, current_user
from .forms import LoginForm, RegisterForm, RegistroPagoForm,EditForm,PerfilForm,ContactForm, Retenciones
from .models import User, Cobranza, Formula
from . import login_manager
from .consts import *
from .email import welcome_mail, pago_crm_mail, pago_mail, comprobante_mail, comprobante_crm_mail, pago_iva_mail,pago_iva_crm_mail, prepago_crm_mail, prepago_mail, letra_cambio_mail
from flask import session
from flask import send_file
from datetime import datetime
#from .promo import participantes
from .funciones import cadena_md5,obtener_hora_minutos_segundos_fecha,fecha_sap, consulta_basica_sap
from requests.auth import HTTPBasicAuth
from .servicios_consultas import ConsultasSAP
import json
import collections
import random

import requests
from bs4 import BeautifulSoup

import os
local_adj = 'app\\static\\adj\\{}'
server_adj = 'app/static/adj/{}'
APP_VERSION = "20251104_1"
user_fuente = U_FUENTE
contra_fuente = C_FUENTE
ip_fuente = URL_FUENTE

#sdfsdf
page = Blueprint('page', __name__)

@page.context_processor
def inject_version():
    return dict(APP_VERSION=APP_VERSION)

@login_manager.user_loader
def load_user(rif):
    return User.get_by_rif(rif)

@page.route('/logout')
def logout():
    logout_user()
    flash(LOGOUT)
    return redirect(url_for('.login'))

@page.app_errorhandler(500)
def internar_error_server(error):
    flash(ERROR_500,'error')
    return render_template('/errors/500.html'),500

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
            flash("modal", "modal")
            if user.nivel == "corimon":
                return  redirect(url_for('.panel'))
            else:
                return redirect(url_for('.modulos'))
        else:
            flash(ERROR_USER_PASSWORD ,'error')
    return render_template("auth/login.html", form = login_form, titulo = "Login")

import os
from datetime import datetime




@page.route("/panel", methods=["GET"])
def panel():
    files_info = []
    base_dir = os.path.dirname(os.path.abspath(__file__))
    adj_folder = os.path.join(base_dir, 'static', 'adj')
    
    try:
        if os.path.exists(adj_folder):
            for filename in os.listdir(adj_folder):
                file_path = os.path.join(adj_folder, filename)
                if os.path.isfile(file_path) and not filename.endswith('.json'):
                    try:
                        file_size = os.path.getsize(file_path)
                        file_stats = os.stat(file_path)
                        created_time = datetime.fromtimestamp(file_stats.st_ctime)
                        modified_time = datetime.fromtimestamp(file_stats.st_mtime)
                        
                        files_info.append({
                            'key': filename,  
                            'name': filename,
                            'size': format_file_size(file_size),
                            'created': created_time.strftime('%d/%m/%Y %H:%M'),  

                            'created_timestamp': file_stats.st_ctime,
                            'modified_timestamp': file_stats.st_mtime
                        })
                    except OSError:
                        continue
    except OSError:
        pass

    files_info.sort(key=lambda x: x['modified_timestamp'], reverse=True)
    
    return render_template("auth/panel.html", titulo="Panel administrador", files=files_info)


@page.route("/download_panel/<file_key>")
def download_panel_file(file_key):
    print('asdasdasdas')
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'static', 'adj', file_key)
    print(file_path)
    if not os.path.exists(file_path) or file_key.endswith('.json'):
        print(f"File not found or forbidden: {file_key}")   
        redirect(url_for('.modulos'))
    
    try:
        return send_file(
            file_path,
            as_attachment=True,
            download_name=file_key,
            mimetype='application/pdf'
        )
    except FileNotFoundError:
        redirect(url_for('.modulos'))
        
        
        


@page.route("/registro", methods = ["GET", "POST"])
@login_required
def registroUsuario():
    if current_user.nivel == "cliente":
        return redirect(url_for(".panel"))
    registro_form = RegisterForm(request.form)
    if request.method == "POST" and registro_form.validate():
        rif = registro_form.rif.data
        n_rif = registro_form.n_rif.data
        empresa = registro_form.username.data
        correo = registro_form.email.data
        password = registro_form.password.data
        zona = registro_form.zona.data
        nivel = registro_form.nivel.data
        codigo = registro_form.codigo.data
        vendedor = registro_form.vendedor.data
        argumentos = (rif+""+n_rif,empresa, password,correo,zona)
        #print(argumentos)
        registro = User.create_element(rif+""+n_rif,empresa, password,correo,zona,nivel,codigo,vendedor)
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
        confirm_password = form.confirm_password.data
        email = form.email.data
        verify_email = form.verify_email.data
        if password:
            if password==confirm_password:
                print("contra")
                update = User.update_password(rif,password)
                flash(USER_EDIT)
            elif password!=confirm_password:
                flash(USER_ERROR,'error')
        
        if email:
            if email== verify_email:
                flash(USER_EDIT)
                update_email = User.update_email(rif,email)
            elif email != verify_email:
                flash(USER_ERROR, 'error')

    return render_template("auth/perfil.html",titulo="Cambiar clave",form = form) 

@page.route("/usuarios")
@login_required
def usuarios():
    if current_user.nivel == "Cliente":
        return redirect(url_for('.dashboard'))
    users = User.query.all()
    return render_template("auth/list_users.html",titulo="Lista usuarios",users=users)


@page.route("/landing_dos")
def landing_dos():
    Formula.migrate_from_sqlite()
    
    return render_template("nuevo_landing/index.html",titulo="landingDos")

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
        vendedor = edit_form.seller.data
        password = edit_form.password.data
        edit = User.update_user(rif,empresa,correo,zona,nivel,codigo,vendedor)
        if password:
            update = User.update_password(rif,password)
            flash("Contraseña actualizada")
        mensaje = USER_EDIT
        flash(mensaje)
    return render_template("auth/edit_user.html",titulo="Info usuario", form=edit_form)

@page.route("/reporte-pago", methods=["GET","POST"])
@login_required
def cobranza():
    control_form = RegistroPagoForm(request.form)
    if request.method == "POST":
        rif = current_user.rif
        fecha_deposito = control_form.fecha_deposito.data
        fecha_deposito_str = fecha_deposito.strftime("%Y-%m-%d") 
        fecha_objeto = datetime.strptime(fecha_deposito_str, "%Y-%m-%d")
        fecha_formateada = fecha_objeto.strftime("%Y%m%d")
        total= control_form.base_iva.data
        base= control_form.base.data
        if base:
            session['condicion_pago'] = 'base+iva'
        elif total:
            session['condicion_pago'] = 'base'
        session['fecha_pago']=fecha_formateada
        return redirect(url_for('.cobranza2'))
    return render_template("collections/cobranza.html",form = control_form,titulo = 'Registrar Pago')


@page.route("/reportarPago", methods=["GET","POST"])
@login_required
def cobranza2():
  
    control_form = RegistroPagoForm(request.form)
    fecha_pago =  session.get('fecha_pago')
    condicion_pago = session.get('condicion_pago')
    #---------------------------------------------------------------
    sap = ip_fuente+"/sap/bc/rest/zpasdeudores"
    tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha_enc,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
        'FEC_DEP': fecha_pago
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    fecha = datetime.strptime(fecha_pago, "%Y%m%d")  # Usar el mismo formato
    fecha = fecha.strftime("%Y-%m-%d")  # Formato original
    if response.status_code == 200:
        response_json = json.loads(response.content)
        response_json = str(response_json)
        response_json = response_json[1:]
        response_json = response_json[:-1]
        response_json = eval(response_json)
        datos= None
        if isinstance(response_json, dict):
            response_json = [response_json]
        for dic in response_json:
            if 'blart' in dic:
                if dic['blart'] == 'RV':
                    datos = dic
        facturas = sorted(response_json, key= lambda x: x['fecvencr'])
        facturas_vencidas= []
        facturas_NOvencidas= []
        abonos_nc= []
        if (facturas):
            for factura in facturas:
                
                if factura['pagaiva'] != "S":
                    if factura['fecvencr'] < fecha and factura['dmbtr'] >0 :
                        facturas_vencidas.append(factura)
                    elif factura['fecvencr'] >= fecha  and factura['dmbtr'] >0:
                        facturas_NOvencidas.append(factura)
                        facturas_NOvencidas.append('novencidas')
                    elif factura['dmbtr'] <0 and factura['status']=='':
                        abonos_nc.append(factura)     
                
    #---------------------------------------------------------------------

    #--------Porcentaje descuento pag en $--------------------------------------
    sap = ip_fuente + "/sap/bc/rest/zobdecesp"
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'FEC_DEP': fecha_pago
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            response_json_descuento = json.loads(response.content)
            response_json_descuento = str(response_json_descuento)
            response_json_descuento = response_json_descuento[1:]
            response_json_descuento = response_json_descuento[:-1]
            response_json_descuento = eval(response_json_descuento)
            descuento_div = response_json_descuento['descesp']
        except:
            response_json_descuento=[]
            descuento_div = 0
    else:
        descuento_div = 0
    #----------------------------------------------------------------------------------
    #----------------------- Tolerancia-----------------------------------------------
    sap = ip_fuente + "/sap/bc/rest/zobdecesp"
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'TOLERANCIA': 'X'
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            response_json_tolerancia = json.loads(response.content)
            response_json_tolerancia = str(response_json_tolerancia)
            response_json_tolerancia = response_json_tolerancia[1:]
            response_json_tolerancia = response_json_tolerancia[:-1]
            response_json_tolerancia = eval(response_json_tolerancia)
        except:
            response_json_tolerancia=[]
    else:
        descuento_div = 0
    #----------------------------------------------------------

    if request.method == "POST":
        # Obtener los datos enviados desde JavaScript
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
        n_deposito = control_form.n_deposito.data
        comprobante = control_form.comprobante.data
        monto_total = control_form.monto.data
        empresa = current_user.username
        dolares = control_form.dolares.data
        euro = control_form.euro.data
        factura= control_form.factura.data
        bolivares = control_form.bolivares.data
        estado = 0
        observacion = control_form.observaciones.data
        beneficiario = control_form.empresa_beneficiaria.data
        """f = request.files['archivo']
        filename = secure_filename(f.filename)
        f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))"""
        facturas_list = []
        montos_list=[]
        fkdat_list=[]
        belnr1_list=[]
        buzei_list=[]
        blart_list = []
        facturas = response_json[::-1]
        for i in range(len(facturas)):
            factura = request.form.get('inputFactura' + str(i))
            #print(factura)
            if factura:
                facturas_list.append(factura)
            montos = request.form.get('inputfacturaMonto' + str(i))
            if montos:
                montos_list.append(montos)
            fecha= request.form.get('inputfkdat' + str(i))
            if fecha:
                fkdat_list.append(fecha)
            belnr1 = request.form.get('inputbelnr1' + str(i))
            if belnr1:
                belnr1_list.append(belnr1)
            buzei = request.form.get('inputbuzei' + str(i))
            if buzei:
                buzei_list.append(buzei)
            blart = request.form.get('inputblart' + str(i))
            if blart:
                blart_list.append(blart)
        """ 
        print(f"facturas: {facturas_list}")
        print('-------------')
        print(f"montos list: {montos_list}")
        print('-------------')
        print(f"las fechas son: {fkdat_list}")
        print('-------------')
        print(f"las belnr1 son: {belnr1_list}")
        print('-------------')
        print(f"las buzeis son: {buzei_list}")
        print('-------------')
        """
        
        if  request.files['archivo']:
            imagen = request.files['archivo']
            nombre_imagen = secure_filename(current_user.username + '_' + str(n_deposito)+'_'+imagen.filename)
            ruta_imagen = os.path.abspath(server_adj.format(nombre_imagen))
            ruta_html = '{}'.format(nombre_imagen)
            imagen.save(ruta_imagen)
            if imagen.filename != '':
                post_imagen = ruta_imagen
                #print(post_imagen)
            else:
                post_imagen = ''
                nombre_imagen = ''
        else:
            post_imagen = ""
            nombre_imagen =''
        #print(beneficiario)
        if dolares or euro:
            divisa = "D"
        elif bolivares:
            divisa = "B"
        else:
            flash(VALIDATE_FORM)
        #print(beneficiario)
#-----------------------------------------------------------------------------------------------------------------------
        if divisa == "D":
            banco_receptor=1120109001

        if condicion_pago == 'base':
            condicion_pago_pivote= 'X'
        else:
            condicion_pago_pivote = ''
        # Datos en formato JSON que deseas enviar
        url_c = ip_fuente+'/sap/bc/rest/zrecdepo?sap-client=510&ENVIO=C'
        url = ip_fuente+'/sap/bc/rest/zrecdepo?sap-client=510&ENVIO=C'
        data = [{
        'BUKRS': '1200',# por aca ppv o crp
        'XBLNR':n_deposito, #Número de documento de referencia... del pago
        'KUNNR':rif, #Número de deudor codif saps
        'BLDAT':fecha_pago, #Fecha de documento en documento..Fecha pago
        'TIPOPAGO':divisa, #FI AR: Tipo de Pago.... 
        'WRBTR':monto_total, #Importe en la moneda del documento... monto
        'CTABANCO':banco_receptor, #Cuenta Bancaria
        'PROCESADO':'', #Check de Procesado,
        'ABONOCTA':'',#ENVIAR
        'PBASE': condicion_pago_pivote
        }]
        #response_c = requests.post(url_c, auth=HTTPBasicAuth(user_fuente, contra_fuente),json=data,headers=headers,verify=False)
        datos = [{'BUKRS': '1200','XBLNR':n_deposito,'KUNNR':rif,'BLDAT':fecha_pago,'TIPOPAGO':divisa,'WRBTR':monto_total,'CTABANCO':banco_receptor,'PROCESADO':'','ABONOCTA':'','PBASE': condicion_pago_pivote,'BELNR1':belnr1,'VBELN': factura,'buzei':buzei,'BLDATF':fkdat,'MONTOPG': monto,'HORAP':'', 'BLART':blart} for factura, monto, fkdat, belnr1, buzei, blart  in zip(facturas_list, montos_list,fkdat_list,belnr1_list,buzei_list,blart_list)]
        if datos:
            #print('existe')
            pass
        else:
            datos=data     
        #print('cabecera:',data)
        #print('detalle:',datos)
        # Realizar la solicitud POST con los datos en formato JSON
        response = requests.post(url, auth=HTTPBasicAuth(user_fuente, contra_fuente),json=datos,headers=headers,verify=False)
        #print(response)
        # Verificar la respuesta
        if response.status_code == 200:
            #print("Solicitud exitosa")
            #print(response.status_code)
            respuesta = response.content.decode('utf-8')
            #print(response.content)
            if respuesta == "Deposito Enviado Anteriormente por favor Verificar." or respuesta =="Actualizacion de deposito no Satisfactoria datos vacios":
                flash('Deposito repetido','error')
                #print("fallo")
            elif respuesta == "Actualizacion de deposito Satisfactoria":
                #print("todo bien")
                flash(PAGO_CREADO)
                fec = datetime.now()
                fec = fec.strftime('%d/%m/%Y')
                data = {
                'BUKRS': '1200',# por aca ppv o crp
                'XBLNR':n_deposito, #Número de documento de referencia... del pago
                'KUNNR':rif, #Número de deudor codif saps
                'BLDAT':fecha_pago, #Fecha de documento en documento..Fecha pago
                'TIPOPAGO':divisa, #FI AR: Tipo de Pago.... 
                'WRBTR':monto_total, #Importe en la moneda del documento... monto
                'CTABANCO':banco_receptor, #Cuenta Bancaria
                'PROCESADO':'', #Check de Procesado,
                'ABONOCTA':'',#ENVIAR
                'PBASE': condicion_pago_pivote
                }
                pago_crm_mail(current_user, pago = data,post_imagen=post_imagen,nombre_imagen=nombre_imagen, pagos =datos)
                pago_mail(current_user, data, datos)
                return redirect(url_for('.dashboard'))
            #print(response.json())

        else:
            #print("Error en la solicitud, no se envio los detalles del pago")
            flash(ERROR_PAGO,'error')

    print(facturas_NOvencidas)
            #print(response.status_code)
#------------------------------------------------------------------------------------------------------------------------
    
    return render_template("collections/cobranza_2.html",form = control_form,titulo = 'Registrar Pago', facturas = facturas, datos = datos, Fecha_pago=fecha, facturas_vencidas= facturas_vencidas, facturas_NOvencidas=facturas_NOvencidas, condicion_pago =  condicion_pago, abonos_nc= abonos_nc, descuento_div = descuento_div, tolerancia = response_json_tolerancia)

@page.route("/cobranza_ivas", methods= ["GET", "POST"])
@login_required
def cobranza_iva(): 
    control_form = RegistroPagoForm(request.form)
    
    
    
    pago_iva = []
    iva_x_pagar= []
    Fecha_pago =  fecha_sap()
#------------------------------------
    tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
    #Inicializo el cliente de SAP
    sap_client = ConsultasSAP(
        user_fuente=user_fuente,
        contra_fuente=contra_fuente,
        ip_fuente=ip_fuente,
        verificacion_ssl=VERIFICACION_SSL
    )

    try:

        
        #---------------------------------Documentos pendientes-------------------------
        documentos = sap_client.consultar_documentos(
            current_user.rif, 
            tiempo, 
            fecha_enc, 
            cadena
        )
        print(documentos)
        for documento in documentos:
            
            if documento['status']=='':
                if documento['blart'] == 'DZ' and documento['pagaiva']== 'S':
                    pago_iva.append(documento)
                elif documento['blart'] == 'DZ' and documento['dmbtr']>0:
                    iva_x_pagar.append(documento)

        #print(iva_x_pagar)
#---------------------------------IVAs pendientes-------------------------
        ivas_completos = sap_client.consulta_ivas_generico(
            current_user.rif, 
            tiempo, 
            fecha_enc, 
            cadena
        )
        response_json = ivas_completos
        iva_x_pagar=[]
        
        for iva in ivas_completos:
            if iva['statusiva']=='':
                iva_x_pagar.append(iva)
        #print(f" Funcion de la clase realizada{ivas_completos}")
        

    finally:
        # Cerrar sesión
        sap_client.cerrar_sesion()

#---------------------------------Documentos pendientes-------------------------
    """sap = ip_fuente+"/sap/bc/rest/zpasdeudores"
    tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha_enc,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    
    pago_iva = []
    iva_x_pagar= []
    try:
        if response.status_code == 200:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            documentos = response_json

            print(f"Documentos por la funcion de alejandro {documentos}")
            if (documentos):
                for documento in documentos:

                    if documento['status']=='':
                        if documento['blart'] == 'DZ' and documento['pagaiva']== 'S':
                            print(f"asdasdas {documento}")
                            pago_iva.append(documento)
                        elif documento['blart'] == 'DZ' and documento['dmbtr']>0:
                            iva_x_pagar.append(documento)
    except:
        pass"""

#---------------------------------IVAs pendientes-------------------------
    """sap = ip_fuente+"/sap/bc/rest/zpasdeudoiva"
    tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha_enc,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
        'PAGAIVA':'X'
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    """
    '''try:
        if response.status_code == 200:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            ivas = response_json
            
            iva_x_pagar=[]
            print(type(ivas))

            if ivas:

                if isinstance(ivas, dict):
                    iva_x_pagar.append(ivas)

                elif isinstance(ivas, list):
                    for iva in ivas:
                        #print(iva)
                        iva_x_pagar.append(iva)  
        #print(iva_x_pagar)
        
    except:
        pass'''

    #-----------------------------------Tolerancia----------------------------------
    
    #NO HAY TOLERANCIA EN IVA PA
        
    #---------------------------------------------------------------------        

    if request.method == "POST":
        # Obtener los datos enviados desde JavaScript
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
        fecha_deposito_str = fecha_deposito.strftime("%Y-%m-%d") 
        fecha_objeto = datetime.strptime(fecha_deposito_str, "%Y-%m-%d")
        fecha_formateada = fecha_objeto.strftime("%Y%m%d")
        fecha_pago=fecha_formateada
        n_deposito = control_form.n_deposito.data
        comprobante = control_form.comprobante.data
        monto_total = control_form.monto.data
        empresa = current_user.username
        dolares = control_form.dolares.data
        euro = control_form.euro.data
        factura= control_form.factura.data
        bolivares = control_form.bolivares.data


        if  request.files['archivo']:
            imagen = request.files['archivo']
            nombre_imagen = secure_filename(current_user.username + '_' + str(n_deposito)+'_'+imagen.filename)
            ruta_imagen = os.path.abspath(server_adj.format(nombre_imagen))
            ruta_html = '{}'.format(nombre_imagen)
            imagen.save(ruta_imagen)
            if imagen.filename != '':
                post_imagen = ruta_imagen
                #print(post_imagen)
            else:
                post_imagen = ''
                nombre_imagen = ''
        else:
            post_imagen = ""
            nombre_imagen =''




        facturas_list = []
        montos_list=[]
        fkdat_list=[]
        belnr1_list=[]
        buzei_list=[]
        blart_list = []
        facturas = response_json[::-1]
        for i in range(len(facturas)):
            factura = request.form.get('inputFactura' + str(i))
            #print(factura)
            if factura:
                facturas_list.append(factura)
            montos = request.form.get('inputfacturaMonto' + str(i))
            if montos:
                montos_list.append(montos)
            fecha= request.form.get('inputfkdat' + str(i))
            if fecha:
                fkdat_list.append(fecha)
            belnr1 = request.form.get('inputbelnr1' + str(i))
            if belnr1:
                belnr1_list.append(belnr1)
            buzei = request.form.get('inputbuzei' + str(i))
            if buzei:
                buzei_list.append(buzei)
            blart = request.form.get('inputblart' + str(i))
            if blart:
                blart_list.append(blart)
        """
        print(f"facturas: {facturas_list}")
        print('-------------')
        print(f"montos list: {montos_list}")
        print('-------------')
        print(f"las fechas son: {fkdat_list}")
        print('-------------')
        print(f"las belnr1 son: {belnr1_list}")
        print('-------------')
        print(f"las buzeis son: {buzei_list}")
        print('-------------')
        """

        url = ip_fuente+'/sap/bc/rest/zrecdepo?sap-client=510&ENVIO=C'
        headers = {
            'Accept': 'application/json',
            'Origin':'',
            'BUKRS': '1200',
            'KUNNR':current_user.rif,
            'BUDAT':fecha_enc,
            'TIMLO':tiempo,
            'CORIMON':cadena
        }
        data = [{
        'BUKRS': '1200',# por aca ppv o crp
        'XBLNR':n_deposito, #Número de documento de referencia... del pago
        'KUNNR':rif, #Número de deudor codif saps
        'BLDAT':fecha_formateada, #Fecha de documento en documento..Fecha pago
        'TIPOPAGO':'B', #FI AR: Tipo de Pago.... 
        'WRBTR':monto_total, #Importe en la moneda del documento... monto
        'CTABANCO':banco_receptor, #Cuenta Bancaria
        'PROCESADO':'', #Check de Procesado,
        'ABONOCTA':'',#ENVIAR
        'PAGAIVA': 'S'
        }]
        datos = [{'BUKRS': '1200','XBLNR':n_deposito,'KUNNR':rif,'BLDAT':fecha_pago,'TIPOPAGO':'B','WRBTR':monto_total,'CTABANCO':banco_receptor,'PROCESADO':'','ABONOCTA':'','PAGAIVA': 'S','PBASE': '','BELNR1':belnr1,'VBELN': factura,'buzei':buzei,'BLDATF':fkdat,'MONTOPG': monto,'HORAP':'', 'BLART':blart} for factura, monto, fkdat, belnr1, buzei, blart  in zip(facturas_list, montos_list,fkdat_list,belnr1_list,buzei_list,blart_list)]
        # Realizar la solicitud POST con los datos en formato JSON

        if datos:
            pass
            #print('existe')
        else:
            datos=data
            #print("no existe datos")

        #print('cabecera:',data)
        #print('detalle:',datos)
        response = requests.post(url, auth=HTTPBasicAuth(user_fuente, contra_fuente),json=datos,headers=headers,verify=VERIFICACION_SSL)
        #print(response)
        # Verificar la respuesta
        if response.status_code == 200:
            #print("Solicitud exitosa")
            #print(response.status_code)
            respuesta = response.content.decode('utf-8')
            #print(response.content)
            if respuesta == "Deposito Enviado Anteriormente por favor Verificar." or respuesta =="Actualizacion de deposito no Satisfactoria datos vacios":
                flash('Deposito repetido','error')
                #print("fallo")
            elif respuesta == "Actualizacion de deposito Satisfactoria":
                fec = datetime.now()
                fec = fec.strftime('%d/%m/%Y')
                data = {
                'BUKRS': '1200',# por aca ppv o crp
                'XBLNR':n_deposito, #Número de documento de referencia... del pago
                'KUNNR':rif, #Número de deudor codif saps
                'BLDAT':fec, #Fecha de documento en documento..Fecha pago
                'TIPOPAGO':'B', #FI AR: Tipo de Pago.... 
                'WRBTR':monto_total, #Importe en la moneda del documento... monto
                'CTABANCO':banco_receptor, #Cuenta Bancaria
                'PROCESADO':'', #Check de Procesado,
                'ABONOCTA':'',#ENVIAR
                'PAGAIVA': 'S'
                }
                pago_iva_crm_mail(current_user, pago = data,post_imagen=post_imagen,nombre_imagen=nombre_imagen, pagos =datos)
                pago_iva_mail(current_user,data,datos)
                #print("todo bien")
                flash(PAGO_CREADO)

                return redirect(url_for('.dashboard'))

    return render_template("/collections/cobranza_iva.html", titulo = "Pago de Iva", form = control_form, iva_x_pagar=iva_x_pagar, tolerancia = 10)

"""@page.route("/Dashboard", methods=["GET","POST"])
@login_required
def dashboard():
    #pagos = current_user.pago
    pagos = Cobranza.get_pagos_order(current_user.rif)
    pago_t = pagos[:3]

    
    # Obtener la página web del Banco Central de Venezuela
    url = "https://www.bcv.org.ve/"
    
    try:
        url="https://www.bcv.org.ve/"
        r = requests.get(url, verify=False, timeout=10)
        # Parsear la página web usando BeautifulSoup
        soup = BeautifulSoup(r.content, "html.parser")

        # Encontrar la tabla con la tasa del dólar
        table = soup.find_all("div", class_="col-sm-6 col-xs-6 centrado")

        # Obtener la tasa del dólar que es la 4ta de la lista
        rate = table[4].text
        #Remplazo los espacios por no espacios
        rate=rate.replace(" ", "")
        #Remplazo la coma por punto
        rate= rate.replace(",", ".")
        #Redondeo y listo pa
        rate = round(float(rate),2)
        

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
"""

@page.route("/modulos", methods=["GET"])
@login_required
def modulos():
    return render_template("modulos.html", titulo = f"Bienvenido,  {current_user.username.title()}",donde="modulo")




@page.route("/dashboard", methods=["GET"])
@login_required
def dashboard():

    pagos = Cobranza.get_pagos_order(current_user.rif)
    pago_t = pagos[:3]
    Fecha_pago =  fecha_sap()
#------------------------------------
    #Inicializo el cliente de SAP
    sap_client = ConsultasSAP(
        user_fuente=user_fuente,
        contra_fuente=contra_fuente,
        ip_fuente=ip_fuente,
        verificacion_ssl=VERIFICACION_SSL
    )

    try:
        tiempo, fecha = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)
        response_json1 = sap_client.consultar_deudores(
            rif=current_user.rif,
            fecha_pago=Fecha_pago,
            tiempo=tiempo,
            fecha_enc=fecha,
            cadena=cadena
        )
        
        #-----------------------------------Consulta de deudores ResponseJson----------------------------------------------
        response_json = sap_client.consultar_deudores_totales(
            current_user.rif,
            tiempo,
            fecha, 
            cadena
        )

        #-----------------------------------retenciones----------------------------------------------
        response_json2 = sap_client.consultar_retenciones(
            current_user.rif, tiempo, fecha, cadena
        )
        
        #-----------------------------------Facturas pendietes por retencion---------------------------
        certificados_datos, ret = sap_client.consultar_facturas_pendietes_retencion(
            current_user.rif,
            tiempo,
            fecha,
            cadena
        )
        
        #----------------------retenciones pendientes por validacion------------------------------------------------
        retenciones_pendiente_validacion, contador_retenciones_pendientes = sap_client.consultar_retenciones_pendientes(
            current_user.rif,
            tiempo,
            fecha,
            cadena
        )
    
        #-----------------ivas pendientes por pagar---------------
        ivas_pendientes, iva_x_pagar = sap_client.consultar_ivas_pendientes(
            current_user.rif,
            tiempo,
            fecha,
            cadena
        )

    finally:
        # Cerrar sesión
        sap_client.cerrar_sesion()
    
    return render_template("collections/dashboard.html", titulo = "Estado de cuenta", pagos=pagos, pago_t = pago_t,rate=0, no_vencido_dolar=response_json['tnovencdiv'],no_vencido_bs=response_json['tnovencbs'],total_deudas_dolares=response_json['tdeudadiv'],total_deudas_bs=response_json['tdeudabs'], total_saldo_dolar=response_json['tsaldofdiv'],total_saldo_bs=response_json['tsaldofbs'], total_bolos=response_json['totfactbs'],total_vencido_d=response_json['tvencdiv'],total_vencido_b=response_json['tvencbs'],vencido_130_d=response_json['tvenc130d'],vencido_130_b=response_json['tvenc130b'], vencido_3160_d=response_json['tvecc3160d'], vencido_3160_b=response_json['tvecc3160b'], vencido_60_d=response_json['tvec61masd'], vencido_60_b=response_json['tvec61masb'], facturas =response_json1, retenciones=response_json2,contador_fact = ret, deuda_dif_dolar=response_json['tdifedeudadiv'],deuda_dif_bs=response_json['tdifedeudabs'],favor_dif_dolar=response_json['tdifesaldofdiv'],favor_dif_bs=response_json['tdifesaldofbs'],contador_retenciones_pendientes=contador_retenciones_pendientes,iva_x_pagar=iva_x_pagar)
















@page.route("/lista", methods=["GET","POST"])
@login_required
def lista_cobranza():
    """
    if current_user.nivel == "cliente":
        pagos = Cobranza.get_pagos_order(current_user.rif)
    elif current_user.nivel == "vendedor":
        pagos = Cobranza.get_deposito_by_seller(current_user.user)
    else:
        zona = current_user.zona
        pagos = Cobranza.get_deposito_by_zona(zona)
    """
    sap = ip_fuente+"/sap/bc/rest/zpasdeudores"
    tiempo, fecha = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)

    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente),params=args, headers=headers,verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            if isinstance(response_json , dict):
                response_json = [response_json]
            #print(response_json)
        except:
            #print("nada")
            response_json = []
   #-----------------ivas pendientes por pagar---------------
    sap = ip_fuente+"/sap/bc/rest/zpasdeudoiva"

    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
        'PAGAIVA':'X'
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    try:
        if response.status_code == 200:
            response_json5 = json.loads(response.content)
            response_json5 = str(response_json5)
            response_json5 = response_json5[1:]
            response_json5 = response_json5[:-1]
            response_json5 = eval(response_json5)
            ivas = response_json5
            iva_x_pagar= []

            if (ivas):
                for iva in ivas:
                    if iva['statusiva']=='P':
                            iva_x_pagar.append(iva) 
            #print(iva_x_pagar) 
    except:
        iva_x_pagar = []
    return render_template("collections/tabla_cobranza.html", titulo = "Documentos Pendientes", pagos=response_json, ivas = iva_x_pagar)

@page.route("/pagos", methods=["GET","POST"])
@login_required
def pagos_cobranza():
    sap = ip_fuente+"/sap/bc/rest/zstpagosrec"
    tiempo, fecha = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)

    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente),params=args, headers=headers,verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            if isinstance(response_json , dict):
                response_json = [response_json]
            #print(response_json)
        except:
            #print("nada")
            response_json = []
    return render_template("collections/pagos_cobranza.html", titulo = "Pagos realizados", pagos=response_json)


@page.route('/ejemplo<n>', methods=['GET'])
def ejemplo(n):
        sap = ip_fuente+"/sap/bc/rest/zcomdeudores"
        tiempo, fecha = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200', current_user.rif, tiempo, fecha)
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': current_user.rif,
            'BUDAT': fecha,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': 'J294592210',
            'MESES': n
        }

        response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=False)

        if response.status_code == 200:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            #print("Exito en la peticion")
        else:
            pass
            #print('Error en la peticion')
        return jsonify(response_json)

@page.route("/historial", methods=['POST', 'GET'])
@login_required
def historial():
    if request.method == 'GET':
        # Obtener y procesar los datos necesarios para el template
        sap = ip_fuente+"/sap/bc/rest/zcomdeudores"
        tiempo, fecha = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200', current_user.rif, tiempo, fecha)
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': current_user.rif,
            'BUDAT': fecha,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': current_user.rif,
            'MESES': ''
        }
        response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
        if response.status_code == 200:
            try:
                response_json = json.loads(response.content)
                response_json = str(response_json)
                response_json = response_json[1:]
                response_json = response_json[:-1]
                response_json = eval(response_json)
                #print(response_json)
                #print("Exito en la peticion")
            except:
                response_json = []
        else:
            pass#print('Error en la peticion')
        return render_template("collections/historial_pagos.html", titulo="Historial de documentos verificados", pagos=response_json)
    else:
        # Manejar otros métodos HTTP (PUT, DELETE, etc.) si es necesario
        return jsonify({'error': 'Método HTTP no permitido'}), 405
    
@page.route("/documento-historial/<n>-<i>")
@login_required
def doc_historial(n,i):
    if request.method == 'GET':
        # Obtener y procesar los datos necesarios para el template
        sap = ip_fuente+"/sap/bc/rest/zcomdeudores"
        tiempo, fecha = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200', current_user.rif, tiempo, fecha)
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': current_user.rif,
            'BUDAT': fecha,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': current_user.rif,
            'MESES': '12'
        }
        response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
        if response.status_code == 200:
            try:
                response_json = json.loads(response.content)
                response_json = str(response_json)
                response_json = response_json[1:]
                response_json = response_json[:-1]
                response_json = eval(response_json)
                #print(response_json)
                #print("Exito en la peticion")
            except:
                response_json = []

    for dic in response_json:
        if 'vbeln' in dic and dic['vbeln'] ==n and dic['buzei']==i:
            datos = dic
                #print(dic)
    #print(datos['vbeln'] )
    
    return render_template("collections/info_factura.html", titulo = "",datos=datos)

@page.route('/verificar-factura/<factura_id>-<i>-<p>')
def verificar_factura(factura_id,i,p):
    try:
        sap = ip_fuente+"/sap/bc/rest/zvistafactdigit"
        tiempo, fecha = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)
        headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha,
        'TIMLO':tiempo,
        'CORIMON':cadena
        }
        args = {
            'sap-client':'510',
            'SOCIEDAD': '1200',
            'FACTURA':factura_id,
        }
        response = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=False)

        response.raise_for_status()  # Lanza excepción para códigos 4XX/5XX
        
        data = response.json()
        
        # 2. Verificar si existe URL en la respuesta
        if data.get('url'):  # Cambia 'url_factura' por el campo real
            # 3. Redirigir a la URL externa
            return redirect(data['url'], code=302)
        else:
            # 4. Redirigir a ruta interna alternativa
            if p == "p":
                return redirect(url_for('.documento',n=factura_id,i=i))
            elif p =="h":
                return redirect(url_for('.doc_historial',n=factura_id,i=i))
            elif p=="c":
                return redirect(url_for('.doc_certificado',n=factura_id,i=i))
            
    except requests.exceptions.RequestException as e:
        try:
            if p == "p":
                return redirect(url_for('.documento',n=factura_id,i=i))
            elif p =="h":
                return redirect(url_for('.doc_historial',n=factura_id,i=i))
            elif p=="c":
                return redirect(url_for('.doc_certificado',n=factura_id,i=i))
        except:
            return "Información no disponible"

@page.route("/certificados-pendientes")
@login_required
def certificados_pendientes():
    sap = ip_fuente+"/sap/bc/rest/zcertrete"

    tiempo, fecha = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)

    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }

    args = {
        'sap-client':'510',
        'ENVIO':'D',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }

    #response_post = requests.post(url, data=json.dumps(payload), headers=headers)
    response = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=VERIFICACION_SSL)
    #time.sleep(5)
    try:
        if response.status_code == 200:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            #print(len(response_json))
            #print("Exito en la peticion")
        else:
            pass
            #print('Error en la peticion')
    except:
        response_json = []
    return render_template("collections/certificados_pendientes.html", titulo = "Facturas Pendientes por Comprobantes",pagos=response_json)


"""@page.route("/deposito/<int:n>")
@login_required
def deposito(n):
    datos = Cobranza.query.get_or_404(n)
    #datos = Cobranza.get_by_deposito(n)
    return render_template("collections/info_pago.html", titulo = "Deposito",datos=datos)"""


@page.route("/documento/<n>-<i>")
@login_required
def documento(n,i):
    sap = ip_fuente+"/sap/bc/rest/zpasdeudores"
    tiempo, fecha = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)
    headers = {
    'Accept': 'application/json',
    'Origin':'',
    'BUKRS': '1200',
    'KUNNR':current_user.rif,
    'BUDAT':fecha,
    'TIMLO':tiempo,
    'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=False)
    #print(response.url)
    if response.status_code == 200:
        response_json = json.loads(response.content)
        response_json = str(response_json)
        response_json = response_json[1:]
        response_json = response_json[:-1]
        response_json = eval(response_json)
        for dic in response_json:
            if 'vbeln' in dic and dic['vbeln'] ==n and dic['buzei']==i:
                datos = dic
                #print(dic)
        #print(datos['vbeln'] )
    return render_template("collections/info_factura.html", titulo = "Factura",datos=datos)


"""@page.route("/editar/<int:n>", methods=["GET","POST"])
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
    return render_template("collections/editar.html", titulo = "Editar usuario", form = control_form)"""


"""@page.route("/eliminar/<int:n>")
@login_required
def eliminar(n):
    registro = Cobranza.query.get_or_404(n)
    print(registro.n_deposito)

    if Cobranza.delete_element(registro.n_deposito):
        flash(TASK_DELETED)
    
    return redirect(url_for('.lista_cobranza'))"""

"""@page.route("/<estado>/<int:n>")
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
    
    return redirect(url_for('.lista_cobranza'))"""

@page.route("/")
def index():

    return render_template("/landing/index.html",titulo = "Inicio")




local_consultoria = 'app\\static\\consultoria_tecnica\\{}'
server_consultoria = 'app/static/consultoria_tecnica/{}'

# Lista blanca de archivos
ARCHIVOS_MOSTRAR = {
    'folleto-productos-industriales.pdf': 'Folleto de los Productos Industriales y Marinos.pdf',
    'libro-resistencias-quimicas-epomon-epoxi.pdf':'Libro de Resistencias Químicas del Epomon Epoxi Fenólico.pdf',
    'manual-hojas-tecnicas-MIM.pdf':'Manual de Hojas Técnica MIM.pdf',
    'manual-hojas-tecnicas-ARQ.pdf': 'Manual de Hojas Técnicas ARQ.pdf'

}

@page.route("/consultoria_tecnica")
def consultria_tecnica():
    files_info = []
    
    for file_key, display_name in ARCHIVOS_MOSTRAR.items():
        # Intentar con ruta local primero, luego servidor
        try:
            file_path = local_consultoria.format(display_name)
            print(file_path)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                files_info.append({
                    'key': file_key,
                    'name': display_name,
                    'size': format_file_size(file_size)
                })
            else:
                # Probar con ruta de servidor
                file_path = server_consultoria.format(display_name)
                print(file_path)
                if os.path.exists(file_path):
                    file_size = os.path.getsize(file_path)
                    files_info.append({
                        'key': file_key,
                        'name': display_name,
                        'size': format_file_size(file_size)
                    })
        except OSError:
            continue  
        
        print(files_info)
    
    return render_template("/landing/material_apoyo.html",  titulo="Material de Apoyo", files=files_info)

@page.route("/download/<file_key>")
def download_file(file_key):

    if file_key not in ARCHIVOS_MOSTRAR:
        abort(404)
    
    
    filename = ARCHIVOS_MOSTRAR[file_key]
    

    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'static', 'consultoria_tecnica', filename)
    
    if not os.path.exists(file_path):
        print(f"File not found: {filename}")
        abort(404)
    
    try:
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    except FileNotFoundError:
        abort(404)
        
        
def format_file_size(bytes_size):
    """Convertir bytes a formato legible"""
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024**2:
        return f"{bytes_size/1024:.1f} KB"
    else:
        return f"{bytes_size/(1024**2):.1f} MB"
    
    
@page.route("/nosotros")
def nosotros():

    return render_template("/landing/nosotros.html",titulo = "Nosotros")

@page.route("/Promocion",  methods=["GET","POST"] )
def Promocion():
    # Listas de participantes por estado
    participantes_oriente_sur = []
    participantes_oriente_norte = []
    participantes_capital = []
    participantes_centro = []
    participantes_centro_occidente = []
    participantes_occidente = []
    participantes_limpio = []
    ganadores_motos = []
    ganadores_tv = []
    ganadores_cel = []

    # Abre el archivo JSON
    with open("Data.json", encoding="utf-8-sig") as f:
        participantes = json.load(f)

    # Calcula la dimensión del JSON
    dimension = len(participantes)
    #print("Cantidad de participantes total: ", dimension )
    #print("----------------------------------------------------------------------------------------------------------")
    # Lista de ganadores
    ganadores = 12

    # Cuenta el número de eventos de cada participante
    #veces_participado = collections.Counter([participante["Cédula"] for participante in participantes])

    """# Imprime el resultado
    for nombre, veces in veces_participado.items():
        if  veces > 3:
            print(f"{nombre}: {veces}")
        else:
            participantes_limpio.append(veces_participado)"""
    

    # Recorre los participantes
    for participante in participantes:
        # Asigna el participante a la lista correspondiente
        state = participante["Estado"]
        if state == "Monagas" or state=="Bolívar":
            if participante["Cédula"] == 28429763:
                pass
            else:
                participantes_oriente_sur.append(participante)
        elif state == "Miranda" or state=="La Guaira" or state =="Distrito Capital":
                participantes_capital.append(participante)
        elif state == "Anzoátegui" or state == "Sucre" or state=="Nueva Esparta" or state == "Aragua" or state =="Carabobo" or state =="Cojedes" or state =="Guárico" or state == "Yaracuy" or state =="Lara" or state=="Portuguesa" or state == "Barinas"or state=="Zulia" or state=="Táchira" or state=="Falcón" or state=="Mérida" or state=="Trujillo":
                participantes_centro.append(participante)

    # Mezcla la lista de participantes
    random.shuffle(participantes_oriente_sur)

    #random.shuffle(participantes_oriente_norte)

    random.shuffle(participantes_capital)

    random.shuffle(participantes_centro)

    # Realiza el sorteo
    ganadores_oriente_sur = random.sample(participantes_oriente_sur, ganadores)
    
    #ganadores_oriente_norte = random.sample(participantes_oriente_norte, ganadores)

    ganadores_capital = random.sample(participantes_capital, ganadores)

    ganadores_centro = random.sample(participantes_centro, ganadores)
    
    def ganadores(ganadores,zona,participantes):
    # Imprime los ganadores
        long = len(participantes)
        #print("GANADORES ",zona,": ")
        print("Cantidad de participantes región: ",zona,": ", long )
        i=0
        #for ganador in ganadores:
        #    print(f"Ganador: {ganador['Nombre']} {ganador['Apellido']} factura: {ganador['# Factura']} Tienda: {ganador['Tienda']}")
        #   i=i+1
        print("----------------------------------------------------------------------------------------------------------")
    

    ganadores(ganadores_oriente_sur, "Oriente Sur", participantes_oriente_sur)
    #ganadores(ganadores_oriente_norte, "Oriente Norte", participantes_oriente_norte)
    ganadores(ganadores_capital,"Capital", participantes_capital)
    ganadores(ganadores_centro, "Zona 3", participantes_centro)
    #ganadores(ganadores_centro_occidente, "Centro Occidente", participantes_centro_occidente)
    #ganadores(ganadores_occidente, "Occidente", participantes_occidente)


    ganadores_motos = ganadores_oriente_sur[0:2]

    ganadores_tv = ganadores_oriente_sur[2:6]

    ganadores_cel = ganadores_oriente_sur[6:12]

    ganadores_motos2 = ganadores_capital[0:2]

    ganadores_tv2 = ganadores_capital[2:6]

    ganadores_cel2 = ganadores_capital[6:12]

    ganadores_motos3 = ganadores_centro[0:2]

    ganadores_tv3 = ganadores_centro[2:6]

    ganadores_cel3 = ganadores_centro[6:12]

    ganadores_motos.extend(ganadores_motos2)

    ganadores_motos.extend(ganadores_motos3)

    ganadores_cel.extend(ganadores_cel2)

    ganadores_cel.extend(ganadores_cel3)

    ganadores_tv.extend(ganadores_tv2)

    ganadores_tv.extend(ganadores_tv3)

    random.shuffle(ganadores_motos)
    random.shuffle(ganadores_cel)
    random.shuffle(ganadores_tv)

    #ganadores_motos = json.dumps(ganadores_motos)

    #print(ganadores_motos)

    """
    json = list(ganadores_capital)


    # Extrae los dos primeros elementos
    json_moto = json[0:2]

    json_tv = json[2:5]

    json_tlf = json[5:11]
    """

    # Imprime los dos primeros elementos
    #ganadores(ganadores_motos,"Moto",ganadores_motos)

    #ganadores( ganadores_tv ,"Tv", ganadores_tv)

    #ganadores( ganadores_cel ,"Tlf",ganadores_cel)

    ganadores = []

    ganadores.extend(ganadores_motos)

    ganadores.extend(ganadores_tv)

    ganadores.extend(ganadores_cel)

    # Abre el archivo JSON
    archivo = open("ganadores.json", "w")

    # Codifica el JSON
    contenido = json.dumps(ganadores)

    # Escribe el contenido del archivo
    archivo.write(contenido)

    # Cierra el archivo
    archivo.close()

    return render_template("/Promos/Promocion.html",titulo = "Promocion", participantes=participantes, ganadores_motos =ganadores_motos, ganadores_tv=ganadores_tv, ganadores_cel=ganadores_cel)

@page.route("/soon")
def soon():

    return render_template("/errors/soon.html",titulo = "En construccion")

@page.route("/contacto")
def contacto():
    contact_form = ContactForm(request.form)
    return render_template("/landing/contacto.html",titulo = "Contactanos", form =contact_form)

@page.route("/productos", methods= ["GET"])
def products():

    return render_template("/products/Productos.html",titulo = "Productos")

@page.route("/productos/detalles", methods= ["GET", "POST"])
def details():

    return render_template("/products/detalles.html",titulo = "Detalles")

@page.route("/retenciones", methods= ["GET"])
@login_required
def ret_enviadas():
    sap = ip_fuente+"/sap/bc/rest/zcertrete"
    tiempo, fecha = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)
    headers = {
    'Accept': 'application/json',
    'Origin':'',
    'BUKRS': '1200',
    'KUNNR':current_user.rif,
    'BUDAT':fecha,
    'TIMLO':tiempo,
    'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'ENVIO':'C',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=VERIFICACION_SSL)
    try:
        if response.status_code == 200:
            response_json = json.loads(response.content)
            response_json = str(response_json)
            response_json = response_json[1:]
            response_json = response_json[:-1]
            response_json = eval(response_json)
            #print(response_json)
            #print("Exito en la peticion")
        else:
            pass#print('Error en la peticion')
    except:
        response_json = []
    try:
        ret_pendiente = []
        for retencion in response_json:
            if retencion['status'] == 'P':
                ret_pendiente.append(retencion)
    except:
        response_json = [response_json]
    return render_template("/collections/ret_enviadas.html",titulo = "Estado Retención", retenciones=response_json)

@page.route("/registrar_retenciones", methods= ["GET", "POST"])
@login_required
def retenciones():
    control_form = Retenciones(request.form)
    if request.method == "POST":
        n_retencion= control_form.n_comprobante.data
        archivo= control_form.comprobante.data
        if  request.files['archivo']:
            imagen = request.files['archivo']
            nombre_imagen = secure_filename(current_user.username + '_'+ 'RET' + '_' + str(n_retencion)+'_'+imagen.filename)
            ruta_imagen = os.path.abspath(server_adj.format(nombre_imagen))
            ruta_html = '{}'.format(nombre_imagen)
            imagen.save(ruta_imagen)
            if imagen.filename != '':
                post_imagen = ruta_imagen
                #print(post_imagen)
            else:
                post_imagen = ''
                nombre_imagen = ''
        else:
            post_imagen = ""
            nombre_imagen =''


        sap = ip_fuente+"/sap/bc/rest/zcertrete"
        tiempo, fecha = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)
        headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha,
        'TIMLO':tiempo,
        'CORIMON':cadena
        }
        args = {
            'sap-client':'510',
            'ENVIO':'S',
            'SOCIEDAD': '1200',
            'CLIENTE':current_user.rif,
            'C_RET':n_retencion
        }
        response = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=VERIFICACION_SSL)
        if response.status_code == 200:
            #print("Exito en la peticion")
            flash(RET_REGISTRADA)
            comprobante_mail(current_user, n_retencion)
            comprobante_crm_mail(current_user, n_retencion,post_imagen,nombre_imagen)
            return redirect(url_for('.dashboard'))
        else:
            flash("Error al registrar",'error')
            #print('Error en la peticion')
        
    return render_template("/collections/registrar_retenciones.html",titulo = "Registrar Comprobante de Retención", form = control_form)

@page.route("/dashboard2", methods= ["GET", "POST"])
def dashboard2():
    pagos = Cobranza.get_pagos_order(current_user.rif)
    pago_t = pagos[:3]
    Fecha_pago =  fecha_sap()
#------------------------------------
    sap = ip_fuente+"/sap/bc/rest/zpasdeudores"
    tiempo, fecha = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha)
    headers = {
        'Accept': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
        'FEC_DEP': Fecha_pago
    }
    response1 = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args,headers=headers, verify=VERIFICACION_SSL)
    #print(response.url)
    if response1.status_code == 200:
        response_json1 = json.loads(response1.content)
        response_json1 = str(response_json1)
        response_json1 = response_json1[1:]
        response_json1 = response_json1[:-1]
        response_json1 = eval(response_json1)
        #print(response_json1)
        for dic in response_json1:
            if 'blart' in dic:
                if dic['blart'] == 'RV':
                    datos = dic
                    #print(dic)
        #print(datos )
    #---------------------------------------------------------------
#----------------------------------------
    sap = ip_fuente+"/sap/bc/rest/zpasdeudores"
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
        'TOTALES':'X'
    }
    response = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args,headers=headers, verify=VERIFICACION_SSL)
    if response.status_code == 200:

        response_json = json.loads(response.content)
        response_json = str(response_json)
        response_json = response_json[1:]
        response_json = response_json[:-1]
        response_json = eval(response_json)

        print('Importe en moneda local($):',response_json['dmbtr'] )
        print('Total facturas(Bs):' ,response_json['totfactbs'])
        print(Fecha_pago) 
    #-----------------------------------retenciones----------------------------------------------
    args = {
        'sap-client':'510',
        'ENVIO':'C',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response_ret = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=VERIFICACION_SSL)
    if response_ret.status_code == 200:
        response_json2 = json.loads(response_ret.content)
        response_json2 = str(response_json2)
        response_json2 = response_json2[1:]
        response_json2 = response_json2[:-1]
        response_json2 = eval(response_json2)
        print("Exito en la peticion")
    else:
        print('Error en la peticion')
    #----------------------------------------------------------------------------------------------

    #-----------------------------------Facturas pendietes por retencion---------------------------
    sap = ip_fuente+"/sap/bc/rest/zcertrete"
    args = {
        'sap-client':'510',
        'ENVIO':'D',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif,
    }
    response_fact = requests.get(sap,auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers,verify=VERIFICACION_SSL)
    if response_fact.status_code == 200:
        response_json3 = json.loads(response_fact.content)
        response_json3 = str(response_json3)
        response_json3 = response_json3[1:]
        response_json3 = response_json3[:-1]
        response_json3 = eval(response_json3)
        print("Exito en la peticion")
    else:
        print('Error en la peticion')
    ret = len(response_json3)
    return render_template("collections/dashboard2.html", titulo = "Estado de cuenta", pagos=pagos, pago_t = pago_t,rate=0,total_dolares=response_json['dmbtr'],total_bolos=response_json['totfactbs'],total_vencido_d=response_json['tvencdiv'],total_vencido_b=response_json['tvencbs'],vencido_130_d=response_json['tvenc130d'],vencido_130_b=response_json['tvenc130b'], vencido_3160_d=response_json['tvecc3160d'], vencido_3160_b=response_json['tvecc3160b'], vencido_60_d=response_json['tvec61masd'], vencido_60_b=response_json['tvec61masb'], facturas =response_json1, retenciones=response_json2,contador_fact = ret)







@page.route("/prepago", methods= ["GET", "POST"])
def prepago():
    prepago_form = RegistroPagoForm(request.form)

    #---------------------------------------------------------------
    sap = ip_fuente+"/sap/bc/rest/zentregas"
    tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha_enc,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE':current_user.rif
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)

    if response.status_code == 200:
        try:
            data = response.json()
            
            if not data or not isinstance(data, list):
                return jsonify({'error': 'Se esperaba un array JSON'}), 400
            
            resultados = []
            print('=====================================RESULTADOS EN CRUDO====================================================')
            print(data)
            print("================================================================================")
            
            # Validar si los datos están vacíos
            def es_entrega_vacia(entrega):
                """Verifica si una entrega está vacía o con datos por defecto"""
                return (
                    not entrega.get('entrega') or entrega.get('entrega') == '' or
                    entrega.get('fechaem') == '0000-00-00' or
                    (entrega.get('montodiv') == 0.0 and entrega.get('montobs') == 0.0)
                )

            for entrega in data:
                if es_entrega_vacia(entrega):
                    print('asdasdasdasdasdasd')
                    resultado_vacio = {
                        'encabezado': {
                            'numero_entrega': '',
                            'numero_pedido': '',
                            'fecha_emision': '',
                            'monto_dolares': 0.0,
                            'iva_dolares': 0.0,
                            'monto_bolivares': 0.0,
                            'iva_bolivares': 0.0,
                            'tasa_cambio': 0.0,
                            'total_dolares': 0.0,
                            'total_bolivares': 0.0,
                            'termino_pago': '',
                            'moneda': '',
                            'monto_abonado_bolivares': 0.0,
                            'monto_abonado_dolares': 0.0
                        },
                        'detalle': {
                            'total_items': 0,
                            'monto_total_detalle': 0.0,
                            'items': [],
                            'cantidad_items': 0
                        },
                        'vacio': True  
                    }
                    resultados.append(resultado_vacio)
                else:
                    resultado_entrega = procesar_entrega_individual(entrega)
                    resultado_entrega['vacio'] = False
                    resultados.append(resultado_entrega)
            """return jsonify({
                'total_entregas': len(resultados),
                'entregas_procesadas': resultados
            })"""

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        print(resultados)
        
    fecha_pago = datetime.today().strftime("%Y%m%d")
    #--------Porcentaje descuento pag en $--------------------------------------
    sap = ip_fuente + "/sap/bc/rest/zobdecesp"
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'FEC_DEP': fecha_pago
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            response_json_descuento = json.loads(response.content)
            response_json_descuento = str(response_json_descuento)
            response_json_descuento = response_json_descuento[1:]
            response_json_descuento = response_json_descuento[:-1]
            response_json_descuento = eval(response_json_descuento)
            descuento_div = response_json_descuento['descesp']
        except:
            response_json_descuento=[]
            descuento_div = 0
    else:
        descuento_div = 0
    #----------------------- Tolerancia-----------------------------------------------
    sap = ip_fuente + "/sap/bc/rest/zobdecesp"
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'TOLERANCIA': 'X'
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            response_json_tolerancia = json.loads(response.content)
            response_json_tolerancia = str(response_json_tolerancia)
            response_json_tolerancia = response_json_tolerancia[1:]
            response_json_tolerancia = response_json_tolerancia[:-1]
            response_json_tolerancia = eval(response_json_tolerancia)
        except:
            response_json_tolerancia=[]
    else:
        response_json_tolerancia=[]
    return render_template("collections/prepago.html", titulo = "Prepago", resultado = resultados, form = prepago_form, resultados = resultados, excluir_app_js=True, tolerancia = response_json_tolerancia, descuento_div = descuento_div)



@page.route("/prepagoPost", methods=['POST'])
def prepagoPost():
    try:
        datos_json = request.form.get('data')
        if datos_json:
            datos = json.loads(datos_json)
        else:
            datos = {}
        
        archivo = request.files.get('soporte_pago')
        n_deposito= datos.get('ref')
        rif = datos.get('rif')
        banco_receptor= datos.get('banco_receptor')
        fecha = datos.get('fecha')
        dt = datetime.strptime(fecha, "%Y-%m-%d")
        fecha_pago = dt.strftime("%Y%m%d")
        tipoPago = datos.get('tipoPago')
        monto = datos.get('monto')
        divisa = "D" if  tipoPago == "$" else "B"
        
        seleccionada = datos.get("facturasSeleccionadas", [])
        print(datos)
        data = [
            {
                'BUKRS': '1200',
                'XBLNR': n_deposito,
                'KUNNR': rif,
                'BLDAT': fecha_pago,
                'TIPOPAGO': divisa,
                'WRBTR': monto,
                'CTABANCO': banco_receptor,
                'PROCESADO': '',
                "BELNR1": entrega["encabezado"]["numero_pedido"],       
                "VBELN": entrega["encabezado"]["numero_entrega"],       
                "BUZEI": "010",                           
                "BLDATF": entrega["encabezado"]['fecha_emision'],
                "MONTOPG": entrega["encabezado"]['monto_abonado'] if entrega["encabezado"]['monto_abonado']else (entrega["encabezado"]["total_dolares"] if divisa == "D" else entrega["encabezado"]["total_bolivares"]),
                "ENTREGA": entrega["encabezado"]["numero_entrega"],
                'PREPAGO': "X"
            }
            for entrega in seleccionada
        ]
        print(data)

        if  archivo:
            nombre_imagen = secure_filename(current_user.username + '_' + str(n_deposito)+'_'+archivo.filename)
            ruta_imagen = os.path.abspath(server_adj.format(nombre_imagen))
            ruta_html = '{}'.format(nombre_imagen)
            archivo.save(ruta_imagen)
            if archivo.filename != '':
                post_imagen = ruta_imagen
                #print(post_imagen)
            else:
                post_imagen = ''
                nombre_imagen = ''
        else:
            post_imagen = ""
            nombre_imagen =''
            

        
        url = ip_fuente+'/sap/bc/rest/zrecdepo?sap-client=510&ENVIO=C'
        tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin':'',
            'BUKRS': '1200',
            'KUNNR':current_user.rif,
            'BUDAT':fecha_enc,
            'TIMLO':tiempo,
            'CORIMON':cadena
        }
        args = {
            'sap-client':'510',
            'SOCIEDAD': '1200',
            'CLIENTE':current_user.rif
        }
        
        print(data)
        response = requests.post(
            url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente),
            json=data,
            headers=headers,
            verify=VERIFICACION_SSL)

        print(f"El estatus fué:{response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:

            respuesta = response.content.decode('utf-8')

            if respuesta == "Deposito Enviado Anteriormente por favor Verificar.":
                print("deposito repetido")
                return jsonify({
                    "success": False,
                    "message": respuesta
                }), 200

            elif respuesta == "Actualizacion de deposito Satisfactoria":
                #print("todo bien")
                flash(PAGO_CREADO)
                prepago_crm_mail(current_user, datos, post_imagen,nombre_imagen)
                prepago_mail(current_user, datos )
                return jsonify({
                    "success": True,
                    "message": "Pago creado exitosamente",
                    "redirect": url_for('.dashboard')  # Envía la URL como JSON
                }), 200
            
            else:
                print('anad')

        else:
            print(respuesta)
            print('aqui')
            return jsonify({
                "success": False,
                "message": f"Error en la respuesta del servidor: {response.status_code}"
            }), response.status_code
            
    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500


def procesar_entrega_individual(entrega):
    """Procesa una entrega individual con su detalle"""
    
    # Extraer datos principales
    datos_principales = {
        'numero_entrega': entrega.get('entrega'),
        'numero_pedido': entrega.get('pedido'),
        'fecha_emision': entrega.get('fechaem'),
        'monto_dolares': entrega.get('montodiv'),
        'iva_dolares': entrega.get('ivadiv'),
        'monto_bolivares': entrega.get('montobs'),
        'iva_bolivares': entrega.get('ivabs'),
        'tasa_cambio': entrega.get('tasa'),
        'total_dolares': entrega.get('dppdiv') if entrega.get('dppdiv') >0 else float(entrega.get('montodiv'))+float(entrega.get('ivadiv')) ,
        'total_bolivares': entrega.get('dppbs') if entrega.get('dppbs') >0 else float(entrega.get('montobs'))+float(entrega.get('ivabs')),
        'termino_pago': entrega.get('zterm'),
        'moneda': entrega.get('moneda'),
        'monto_abonado_bolivares': entrega.get('montpgbs') or 0,
        'monto_abonado_dolares': entrega.get('montpgdiv') or 0,
        'TieneDPP': True if entrega.get('dppdiv') >0 or entrega.get('dppbs') >0 else False,
        'base_bono_sin_dpp': entrega.get('bsepbonp') or 0,
        'base_bono_dpp': entrega.get('bbonpdpp') or 0,
        'condicion_pago': f" {entrega.get('zterm')}-{entrega.get('text1')} ",
        'bonificacion_pago_divisa_sindpp': entrega.get('montbono') or 0,
        'bonificacion_pago_divisa_condpp': entrega.get('mbonodpp') or 0
        
    }


    # Procesar el detalle anidado
    detalle = entrega.get('detalle', [])
    items_procesados = []
    total_items = 0
    monto_total_detalle = 0
    
    for item in detalle:
        item_procesado = {
            'posicion': item.get('posicion'),
            'material': item.get('material'),
            'descripcion': item.get('descripcion'),
            'cantidad': float(item.get('total', 0)),
            'precio': float(item.get('precio', 0)),
            'precio_unitario': float(item.get('preunitario', 0)),
            'descuento': float(item.get('descuento', 0)),
            'monto_total_item': float(item.get('montototal', 0))
        }
        
        items_procesados.append(item_procesado)
        total_items += item_procesado['cantidad']
        monto_total_detalle += item_procesado['monto_total_item']
    
    return {
        'encabezado': datos_principales,
        'detalle': {
            'total_items': total_items,
            'monto_total_detalle': monto_total_detalle,
            'items': items_procesados,
            'cantidad_items': len(items_procesados)
        }
    }



@page.route("/otras_deudas", methods= ["GET", "POST"])
def otras_deudas():
    letra_cambio_form = RegistroPagoForm(request.form)
    #---------------------------------------------------------------

    sap = ip_fuente+"/sap/bc/rest/zlccp_b2b"
    tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
    cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin':'',
        'BUKRS': '1200',
        'KUNNR':current_user.rif,
        'BUDAT':fecha_enc,
        'TIMLO':tiempo,
        'CORIMON':cadena
    }
    args = {
        'sap-client':'510',
        'SOCIEDAD': '1200',
        'CLIENTE': current_user.rif  #current_user.rif
    }
    response = requests.get(sap, auth=HTTPBasicAuth(user_fuente, contra_fuente), params=args, headers=headers, verify=VERIFICACION_SSL)
    if response.status_code == 200:
        try:
            data = response.json()
            print(data)
            resultados = []
            if not data or not isinstance(data, list):
                resultados = data
            

            print('=========================================================================================')
            print(data)
            print("=========================================================================================")
            
            datos_filtrados=[]
            for dato in data:
                print(dato)
                if float(dato['montodoc']) >=1 :
                    print('asdas')
                    datos_filtrados.append(dato)
            if isinstance(data, list):
                resultados= datos_filtrados
            
            # Ordenar por fecha de vencimiento
            resultados = sorted(resultados, key=lambda x: x['fechavenc'])

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        print(resultados)
        
    
    return render_template("collections/letras_cambio.html", titulo = "Otras Deudas", excluir_app_js=True, letras_cambio = resultados, form = letra_cambio_form)



    
@page.route("/letra_cambio_post", methods=['POST'])
def letra_cambio_post():
    try:
        datos_json = request.form.get('data')
        if datos_json:
            datos = json.loads(datos_json)
        else:
            datos = {}
        
        archivo = request.files.get('soporte_pago')
        n_deposito= datos.get('ref')
        rif = datos.get('rif')
        banco_receptor= datos.get('banco_receptor')
        fecha = datos.get('fecha')
        dt = datetime.strptime(fecha, "%Y-%m-%d")
        fecha_pago = dt.strftime("%Y%m%d")
        tipoPago = datos.get('tipoPago')
        monto = datos.get('monto')
        divisa = "D" if  tipoPago == "$" else "B"
        
        seleccionada = datos.get("facturasSeleccionadas", [])
        
        
        data = [
            {
                'BUKRS': '1200',
                'XBLNR': n_deposito,
                'KUNNR': rif,
                'BLDAT': fecha_pago,
                'TIPOPAGO': divisa,
                'WRBTR': monto,
                'CTABANCO': banco_receptor,
                'PROCESADO': '',
                "BELNR1": documento["documento"],       
                "VBELN": documento["documento"],       
                "BUZEI": documento["item"],                           
                "BLDATF": documento["fechadoc"],
                "MONTOPG": documento["montodoc"],
                "ENTREGA": "",
                'PREPAGO': "",
                'LCCP': "X"
            }
            for documento in seleccionada
        ]
        print(datos)

        url = ip_fuente+'/sap/bc/rest/zrecdepo?sap-client=510&ENVIO=C'
        tiempo, fecha_enc = obtener_hora_minutos_segundos_fecha()
        cadena = cadena_md5('1200',current_user.rif,tiempo,fecha_enc)
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin':'',
            'BUKRS': '1200',
            'KUNNR':current_user.rif,
            'BUDAT':fecha_enc,
            'TIMLO':tiempo,
            'CORIMON':cadena
        }
        args = {
            'sap-client':'510',
            'SOCIEDAD': '1200',
            'CLIENTE':current_user.rif
        }
        

        response = requests.post(
            url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente),
            json=data,
            headers=headers,
            verify=VERIFICACION_SSL)

        print(f"El estatus fué:{response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:

            respuesta = response.content.decode('utf-8')

            if respuesta == "Deposito Enviado Anteriormente por favor Verificar.":
                print("deposito repetido")
                return jsonify({
                    "success": False,
                    "message": respuesta
                }), 200

            elif respuesta == "Actualizacion de deposito Satisfactoria":
                #print("todo bien")
                flash(PAGO_CREADO)
                letra_cambio_mail(current_user, datos )
                
                return jsonify({
                    "success": True,
                    "message": "Pago creado exitosamente",
                    "redirect": url_for('.dashboard')  
                }), 200
            
            else:
                print('anad')

        else:
            print(respuesta)
            print('aqui')
            return jsonify({
                "success": False,
                "message": f"Error en la respuesta del servidor: {response.status_code}"
            }), response.status_code
    except Exception as e:
        flash("Ocurrió un error", "error")
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error inesperado: {str(e)}"
        }), 500

"""

@page.route("/formulacion", methods=["GET", "POST"])
def formy():
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        print('asda')
        page = request.args.get('page', 1, type=int)
        per_page = 18  # 18 GRUPOS por página (no registros)
        
        # Obtener grupos paginados
        formulas_agrupadas, total_grupos = Formula.get_rgb_groups_paginated(
            page=page, 
            per_page=per_page
        )
        
        # Calcular totales
        total_registros = Formula.get_count()
        total_colores_unicos = Formula.get_unique_colors_count()
        total_paginas = (total_grupos + per_page - 1) // per_page
        
        return jsonify({
            'grupos': formulas_agrupadas,
            'page': page,
            'total_paginas': total_paginas,
            'total_grupos': total_grupos,  
            'total_registros': total_registros,
            'total_colores_unicos': total_colores_unicos
        })
    
    # Carga inicial
    page = 1
    per_page = 18
    formulas_agrupadas, total_grupos = Formula.get_rgb_groups_paginated(
        page=page, 
        per_page=per_page
    )
    

    
    total_registros = Formula.get_count()
    total_colores_unicos = Formula.get_unique_colors_count()
    total_paginas = (total_grupos + per_page - 1) // per_page

    

    
    return render_template(
        "collections/formy.html", 
        titulo="Formulación", 
        formulas_agrupadas=formulas_agrupadas,
        page=page,
        total_paginas=total_paginas,
        total_grupos=total_grupos,
        total_registros=total_registros,
        total_colores_unicos=total_colores_unicos,
    )

@page.route("/formyPost", methods=["POST"])
def formyPost():
    try:
        datos_json = request.form.get('data')
        
        if datos_json:
            datos = json.loads(datos_json)
        else:
            datos = {}
        print("=============")
        print(datos['producto'])
        
        name_product = datos['producto']['name_product']
        name_color = datos['producto']['name_color']
        colores = Formula.obtener_ingredientes(name_color, name_product)
        presentacion = float(datos['presentacion'])  
        print(colores)
        for color in colores:
            cantidad = color['cantidad']
            calculo = getLineFrom(cantidad, presentacion)
            color['medida_calculada'] = calculo
            print(f"  {color['codigo']}: {cantidad} x {presentacion} = {calculo}")
        
        datos_producto = datos['producto']
        return jsonify({
            "success": True,
            "message": "Datos recibidos correctamente",
            "colores": colores,
            "datos": datos_producto
        }), 200
    
    except Exception as e:
        import traceback
        error_msg = f"Error inesperado: {str(e)}"
        print("ERROR EN formyPost:")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "message": error_msg
        }), 500

def getLineFrom(amt, mult):
    if amt is None or amt == "" or amt == " ":
        return {
            "texto_completo": "0",
            "onzas": 0,
            "partes_64": 0,
            "partes_128": 0
        }
    
    try:
        float_amt = float(str(amt).replace(" ", ""))
        total = float_amt * mult
        
        onzas = 0
        partes_64 = 0
        partes_128 = 0
        texto_lineas = []

        if total >= 1.0:
            # HAY ONZAS COMPLETAS
            onzas = int(total)
            decimal_part = total - onzas
            
            if onzas > 0:
                texto_lineas.append(f"{onzas} Onzas")
            
            # Convertir decimales a partes de 1/64
            if decimal_part > 0:
                partes_64_float = decimal_part * 64
                partes_64 = int(partes_64_float)
                
                if partes_64 >= 1:
                    texto_lineas.append(f"{partes_64} Partes (1/64)")
                
                # Convertir decimales sobrantes a partes de 1/128
                decimal_64 = partes_64_float - partes_64
                if decimal_64 > 0:
                    partes_128 = int(decimal_64 * 2)
                    if partes_128 > 0:
                        texto_lineas.append(f"{partes_128} Partes (1/128)")
        else:
            # SOLO HAY FRACCIONES
            partes_64_float = total * 64
            partes_64 = int(partes_64_float)
            
            if partes_64 >= 1:
                texto_lineas.append(f"{partes_64} Partes (1/64)")
            
            # Convertir decimales sobrantes a partes de 1/128
            decimal_64 = partes_64_float - partes_64
            if decimal_64 > 0:
                partes_128 = int(decimal_64 * 2)
                if partes_128 > 0:
                    texto_lineas.append(f"{partes_128} Partes (1/128)")
        
        # Retornar estructura con todos los datos
        return {
            "texto_completo": "\n".join(texto_lineas) if texto_lineas else "0",
            "onzas": onzas,
            "partes_64": partes_64,
            "partes_128": partes_128
        }
    
    except Exception as e:
        print(f"ERROR en getLineFrom con amt={amt}, mult={mult}: {e}")
        return {
            "texto_completo": "Error",
            "onzas": 0,
            "partes_64": 0,
            "partes_128": 0
        }
        

@page.route("/api/colores")
def get_colores_api():
    nombres = Formula.get_unique_color_names()
    return jsonify(nombres)

@page.route("/api/filtrarNombre", methods=["POST"])
def filtrar_nombre():
    try:
        data = json.loads(request.form.get('data'))
        nombre_color = data.get('nombreColor')
        
        if not nombre_color:
            return jsonify({
                'success': False,
                'message': 'Nombre de color no proporcionado'
            }), 400
        
        resultado = Formula.get_formulas_by_color_name(nombre_color)
        
        if resultado is None:
            return jsonify({
                'success': True,
                'data': {
                    'name_color': nombre_color,
                    'rgb': {'r': 0, 'g': 0, 'b': 0},
                    'rgb_string': 'rgb(0, 0, 0)',
                    'productos': []
                }
            })
        
        return jsonify({
            'success': True,
            'data': {
                'name_color': resultado['name_color'],
                'rgb': resultado['rgb'],
                'rgb_string': resultado['rgb_string'],
                'base_color': resultado['productos'][0]['name_base'] if resultado['productos'] else 'Sin base',
                'productos': resultado['productos']
            }
        })
        
    except Exception as e:
        print(f"Error en filtrar_nombre: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@page.route('/api/filtrarRango', methods=['POST'])
def filtrar_por_rango_color():

    try:
        data = json.loads(request.form.get('data'))
        
        # Extraer parámetros
        r_min = int(data.get('r_min', 0))
        r_max = int(data.get('r_max', 255))
        g_min = int(data.get('g_min', 0))
        g_max = int(data.get('g_max', 255))
        b_min = int(data.get('b_min', 0))
        b_max = int(data.get('b_max', 255))
        page = int(data.get('page', 1))
        per_page = int(data.get('per_page', 50))
        
        print(f"Filtrando colores - R:{r_min}-{r_max}, G:{g_min}-{g_max}, B:{b_min}-{b_max}")
        
        # Consultar base de datos
        grupos, total = Formula.get_rgb_groups_by_range(
            r_min, r_max, g_min, g_max, b_min, b_max,
            page, per_page
        )
        
        print(f" Encontrados {total} grupos, mostrando {len(grupos)} en página {page}")
        
        return jsonify({
            'success': True,
            'grupos': grupos,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page if total > 0 else 0,
            'filtro_aplicado': {
                'r': f'{r_min}-{r_max}',
                'g': f'{g_min}-{g_max}',
                'b': f'{b_min}-{b_max}'
            }
        })
        
    except Exception as e:
        print(f" Error en filtrar_por_rango_color: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500"""