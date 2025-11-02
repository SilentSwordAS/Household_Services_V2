export default {
  template: `
        <div class="d-flex flex-column justify-content-center align-items-center mt-2">
            <h1>--------Edit Request--------</h1>
            <form>
                <div class="mb-3">
                    <label for="date_of_request" v-if="status != 'Closed'"><b>Date of Request</b></label>
                    <input type="date" id="date_of_request" :min="date_of_request" v-if="status != 'Closed'" v-model="date_of_request" required>
                </div>
                <div class="mb-3">
                    <label for="remarks" v-if="status == 'Closed'"><b>Remarks</b></label>
                    <input type="text" id="remarks" v-if="status == 'Closed'" v-model="remarks" style="width:300px">
                </div>
                <button class="btn btn-primary text-center w-100" :disabled="date_of_request == ''" style="border-radius: 25px" v-on:click="editRequest">Edit Request</button>
                <button class="btn btn-secondary w-100" style="border-radius: 25px"><router-link to="/customer-dashboard" class="nav-link" >Back to Dashboard</router-link></button>
            </form>
        </div>
  `,
  data() {
    return {
      date_of_request: "",
      remarks: "",
      status: "",
    };
  },
  methods: {
    async editRequest() {
      const res = await fetch(
        location.origin + "/api/service_request_list/" + this.$route.params.id,
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date_of_request: this.date_of_request
              .split("-")
              .reverse()
              .join("/"),
            remarks: this.remarks,
          }),
        }
      );
      if (res.status == "200") {
        alert("Request Updated Successfully");
        this.$router.push("/customer-dashboard");
      }
    },
  },
  async mounted() {
    const res = await fetch(
      location.origin + "/api/service_request_list/" + this.$route.params.id,
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
      this.date_of_request = data.date_of_request
        .split("/")
        .reverse()
        .join("-");
      this.remarks = data.remarks;
      this.status = data.service_status;
    }
  },
};
