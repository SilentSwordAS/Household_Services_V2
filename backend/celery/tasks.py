from celery import shared_task
from backend.models import ServiceRequest, User, Services
import flask_excel
from backend.celery.mail_service import send_email
from flask import render_template

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = ServiceRequest.query.filter_by(service_status = "Closed").all()

    if resource == []:
        return {"message": "No closed requests found"}, 404
    else:
        task_id = self.request.id
        filename = f'service_request_{task_id}.csv'
        column_names = [column.name for column in ServiceRequest.__table__.columns]
        csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv' )

        with open(f'./backend/celery/exports/{filename}', 'wb') as f:
            f.write(csv_out.data)
        
        return filename

@shared_task(ignore_result=True)
def send_pending_notification():
    all_pros = User.query.filter(User.service_name != None, User.status == "Approved").all()
    for pro in all_pros:
        req_pro = ServiceRequest.query.filter_by(pro_id=pro.user_id, service_status="Requested").all()
        if len(req_pro) != 0:
            send_email(pro.email, "Daily Pending Request Reminder", "You have " + str(len(req_pro)) + " pending requests. Please tend to those ASAP.")

@shared_task(ignore_result=False)
def send_monthly_notification():
    all_cust = User.query.filter(User.service_name == None, User.status == "Approved").all()

    for cust in all_cust:
        if (cust.roles[0].name == "Customer"):
            all_req = []
        
            for req in ServiceRequest.query.filter_by(user_id=cust.user_id).all():
                data = {}
                if req.pro_id == None:
                    data["pro_name"] = "Not assigned yet"
                    data["pro_email"] = "Not assigned yet"
                else:
                    pro = User.query.filter_by(user_id=req.pro_id).first()
                    data["pro_name"] = pro.first_name + " " + pro.last_name
                    data["pro_email"] = pro.email
                data["service_name"] = Services.query.filter_by(serv_id=req.service_id).first().name
                data["req_date"] = req.date_of_request
                data["req_status"] = req.service_status
                data["req_rating"] = req.ratings
                data["req_remarks"] = req.remarks
                all_req.append(data)

            template = render_template("mail_template.html", service_requests = all_req)
            send_email(cust.email, "Monthly Report", template)