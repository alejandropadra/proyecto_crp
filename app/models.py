import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash,check_password_hash

from . import db

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    rif = db.Column(db.String(10), primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)#empresa
    encrypted_password = db.Column(db.String(120))#clve
    email = db.Column(db.String(100), nullable=False)#correo
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())#fecha registro
    pago = db.relationship('Cobranza', backref ='user')
    zona = db.Column(db.String(30),nullable = False)#zona
    nivel = db.Column(db.String(30))#niveles.. clientes... corimon.. administrador.
    codigo = db.Column(db.String(20))
    seller = db.Column(db.String(300))
    tipo = db.Column(db.String(15))

    def verify_password(self, password):
        return check_password_hash(self.encrypted_password, password)
    
    @property
    def password(self):
        pass

    @password.setter
    def password(self, value):
        self.encrypted_password = generate_password_hash(value)

    def __str(self):
        return self.username

    @classmethod
    def create_element(cls, rif,username, password, email, zona, nivel):
        user = User(rif=rif,username=username, password=password, email=email, zona = zona, nivel = nivel)

        db.session.add(user)
        db.session.commit()

        return user
    
    @classmethod
    def update_user(cls,rif,username,email,zona,nivel,codigo):
        user = User.get_by_rif(rif)

        if user is None:
            return False
        
        user.rif = rif
        user.username = username
        user.email = email
        user.zona = zona
        user.nivel = nivel
        user.codigo = codigo

        db.session.add(user)
        db.session.commit()

        return user
    
    @classmethod
    def update_password(cls,rif,password):
        user = User.get_by_rif(rif)

        if user is None:
            return False
        
        user.password = password

        db.session.add(user)
        db.session.commit()

        return user

    @classmethod
    def update_email(cls,rif,email):
        user = User.get_by_rif(rif)

        if user is None:
            return False
        
        user.email = email

        db.session.add(user)
        db.session.commit()

        return user

    @classmethod
    def get_by_username(cls, username):
        return User.query.filter_by(username=username).first()

    @classmethod
    def get_by_email(cls, email):
        return User.query.filter_by(email=email).first()

    @classmethod
    def get_by_rif(cls, rif):
        return User.query.filter_by(rif=rif).first()
    
    def get_id(self):
        return (self.rif)
    
    @classmethod
    def get_by_all_zona(cls,zona):
        return User.query.filter_by(zona=zona)





    
class Cobranza(db.Model):
    __tablename__ = 'cobranzas'

    rif = db.Column(db.String(20),nullable=False)
    empresa = db.Column(db.String(50),nullable=False)
    banco_emisor =db.Column(db.String(50),nullable=False)
    beneficiario = db.Column(db.String(30),nullable=False)
    banco_receptor=db.Column(db.String(50),nullable=False)
    fecha_deposito =db.Column(db.String(20),nullable=False)
    n_deposito =db.Column(db.Integer,primary_key=True,nullable=False)
    monto =db.Column(db.Float,nullable=False)
    divisa =db.Column(db.String(5),nullable=False)
    comprobante =db.Column(db.String(30))
    estado =db.Column(db.Boolean)
    create_at =db.Column(db.DateTime, default=datetime.datetime.now())
    observaciones =db.Column(db.Text())
    path_adjunto = db.Column(db.Text())
    estado = db.Column(db.Integer, default = 0)
    imagen = db.Column(db.String(50))
    user_confirm = db.Column(db.String(12))
    user_rif = db.Column(db.String(10), db.ForeignKey('users.rif'))

    @classmethod
    def create_element(cls,rif,empresa,banco_emisor,banco_receptor,fecha_deposito,
                       n_deposito,monto,divisa,comprobante,estado,observaciones,beneficiario,user_rif,imagen):
        pago = Cobranza(rif=rif,empresa=empresa,banco_emisor=banco_emisor,banco_receptor=banco_receptor,
                        fecha_deposito=fecha_deposito,n_deposito=n_deposito,monto=monto,
                        divisa=divisa,comprobante=comprobante,estado=estado,observaciones=observaciones,
                        beneficiario =beneficiario,user_rif=user_rif,imagen = imagen)
        
        db.session.add(pago)
        db.session.commit()

        return pago
    
    @classmethod
    def get_by_all_zona(cls,zona):
        return Cobranza.query.filter_by(zona=zona)
    
    @classmethod
    def update_estado(cls, n_deposito,estado):
        pago = Cobranza.get_by_deposito(n_deposito)

        if pago is None:
            return False
        
        pago.estado = estado

        db.session.add(pago)
        db.session.commit()

        return pago
    
    @classmethod
    def get_by_deposito(cls, n_deposito):
        return Cobranza.query.filter_by(n_deposito=n_deposito).first()
    
    @classmethod
    def get_by_deposito_all(cls, n_deposito):
        return Cobranza.query.filter_by(n_deposito=n_deposito)

    @classmethod
    def update_element(cls,rif,empresa,banco_emisor,banco_receptor,fecha_deposito,
                       n_deposito,monto,divisa,comprobante,estado,observaciones,user_rif):
        pago = Cobranza.get_by_deposito(n_deposito)

        if pago is None:
            return False
        
        pago.rif=rif
        pago.empresa=empresa
        pago.banco_emisor=banco_emisor
        pago.banco_receptor=banco_receptor
        pago.fecha_deposito=fecha_deposito
        pago.n_deposito=n_deposito
        pago.monto=monto
        pago.divisa=divisa
        pago.comprobante=comprobante
        pago.estado=estado
        pago.observaciones=observaciones
        pago.user_rif=user_rif

        db.session.add(pago)
        db.session.commit()

        return pago
    
    @classmethod
    def delete_element(cls,n_deposito):
        pago = Cobranza.get_by_deposito(n_deposito)

        if pago is None:
            return False
        
        db.session.delete(pago)
        db.session.commit()
        return True
    
    @classmethod
    def get_deposito_by_zona(cls,zona):
        #pagos = db.session.query(User).join(Cobranza, User.zona =="Centro")

        if zona == "all":
            pagos = Cobranza.query.all()
        else:
            pagos = db.session.query(Cobranza).outerjoin(User).filter(User.zona==zona)

        return pagos
    
    @classmethod
    def get_deposito_by_seller(cls,seller):
        pagos = db.session.query(Cobranza).outerjoin(User).filter(User.seller==seller)
        return pagos

    @classmethod
    def get_pagos_order(cls, rif):
        return Cobranza.query.filter_by(rif=rif).order_by(Cobranza.create_at.desc())