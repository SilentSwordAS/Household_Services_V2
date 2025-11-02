export default {
  template: `
  <div class="text-center mt-2">
        <div>
            <h1>--------Professional Dashboard--------</h1>
            <h1>Public Requests</h1>
            <table class="table table-dark table-striped">
            <thead>
                <tr>
                <th>S.No</th>
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Date of Request</th>
                <th>Pincode</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(request, index) in public_requests" v-if="public_requests.length != 0">
                    <td class="align-middle">{{index+1}}</td>
                    <td class="align-middle">{{request.user_name}}</td>
                    <td class="align-middle">{{request.user_email}}</td>
                    <td class="align-middle">{{request.date_of_request}}</td>
                    <td class="align-middle">{{request.pincode}}</td>
                    <td class="align-middle">
                      <button class="btn btn-success" v-on:click="approvePublicRequest([request.id, index])">Accept</button>
                    </td>
                </tr>
                <tr v-if="public_requests.length == 0">
                    <td colspan="6" class="align-middle text-center">No Requests Available</td>
                </tr>
            </tbody>
            </table>
        </div>
        <div>
            <h1>Private Requests</h1>
            <table class="table table-dark table-striped">
            <thead>
                <tr>
                <th>S.No</th>
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Date of Request</th>
                <th>Pincode</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(request, index) in private_requests" v-if="private_requests.length != 0">
                    <td class="align-middle">{{index+1}}</td>
                    <td class="align-middle">{{request.user_name}}</td>
                    <td class="align-middle">{{request.user_email}}</td>
                    <td class="align-middle">{{request.date_of_request}}</td>
                    <td class="align-middle">{{request.pincode}}</td>
                    <td class="align-middle">
                      <button class="btn btn-success" v-on:click="approvePrivateRequest([request.id, index])">Accept</button>
                      <button class="btn btn-danger" v-on:click="denyRequest([request.id, index])">Reject</button>
                    </td>
                </tr>
                <tr v-if="private_requests.length == 0">
                    <td colspan="6" class="align-middle text-center">No Requests Available</td>
                </tr>
            </tbody>
            </table>
        </div>
        <div>
            <h1>Accepted/Closed Requests</h1>
            <table class="table table-dark table-striped">
            <thead>
                <tr>
                <th>S.No</th>
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Date of Request</th>
                <th>Date of Completion</th>
                <th>Pincode</th>
                <th>Status</th>
                <th>Ratings</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(request, index) in accepted_requests" v-if="accepted_requests.length != 0">
                    <td class="align-middle">{{index+1}}</td>
                    <td class="align-middle">{{request.user_name}}</td>
                    <td class="align-middle">{{request.user_email}}</td>
                    <td class="align-middle">{{request.date_of_request}}</td>
                    <td class="align-middle" v-if="request.status == 'Closed'">{{request.date_of_completion}}</td>
                    <td class="align-middle" v-else>Not Completed Yet</td>
                    <td class="align-middle">{{request.pincode}}</td>
                    <td class="align-middle">{{request.status}}</td>
                    <td class="align-middle">{{request.ratings}}</td>
                </tr>
                <tr v-if="accepted_requests.length == 0">
                    <td colspan="8" class="align-middle text-center">No Requests Available</td>
                </tr>
            </tbody>
            </table>
        </div>
        </div>
        `,
  data() {
    return {
      public_requests: [],
      private_requests: [],
      accepted_requests: [],
    };
  },
  methods: {
    async approvePublicRequest(params) {
      const res = await fetch(
        location.origin +
          "/api/accept_request/" +
          params[0] +
          `/${this.$store.state.user_id}`,
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        alert("Request Accepted Successfully");
        const elem = this.public_requests.splice(params[1], 1);
        elem[0].status = "Accepted";
        this.accepted_requests.push(elem[0]);
      }
    },
    async approvePrivateRequest(params) {
      const res = await fetch(
        location.origin + "/api/accept_request/" + params[0],
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        alert("Request Accepted Successfully");
        const elem = this.private_requests.splice(params[1], 1);
        elem[0].status = "Accepted";
        this.accepted_requests.push(elem[0]);
      }
    },
    async denyRequest(params) {
      const res = await fetch(
        location.origin + "/api/reject_request/" + params[0],
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        alert("Request Denied Successfully");
        this.private_requests.splice(params[1], 1);
      }
    },
  },
  async mounted() {
    const res = await fetch(
      location.origin + "/api/get_public_requests/" + this.$store.state.user_id,
      {
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      this.public_requests = data;
    }

    const res1 = await fetch(
      location.origin +
        "/api/get_private_requests/" +
        this.$store.state.user_id,
      {
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res1.ok) {
      const data = await res1.json();
      console.log(data);
      this.private_requests = data;
    }

    const res2 = await fetch(
      location.origin +
        "/api/get_accepted_requests/" +
        this.$store.state.user_id,
      {
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res2.ok) {
      const data = await res2.json();
      this.accepted_requests = data;
    }
  },
};
