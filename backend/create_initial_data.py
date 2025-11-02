from flask import current_app as app
from flask_security import SQLAlchemyUserDatastore, hash_password
from backend.models import db

with app.app_context():
    db.create_all()

    app_datastore: SQLAlchemyUserDatastore = app.security.datastore

    app_datastore.find_or_create_role(name="Admin", description="Complete Overseer of the application.")
    app_datastore.find_or_create_role(name="Professional", description="Service Professionals employed by the organisation.")
    app_datastore.find_or_create_role(name="Customer", description="Customers who can employ the services provided by the organization")

    if not(app_datastore.find_user(email="admin@xyz.com")):
        app_datastore.create_user(email="admin@xyz.com", password = hash_password('1234'), first_name="admin", address="XYZ Household Services", pin_code=000000, contact=0000000000, roles = ["Admin"])
    
    db.session.commit()
