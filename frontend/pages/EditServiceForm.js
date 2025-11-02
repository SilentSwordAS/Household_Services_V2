export default {
  template: `
      <div class="d-flex flex-column justify-content-center align-items-center mt-2">
          <h1>--------Service Form--------</h1>
          <form>
            <div class="mb-3">
              <label for="name" class="form-label"><b>Name</b></label>
              <input type="text" class="form-control" id="name" disabled v-model="name" required style="width:300px">
            </div>
            <div class="mb-3">
              <label for="price" class="form-label"><b>Price</b></label>
              <input type="number" class="form-control" id="price" v-model="price" required style="width:300px">
            </div>
            <div class="mb-3">
              <label for="time_required" class="form-label"><b>Time Required</b></label>
              <input type="number" class="form-control" id="time_required" v-model="time_required" required style="width:300px">
            </div>
            <div class="mb-3">
              <label for="description" class="form-label"><b>Description</b></label>    
              <input type="text" class="form-control" id="description" v-model="description" required style="width:300px">
            </div>
              <button class="btn btn-primary w-100" style="border-radius: 25px" :disabled="isRequiredFilled" v-on:click="editService">Edit Service</button>
              <button class="btn btn-secondary w-100" style="border-radius: 25px"><router-link to="/admin-dashboard" class="nav-link">Back to Dashboard</router-link></button>
          </form>
      </div>
      `,
  data() {
    return {
      name: "",
      price: "",
      time_required: "",
      description: "",
    };
  },
  methods: {
    async editService() {
      const res = await fetch(
        location.origin + "/api/service/" + this.$route.params.id,
        {
          method: "PUT",
          headers: {
            "service-token": `${this.$store.state.auth_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: this.price,
            time_required: this.time_required,
            description: this.description,
            role: this.$store.state.role_hash,
          }),
        }
      );

      if (res.ok) {
        alert("Service Edited Successfully");
        this.$router.push("/admin-dashboard");
      } else {
        alert("Error while editing service");
        this.$router.push("/admin-dashboard");
      }
    },
  },
  computed: {
    isRequiredFilled() {
      return (
        this.price == "" || this.time_required == "" || this.description == ""
      );
    },
  },
  async mounted() {
    const res = await fetch(
      location.origin + "/api/service/" + `${this.$route.params.id}`,
      {
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      this.name = data.name;
      this.price = data.price;
      this.time_required = data.time_required;
      this.description = data.description;
    }
  },
};
