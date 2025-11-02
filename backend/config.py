class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///HouseholdServices.sqlite3"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "super_tawp_sekret"
    SECRET_KEY = "tawp_sekret"
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "service-token"
    WTF_CSRF_ENABLED = False

    #Cache Config
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379