import datetime
from collections import defaultdict
from flask_login import UserMixin
from werkzeug.security import generate_password_hash,check_password_hash
from sqlalchemy import func, distinct, UniqueConstraint, or_, desc, asc
from . import db
from sqlalchemy import Index

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
    #modulos_acceso = db.Column(db.Text, default=None)#modulos a los que tiene acceso el usuario
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
    def create_element(cls, rif,username, password, email, zona, nivel, codigo, seller):
        user = User(rif=rif,username=username, password=password, email=email, zona = zona, nivel = nivel, codigo = codigo, seller = seller)

        db.session.add(user)
        db.session.commit()

        return user
    
    @classmethod
    def update_user(cls,rif,username,email,zona,nivel,codigo,seller):
        user = User.get_by_rif(rif)

        if user is None:
            return False
        
        user.rif = rif
        user.username = username
        user.email = email
        user.zona = zona
        user.nivel = nivel
        user.codigo = codigo
        user.seller = seller

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
    
class Formula(db.Model):
    """Fórmulas de pinturas - Versión optimizada"""
    __tablename__ = 'formulas'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name_color = db.Column(db.String(100), nullable=False, index=True)
    name_product = db.Column(db.String(100), nullable=False, index=True)
    r_color = db.Column(db.SmallInteger, nullable=False)
    g_color = db.Column(db.SmallInteger, nullable=False)
    b_color = db.Column(db.SmallInteger, nullable=False)
    name_base = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relación con ingredientes
    ingredientes = db.relationship(
        'FormulaIngrediente', 
        backref='formula', 
        lazy='select',
        order_by='formula_ingredientes.c.orden',
        cascade='all, delete-orphan' 
    )
    
    def to_dict(self):
        """Convierte el modelo a diccionario para JSON"""
        return {
            'id': self.id,
            'name_color': self.name_color,
            'name_product': self.name_product,
            'rgb': {
                'r': self.r_color,
                'g': self.g_color,
                'b': self.b_color
            },
            'name_base': self.name_base,
            'colorantes': [
                {'code': ing.codigo_colorante, 'amt': float(ing.cantidad)}
                for ing in self.ingredientes
            ]
        }
    
    def __repr__(self):
        return f'<Formula {self.id}: {self.name_color} - {self.name_product}>'
    
    @classmethod
    def get_rgb_groups_paginated(cls, page=1, per_page=50):
        """
        Obtiene grupos RGB paginados de forma optimizada.
        Solo carga los datos necesarios para la página actual.
        
        Args:
            page (int): Número de página (empieza en 1)
            per_page (int): Grupos por página
            
        Returns:
            tuple: (grupos_paginados, total_grupos)
        """
        # Contar total de grupos únicos
        total_grupos = db.session.query(
            func.count(func.distinct(
                func.concat(cls.r_color, '-', cls.g_color, '-', cls.b_color)
            ))
        ).filter(
            cls.name_product != 'competencia'  
        ).scalar()
        # Obtener solo los colores de la página actual
        offset = (page - 1) * per_page
        
        colores_pagina = db.session.query(
            cls.r_color,
            cls.g_color,
            cls.b_color,
            func.count(cls.id).label('total')
        ).filter(
            cls.name_product != 'competencia'  
        ).group_by(
            cls.r_color,
            cls.g_color,
            cls.b_color
        ).limit(per_page).offset(offset).all()
            
        # Cargar fórmulas solo de estos colores
        grupos_paginados = []
        
        for r, g, b, count in colores_pagina:
            formulas_color = cls.query.filter(
                cls.r_color == r,
                cls.g_color == g,
                cls.b_color == b,
                cls.name_product != 'competencia'  
            ).all()
            

            name_color = formulas_color[0].name_color if formulas_color else 'Sin nombre'
            base_color= formulas_color[0].name_base if formulas_color else 'sin base'
            
            grupos_paginados.append({
                'rgb': {'r': r, 'g': g, 'b': b},
                'rgb_string': f'rgb({r}, {g}, {b})',
                'name_color': name_color,
                'base_color': base_color,
                'count': count,
                'datos': [f.to_dict() for f in formulas_color]
            })
        
        return grupos_paginados, total_grupos
    
    @classmethod
    def get_count(cls):
        """Obtiene el número total de registros"""
        return cls.query.count()
    
    @classmethod
    def get_unique_colors_count(cls):
        """Obtiene el número de colores RGB únicos"""
        result = db.session.query(
            func.count(func.distinct(
                func.concat(cls.r_color, '-', cls.g_color, '-', cls.b_color)
            ))
        ).scalar()
        return result
    
    @staticmethod
    def obtener_ingredientes(name_color, name_product):
        """
        Obtiene los ingredientes de una fórmula específica
        
        Args:
            name_color (str): 
            name_product (str): 
        
        Returns:
            list: Lista de diccionarios con los ingredientes, o lista vacía si no existe
                [{'codigo': 'BLK', 'cantidad': 3.2031, 'orden': 0}, ...]
        """
        
        
        formula = Formula.query.filter_by(
            name_color=name_color,
            name_product=name_product
        ).first()
        
        if not formula:
            return []
        
        ingredientes = [
            {
                'codigo': ing.codigo_colorante,
                'cantidad': float(ing.cantidad),
                'orden': ing.orden
            }
            for ing in formula.ingredientes
        ]
        
        return ingredientes
    
    @classmethod
    def get_unique_color_names(cls, exclude_competencia=True):
        """
        Obtiene una lista de nombres de colores únicos
    
        """
        query = db.session.query(cls.name_color).distinct()
        
        if exclude_competencia:
            query = query.filter(cls.name_product != 'competencia')
        
        result = query.order_by(cls.name_color).all()
        
        return [color[0] for color in result]
    
    @classmethod
    def get_formulas_by_color_name(cls, name_color):
        """
        Obtiene todas las fórmulas de un color específico agrupadas por producto.
        
        
        """

        formulas = cls.query.filter(
            cls.name_color == name_color,
            cls.name_product != 'competencia'
        ).all()
        

        if not formulas:
            return None

        primera_formula = formulas[0]
        

        resultado = {
            'name_color': name_color,
            'rgb': {
                'r': primera_formula.r_color,
                'g': primera_formula.g_color,
                'b': primera_formula.b_color
            },
            'rgb_string': f'rgb({primera_formula.r_color}, {primera_formula.g_color}, {primera_formula.b_color})',
            'total_productos': len(formulas),
            'productos': []
        }
        
        for formula in formulas:
            producto_info = {
                'id': formula.id,
                'name_product': formula.name_product,
                'name_base': formula.name_base,
                'colorantes': [
                    {
                        'codigo': ing.codigo_colorante,
                        'cantidad': float(ing.cantidad),
                        'orden': ing.orden
                    }
                    for ing in formula.ingredientes
                ]
            }
            resultado['productos'].append(producto_info)
        
        return resultado

    @classmethod
    def get_rgb_groups_by_range(cls, r_min, r_max, g_min, g_max, b_min, b_max, page=1, per_page=50):
        """
        Obtiene grupos RGB filtrados por rangos de color.
        
        Args:
            r_min, r_max: Rango para canal rojo (0-255)
            g_min, g_max: Rango para canal verde (0-255)
            b_min, b_max: Rango para canal azul (0-255)
            page: Número de página (empieza en 1)
            per_page: Grupos por página
            
        Returns:
            tuple: (grupos_filtrados, total_grupos)
        """
        # Contar total de grupos únicos que cumplen el criterio
        total_grupos = db.session.query(
            func.count(func.distinct(
                func.concat(cls.r_color, '-', cls.g_color, '-', cls.b_color)
            ))
        ).filter(
            cls.name_product != 'competencia',
            cls.r_color.between(r_min, r_max),
            cls.g_color.between(g_min, g_max),
            cls.b_color.between(b_min, b_max)
        ).scalar()
        
        # Obtener solo los colores de la página actual
        offset = (page - 1) * per_page
        
        colores_pagina = db.session.query(
            cls.r_color,
            cls.g_color,
            cls.b_color,
            func.count(cls.id).label('total')
        ).filter(
            cls.name_product != 'competencia',
            cls.r_color.between(r_min, r_max),
            cls.g_color.between(g_min, g_max),
            cls.b_color.between(b_min, b_max)
        ).group_by(
            cls.r_color,
            cls.g_color,
            cls.b_color
        ).limit(per_page).offset(offset).all()
        
        # Cargar fórmulas solo de estos colores
        grupos_filtrados = []
        
        for r, g, b, count in colores_pagina:
            formulas_color = cls.query.filter(
                cls.r_color == r,
                cls.g_color == g,
                cls.b_color == b,
                cls.name_product != 'competencia'
            ).all()
            
            name_color = formulas_color[0].name_color if formulas_color else 'Sin nombre'
            base_color = formulas_color[0].name_base if formulas_color else 'sin base'
            
            grupos_filtrados.append({
                'rgb': {'r': r, 'g': g, 'b': b},
                'rgb_string': f'rgb({r}, {g}, {b})',
                'name_color': name_color,
                'base_color': base_color,
                'count': count,
                'datos': [f.to_dict() for f in formulas_color]
            })
        
        return grupos_filtrados, total_grupos

class FormulaIngrediente(db.Model):
    """Ingredientes/colorantes de las fórmulas"""
    __tablename__ = 'formula_ingredientes'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    formula_id = db.Column(
        db.Integer, 
        db.ForeignKey('formulas.id', ondelete='CASCADE'), 
        nullable=False,
        index=True
    )
    codigo_colorante = db.Column(db.String(20), nullable=False, index=True)
    cantidad = db.Column(db.Numeric(10, 4), nullable=False, default=0.0)
    orden = db.Column(db.SmallInteger, nullable=False)
    
    def __repr__(self):
        return f'<Ingrediente {self.codigo_colorante}: {self.cantidad}>'
    
    
class Producto(db.Model):
    __tablename__ = 'productos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    marca_codigo = db.Column(db.String(10), nullable=False, index=True)          
    marca_nombre = db.Column(db.String(50), nullable=False, index=True)          
    linea_codigo = db.Column(db.String(10), nullable=False, index=True)          
    linea_nombre = db.Column(db.String(100))                                      
    subcodigo = db.Column(db.String(20), index=True)                             
    codigo_ficha_tecnica = db.Column(db.String(20), unique=True, index=True)     
    nombre = db.Column(db.String(200), nullable=False, index=True)               
    descripcion_general = db.Column(db.String(500))                             

    tipo = db.Column(db.String(100))                    
    categoria = db.Column(db.String(100))                                        
    acabado = db.Column(db.String(50))                                          
    calidad = db.Column(db.String(70))                                           
    uso = db.Column(db.String(100))                                             
    superficie = db.Column(db.String(200))                                       
    detalles = db.Column(db.String(900))                                         
    color = db.Column(db.String(100))                                           
    prioridad = db.Column(db.Integer)                                           
    destacado = db.Column(db.Boolean, default=False)                            

    activo = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # RELACIONES 
    presentaciones = db.relationship('Presentacion', backref='producto', lazy='dynamic', cascade='all, delete-orphan')
    detalle_tecnico = db.relationship('DetalleTecnico', backref='producto', uselist=False, cascade='all, delete-orphan')

    __table_args__ = (
        db.UniqueConstraint('marca_codigo', 'linea_codigo', 'subcodigo', name='uq_producto_identidad'),
    )

    def __repr__(self):
        return f'<Producto {self.codigo_ficha_tecnica}: {self.nombre}>'

    def to_dict(self, include_presentaciones=False, include_detalle=False):
        """Serializa el producto con control de profundidad."""
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        if include_presentaciones:
            data['presentaciones'] = [p.to_dict() for p in self.presentaciones]
        if include_detalle and self.detalle_tecnico:
            data['detalle_tecnico'] = self.detalle_tecnico.to_dict()
        return data
    


    @classmethod
    def get_all(cls, activos_only=True):
        query = cls.query
        if activos_only:
            query = query.filter_by(activo=True)
        return query.all()

    @classmethod
    def get_by_id(cls, id):
        return cls.query.filter_by(id=id).first()

    @classmethod
    def get_by_ficha(cls, codigo_ficha):
        return cls.query.filter_by(codigo_ficha_tecnica=codigo_ficha).first()
    
    @classmethod
    def get_all_sin_marca(cls, marca_excluir, activos_only=True):
        query = cls.query.filter(cls.marca_nombre != marca_excluir)
        if activos_only:
            query = query.filter_by(activo=True)
        return query.all()

    @classmethod
    def buscar(cls, termino):
        """Búsqueda por nombre, descripción, tipo o categoría."""
        like = f'%{termino}%'
        return cls.query.filter(
            db.or_(
                cls.nombre.ilike(like),
                cls.descripcion_general.ilike(like),
                cls.tipo.ilike(like),
                cls.categoria.ilike(like),
            )
        ).all()
        
    @classmethod
    def get_filtros(cls, marca_excluir=None):
        """Extrae valores únicos de las columnas filtrables para los radio buttons."""
        query = cls.query.filter_by(activo=True)
        if marca_excluir:
            query = query.filter(cls.marca_nombre != marca_excluir)

        columnas_filtro = ['tipo', 'categoria', 'acabado', 'calidad', 'uso', 'superficie', 'marca_nombre']

        filtros = {}
        for col in columnas_filtro:
            valores = (
                query
                .with_entities(getattr(cls, col))
                .filter(getattr(cls, col).isnot(None))
                .distinct()
                .order_by(getattr(cls, col))
                .all()
            )
            filtros[col] = [v[0] for v in valores]

        return filtros



class Presentacion(db.Model):
    __tablename__ = 'presentaciones'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False, index=True)

    #IDENTIFICACIÓN DEL SKU 
    material = db.Column(db.String(20), unique=True, nullable=False, index=True)  
    descripcion = db.Column(db.String(200))                                        
    unidad_venta = db.Column(db.String(50))        
    imagen_color = db.Column(db.String(300))                               
    cod_presentacion = db.Column(db.String(10))                                    

    #METADATA 
    activo = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<Presentacion {self.material}: {self.unidad_venta}>'

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}



class DetalleTecnico(db.Model):
    __tablename__ = 'detalles_tecnicos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False, unique=True, index=True)

    # DESCRIPCIÓN DEL PRODUCTO 
    descripcion_detallada = db.Column(db.Text)                     
    caracteristicas = db.Column(db.Text)                           
    orientacion_uso = db.Column(db.Text)                           

    # CARACTERÍSTICAS TÉCNICAS 
    vehiculo = db.Column(db.String(200))
    componentes_principales = db.Column(db.String(200))
    pigmentos = db.Column(db.String(200))
    solventes = db.Column(db.String(200))
    color = db.Column(db.String(250))
    voc = db.Column(db.String(250))
    brillo = db.Column(db.String(250))
    espesor_pelicula_recomendado = db.Column(db.String(500))
    aspecto_pelicula = db.Column(db.String(250))
    viscosidad = db.Column(db.String(250))
    densidad = db.Column(db.String(50))
    solidos_por_volumen = db.Column(db.String(50))
    rendimiento_practico = db.Column(db.String(250))
    rendimiento_teorico = db.Column(db.String(250))
    nota_rendimiento = db.Column(db.Text)
    relacion_activacion = db.Column(db.String(250))
    vida_util_mezcla = db.Column(db.String(500))
    viscosidad_empaque = db.Column(db.String(250))
    tiempo_oreo = db.Column(db.String(250))
    espesor_pelicula = db.Column(db.String(250))
    ph = db.Column(db.String(20))
    flash_point = db.Column(db.String(50))
    vida_util_mezcla_25c = db.Column(db.String(250))
    sustratos_recomendados = db.Column(db.Text)
    nota_caracteristicas = db.Column(db.Text)
    capas_recomendadas = db.Column(db.String(250))

    # TIEMPOS DE SECAMIENTO A 25°C (77°F) 
    secamiento_al_tacto = db.Column(db.String(250))
    secamiento_para_repintar = db.Column(db.String(250))
    secamiento_duro = db.Column(db.String(250))
    curado_total = db.Column(db.String(250))
    secamiento_inmersion = db.Column(db.String(250))
    secamiento_al_transito = db.Column(db.String(250))
    secamiento_al_polvo = db.Column(db.String(250))
    nota_secamiento = db.Column(db.Text)

    # PREPARACIÓN Y APLICACIÓN 
    preparacion_superficie = db.Column(db.Text)
    metodo_aplicacion = db.Column(db.Text)
    equipos_recomendados = db.Column(db.Text)
    limpieza_equipos = db.Column(db.String(200))
    diluyente = db.Column(db.String(200))
    condiciones_aplicar = db.Column(db.Text)
    nota_aplicacion = db.Column(db.Text)

    # INFORMACIÓN ADICIONAL 
    fondos_recomendados = db.Column(db.Text)
    resistencia = db.Column(db.Text)
    almacenamiento_precauciones = db.Column(db.Text)
    clase = db.Column(db.Text)
    indicador_clase = db.Column(db.Float)
    presentacion_texto = db.Column(db.String(200))                 
    ubicacion_ficha_tecnica = db.Column(db.String(200))            

    def __repr__(self):
        return f'<DetalleTecnico producto_id={self.producto_id}>'

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    
class LogsActividad(db.Model):
    __tablename__ = 'actividad_logs'

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rif         = db.Column(db.String(10), nullable=True)   
    username    = db.Column(db.String(50), nullable=True)
    ip          = db.Column(db.String(45), nullable=False)  
    device_id   = db.Column(db.String(36), nullable=True, index=True)   
    device_name = db.Column(db.String(100), nullable=True)              
    endpoint    = db.Column(db.String(100), nullable=True)  
    path        = db.Column(db.String(200), nullable=True)  
    method      = db.Column(db.String(10), nullable=False) 
    status_code = db.Column(db.SmallInteger, nullable=True)
    user_agent  = db.Column(db.String(300), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.datetime.now)

    def __repr__(self):
        return f'<ActivityLog {self.id}: {self.rif} -> {self.path} [{self.status_code}]>'

    @classmethod
    def registrar(cls, ip, method, endpoint, path, status_code, user_agent,
                    rif=None, username=None, device_id=None, device_name=None):
        log = cls(
            rif=rif,
            username=username,
            ip=ip,
            device_id=device_id,
            device_name=device_name,
            endpoint=endpoint,
            path=path,
            method=method,
            status_code=status_code,
            user_agent=user_agent
        )
        db.session.add(log)
        db.session.commit()
        return log

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.created_at.desc()).all()

    @classmethod
    def get_by_user(cls, rif):
        return cls.query.filter_by(rif=rif).order_by(cls.created_at.desc()).all()

    @classmethod
    def get_by_ip(cls, ip):
        return cls.query.filter_by(ip=ip).order_by(cls.created_at.desc()).all()

    @classmethod
    def get_recientes(cls, limite=100):
        return cls.query.order_by(cls.created_at.desc()).limit(limite).all()

    @classmethod
    def get_by_endpoint(cls, endpoint):
        return cls.query.filter_by(endpoint=endpoint).order_by(cls.created_at.desc()).all()
    
    @classmethod
    def get_paginado(cls, page=1, per_page=50, 
                    rif=None, username=None, ip=None, device_id=None,
                    endpoint=None, method=None, status_code=None,
                    fecha_desde=None, fecha_hasta=None,
                    orden='desc'):
        query = cls.query

        query = db.session.query(cls, User.seller).outerjoin(
                User, cls.rif == User.rif
            )
        if rif:
            query = query.filter(cls.rif == rif)
        if username:
            query = query.filter(cls.username.like(f'%{username}%'))
        if ip:
            query = query.filter(cls.ip == ip)
        if device_id:
            query = query.filter(cls.device_id == device_id)
        if endpoint:
            query = query.filter(cls.endpoint == endpoint)
        if method:
            query = query.filter(cls.method == method.upper())
        if status_code:
            query = query.filter(cls.status_code == status_code)
        if fecha_desde:
            query = query.filter(cls.created_at >= fecha_desde)
        if fecha_hasta:
            query = query.filter(cls.created_at <= fecha_hasta)

        # Orden
        if orden == 'asc':
            query = query.order_by(cls.created_at.asc())
        else:
            query = query.order_by(cls.created_at.desc())


        return query.paginate(page=page, per_page=per_page, error_out=False)
    


    @classmethod
    def top_usuarios_multidispositivo(cls, limite=10):
        """
        Retorna los usuarios que más dispositivos distintos han usado.
        
        Returns:
            Lista de dicts: [{'rif', 'username', 'dispositivos_distintos', 'ips_distintas'}]
        """
        resultados = db.session.query(
            cls.rif,
            cls.username,
            func.count(distinct(cls.device_id)).label('dispositivos_distintos'),
            func.count(distinct(cls.ip)).label('ips_distintas')
        ).filter(
            cls.rif.isnot(None),
            cls.device_id.isnot(None)
        ).group_by(
            cls.rif, cls.username
        ).having(
            func.count(distinct(cls.device_id)) > 1
        ).order_by(
            func.count(distinct(cls.device_id)).desc()
        ).limit(limite).all()
        
        return [
            {
                'rif': r.rif,
                'username': r.username,
                'dispositivos_distintos': r.dispositivos_distintos,
                'ips_distintas': r.ips_distintas
            }
            for r in resultados
        ]


    @classmethod
    def top_dispositivos_multiusuario(cls, limite=10):
        """
        Retorna los dispositivos que más usuarios distintos han usado.
        
        Returns:
            Lista de dicts: [{'device_id', 'device_name', 'ip', 'usuarios_distintos', 'lista_usuarios'}]
        """
        # Primera query: agrupar por device_id y contar usuarios distintos
        resultados = db.session.query(
            cls.device_id,
            func.count(distinct(cls.rif)).label('usuarios_distintos')
        ).filter(
            cls.device_id.isnot(None),
            cls.rif.isnot(None)
        ).group_by(
            cls.device_id
        ).having(
            func.count(distinct(cls.rif)) > 1
        ).order_by(
            func.count(distinct(cls.rif)).desc()
        ).limit(limite).all()
        
        datos = []
        for r in resultados:
            info = db.session.query(
                cls.device_name, cls.ip
            ).filter(
                cls.device_id == r.device_id
            ).order_by(
                cls.created_at.desc()
            ).first()
            
            usuarios = db.session.query(
                cls.username,
                User.seller
            ).join(
                User, cls.rif == User.rif
            ).filter(
                cls.device_id == r.device_id,
                cls.username.isnot(None)
            ).distinct(cls.username).all()
            
            datos.append({
                'device_id': r.device_id,
                'device_id_corto': r.device_id[:8] + '...',  # para mostrar en gráfica
                'device_name': info.device_name if info else 'Desconocido',
                'ip': info.ip if info else '-',
                'usuarios_distintos': r.usuarios_distintos,
                'lista_usuarios': [
                    f"{u.username} ( Seller: {u.seller})" if u.seller else u.username
                    for u in usuarios
                ]
            })
        
        return datos
    
    @classmethod
    def multicuentas_kpi(cls):
        """
        Cuenta cuántos dispositivos (device_id) han sido usados por 
        más de un usuario distinto (rif).
        
        Returns:
            int: Número de dispositivos con múltiples usuarios asociados.
                0 si no hay casos sospechosos.
        """
        subquery = db.session.query(
            cls.device_id
        ).filter(
            cls.device_id.isnot(None),
            cls.rif.isnot(None)
        ).group_by(
            cls.device_id
        ).having(
            func.count(distinct(cls.rif)) > 1
        ).subquery()
        
        total = db.session.query(func.count()).select_from(subquery).scalar()
        
        return total or 0






"""COMENTAR DESDE AQUI PARA HACER EL PULL"""

class Ticket(db.Model):
    """Ticket de atención al cliente"""
    __tablename__ = 'tickets'
    

    class TipoProceso:
        COLOR_MATCHING = 'color_matching'
        QUEJA = 'queja'
        DEVOLUCION = 'devolucion'
        CONSULTA_TECNICA = 'consulta_tecnica'
    
    class EstadoGlobal:
        ABIERTO = 'abierto'
        EN_PROCESO = 'en_proceso'
        CERRADO = 'cerrado'
        CANCELADO = 'cancelado'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero_ticket = db.Column(db.String(20), nullable=False, unique=True, index=True)
    tipo_proceso = db.Column(db.String(50), nullable=False, index=True)
    
    # Datos del cliente
    rif_cliente = db.Column(db.String(20), nullable=False, index=True)
    email_cliente = db.Column(db.String(150), nullable=False)
    estado_global = db.Column(db.String(30), nullable=False, default=EstadoGlobal.ABIERTO, index=True)
    estado_actual = db.Column(db.String(50), nullable=False, index=True)
    asignado_a = db.Column(db.String(100), index=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)
    fecha_ultima_accion = db.Column(db.DateTime, default=datetime.datetime.utcnow,
                                    onupdate=datetime.datetime.utcnow,
                                    nullable=False)
    fecha_cierre = db.Column(db.DateTime, nullable=True)
    
    historial = db.relationship(
        'TicketHistorial',
        backref='ticket',
        lazy='select',
        order_by='ticket_historial.c.fecha',
        cascade='all, delete-orphan'
    )
    
    color_matchings = db.relationship(
        'ColorMatching',
        backref='ticket',
        lazy='select',
        cascade='all, delete-orphan'
    )
    
    def to_dict(self, include_relations=False):
        data = {
            'id': self.id,
            'numero_ticket': self.numero_ticket,
            'tipo_proceso': self.tipo_proceso,
            'rif_cliente': self.rif_cliente,
            'email_cliente': self.email_cliente,
            'estado_global': self.estado_global,
            'estado_actual': self.estado_actual,
            'asignado_a': self.asignado_a,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_ultima_accion': self.fecha_ultima_accion.isoformat() if self.fecha_ultima_accion else None,
            'fecha_cierre': self.fecha_cierre.isoformat() if self.fecha_cierre else None,
        }
        if include_relations:
            data['color_matchings'] = [cm.to_dict() for cm in self.color_matchings]
            data['historial'] = [h.to_dict() for h in self.historial]
        return data
    
    def registrar_paso(self, paso, ejecutado_por, comentario=None, payload=None):
        """Helper para agregar entradas al historial sin importar TicketHistorial en cada ruta"""
        self.historial.append(TicketHistorial(
            paso=paso,
            ejecutado_por=ejecutado_por,
            comentario=comentario,
            payload=payload
        ))
        self.fecha_ultima_accion = datetime.datetime.utcnow()
    
    def cerrar(self, ejecutado_por, comentario=None):
        """Cierra el ticket y deja huella en el historial"""
        self.estado_global = self.EstadoGlobal.CERRADO
        self.estado_actual = 'cerrado'
        self.fecha_cierre = datetime.datetime.utcnow()
        self.registrar_paso('cierre', ejecutado_por, comentario or 'Ticket cerrado')
    
    def __repr__(self):
        return f'<Ticket {self.numero_ticket} ({self.estado_global})>'
    
    SORT_COLUMNS = {
        'numero_ticket':       'numero_ticket',
        'fecha_creacion':      'fecha_creacion',
        'fecha_ultima_accion': 'fecha_ultima_accion',
        'estado_global':       'estado_global',
    }

    @classmethod
    def get_paginado(cls, page=1, per_page=25,
                    sort_by='fecha_ultima_accion', sort_dir='desc',
                    search=None, estado_global=None, tipo_proceso=None):
        """
        Obtiene tickets paginados con filtros, búsqueda y ordenamiento.
        Args:
            page (int): Número de página (empieza en 1)
            per_page (int): Tickets por página (máx 100 — validar en la ruta)
            sort_by (str): Columna por la cual ordenar. Solo acepta valores de cls.SORT_COLUMNS, default 'fecha_ultima_accion'
            sort_dir (str): 'asc' o 'desc', default 'desc'
            search (str): Texto a buscar en numero_ticket, rif_cliente, email_cliente y asignado_a
            estado_global (str): Filtrar por estado_global exacto
            tipo_proceso (str): Filtrar por tipo_proceso exacto
        Returns:
            tuple: (items_dict_list, total)
        """
        query = cls.query

        # Filtros simples sobre columnas indexadas
        if estado_global:
            query = query.filter(cls.estado_global == estado_global)
        if tipo_proceso:
            query = query.filter(cls.tipo_proceso == tipo_proceso)

        # Búsqueda libre en campos clave del ticket
        if search:
            like = f'%{search}%'
            query = query.filter(or_(
                cls.numero_ticket.ilike(like),
                cls.rif_cliente.ilike(like),
                cls.email_cliente.ilike(like),
                cls.asignado_a.ilike(like),
            ))

        sort_attr = cls.SORT_COLUMNS.get(sort_by, 'fecha_ultima_accion')
        col = getattr(cls, sort_attr)
        query = query.order_by(desc(col) if sort_dir == 'desc' else asc(col))

        # Paginación
        pag = query.paginate(page=page, per_page=per_page, error_out=False)

        items = [t.to_dict() for t in pag.items]
        return items, pag.total

    @classmethod
    def get_count(cls):
        """Obtiene el número total de tickets"""
        return cls.query.count()

    @classmethod
    def count_by_estado(cls, estado):
        """Cuenta los tickets con un estado_global específico"""
        return cls.query.filter(cls.estado_global == estado).count()

    @classmethod
    def count_by_tipo(cls, tipo):
        """Cuenta los tickets con un tipo_proceso específico"""
        return cls.query.filter(cls.tipo_proceso == tipo).count()

    @classmethod
    def count_cerrados_mes(cls):
        """
        Cuenta los tickets cerrados desde el primer día del mes actual.
        Usa el índice de estado_global; fecha_cierre filtra el subset.
        """
        inicio_mes = datetime.datetime.utcnow().replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        return cls.query.filter(
            cls.estado_global == cls.EstadoGlobal.CERRADO,
            cls.fecha_cierre >= inicio_mes
        ).count()

    @classmethod
    def get_kpis_dashboard(cls):
        """
        Retorna los KPIs para la vista de lista de solicitudes en un dict.
        Centraliza las consultas para que la vista quede limpia.
        """
        return {
            'abiertos':       cls.count_by_estado(cls.EstadoGlobal.ABIERTO),
            'en_proceso':     cls.count_by_estado(cls.EstadoGlobal.EN_PROCESO),
            'cerrados_mes':   cls.count_cerrados_mes(),
            'color_matching': cls.count_by_tipo(cls.TipoProceso.COLOR_MATCHING),
        }
        
    
    """AQQUI SE AGREGAN FUNCIONES SEGUN EL MODULO DE ATENCION AL CLIENTE, POR EJEMPLO AQUI DIRECTAMNETE SE INSERTA EL COLOR MATCHING PARA EL FLUJO COMPLETO"""
    
    @classmethod
    def crear_color_matching(cls, form, user):
        """
        Crea un ticket de color matching completo en una sola transacción.
        Retorna (ticket, None) si todo va bien, o (None, mensaje_error) si falla.
        """
        try:
            # 1. Ticket base
            ticket = cls(
                numero_ticket='TEMP',
                tipo_proceso=cls.TipoProceso.COLOR_MATCHING,
                rif_cliente=getattr(user, 'rif', user.username),
                email_cliente=user.email,
                estado_global=cls.EstadoGlobal.ABIERTO,
                estado_actual='recibido',
                asignado_a=None
            )
            db.session.add(ticket)
            db.session.flush()  # genera ticket.id sin commit

            # 2. Numero de ticket con el ID ya disponible
            año = datetime.datetime.utcnow().year
            ticket.numero_ticket = f"TIN-{año}-{ticket.id:04d}"

            # 3. Color matching ligado al ticket
            color_matching = ColorMatching(
                ticket_id=ticket.id,
                color_nombre=form.color.data,
                cod_std=form.cod_std.data or None,
                marca=form.marca.data or None,
                linea=form.linea.data or None,
                udv=form.udv.data,
                unidad_cantidad='cc',
                observaciones=form.observaciones.data or None,
                base=None,
                primer=None,
            )
            db.session.add(color_matching)

            # 4. Primer paso del historial
            ticket.registrar_paso(
                paso='creacion',
                ejecutado_por=user.email,
                comentario=f"Solicitud creada por {form.tienda.data}",
                payload={
                    'tienda': form.tienda.data,
                    'location': form.location.data,
                    'color_nombre': form.color.data,
                    'cod_std': form.cod_std.data,
                    'marca': form.marca.data,
                    'udv': form.udv.data,
                }
            )

            db.session.commit()
            return ticket, None

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] Ticket.crear_color_matching: {e}")
            return None, str(e)
    

class TicketHistorial(db.Model):
    """Registro inmutable de cada acción ejecutada sobre un ticket"""
    __tablename__ = 'ticket_historial'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ticket_id = db.Column(
        db.Integer,
        db.ForeignKey('tickets.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    paso = db.Column(db.String(50), nullable=False, index=True)
    ejecutado_por = db.Column(db.String(100), nullable=False, index=True)
    fecha = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    comentario = db.Column(db.Text)
    payload = db.Column(db.JSON)  
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'paso': self.paso,
            'ejecutado_por': self.ejecutado_por,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'comentario': self.comentario,
            'payload': self.payload
        }
    
    def __repr__(self):
        return f'<Historial #{self.id} ticket={self.ticket_id} paso={self.paso}>'


class ColorMatching(db.Model):
    """Respuesta de formulación de color para un ticket"""
    __tablename__ = 'color_matching'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ticket_id = db.Column(
        db.Integer,
        db.ForeignKey('tickets.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    

    color_nombre = db.Column(db.String(150), nullable=False)
    cod_std = db.Column(db.String(50))
    marca = db.Column(db.String(100))
    linea = db.Column(db.String(150))
    base = db.Column(db.String(150))
    primer = db.Column(db.String(100))
    
    # Unidad de envase y unidad de cantidad
    udv = db.Column(db.String(20), nullable=False, default='1 GALON')
    unidad_cantidad = db.Column(db.String(10), default='cc')
    
    observaciones = db.Column(db.Text)
    
    tintas = db.relationship(
        'ColorMatchingTinta',
        backref='color_matching',
        lazy='select',
        order_by='color_matching_tintas.c.orden',
        cascade='all, delete-orphan'
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'color_nombre': self.color_nombre,
            'cod_std': self.cod_std,
            'marca': self.marca,
            'linea': self.linea,
            'base': self.base,
            'primer': self.primer,
            'udv': self.udv,
            'unidad_cantidad': self.unidad_cantidad,
            'observaciones': self.observaciones,
            'tintas': [t.to_dict() for t in self.tintas]
        }
    
    def __repr__(self):
        return f'<ColorMatching #{self.id} - {self.color_nombre} ({self.udv})>'



class ColorMatchingTinta(db.Model):
    """Cada tinta/colorante de una fórmula de color matching"""
    __tablename__ = 'color_matching_tintas'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    color_matching_id = db.Column(
        db.Integer,
        db.ForeignKey('color_matching.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    codigo_tinta = db.Column(db.String(20), nullable=False)     
    cantidad = db.Column(db.Numeric(10, 4), nullable=False)   
    orden = db.Column(db.SmallInteger, nullable=False, default=0)
    

    __table_args__ = (
        UniqueConstraint('color_matching_id', 'codigo_tinta',
                        name='uq_color_matching_tinta'),
    )
    
    def to_dict(self):
        return {
            'codigo_tinta': self.codigo_tinta,
            'cantidad': float(self.cantidad),
            'orden': self.orden
        }
    
    def __repr__(self):
        return f'<Tinta {self.codigo_tinta}: {self.cantidad} en CM #{self.color_matching_id}>'
"""COMENTAR HASTA AQUI PARA HACER EL PULL"""