export default {
  template: `
          <div class="text-center mt-2">
            <h1>--------Professional Search--------</h1>
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
                        <option value="avg_rating">Average_Ratings</option>
                        <option value="service_name">Service Name</option>
                    </select>
                </div>
                <div class="col-auto">
                    <button class="btn btn-primary" v-on:click="getSearchResult">Search</button>
                    <button class="btn btn-danger" v-on:click="clear">Reset</button>
                    <button class="btn btn-secondary"><router-link to="/customer-dashboard" class="nav-link">Back to Dashboard</router-link></button>
                </div>
            </form>
            <table class="table table-dark table-striped">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Professional Name</th>
                <th>Professional Email</th>
                <th>Service Name</th>
                <th>Pincode</th>
                <th>Average Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody v-if="search_filter">
              <tr v-for="(pro, index) in professionals_filter" v-if="professionals_filter.length != 0 && pro.status == 'Approved'">
                <td class="align-middle">{{index+1}}</td>
                <td class="align-middle">{{pro.pro_name}}</td>
                <td class="align-middle">{{pro.pro_email}}</td>
                <td class="align-middle">{{pro.service_name}}</td>
                <td class="align-middle">{{pro.pincode}}</td>
                <td class="align-middle">{{pro.avg_rating}}</td>
                <td class="align-middle">
                    <button class="btn btn-primary" v-on:click="createPrivateRequest([pro.service_id,pro.id])">Create Private Request</button>
                    <button class="btn btn-success" v-on:click="createPublicRequest(pro.service_id)">Create Public Request</button>
                </td>
              </tr>
              <tr v-if="professionals_filter.length == 0">
                <td colspan="7" class="align-middle text-center">No Professionals Available</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(pro, index) in professionals_data" v-if="professionals_data.length != 0 && pro.status == 'Approved'">
                <td class="align-middle">{{index+1}}</td>
                <td class="align-middle">{{pro.first_name}} {{pro.last_name}}</td>
                <td class="align-middle">{{pro.email}}</td>
                <td class="align-middle">{{pro.service_name}}</td>
                <td class="align-middle">{{pro.pin_code}}</td>
                <td class="align-middle">{{pro.avg_ratings}}</td>
                <td class="align-middle">
                    <button class="btn btn-primary" v-on:click="createPrivateRequest([pro.service_id,pro.user_id])">Create Private Request</button>
                    <button class="btn btn-success" v-on:click="createPublicRequest(pro.service_id)">Create Public Request</button>
                </td>
              </tr>
              <tr v-if="professionals_data.length == 0">
                <td colspan="7" class="align-middle text-center">No Professionals Available</td>
              </tr>
            </tbody>
            </table>
          </div>
        `,
  data() {
    return {
      professionals_data: [],
      professionals_filter: [],
      filter: "",
      search_input: "",
      search_filter: false,
    };
  },
  methods: {
    async getSearchResult() {
      const res = await fetch(
        location.origin +
          "/api/customer_search/" +
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
        this.professionals_filter = res_data;
        this.search_filter = true;
      }
    },
    clear() {
      this.search_input = "";
      this.search_filter = false;
      this.search_input = "";
      this.filter = "";
    },
    async createPublicRequest(params) {
      const res = await fetch(
        location.origin +
          "/api/public_request/" +
          params +
          `/${this.$store.state.user_id}`,
        {
          method: "POST",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("Request Created Successfully");
        this.$router.push("/customer-dashboard");
      }
    },

    async createPrivateRequest(params) {
      const res = await fetch(
        location.origin +
          "/api/private_request/" +
          params[0] +
          `/${params[1]}/${this.$store.state.user_id}`,
        {
          method: "POST",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("Request Created Successfully");
        this.$router.push("/customer-dashboard");
      }
    },
  },
  async mounted() {
    const res = await fetch(location.origin + "/api/professional");
    if (res.ok) {
      const res_data = await res.json();
      this.professionals_data = res_data;
    }
  },
};
