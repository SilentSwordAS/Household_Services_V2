export default {
  template: `
    <div class="d-flex flex-column justify-content-center align-items-center mt-2">
      <h1>--------User Registration--------</h1>
      <form>
        <div class="mb-3">
          <label for="first_name" class="form-label"><b>First Name</b></label>
          <input type="text" id="first_name" class="form-control" v-model="first_name" required style="width:300px">
        </div>
        <div class="mb-3">
          <label for="last_name" class="form-label"><b>Last Name</b></label>
          <input type="text" id="last_name" class="form-control" v-model="last_name" style="width:300px">
        </div>
        <div class="mb-3">
          <label for="email" class="form-label"><b>Email</b></label>
          <input type="email" class="form-control" id="email" v-model="email" required style="width:300px">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label"><b>Password</b></label>
          <input type="password" class="form-control" id="password" v-model="password" required style="width:300px">
        </div>
        <div class="mb-3">
          <label for="address" class="form-label"><b>Address</b></label>
          <input type="text" id="address" class="form-control" v-model="address" required style="width:300px">
        </div>
        <div class="mb-3">
          <label for="pincode" class="form-label"><b>Pincode</b></label>
          <input type="number" class="form-control" id="pincode" v-model="pincode" required style="width:300px">
        </div>
        <div class="mb-3">
          <label for="contact" class="form-label"><b>Contact</b></label>
          <input type="number" class="form-control" id="contact" v-model="contact" required style="width:300px">
        </div>
        <div class="mb-3">
          <label for="role" class="form-label"><b>Role</b></label>
          <select id="role" v-model="role" required>
            <option disabled value="">Please select one</option>
            <option value="Professional">Professional</option>
            <option value="Customer">Customer</option>
          </select>
        </div>
        <div class="mb-3">
          <label v-if="role == 'Professional'" class="form-label" for="service_name"><b>Service Name</b></label>
          <select v-if="role == 'Professional'" id="service_name" v-model="service_name" required>
            <option v-if="services.length == 0" disabled value="">No Services Available</option>
            <option v-if="services.length != 0" disabled value="">Please select one</option>
            <option v-if="services.length != 0" v-for="service in services" :value="service.name">{{service.name}}</option>
          </select>
        </div>

        <button :disabled="isRequiredFilled" class="btn btn-primary w-100" style="border-radius: 25px;" v-on:click="register">Register</button>
      </form>
    </div>
    `,
  data() {
    return {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      address: "",
      contact: "",
      pincode: "",
      role: "",
      services: [],
      service_name: "",
    };
  },
  methods: {
    async register() {
      const res = await fetch(location.origin + "/user_register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          first_name: this.first_name,
          last_name: this.last_name,
          address: this.address,
          pincode: this.pincode,
          contact: this.contact,
          role: this.role,
          service_name: this.service_name,
        }),
      });

      if (res.ok) {
        alert("Registered Successfully");
        this.$router.push("/login");
      }
    },
  },
  computed: {
    isRequiredFilled() {
      return (
        this.email == "" ||
        this.password == "" ||
        this.first_name == "" ||
        this.address == "" ||
        this.pincode == "" ||
        this.contact == "" ||
        this.role == "" ||
        (this.role == "Professional" && this.service_name == "")
      );
    },
  },
  async mounted() {
    const res = await fetch(location.origin + "/api/service");
    if (res.ok) {
      const data = await res.json();
      this.services = data;
    }
  },
};
