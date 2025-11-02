from flask import current_app as app, render_template, request, jsonify, url_for, send_file
from flask_security import SQLAlchemyUserDatastore, verify_password, hash_password, auth_required
from backend.models import db
from datetime import datetime
from backend.celery.tasks import create_csv
from celery.result import AsyncResult

cache = app.cache
app_datastore : SQLAlchemyUserDatastore = app.security.datastore

@app.get("/")
def home():
    return render_template("index.html")

@auth_required("token")
@app.get("/create-csv")
def make_csv():
    task = create_csv.delay()
    return {"task_id":task.id}

@auth_required("token")
@app.get("/get-csv/<task_id>")
def get_csv(task_id):
    result = AsyncResult(task_id)
    if result.ready():
        return send_file(f'./backend/celery/exports/{result.result}')
    else:
        return {"message":"Task is not ready"},405

@app.route("/user_login", methods=["POST"])
def user_login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Invalid Inputs"}), 404
    
    user = app_datastore.find_user(email=email)

    if not user:
        return jsonify({"message":"Invalid Email"}), 404
    
    if verify_password(password, user.password):
        if user.status == "Pending":
            return jsonify({"message": "Your account is pending approval"}), 401
        elif user.status == "Blocked":
            return jsonify({"message": "Your account is blocked"}), 403
        else: 
            return jsonify({"token": user.get_auth_token(), "email": email, "role": user.roles[0].name, "id": user.user_id , "role_hash": hash_password(user.roles[0].name)}), 200
        
    else:
        return jsonify({"message": "Wrong password, please try again."}), 400

@app.route("/user_register", methods=["POST"])
def user_register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    roles = data.get("role")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    address = data.get("address")
    pincode = data.get("pincode")
    contact = data.get("contact")
    service_name = data.get("service_name")

    if not email or roles not in ["Customer", "Professional"]:
        return jsonify({"message":"Invalid Inputs"}), 404
    
    user = app_datastore.find_user(email=email)

    if user:
        return jsonify({"message":"User already exists"}), 404
    
    try:
        if roles == "Professional":
            app_datastore.create_user(email=email, password=hash_password(password), first_name=first_name, last_name=last_name, address=address, pin_code=pincode,contact=contact,roles=[roles], service_name=service_name)
            pro = app_datastore.find_user(email=email)
            pro.status = "Pending"
        else:
            app_datastore.create_user(email=email, password=hash_password(password), first_name=first_name, last_name=last_name, address=address, pin_code=pincode,contact=contact,roles=[roles])
        db.session.commit()
        return jsonify({"message":"User Created Successfully"}), 200
    except:
        db.session.rollback()
        return jsonify({"message":"Error registering the user"}), 400