

class Config:
    SECRET_KEY = 'codigofacilito'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql://root:Di.IoT4.0@localhost/cobranza'

    MAIL_SERVER = 'smtp.googlemail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = '@gmail.com'
    MAIL_PASSWORD = ''


config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
}