export default {
  template: `
    <div class="text-center mt-2">
        <h1>--------{{service.name}}--------</h1>
        <h3><b>Base Price:</b> ₹{{service.price}} /hr | <b>Time Required:</b> {{service.time_required}} hours | <b>Description:</b> {{service.description}}</h3>
        <button class="btn btn-success" v-on:click="createPublicRequest">Create Public Request</button>
        <div>
                <h1>--------Service Professionals--------</h1>
                <table class="table table-dark table-striped">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Average Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(professional, index) in professionals" v-if="professionals.length != 0 && professional.status == 'Approved'">
                        <td class="align-middle">{{index+1}}</td>
                        <td class="align-middle">{{professional.first_name}} {{professional.last_name}}</td>
                        <td class="align-middle">{{professional.email}}</td>
                        <td class="align-middle">{{professional.avg_ratings}}</td>
                        <td class="align-middle">
                            <button class="btn btn-primary" v-on:click="createPrivateRequest(professional.user_id)">Create Private Request</button>
                        </td>
                    </tr>
                    <tr v-if="professionals.length == 0">
                        <td colspan="5" class="align-middle text-center">No Professionals Available</td>
                    </tr>
                </tbody>
                </table>
            </div>
    </div>
    `,
  data() {
    return {
      professionals: [],
      service: {},
    };
  },
  methods: {
    async createPublicRequest() {
      const res = await fetch(
        location.origin +
          "/api/public_request/" +
          this.$route.params.id +
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

    async createPrivateRequest(prof_id) {
      const res = await fetch(
        location.origin +
          "/api/private_request/" +
          this.$route.params.id +
          `/${prof_id}/${this.$store.state.user_id}`,
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
    const res2 = await fetch(
      location.origin + "/api/service/" + this.$route.params.id,
      {
        headers: {
          "service-token": this.$store.state.auth_token,
          "Content-Type": "application/json",
        },
      }
    );

    if (res2.ok) {
      const data = await res2.json();
      this.service = data;
    }

    const res = await fetch(
      location.origin + "/api/professional/" + this.$route.params.id,
      {
        method: "GET",
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const res_data = await res.json();
      this.professionals = res_data;
    }
  },
};
