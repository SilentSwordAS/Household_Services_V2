import Home from "../pages/Home.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import CustomerDashboard from "../pages/CustomerDashboard.js";
import ProfessionalDashboard from "../pages/ProfessionalDashboard.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import ServiceForm from "../pages/ServiceForm.js";
import EditServiceForm from "../pages/EditServiceForm.js";
import BookService from "../pages/BookService.js";
import EditRequestForm from "../pages/EditRequestForm.js";
import CloseRequestForm from "../pages/CloseRequestForm.js";
import AdminSearch from "../pages/AdminSearch.js";
import CustomerSearch from "../pages/CustomerSearch.js";

import store from "./store.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  {
    path: "/customer-dashboard",
    component: CustomerDashboard,
    meta: { requiresLogin: true, role: "Customer" },
  },
  {
    path: "/professional-dashboard",
    component: ProfessionalDashboard,
    meta: { requiresLogin: true, role: "Professional" },
  },
  {
    path: "/admin-dashboard",
    component: AdminDashboard,
    meta: { requiresLogin: true, role: "Admin" },
  },
  {
    path: "/add-service",
    component: ServiceForm,
    meta: { requiresLogin: true, role: "Admin" },
  },
  {
    path: "/edit-service/:id",
    component: EditServiceForm,
    meta: { requiresLogin: true, role: "Admin" },
  },
  {
    path: "/book-service/:id",
    component: BookService,
    meta: { requiresLogin: true, role: "Customer" },
  },
  {
    path: "/edit-request/:id",
    component: EditRequestForm,
    meta: { requiresLogin: true, role: "Customer" },
  },
  {
    path: "/close-request/:id",
    component: CloseRequestForm,
    meta: { requiresLogin: true, role: "Customer" },
  },
  {
    path: "/admin-search",
    component: AdminSearch,
    meta: { requiresLogin: true, role: "Admin" },
  },
  {
    path: "/customer-search",
    component: CustomerSearch,
    meta: { requiresLogin: true, role: "Customer" },
  },
];

const router = new VueRouter({
  routes,
});

// Implemented Navigation Guard
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!store.state.loggedIn) {
      next({ path: "/login" });
    } else if (to.meta.role && to.meta.role != store.state.role) {
      if (store.state.role == "Admin") {
        alert("You are not authorized to access this page");
        next({ path: "/admin-dashboard" });
      } else if (store.state.role == "Customer") {
        alert("You are not authorized to access this page");
        next({ path: "/customer-dashboard" });
      } else if (store.state.role == "Professional") {
        alert("You are not authorized to access this page");
        next({ path: "/professional-dashboard" });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
