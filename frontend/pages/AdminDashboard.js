export default {
  template: `
        <div class="text-center mt-2" style="min-height:100vh">
            <h1>--------Admin Dashboard--------</h1>
            <div>
                <h1>Services</h1>
                <table class="table table-dark table-striped">
                <thead>
                    <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Time Required</th>
                    <th>Description</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(service, index) in services" v-if="services.length != 0">
                        <td class="align-middle">{{index+1}}</td>
                        <td class="align-middle">{{service.name}}</td>
                        <td class="align-middle">{{service.price}}</td>
                        <td class="align-middle">{{service.time_required}}</td>
                        <td class="align-middle">{{service.description}}</td>
                        <td class="align-middle">
                            <button class="btn btn-primary" v-on:click="$router.push('/edit-service/' + service.serv_id)">Edit Service</button>
                            <button class="btn btn-danger" v-on:click="deleteService([service.serv_id, index])">Delete Service</button>
                        </td>
                    </tr>
                    <tr v-if="services.length == 0">
                        <td colspan="6" class="align-middle text-center">No Services Available</td>
                    </tr>
                </tbody>
                </table>
                <button class="btn btn-success" v-on:click="$router.push('/add-service')">Add Service</button>
            </div>
            <div>
                <h1>Service Professionals</h1>
                <table class="table table-dark table-striped">
                <thead>
                    <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Service Name</th>
                    <th>Average Rating</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(professional, index) in professionals" v-if="professionals.length != 0">
                        <td class="align-middle">{{index+1}}</td>
                        <td class="align-middle">{{professional.first_name}} {{professional.last_name}}</td>
                        <td class="align-middle">{{professional.email}}</td>
                        <td class="align-middle">{{professional.service_name}}</td>
                        <td class="align-middle">{{professional.avg_ratings}}</td>
                        <td class="align-middle">
                            <button class="btn btn-success" v-if="professional.status == 'Pending'" v-on:click="approveProfessional([professional.user_id, index])">Approve</button>
                            <button class="btn btn-danger" v-if="professional.status == 'Pending'" v-on:click="rejectProfessional([professional.user_id, index])">Deny</button>
                            <button class="btn btn-warning" v-if="professional.status == 'Approved'" v-on:click="blockProfessional([professional.user_id, index])">Block</button>
                            <button class="btn btn-warning" v-if="professional.status == 'Blocked'" v-on:click="unblockProfessional([professional.user_id, index])">Unblock</button>
                            <button class="btn btn-danger" v-if="professional.status == 'Blocked' || professional.status == 'Approved'" v-on:click="rejectProfessional([professional.user_id, index])">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="professionals.length == 0">
                        <td colspan="6" class="align-middle text-center">No Professionals Available</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <div>
                <h1>Service Requests</h1>
                <button class="btn btn-primary mb-3" :disabled="closed_requests == 0" v-on:click="exportCSV">Export Closed Requests as CSV</button>
                <table class="table table-dark table-striped">
                <thead>
                    <tr>
                    <th>S.No</th>
                    <th>Professional Name</th>
                    <th>Professional Email</th>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Service Name</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(req, index) in service_requests" v-if="service_requests.length != 0">
                        <td class="align-middle">{{index+1}}</td>
                        <td class="align-middle" v-if="req.pro_first_name != ''">{{req.pro_first_name}} {{req.pro_last_name}}</td>
                        <td class="align-middle" v-if="req.pro_first_name == ''">No Professional Assigned Yet</td>
                        <td class="align-middle" v-if="req.pro_first_name != ''">{{req.pro_email}}</td>
                        <td class="align-middle" v-if="req.pro_first_name == ''">No Professional Assigned Yet</td>
                        <td class="align-middle">{{req.cust_first_name}} {{req.cust_last_name}}s</td>
                        <td class="align-middle">{{req.cust_email}}</td>
                        <td class="align-middle">{{req.service_name}}</td>
                        <td class="align-middle">{{req.service_status}}</td>
                    </tr>
                    <tr v-if="service_requests.length == 0">
                        <td colspan="7" class="align-middle text-center">No Requests Available</td>
                    </tr>
                </tbody>
                </table>
            </div>
        </div>
        `,
  data() {
    return {
      services: [],
      professionals: [],
      service_requests: [],
      closed_requests: 0,
    };
  },
  methods: {
    async exportCSV() {
      const res = await fetch(location.origin + "/create-csv", {
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
        },
      });
      const task_id = (await res.json()).task_id;

      const interval = setInterval(async () => {
        const res1 = await fetch(location.origin + "/get-csv/" + task_id, {
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
          },
        });
        if (res1.ok) {
          alert("CSV Downloaded Successfully");
          window.open(location.origin + "/get-csv/" + task_id);
          clearInterval(interval);
        }
      }, 100);
    },
    async deleteService(params) {
      const res = await fetch(location.origin + "/api/service/" + params[0], {
        method: "DELETE",
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: this.$store.state.role_hash,
        }),
      });
      if (res.status == "200") {
        const elem = this.services[params[1]];
        for (let i = 0; i < this.service_requests.length; i++) {
          if (this.service_requests[i].service_name == elem.name) {
            this.service_requests.splice(i, 1);
          }
        }
        for (let i = 0; i < this.professionals.length; i++) {
          if (this.professionals[i].service_name == elem.name) {
            this.professionals.splice(i, 1);
          }
        }
        this.services.splice(params[1], 1);
        alert("Service Deleted Successfully");
      }
    },
    async approveProfessional(params) {
      const res = await fetch(
        location.origin + "/api/approve_professional/" + params[0],
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: this.$store.state.role_hash,
          }),
        }
      );
      if (res.status == "200") {
        this.professionals[params[1]].status = "Approved";
        alert("Professional Approved Successfully");
      }
    },
    async blockProfessional(params) {
      const res = await fetch(
        location.origin + "/api/block_professional/" + params[0],
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: this.$store.state.role_hash,
          }),
        }
      );
      if (res.status == "200") {
        this.professionals[params[1]].status = "Blocked";
        alert("Professional Blocked Successfully");
      }
    },
    async rejectProfessional(params) {
      const res = await fetch(
        location.origin + "/api/reject_professional/" + params[0],
        {
          method: "DELETE",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: this.$store.state.role_hash,
          }),
        }
      );
      if (res.status == "200") {
        this.professionals.splice(params[1], 1);
        alert("Professional Deleted Successfully");
      }
    },
    async unblockProfessional(params) {
      const res = await fetch(
        location.origin + "/api/unblock_professional/" + params[0],
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: this.$store.state.role_hash,
          }),
        }
      );
      if (res.status == "200") {
        this.professionals[params[1]].status = "Approved";
        alert("Professional Unblocked Successfully");
      }
    },
  },
  async mounted() {
    const res = await fetch(location.origin + "/api/service");
    if (res.ok) {
      const res_data = await res.json();
      this.services = res_data;
    }

    const res2 = await fetch(location.origin + "/api/professional");
    if (res2.ok) {
      const res_data = await res2.json();
      this.professionals = res_data;
    }

    const res3 = await fetch(location.origin + "/api/service_request_list");
    if (res3.ok) {
      const res_data = await res3.json();
      this.service_requests = res_data;
      for (let i = 0; i < this.service_requests.length; i++) {
        if (this.service_requests[i].status == "Closed") {
          this.closed_requests++;
        }
      }
    }
  },
};
