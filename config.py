

class Config:
    SECRET_KEY = 'codigofacilito'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql://root:Di.IoT4.0@localhost/cobranza'

    MAIL_SERVER = 'smtp.office365.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'noreply@corimon.com'
    MAIL_PASSWORD = 'Suz38159'

class ProductionConfig(DevelopmentConfig):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
    'production':ProductionConfig
}