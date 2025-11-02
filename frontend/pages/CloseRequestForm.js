export default {
  template: `
        <div class="d-flex flex-column justify-content-center align-items-center mt-2">
            <h1>--------Close Request--------</h1>
            <h3><b>Service Name: </b>{{serv_name}} | <b>Professional Name: </b>{{pro_name}} | <b>Professional Email: </b>{{pro_email}}</h3>
            <form>
                <div class="mb-3">
                    <h3 class="text-center"><b>Ratings</b></h3>
                </div>
                <div class="mb-3 text-center">
                <label for="one_star" class="form-label" style="color:#ffff00;">★</label>★★★★
                <input type="radio" id="one_star" class="form-check-input" v-model="ratings" value="1" required>
                </div>
                <div class="mb-3 text-center">
                <label for="two_star" class="form-label" style="color:yellow">★★</label>★★★
                <input type="radio" class="form-check-input" id="two_star" v-model="ratings" value="2">
                </div>
                <div class="mb-3 text-center">
                <label for="three_star" class="form-label" style="color:yellow">★★★</label>★★
                <input type="radio" class="form-check-input" id="three_star" v-model="ratings" value="3">
                </div>
                <div class="mb-3 text-center">
                <label for="four_star" class="form-label" style="color:yellow">★★★★</label>★
                <input type="radio" class="form-check-input" id="four_star" v-model="ratings" value="4">
                </div>
                <div class="mb-3 text-center">
                <label for="five_star" class="form-label" style="color:yellow">★★★★★</label>
                <input type="radio" class="form-check-input" id="five_star" v-model="ratings" value="5">
                </div>
                <div class="mb-3">
                    <label for="remarks" class="form-label"><b>Remarks</b></label>
                    <input type="text" class="form-control" id="remarks" v-model="remarks">
                </div>

                <button class="btn btn-primary text-center w-100" style="border-radius: 25px" :disabled="ratings == 0" v-on:click="closeRequest">Close Request</button>
                <button class="btn btn-secondary w-100" style="border-radius: 25px"><router-link to="/customer-dashboard" class="nav-link">Back to Dashboard</router-link></button>
            </form>
        </div>
    `,
  data() {
    return {
      ratings: 0,
      remarks: "",
      pro_name: "",
      serv_name: "",
      pro_email: "",
    };
  },
  methods: {
    async closeRequest() {
      const res = await fetch(
        location.origin + "/api/close_request/" + this.$route.params.id,
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ratings: this.ratings,
            remarks: this.remarks,
          }),
        }
      );
      if (res.ok) {
        alert("Request Closed Successfully");
        this.$router.push("/customer-dashboard");
      }
    },
  },
  async mounted() {
    const res = await fetch(
      location.origin + "/api/professional_details/" + this.$route.params.id,
      {
        method: "GET",
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      this.pro_name = data.pro_first_name + " " + data.pro_last_name;
      this.pro_email = data.pro_email;
      this.serv_name = data.service_name;
    }
  },
};
