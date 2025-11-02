from flask_restful import Api, Resource, fields, marshal_with
from backend.models import db, ServiceRequest, Services, User
from flask_security import auth_required, roles_required, current_user,verify_password
from flask import request, jsonify, make_response, current_app as app
from datetime import datetime

cache = app.cache
api = Api(prefix="/api")

service_fields = {
    "serv_id":fields.Integer,
    "name": fields.String,
    "price": fields.Integer,
    "time_required": fields.Integer,
    "description": fields.String
}

service_request_fields = {
    "id":fields.Integer,
    "service_id": fields.Integer,
    "user_id": fields.Integer,
    "date_of_request": fields.String,
    "date_of_completion": fields.String,
    "service_status": fields.String,
    "ratings": fields.Integer,
    "remarks": fields.String
}

service_professional_fields = {
    "user_id": fields.Integer,
    "email": fields.String,
    "first_name": fields.String,
    "last_name": fields.String,
    "address": fields.String,
    "pin_code": fields.Integer,
    "contact": fields.Integer,
    "service_name": fields.String,
    "status": fields.String,
    "avg_ratings": fields.String
}

class ServiceListAPI(Resource):

    @marshal_with(service_fields)
    def get(self):
        services = Services.query.all()
        return services

    @auth_required('token')
    def post(self):
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        time_required = data.get('time_required')
        description = data.get('description')
        role = data.get('role')

        service = Services(name=name, price=price, time_required=time_required, description=description)

        try:
            if verify_password("Admin", role):
                db.session.add(service)
                db.session.commit()
                return make_response(jsonify({"message": "Service Created Successfully"}), 200)
            else:
                return make_response(jsonify({"message": "You are not authorized to create a service"}), 403)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error while creating service"}), 400)

class ServiceAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout=10)
    @marshal_with(service_fields)
    def get(self, serv_id):
        service = Services.query.filter_by(serv_id=serv_id).first()
        return service
    
    @auth_required('token')
    def put(self, serv_id):
        data = request.get_json()
        service = Services.query.filter_by(serv_id=serv_id).first()
        if not service:
            return make_response(jsonify({"message":"Service Unavailable"}), 404)
        
        service.price = data.get("price")
        service.time_required = data.get("time_required")
        service.description = data.get("description")
        try:
            if verify_password("Admin", data.get("role")):
                db.session.commit()
                return make_response(jsonify({"message":"Service Updated Successfully"}), 200)
            else:
                return make_response(jsonify({"message":"You are not authorized to update this service"}), 403)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error while updating service"}), 400)

    @auth_required('token')
    def delete(self, serv_id):
        data = request.get_json()
        service = Services.query.filter_by(serv_id=serv_id).first()

        if not service:
            return make_response(jsonify({"message":"Service does not exist"}), 404)

        try:
            if verify_password("Admin", data.get("role")):
                all_requests = ServiceRequest.query.filter_by(service_id=serv_id).all()
                all_professionals = User.query.filter_by(service_name=service.name).all()
                for req in all_requests:
                    db.session.delete(req)
                for pro in all_professionals:
                    db.session.delete(pro)
                db.session.delete(service)
                db.session.commit()
                return make_response(jsonify({"message":"Service deleted successfully"}), 200)
            else:
                return make_response(jsonify({"message":"You are not authorized to delete this service"}), 403)
            
        except:
            db.session.rollback()        
            return make_response(jsonify({"message":"Error while deleting service"}), 400)

class ServiceRequestListAPI(Resource):

    def get(self):
        service_requests = ServiceRequest.query.order_by(ServiceRequest.ratings.desc()).all()
        all_requests = []
        for req in service_requests:
            req_json = {}
            if req.pro_id != None:
                pro = User.query.filter_by(user_id=req.pro_id).first()
                req_json["pro_first_name"] = pro.first_name
                req_json["pro_last_name"] = pro.last_name
                req_json["pro_email"] = pro.email
                req_json["pro_id"] = pro.user_id
                req_json["pro_status"] = pro.status
            else:
                req_json["pro_first_name"] = ""
                req_json["pro_last_name"] = ""
                req_json["pro_email"] = ""
                req_json["pro_id"] = ""
                req_json["pro_status"] = ""
            cust = User.query.filter_by(user_id=req.user_id).first()
            req_json["cust_first_name"] = cust.first_name
            req_json["cust_last_name"] = cust.last_name
            req_json["cust_email"] = cust.email
            req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name  
            req_json["service_status"] = req.service_status
            req_json["id"] = req.id
            req_json["date_of_request"] = req.date_of_request
            req_json["status"] =req.service_status
            req_json["cust_id"] = req.user_id
            req_json["cust_status"] = cust.status
            if req.date_of_completion != None:
                req_json["date_of_completion"] = req.date_of_completion
            else:
                req_json["date_of_completion"] = ""
            all_requests.append(req_json)
        
        return all_requests

class ServiceRequestListByCustomerAPI(Resource):

    @auth_required('token')
    def get(self, cust_id):
        service_requests = ServiceRequest.query.filter_by(user_id=cust_id).all()
        all_requests = []
        for req in service_requests:
            req_json = {}
            if req.pro_id != None:
                pro = User.query.filter_by(user_id=req.pro_id).first()    
                req_json["pro_first_name"] = pro.first_name
                req_json["pro_last_name"] = pro.last_name
                req_json["pro_email"] = pro.email
            else:
                req_json["pro_first_name"] = ""
                req_json["pro_last_name"] = ""
                req_json["pro_email"] = ""
            cust = User.query.filter_by(user_id=req.user_id).first()
            req_json["cust_first_name"] = cust.first_name
            req_json["cust_last_name"] = cust.last_name
            req_json["cust_email"] = cust.email
            req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name 
            req_json["service_status"] = req.service_status
            req_json["id"] = req.id
            all_requests.append(req_json)
        return all_requests

class PublicServiceRequestAPI(Resource):
    
    @auth_required('token')
    def post(self, serv_id, user_id):
        req = ServiceRequest(service_id=serv_id, user_id = user_id)
        
        try:
            db.session.add(req)
            db.session.commit()
            return make_response(jsonify({"message":"Public Request Created Successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in creating public request"}), 400)

class PrivateServiceRequestAPI(Resource):
    
    @auth_required('token')
    def post(self, serv_id, pro_id, user_id):
        req = ServiceRequest(service_id=serv_id, user_id=user_id, pro_id=pro_id)

        try:
            db.session.add(req)
            db.session.commit()
            return make_response(jsonify({"message":"Private Request Created Successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in creating private request"}), 400)

class ServiceRequestAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=10)
    @marshal_with(service_request_fields)
    def get(self, req_id):
        req = ServiceRequest.query.filter_by(id=req_id).first()
        return req
    
    @auth_required('token')
    def put(self, req_id):
        data = request.get_json()
        req = ServiceRequest.query.filter_by(id=req_id).first()
        if req.service_status != "Closed":
            req.date_of_request = data.get("date_of_request")
            try:
                db.session.commit()
                return make_response(jsonify({"message":"Date of request changed successfully"}), 200)
            except:
                db.session.rollback()
                return make_response(jsonify({"message":"Error while changing date of request"}), 400)
        else:
            req.remarks = data.get("remarks")
            try:
                db.session.commit()
                return make_response(jsonify({"message":"Remarks changed successfully"}), 200)
            except:
                db.session.rollback()
                return make_response(jsonify({"message":"Error while changing remarks"}), 400)
    
    @auth_required('token')
    def delete(self, req_id):
        req = ServiceRequest.query.filter_by(id=req_id).first()
        try:
            db.session.delete(req)
            db.session.commit()
            return make_response(jsonify({"message":"Request deleted successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in deleting request"}), 400)
        
class ProfessionalListAPI(Resource):

    def get(self):
        professionals = User.query.filter(User.service_name != None).order_by(User.avg_ratings.desc()).all()
        all_pros = []
        for pro in professionals:
            pro_json = {}
            pro_json["user_id"] = pro.user_id
            pro_json["email"] = pro.email
            pro_json["first_name"]= pro.first_name
            pro_json["last_name"] = pro.last_name
            pro_json["address"]= pro.address
            pro_json["pin_code"] = pro.pin_code
            pro_json["contact"] = pro.contact
            pro_json["service_name"] = pro.service_name
            pro_json["status"] = pro.status
            pro_json["avg_ratings"]= pro.avg_ratings
            pro_json["service_id"] = Services.query.filter_by(name=pro.service_name).first().serv_id
            all_pros.append(pro_json)    
        return all_pros

class ApproveProfessionalAPI(Resource):

    @auth_required('token')
    def put(self, pro_id):
        data = request.get_json()
        prof = User.query.filter_by(user_id=pro_id).first()
        prof.status = "Approved"
        try:
            if (verify_password("Admin", data.get("role"))):
                db.session.commit()
                return make_response(jsonify({"message":"Professional approved successfully"}), 200)
            else:
                return make_response(jsonify({"message":"You are not authorized to approve this professional"}), 403)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in approving professional"}), 400)

class RejectProfessionalAPI(Resource):

    @auth_required('token')
    def delete(self, pro_id):
        data = request.get_json()
        prof = User.query.filter_by(user_id=pro_id).first()
        try:
            if (verify_password("Admin", data.get("role"))):
                db.session.delete(prof)
                db.session.commit()
                all_req = ServiceRequest.query.filter_by(pro_id=pro_id).all()
                for req in all_req:
                    db.session.delete(req)
                db.session.commit()
                return make_response(jsonify({"message":"Professional rejected and deleted successfully"}), 200)
            else:
                return make_response(jsonify({"message":"You are not authorized to reject this professional"}), 403)
        except:
            db.session.rollback()

class BlockProfessionalAPI(Resource):

    @auth_required('token')
    def put(self, pro_id):
        data = request.get_json()
        prof = User.query.filter_by(user_id=pro_id).first()
        prof.status = "Blocked"
        try:
            if (verify_password("Admin", data.get("role"))):
                db.session.commit()
                return make_response(jsonify({"message":"Professional blocked successfully"}), 200)
            else:
                return make_response(jsonify({"message":"You are not authorized to block this professional"}), 403)
        except:
            db.session.rollback()

class UnblockProfessionalAPI(Resource):

    @auth_required('token')
    def put(self, pro_id):
        data = request.get_json()
        prof = User.query.filter_by(user_id=pro_id).first()
        prof.status = "Approved"
        try:
            if (verify_password("Admin", data.get("role"))):
                db.session.commit()
                return make_response(jsonify({"message":"Professional unblocked successfully"}), 200)
            else:
                return make_response(jsonify({"message":"You are not authorized to unblock this professional"}), 403)
        except:
            db.session.rollback()

class ProfessionalListByServiceAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=10)
    @marshal_with(service_professional_fields)
    def get(self, serv_id):
        service = Services.query.filter_by(serv_id=serv_id).first()
        professionals = User.query.filter(User.service_name == service.name).order_by(User.avg_ratings.desc()).all()
        return professionals

class CloseRequestAPI(Resource):

    @auth_required('token')
    def put(self, req_id):
        data = request.get_json()
        req = ServiceRequest.query.filter_by(id=req_id).first()
        req.service_status = "Closed"
        req.remarks = data.get("remarks")
        req.ratings = data.get("ratings")
        req.date_of_completion = datetime.now().date().strftime("%d/%m/%Y")
        try:
            db.session.commit()
            # Need to update average rating of the professional over here
            pro = User.query.filter_by(user_id=req.pro_id).first()
            all_requests = ServiceRequest.query.filter_by(pro_id=req.pro_id, service_status="Closed").all()
            total_ratings = 0
            for req in all_requests:
                total_ratings += int(req.ratings)
            pro.avg_ratings = str(float(total_ratings/len(all_requests)))
            db.session.commit()
            return make_response(jsonify({"message":"Request closed successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in closing request"}), 400)

class ProfessionalDetailsAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=10)
    def get(self, req_id):
        req = ServiceRequest.query.filter_by(id=req_id).first()
        req_json = {}
        pro = User.query.filter_by(user_id=req.pro_id).first()
        service = Services.query.filter_by(serv_id=req.service_id).first()
        req_json["pro_first_name"] = pro.first_name
        req_json["pro_last_name"] = pro.last_name
        req_json["pro_email"] = pro.email
        req_json["service_name"] = service.name
        return req_json

class GetPublicRequestsAPI(Resource):
    @auth_required('token')
    def get(self,pro_id):
        pro = User.query.filter_by(user_id=pro_id).first()
        service_id = Services.query.filter_by(name = pro.service_name).first().serv_id 
        requests = ServiceRequest.query.filter_by(pro_id=None, service_status="Requested", service_id=service_id).all()
        all_requests = []
        for req in requests:
            req_json = {}
            user = User.query.filter_by(user_id=req.user_id).first()
            req_json["user_name"] = user.first_name + " " + user.last_name
            req_json["user_email"] = user.email
            req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
            req_json["pincode"] = user.pin_code
            req_json["id"] = req.id
            req_json["date_of_request"] = req.date_of_request
            all_requests.append(req_json)
        return all_requests

class GetPrivateRequestsAPI(Resource):
    @auth_required('token')
    def get(self, pro_id):
        requests = ServiceRequest.query.filter_by(pro_id=pro_id, service_status="Requested").all()
        all_requests = []
        for req in requests:
            req_json = {}
            user = User.query.filter_by(user_id=req.user_id).first()
            req_json["user_name"] = user.first_name + " " + user.last_name
            req_json["user_email"] = user.email
            req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
            req_json["pincode"] = user.pin_code
            req_json["id"] = req.id
            req_json["date_of_request"] = req.date_of_request
            all_requests.append(req_json)
        return all_requests

class GetAcceptedRequestsAPI(Resource):
    @auth_required('token')
    def get(self, pro_id):
        accepted_requests = ServiceRequest.query.filter_by(pro_id=pro_id, service_status="Accepted").all()
        closed_requests = ServiceRequest.query.filter_by(pro_id=pro_id, service_status="Closed").all()
        requests = accepted_requests + closed_requests
        all_requests = []
        for req in requests:
            req_json = {}
            user = User.query.filter_by(user_id=req.user_id).first()
            req_json["user_name"] = user.first_name + " " + user.last_name
            req_json["user_email"] = user.email
            req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
            req_json["pincode"] = user.pin_code
            req_json["id"] = req.id
            req_json["ratings"] = req.ratings
            req_json["status"] = req.service_status
            req_json["date_of_request"] = req.date_of_request
            req_json["date_of_completion"] = req.date_of_completion
            all_requests.append(req_json)
        return all_requests

class AcceptPublicRequestAPI(Resource):
    @auth_required('token')
    def put(self, req_id, pro_id):
        req = ServiceRequest.query.filter_by(id=req_id).first()
        req.service_status = "Accepted"
        req.pro_id = pro_id
        try:
            db.session.commit()
            return make_response(jsonify({"message":"Request accepted successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in accepting request"}), 400)

class AcceptPrivateRequestAPI(Resource):
    @auth_required('token')
    def put(self, req_id):
        req = ServiceRequest.query.filter_by(id=req_id).first()
        req.service_status = "Accepted"
        try:
            db.session.commit()
            return make_response(jsonify({"message":"Request accepted successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in accepting request"}), 400)

class RejectRequestAPI(Resource):
    @auth_required('token')
    def put(self, req_id):
        req = ServiceRequest.query.filter_by(id=req_id).first()
        req.service_status = "Rejected"
        try:
            db.session.commit()
            return make_response(jsonify({"message":"Request rejected successfully"}), 200)
        except:
            db.session.rollback()
            return make_response(jsonify({"message":"Error in rejecting request"}), 400)

class AdminSearchByFilterAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=10)
    def get(self, filter, value):
        if filter == "service_name":
            all_req = []
            all_services = Services.query.filter(Services.name.ilike("%"+value+"%")).all()
            for service in all_services:
                ser_req = ServiceRequest.query.filter_by(service_id=service.serv_id).all()
                for req in ser_req:
                    req_json = {}
                    user = User.query.filter_by(user_id=req.user_id).first()
                    pro = User.query.filter_by(user_id=req.pro_id).first()
                    req_json["user_name"] = user.first_name + " " + user.last_name
                    if pro != None:
                        req_json["pro_name"] = pro.first_name + " " + pro.last_name
                        req_json["pro_status"] = pro.status
                    else:
                        req_json["pro_name"] = ""
                        req_json["pro_status"] = ""
                    req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
                    req_json["pincode"] = user.pin_code
                    req_json["id"] = req.id
                    req_json["date_of_request"] = req.date_of_request
                    req_json["date_of_completion"] = req.date_of_completion
                    req_json["status"] = req.service_status
                    req_json["cust_id"] = req.user_id
                    req_json["pro_id"] = req.pro_id
                    req_json["cust_status"] = user.status

                    all_req.append(req_json)
            return all_req
        elif filter == "pro_name":
            all_req = []
            first_name_prof = User.query.filter(User.first_name.ilike("%"+value+"%"), User.service_name != None).all()
            last_name_prof = User.query.filter(User.last_name.ilike("%"+value+"%"), User.service_name != None).all()
            all_prof = list(set(first_name_prof + last_name_prof))
            for pro in all_prof:
                pro_req = ServiceRequest.query.filter_by(pro_id=pro.user_id).all()
                for req in pro_req:
                    req_json = {}
                    user = User.query.filter_by(user_id=req.user_id).first()
                    pro = User.query.filter_by(user_id=req.pro_id).first()
                    if pro != None:
                        req_json["pro_name"] = pro.first_name + " " + pro.last_name
                        req_json["pro_status"] = pro.status
                    else:
                        req_json["pro_name"] = ""
                        req_json["pro_status"] = ""
                    req_json["user_name"] = user.first_name + " " + user.last_name
                    req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
                    req_json["pincode"] = user.pin_code
                    req_json["id"] = req.id
                    req_json["date_of_request"] = req.date_of_request
                    req_json["date_of_completion"] = req.date_of_completion
                    req_json["status"] = req.service_status
                    req_json["cust_id"] = req.user_id
                    req_json["pro_id"] = req.pro_id
                    req_json["cust_status"] = user.status
                    all_req.append(req_json)
            return all_req
        elif filter == "cust_name":
            all_req = []
            first_name_cust = User.query.filter(User.first_name.ilike(f"%{str(value)}%"), User.service_name == None).all()
            last_name_cust = User.query.filter(User.last_name.ilike(f"%{str(value)}%"), User.service_name == None).all()
            all_cust = list(set(first_name_cust + last_name_cust))

            for cust in all_cust:
                cust_req = ServiceRequest.query.filter_by(user_id=cust.user_id).all()
                for req in cust_req:
                    req_json = {}
                    user = User.query.filter_by(user_id=req.user_id).first()
                    pro = User.query.filter_by(user_id=req.pro_id).first()
                    if pro != None:
                        req_json["pro_name"] = pro.first_name + " " + pro.last_name
                        req_json["pro_status"] = pro.status
                    else:
                        req_json["pro_name"] = ""
                        req_json["pro_status"] = ""
                    req_json["user_name"] = user.first_name + " " + user.last_name
                    req_json["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
                    req_json["pincode"] = user.pin_code
                    req_json["id"] = req.id
                    req_json["date_of_request"] = req.date_of_request
                    req_json["date_of_completion"] = req.date_of_completion
                    req_json["status"] = req.service_status
                    req_json["cust_id"] = req.user_id
                    req_json["pro_id"] = req.pro_id
                    req_json["cust_status"] = user.status
                    all_req.append(req_json)
            return all_req

class CustomerSearchByFilterAPI(Resource):
    
    @auth_required("token")
    @cache.memoize(timeout=10)
    def get(self, filter, value):
        if filter == "service_name":
            all_pros = []
            all_services = Services.query.filter(Services.name.ilike("%"+value+"%")).all()
            for service in all_services:
                ser_pros = User.query.filter_by(service_name=service.name, status="Approved").order_by(User.avg_ratings.desc()).all()
                for pro in ser_pros:
                    req_json = {}
                    req_json["pro_name"] = pro.first_name + " " + pro.last_name
                    req_json["pro_email"] = pro.email
                    req_json["service_name"] = pro.service_name
                    req_json["pincode"] = pro.pin_code
                    req_json["id"] = pro.user_id
                    req_json["avg_rating"] = pro.avg_ratings
                    req_json["service_id"] = service.serv_id
                    req_json["status"] = pro.status
                    all_pros.append(req_json)
            return all_pros
        elif filter == "pro_name":
            all_pros = []
            first_name_prof = User.query.filter(User.first_name.ilike("%"+value+"%"), User.service_name != None, User.status == "Approved").all()
            last_name_prof = User.query.filter(User.last_name.ilike("%"+value+"%"), User.service_name != None, User.status == "Approved").all()
            all_prof = list(set(first_name_prof + last_name_prof))
            for pro in all_prof:
                req_json = {}
                req_json["pro_name"] = pro.first_name + " " + pro.last_name
                req_json["pro_email"] = pro.email
                req_json["service_name"] = pro.service_name
                req_json["pincode"] = pro.pin_code
                req_json["id"] = pro.user_id
                req_json["avg_rating"] = pro.avg_ratings
                req_json["service_id"] = Services.query.filter_by(name=pro.service_name).first().serv_id
                req_json["status"] = pro.status
                all_pros.append(req_json)
            return all_pros
        elif filter == "avg_rating":
            all_pros = []
            all_prof = User.query.filter(User.avg_ratings >= value, User.service_name != None, User.status == "Approved").all()
            for pro in all_prof:
                req_json = {}
                req_json["pro_name"] = pro.first_name + " " + pro.last_name
                req_json["pro_email"] = pro.email
                req_json["service_name"] = pro.service_name
                req_json["pincode"] = pro.pin_code
                req_json["id"] = pro.user_id
                req_json["avg_rating"] = pro.avg_ratings
                req_json["service_id"] = Services.query.filter_by(name=pro.service_name).first().serv_id
                req_json["status"] = pro.status
                all_pros.append(req_json)
            return all_pros

class BlockCustomerAPI(Resource):
    @auth_required('token')
    def put(self, pro_id):
        data = request.get_json()
        if verify_password("Admin", data.get("role")):
            pro = User.query.filter_by(user_id=pro_id).first()
            pro.status = "Blocked"
            try:
                db.session.commit()
                return make_response(jsonify({"message":"User blocked successfully"}), 200)
            except:
                db.session.rollback()
                return make_response(jsonify({"message":"Error in blocking user"}), 400)
        else:
            return make_response(jsonify({"message":"You are not authorized to block this user"}), 403)

class UnblockCustomerAPI(Resource):
    @auth_required('token')
    def put(self, pro_id):
        data = request.get_json()
        if verify_password("Admin", data.get("role")):
            pro = User.query.filter_by(user_id=pro_id).first()
            pro.status = "Approved"
            try:
                db.session.commit()
                return make_response(jsonify({"message":"User unblocked successfully"}), 200)
            except:
                db.session.rollback()
                return make_response(jsonify({"message":"Error in unblocking user"}), 400)
        else:
            return make_response(jsonify({"message":"You are not authorized to unblock this user"}), 403)

api.add_resource(ServiceRequestListAPI,"/service_request_list")
api.add_resource(ServiceRequestAPI,"/service_request_list/<int:req_id>")
api.add_resource(ServiceRequestListByCustomerAPI, "/service_request_list_customer/<int:cust_id>")
api.add_resource(PublicServiceRequestAPI,"/public_request/<int:serv_id>/<int:user_id>")
api.add_resource(PrivateServiceRequestAPI,"/private_request/<int:serv_id>/<int:pro_id>/<int:user_id>")
api.add_resource(ServiceListAPI, "/service")
api.add_resource(ServiceAPI, "/service/<int:serv_id>")
api.add_resource(ProfessionalListAPI, "/professional")
api.add_resource(ProfessionalListByServiceAPI, "/professional/<int:serv_id>")
api.add_resource(ApproveProfessionalAPI, "/approve_professional/<int:pro_id>")
api.add_resource(RejectProfessionalAPI, "/reject_professional/<int:pro_id>")
api.add_resource(BlockProfessionalAPI, "/block_professional/<int:pro_id>")
api.add_resource(UnblockProfessionalAPI, "/unblock_professional/<int:pro_id>")
api.add_resource(ProfessionalDetailsAPI, "/professional_details/<int:req_id>")
api.add_resource(CloseRequestAPI, "/close_request/<int:req_id>")
api.add_resource(GetPublicRequestsAPI, "/get_public_requests/<int:pro_id>")
api.add_resource(GetPrivateRequestsAPI, "/get_private_requests/<int:pro_id>")
api.add_resource(GetAcceptedRequestsAPI, "/get_accepted_requests/<int:pro_id>")
api.add_resource(AcceptPublicRequestAPI, "/accept_request/<int:req_id>/<int:pro_id>")
api.add_resource(AcceptPrivateRequestAPI, "/accept_request/<int:req_id>")
api.add_resource(RejectRequestAPI, "/reject_request/<int:req_id>")
api.add_resource(AdminSearchByFilterAPI, "/admin_search/<string:filter>/<string:value>")
api.add_resource(CustomerSearchByFilterAPI, "/customer_search/<string:filter>/<string:value>")
api.add_resource(BlockCustomerAPI, "/block_customer/<int:pro_id>")
api.add_resource(UnblockCustomerAPI, "/unblock_customer/<int:pro_id>")
