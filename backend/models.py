from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime


db  = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__= "user"
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80))
    date_created = db.Column(db.String(80), default=datetime.now().date().strftime("%d/%m/%Y"))
    address = db.Column(db.String(80), nullable=False)
    pin_code = db.Column(db.Integer, nullable=False)
    contact = db.Column(db.Integer, nullable=False)
    service_name = db.Column(db.String(80), db.ForeignKey("services.name"))
    status = db.Column(db.String(80), default="Approved")
    avg_ratings = db.Column(db.String(80), default="0")

    # Flask Security Specific
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, default="True")
    roles = db.relationship("Roles", backref="bearer", secondary="user_roles")

class Roles(db.Model, RoleMixin):
    __tablename__="roles"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String, nullable=False)

class UserRoles(db.Model):
    __tablename__="user_roles"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"))

class Services(db.Model):
    __tablename__="services"
    serv_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    name = db.Column(db.String(80), unique=True, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    time_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(150), nullable=False)


class ServiceRequest(db.Model):
    __tablename__="servicerequest"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.serv_id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    pro_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    date_of_request = db.Column(db.String(80), default = datetime.now().date().strftime("%d/%m/%Y"))
    date_of_completion = db.Column(db.String(80))
    service_status = db.Column(db.String(80), default="Requested")
    ratings = db.Column(db.Integer)
    remarks = db.Column(db.String(150))

    