from wtforms import Form
from wtforms import validators
from wtforms import StringField,PasswordField, SelectField, HiddenField,BooleanField, EmailField
from wtforms import DateField,FileField,IntegerField,RadioField,FloatField,TextAreaField
from wtforms.validators import DataRequired, Length

from .models import User

def length_honeypot(form, field):
    if len(field.data) > 0:
        raise validators.ValidationError('Solo los humanos pueden completar el registro!')
    
class LoginForm(Form):
    rif = SelectField("", choices=[("J","J"),("G","G"),("V","V")])
    n_rif = StringField("",[ validators.length(min=4,max=10),
                            validators.DataRequired()])
    clave = PasswordField("",[validators.length(min=4,max=20),
                            validators.DataRequired()])
    honeypot = HiddenField("", [ length_honeypot])

class ContactForm(Form):
    nombre= StringField("",[validators.DataRequired()])
    telefono_contacto= StringField("",[validators.DataRequired()])
    email = EmailField("", [validators.DataRequired(message='El email es requerido.'),
        validators.Email(message='Ingre un email valido.')
    ])
    motivo =SelectField("", [validators.DataRequired()], choices=[("",""), 
                                                ("Ventas", "Quiero vender sus productos"),
                                                ("Particular", "Quiero comprar pinturas"),
                                                ("Compras", "Quiero ofrecer mis productos o servicios"),
                                                ("Empleo", "Quiero unirme a su equipo de trabajo")])

class RegisterForm(Form):
    rif = SelectField("", choices=[("",""),("J","J"),("G","G"),("V","V")])
    n_rif = StringField("",[ validators.length(min=5,max=10),
                            validators.DataRequired()])
    username = StringField("",[ validators.length(min=2,max=50),
                            validators.DataRequired()])
    email = EmailField('', [
        validators.length(min=6, max=100),
        validators.DataRequired(message='El email es requerido.'),
        validators.Email(message='Ingre un email valido.')
    ])
    password = PasswordField('', [
        validators.DataRequired('El password es requerido.'),
        validators.EqualTo('confirm_password', message='La contraseña no coincide.')
    ])
    confirm_password = PasswordField('', [validators.DataRequired()],)
    '''accept = BooleanField('', [
        validators.DataRequired()
    ])'''
    zona = SelectField("",[validators.DataRequired()], choices = [("",""),("Occidente","Occidente"),("Oriente","Oriente"),("Centro","Centro"),("all","all"),("Capital","Capital")])
    nivel = SelectField("", choices=[("",""),("cliente","Cliente"),("corimon","Corimon"),("administrador","Administrador")])
    codigo = StringField("",[validators.DataRequired('El codigo es requerido.')])
    vendedor = StringField("",[validators.DataRequired('El vendedor es requerido.')])
    
    def validate_username(self, username):
        if User.get_by_username(username.data):
            raise validators.ValidationError('El username ya se encuentra en uso.')

    def validate_email(self, email):
        if User.get_by_email(email.data):
            raise validators.ValidationError('El email ya se encuentra en uso.')
        

    def validate(self):
        if not Form.validate(self):
            return False

        if len(self.password.data) < 3:
            self.password.errors.append('El password es demasiado corto.')
            return False

        return True
    
class EditForm(Form):
    
    rif = StringField("")
    username = StringField("",[ validators.length(min=2,max=50),
                            validators.DataRequired()])
    email = EmailField('', [
        validators.length(min=6, max=100),
        validators.DataRequired(message='El email es requerido.'),
        validators.Email(message='Ingre un email valido.')
    ])
    zona = SelectField("",[validators.DataRequired()], choices = [("",""),("Occidente","Occidente"),("Oriente","Oriente"),("Centro","Centro"),("all","all"),("Capital","Capital")])
    nivel = SelectField("", choices=[("cliente","Cliente"),("corimon","Corimon"),("administrador","Administrador")])
    codigo = StringField("")
    seller = StringField("")
    password = PasswordField('', [
        validators.EqualTo('confirm_password', message='La contraseña no coincide.')
    ])
    confirm_password = PasswordField('')

class PerfilForm(Form):
    password = PasswordField('', [
        validators.EqualTo('confirm_password', message='La contraseña no coincide.')
    ])
    confirm_password = PasswordField('')
    email = EmailField('', [
        validators.length(min=6, max=100),
        validators.Email(message='Ingre un email valido.')
    ])
    verify_email = EmailField('', [
        validators.length(min=6, max=100),
        validators.Email(message='Ingre un email valido.')
    ])


class FechaPagoForm(Form):
    rif = StringField("")
    empresa = StringField("")
    fecha_deposito = DateField("", [validators.DataRequired()])
    
    
class Retenciones(Form):
    n_comprobante = IntegerField("", [
        validators.DataRequired(),
        validators.Length(min=14, max=14)
    ])
    comprobante= FileField("")

class RegistroPagoForm(Form):
    montos = FloatField("")
    facturas= IntegerField("")
    rif = StringField("")
    empresa = StringField("")
    banco_emisor = SelectField("", [validators.DataRequired()],choices=[("", "Seleccione una opción"),
                                            ("Banco Central de Venezuela","Banco Central de Venezuela"),
                                            ("Banco de Venezuela (BDV)","Banco de Venezuela (BDV)"),
                                            ("Banco Venezolano de Crédito (BVC)","Banco Venezolano de Crédito (BVC)"),
                                            ("Banco Mercantil","Banco Mercantil"),
                                            ("Banco Provincial (BBVA)","Banco Provincial (BBVA)"),
                                            ("Bancaribe","Bancaribe"),
                                            ("Banco Exterior","Banco Exterior"),
                                            ("Banco Caroní","Banco Caroní"),
                                            ("Banesco Banco Universal","Banesco Banco Universal"),
                                            ("Sofitasa","Sofitasa"),
                                            ("Banco Plaza","Banco Plaza"),
                                            ("Bangente","Bangente"),
                                            ("Banco Fondo Común (BFC)","Banco Fondo Común (BFC)"),
                                            ("100% Banco","100% Banco"),
                                            ("Del Sur Banco Universal","Del Sur Banco Universal"),
                                            ("Banco del Tesoro","Banco del Tesoro"),
                                            ("Banco Agrícola de Venezuela","Banco Agrícola de Venezuela"),
                                            ("Bancrecer","Bancrecer"),
                                            ("Mi Banco, Banco Microfinanciero C.A","Mi Banco, Banco Microfinanciero C.A"),
                                            ("Banco Activo","Banco Activo"),
                                            ("Bancamiga","Bancamiga"),
                                            ("Banplus","Banplus"),
                                            ("Banco Bicentenario del Pueblo","Banco Bicentenario del Pueblo"),
                                            ("Banco de la Fuerza Armada Nacional Bolivariana (BANFANB)","Banco de la Fuerza Armada Nacional Bolivariana (BANFANB)"),
                                            ("Banco Nacional de Crédito (BNC)","Banco Nacional de Crédito (BNC)"),
                                            ("Banco Internacial","Banco Internacional"),
                                            ("Deposito en efectivo","Deposito en efectivo"),])
    
    banco_emisor_extranjero = SelectField("", [validators.DataRequired()],choices=[("", "Seleccione una opción"),
                                        ("Banco Exterior","Banco Exterior"),
                                        ("Banco Mercantil","Banco Mercantil"),
                                        ("Banco Provincial (BBVA)","Banco Provincial (BBVA)"),
                                        ("Bancaribe","Bancaribe"),
                                        ("Banplus","Banplus"),
                                        ("Banco Nacional de Crédito (BNC)","Banco Nacional de Crédito (BNC)"),
                                        ("Bancaribe Puerto Rico","Bancaribe Puerto Rico"),
                                        ("Mercantil Panamá","Mercantil Panamá"),
                                        ("Deposito en efectivo","Deposito en efectivo"),]) 
    banco_receptor = SelectField("", choices = [("","Seleccione una opción"),("0108-0071-41-0100251970","BANCO PROVINCIAL, 0108-0071-41-0100251970"),
                                               ("0102-0234-52-0000049359","BANCO DE VENEZUELA, 0102-0234-52-0000049359"),
                                               ("0114-0172-41-1720022687 ","BANCARIBE, 0114-0172-41-1720022687 "),
                                               ("0134-0031-85-0311052683", "BANESCO, 0134-0031-85-0311052683"),
                                               ("0191-0050-22-2150018612", "BANCO NACIONAL DE CRÉDITO, 0191-0050-22-2150018612"),
                                               ("0115-0052-82-3000386080","BANCO EXTERIOR, 0115-0052-82-3000386080"),
                                               ("0138-0001-41-0010095403", "BANCO PLAZA, 0138-0001-41-0010095403"),
                                               ("0105-0699-94-1699217564", "BANCO MERCANTIL, 0105 0699 94 1699217564"),
                                               ("0172-01-1079-1108934926", "BANCAMIGA, 0172-01-1079-1108934926")
                                               ])
    banco_receptor_dolar =SelectField("" , choices=[("","Seleccione una opción"), ("1120109001", "BANCARIBE, 0114-0165-12-1654046669 "),
                                                ("1120109001", "BANCO NACIONAL DE CRÈDITO, 0191-0050-25-2350502330"),
                                                ("1120109001", "BANCO MERCANTIL, 0105-0699-90-5699053794"),
                                                ("1120109001", "BANCO PROVINCIAL, 0108-0956-83-0100020368"),
                                                ("1120109001", "BANPLUS, 0174-0720-19-7204512615"),
                                                ("1120109001", "BANCAMIGA, 0172-01-1070-1108914084"),
                                                ("1120109001", "BANCO EXTERIOR, 0115-0052-81-0000295727"),
                                                ("1120109001","BANCARIBE PUERTO RICO"),
                                                ("1120109001","BANESCO PANAMA"),
                                                ("1120109001","MERCANTIL PANAMA")])
    banco_receptor_ppv = SelectField("",[validators.DataRequired()], choices = [("","Seleccione una opción"),("BANCO PROVINCIAL, 0108-0071-41-0100251970","BANCO PROVINCIAL, 0108-0071-41-0100251970"),
                                               ("BANCO DE VENEZUELA, 0102-0234-52-0000049359","BANCO DE VENEZUELA, 0102-0234-52-0000049359"),
                                               ("BANCARIBE, 0114-0172-41-1720022687 ","BANCARIBE, 0114-0172-41-1720022687 "),
                                               ("BANESCO, 0134-0031-85-0311052683", "BANESCO, 0134-0031-85-0311052683"),
                                               ("BANCO NACIONAL DE CRÈDITO, 0191-0050-22-2150018612", "BANCO NACIONAL DE CRÈDITO, 0191-0050-22-2150018612"),
                                               ("BANCO EXTERIOR, 0115-0052-82-3000386080","BANCO EXTERIOR, 0115-0052-82-3000386080"),
                                               ("BANCO PLAZA, 0138-0001-41-0010095403", "BANCO PLAZA, 0138-0001-41-0010095403"),
                                               ("BANCO MERCANTIL, 0105 0699 94 1699217564", "BANCO MERCANTIL, 0105 0699 94 1699217564"),
                                               ("BANCAMIGA, 0172-01-1079-1108934926", "BANCAMIGA, 0172-01-1079-1108934926")
                                               ])
    banco_receptor_dolar_ppv =SelectField("", choices=[("","selecciones una opción"), ("BANCARIBE, 0114-0165-12-1654046669 ", "BANCARIBE, 0114-0165-12-1654046669 "),
                                                ("BANCO NACIONAL DE CRÈDITO, 0191-0050-25-2350502330", "BANCO NACIONAL DE CRÈDITO, 0191-0050-25-2350502330"),
                                                ("BANCO MERCANTIL, 0105 0699 90 5699053794", "BANCO MERCANTIL, 0105 0699 90 5699053794"),
                                                ("BANCO PROVINCIAL, 0108 0956 83 0100020368", "BANCO PROVINCIAL, 0108 0956 83 0100020368"),
                                                ("BANPLUS, 0174-0720-19-7204512615", "BANPLUS, 0174-0720-19-7204512615"),
                                                ("BANCAMIGA, 0172-01-1070-1108914084", "BANCAMIGA, 0172-01-1070-1108914084"),
                                                ("BANCO EXTERIOR, 0115-0052-81-0000295727", "BANCO EXTERIOR, 0115-0052-81-0000295727"),
                                                ("BANCARIBE PUERTO RICO","BANCARIBE PUERTO RICO"),
                                                ("BANESCO PANAMA","BANESCO PANAMA"),
                                                ("FACEBANK","FACEBANK"),
                                                ("MERCANTIL PANAMA","MERCANTIL PANAMA")])
    fecha_deposito = DateField("", [validators.DataRequired()])
    n_deposito = StringField("", validators=[DataRequired()])
    bolivares=BooleanField("")
    dolares= BooleanField("")
    euro = BooleanField("")
    factura = BooleanField('Factura') 
    empresa_beneficiaria= StringField("", [validators.DataRequired()])
    """empresa_beneficiaria =SelectField("", [validators.DataRequired()], choices=[("","Seleccione una opción"), 
                                                ("CRP", "Corimon Pinturas"),
                                                ("PPV", "Puras Pinturas Venezolanas")])"""
    divisa = RadioField("", [validators.DataRequired()],  choices=[(" $"," $"),("Bs","Bs")])
    comprobante = SelectField("", [validators.DataRequired()], choices = [("",""),("Con Comprobante de Retención","Con Comprobante de Retención"),("Sin Comprobante de Retención","Sin Comprobante de Retención")])
    monto = FloatField("")
    estado = BooleanField("")
    observaciones = TextAreaField("", [validators.DataRequired()])
    imagen= FileField("Imagen")
    base_iva=BooleanField("")
    base= BooleanField("")
