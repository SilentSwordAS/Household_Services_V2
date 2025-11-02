export default {
  template: `
    <div class="d-flex flex-column justify-content-center align-items-center">
        <h1>--------Service Form--------</h1>
        <form>
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" id="name" v-model="name" required>
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Price</label>
            <input type="number" class="form-control" id="price" v-model="price" required>
          </div>
          <div class="mb-3">
            <label for="time_required" class="form-label">Time Required</label>
            <input type="number" class="form-control" id="time_required" v-model="time_required" required>
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>    
            <input type="text" class="form-control" id="description" v-model="description" required>
          </div>
            <button class="btn btn-primary w-100" style="border-radius: 25px" :disabled="isRequiredFilled" v-on:click="createService">Create Service</button>
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
    async createService() {
      const res = await fetch(location.origin + "/api/service", {
        method: "POST",
        headers: {
          "service-token": `${this.$store.state.auth_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.name,
          price: this.price,
          time_required: this.time_required,
          description: this.description,
          role: this.$store.state.role_hash,
        }),
      });

      if (res.ok) {
        alert("Service Created Successfully");
        console.log(price.value.length);
        this.$router.push("/admin-dashboard");
      } else {
        alert("Error while creating service");
        this.$router.push("/admin-dashboard");
      }
    },
  },
  computed: {
    isRequiredFilled() {
      return (
        this.name == "" ||
        this.price == "" ||
        this.time_required == "" ||
        this.description == ""
      );
    },
  },
};
