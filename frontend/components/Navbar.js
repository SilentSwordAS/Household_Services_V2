export default {
  template: `

  <nav class="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#"><b>XYZ Household Services</b></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link v-if="!$store.state.loggedIn" to="/" class="nav-link"><b>Home</b></router-link>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'Admin'" to="/admin-dashboard" class="nav-link"><b>Home</b></router-link>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'Professional'" to="/professional-dashboard" class="nav-link"><b>Home</b></router-link>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'Customer'" to="/customer-dashboard" class="nav-link"><b>Home</b></router-link>
          </li>
          <li class="nav-item">
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'Admin'" to="/admin-search" class="nav-link"><b>Search</b></router-link>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'Customer'" to="/customer-search" class="nav-link"><b>Search</b></router-link>
          </li>
          <li class="nav-item">
            <router-link v-if="!$store.state.loggedIn" to="/login" class="nav-link"><b>Login</b></router-link>
          </li>
          <li class="nav-item">
            <router-link v-if="!$store.state.loggedIn" to="/register" class="nav-link"><b>Register</b></router-link>
          </li>
        </ul>
        <span class="navbar-text">
          <button class="btn btn-danger" style="border-radius: 25px" v-if="$store.state.loggedIn" @click="$store.commit('logout')"><b>Logout</b></button>
        </span>
      </div>
    </div>
  </nav>
  `,
};
