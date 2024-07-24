local= 'mysql://root:Di.IoT4.0@localhost/cobranza'
server = 'mysql://apadra:Di.2824@localhost/app_crp'

class Config:
    SECRET_KEY = 'codigofacilito'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = server#local

    MAIL_SERVER = 'smtp.office365.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'noreply@corimon.com'
    MAIL_PASSWORD = 'Suz38159'
    MAIL_TEST = 'eliezer_chirino@corimon.com'#'alejandro_padra@corimon.com'

class ProductionConfig(DevelopmentConfig):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
    'production':ProductionConfig
}