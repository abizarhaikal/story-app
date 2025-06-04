import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import {
  checkUnauthenticatedRouteOnly,
  checkAuthenticatedRoute,
} from "../utils/auth.js";
import LoginPage from "../pages/auth/login/login-page.js";
import RegisterPage from "../pages/auth/register/register-page.js";
import StoryDetailPage from "../pages/story-detail/story-detail-page.js";
import AddPage from "../pages/add/add-page.js";
import BookmarkedPage from "../pages/bookmarked/bookmarked-page.js";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/home": () => checkAuthenticatedRoute(new HomePage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/story/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),

  "/add": () => checkAuthenticatedRoute(new AddPage()),
  "/bookmarked": () => checkAuthenticatedRoute(new BookmarkedPage()),
};

export default routes;
