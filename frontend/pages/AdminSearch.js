export default {
  template: `
    <div class="text-center mt-2">
      <h1>--------Admin Search--------</h1>
        <form class="row g-3 d-flex justify-content-center align-items-center m-2">
          <div class="col-auto">
            <p class="col-form-label">Search</p>
          </div>
          <div class="col-auto">
            <input type="text" class="form-control" id="search_input" v-model="search_input">
          </div>
          <div class="col-auto">
            <select id="filter" v-model="filter">
              <option disabled value="">Please select one</option>
              <option value="pro_name">Professional Name</option>
              <option value="cust_name">Customer Name</option>
              <option value="service_name">Service Name</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" v-on:click="getSearchResult">Search</button>
            <button class="btn btn-danger" v-on:click="clear">Reset</button>
            <button class="btn btn-secondary"><router-link to="/admin-dashboard" class="nav-link">Back to Dashboard</router-link></button>
          </div>
        </form>
      <table class="table table-dark table-striped">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Professional Name</th>
          <th>Customer Name</th>
          <th>Service Name</th>
          <th>Date of Request</th>
          <th>Date of Completion</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody v-if="search_filter">
        <tr v-for="(request, index) in service_requests_filter" v-if="service_requests_filter.length != 0">
          <td class="align-middle">{{index+1}}</td>
          <td class="align-middle" v-if="request.pro_name != ''">{{request.pro_name}}</td>
          <td class="align-middle" v-if="request.pro_name == ''">No Professional Assigned Yet</td>
          <td class="align-middle">{{request.user_name}}</td>
          <td class="align-middle">{{request.service_name}}</td>
          <td class="align-middle">{{request.date_of_request}}</td>
          <td class="align-middle" v-if="request.status == 'Closed'">{{request.date_of_completion}}</td>
          <td class="align-middle" v-else>Not Completed Yet</td>
          <td class="align-middle">{{request.status}}</td>
          <td class="align-middle">
            <button class="btn btn-warning" v-if="request.cust_status == 'Approved'" v-on:click="blockCustomer(request.cust_id)">Block Customer</button>
            <button class="btn btn-warning" v-if="request.cust_status == 'Blocked'" v-on:click="unblockCustomer(request.cust_id)">Unblock Customer</button>

            <button class="btn btn-warning" v-if="request.pro_status == 'Blocked'" v-on:click="unblockProfessional(request.pro_id)">Unblock Professional</button>
            <button class="btn btn-warning" v-if="request.pro_status == 'Approved'" v-on:click="blockProfessional(request.pro_id)">Block Professional</button>
            <button class="btn btn-danger" v-if="request.pro_status != ''" v-on:click="rejectProfessional(request.pro_id)">Delete Professional</button>

          </td>
        </tr>
        <tr v-if="service_requests_filter.length == 0">
          <td colspan="8" class="align-middle text-center">No Requests Available</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(request, index) in service_requests_data" v-if="service_requests_data.length != 0">
          <td class="align-middle">{{index+1}}</td>
          <td class="align-middle" v-if="request.pro_first_name != ''">{{request.pro_first_name}} {{request.pro_last_name}}</td>
          <td class="align-middle" v-if="request.pro_first_name == ''">No Professional Assigned Yet</td>
          <td class="align-middle">{{request.cust_first_name}} {{request.cust_last_name}}</td>
          <td class="align-middle">{{request.service_name}}</td>
          <td class="align-middle">{{request.date_of_request}}</td>
          <td class="align-middle" v-if="request.status == 'Closed'">{{request.date_of_completion}}</td>
          <td class="align-middle" v-else>Not Completed Yet</td>
          <td class="align-middle">{{request.status}}</td>
          <td class="align-middle">
            <button class="btn btn-warning" v-if="request.cust_status == 'Approved'" v-on:click="blockCustomer(request.cust_id)">Block Customer</button>
            <button class="btn btn-warning" v-if="request.cust_status == 'Blocked'" v-on:click="unblockCustomer(request.cust_id)">Unblock Customer</button>

            <button class="btn btn-warning" v-if="request.pro_status == 'Blocked'" v-on:click="unblockProfessional(request.pro_id)">Unblock Professional</button>
            <button class="btn btn-warning" v-if="request.pro_status == 'Approved'" v-on:click="blockProfessional(request.pro_id)">Block Professional</button>
            <button class="btn btn-danger" v-if="request.pro_status != ''" v-on:click="rejectProfessional(request.pro_id)">Delete Professional</button>

          </td>
        </tr>
        <tr v-if="service_requests_data.length == 0">
          <td colspan="8" class="align-middle text-center">No Requests Available</td>
        </tr>
      </tbody>
      </table>
    </div>
  `,
  data() {
    return {
      service_requests_data: [],
      service_requests_filter: [],
      filter: "",
      search_input: "",
      search_filter: false,
    };
  },
  methods: {
    async getSearchResult() {
      const res = await fetch(
        location.origin +
          "/api/admin_search/" +
          this.filter +
          "/" +
          this.search_input,
        {
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const res_data = await res.json();
        this.service_requests_filter = res_data;
        this.search_filter = true;
      }
    },
    clear() {
      this.search_input = "";
      this.search_filter = false;
      this.search_input = "";
      this.filter = "";
    },
    async blockProfessional(param) {
      const res = await fetch(
        location.origin + "/api/block_professional/" + param,
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
        alert("Professional Blocked Successfully");
        this.$router.push("/admin-dashboard");
      }
    },
    async rejectProfessional(param) {
      const res = await fetch(
        location.origin + "/api/reject_professional/" + param,
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
        alert("Professional Deleted Successfully");
        this.$router.push("/admin-dashboard");
      }
    },
    async unblockProfessional(param) {
      const res = await fetch(
        location.origin + "/api/unblock_professional/" + param,
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
        alert("Professional Unblocked Successfully");
        this.$router.push("/admin-dashboard");
      }
    },
    async blockCustomer(param) {
      const res = await fetch(
        location.origin + "/api/block_customer/" + param,
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
        alert("Customer Blocked Successfully");
        this.$router.push("/admin-dashboard");
      }
    },
    async unblockCustomer(param) {
      const res = await fetch(
        location.origin + "/api/unblock_customer/" + param,
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
        alert("Customer Unblocked Successfully");
        this.$router.push("/admin-dashboard");
      }
    },
  },
  async mounted() {
    const res = await fetch(location.origin + "/api/service_request_list");
    if (res.ok) {
      const res_data = await res.json();
      this.service_requests_data = res_data;
    }
  },
};
