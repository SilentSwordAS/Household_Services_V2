from flask import Flask,render_template
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Roles
from flask_security import Security, SQLAlchemyUserDatastore
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel

def create_app():
    app = Flask(__name__, template_folder="frontend", static_folder="frontend", static_url_path="/static")

    # Importing Config
    app.config.from_object(LocalDevelopmentConfig)

    # For SQLAlchemy
    db.init_app(app)

    #Cache Init
    cache = Cache(app)

    # For Flask Security
    app_datastore = SQLAlchemyUserDatastore(db, User, Roles)
    app.cache = cache
    app.security = Security(app, datastore=app_datastore, register_blueprint=False)
    app.app_context().push()

    from backend.resources import api
    # for flask restful
    api.init_app(app)


    return app

app = create_app()

celery_app = celery_init_app(app)


import backend.create_initial_data

import backend.routes

import backend.celery.celery_schedule

# For flask excel
excel.init_excel(app)

if __name__ == "__main__":
    app.run(debug=True)

