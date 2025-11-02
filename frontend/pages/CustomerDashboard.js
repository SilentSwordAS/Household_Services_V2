export default {
  template: `
  <div class="text-center mt-2">
        <div>
            <h1>--------Services--------</h1>
            <table class="table table-dark table-striped">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Service Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(service, index) in services" v-if="services.length != 0">
                    <td class="align-middle">{{index+1}}</td>
                    <td class="align-middle">{{service.name}}</td>
                    <td class="align-middle">
                        <button class="btn btn-primary" v-on:click="$router.push('/book-service/' + service.serv_id)">Book Service</button>
                    </td>
                </tr>
                <tr v-if="services.length == 0">
                    <td colspan="3" class="align-middle text-center">No Services Available</td>
                </tr>
            </tbody>
            </table>
        </div>
        <div>
            <h1>--------Request History--------</h1>
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
                        <th>Actions</th>
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
                        <td class="align-middle">
                          <button class="btn btn-primary" v-if="req.service_status != 'Rejected'" v-on:click="$router.push('/edit-request/' + req.id)">Edit Request</button>
                          <button class="btn btn-danger" v-on:click="deleteRequest([req.id, index])" v-if="req.service_status == 'Requested'">Delete Request</button>
                          <button class="btn btn-success" v-on:click="$router.push('/close-request/' + req.id)" v-if="req.service_status == 'Accepted'">Close Request</button>
                        </td>
                    </tr>
                    <tr v-if="service_requests.length == 0">
                        <td colspan="8" class="align-middle text-center">No Requests Available</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
`,
  data() {
    return {
      services: [],
      service_requests: [],
    };
  },
  methods: {
    async deleteRequest(params) {
      const res = await fetch(
        location.origin + "/api/service_request_list/" + params[0],
        {
          method: "DELETE",
          headers: {
            "service-token": this.$store.state.auth_token,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        this.service_requests.splice(params[1], 1);
        alert("Request Deleted Successfully");
      }
    },
  },
  async mounted() {
    const res = await fetch(location.origin + "/api/service");
    if (res.ok) {
      const data = await res.json();
      this.services = data;
    }

    const res2 = await fetch(
      location.origin +
        "/api/service_request_list_customer/" +
        this.$store.state.user_id,
      {
        headers: {
          "service-token": this.$store.state.auth_token,
          "Content-Type": "application/json",
        },
      }
    );
    if (res2.ok) {
      const res_data = await res2.json();
      this.service_requests = res_data;
    }
  },
};
