export default {
  template: `
    <div class="d-flex flex-column justify-content-center align-items-center mt-2">
        <h1>--------User Login--------</h1>
        <form>
            <div class="mb-3">
              <label for="email" class="form-label"><b>Email</b></label>
              <input type="email" id="email" class="form-control" v-model="email" required style="width:300px">
            </div>
            <div class="mb-3">
              <label for="password" class="form-label"><b>Password</b></label>
              <input type="password" id="password" class="form-control" v-model="password" required style="width:300px">
            </div>
            <button class="btn btn-primary text-center w-100" :disabled="isRequiredFilled" style="border-radius: 25px" v-on:click="login">Login</button>
        </form>
    </div>
    `,
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      const res = await fetch(location.origin + "/user_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      if (res.status == "200") {
        alert("Logged In Successfully");
        const res_data = await res.json();
        localStorage.setItem("user", JSON.stringify(res_data));
        this.$store.commit("setUser");
        if (res_data.role == "Professional") {
          this.$router.push("/professional-dashboard");
        } else if (res_data.role == "Customer") {
          this.$router.push("/customer-dashboard");
        } else if (res_data.role == "Admin") {
          this.$router.push("/admin-dashboard");
        }
      } else if (res.status == "401") {
        alert("Account Pending for Approval");
        this.$router.push("/");
      } else if (res.status == "403") {
        alert("You are blocked by the administrator");
        this.$router.push("/");
      } else if (res.status == "400") {
        alert("Invalid Credentials");
        this.$router.push("/");
      }
    },
  },
  computed: {
    isRequiredFilled() {
      return this.email == "" || this.password == "";
    },
  },
};
