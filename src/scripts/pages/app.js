import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";

class App {
  #content = null;

  constructor({ content }) {
    this.#content = content;
  }

  async renderPage() {
    const url = getActiveRoute();
    const getPage = routes[url];

    if (!getPage) {
      this.#content.innerHTML = "<h2>Halaman tidak ditemukan</h2>";
      return;
    }

    const page = getPage();

    if (!page || typeof page.render !== "function") {
      this.#content.innerHTML = "<h2>Halaman tidak ditemukan</h2>";
      return;
    }

    this.#content.innerHTML = await page.render();
    if (page.afterRender) {
      await page.afterRender();
    }

    // Sembunyikan header jika di login page, tampilkan jika bukan
    const header = document.querySelector("header");
    if (url === "/login" || url === "/register") {
      header.style.display = "none";
    } else {
      header.style.display = "";
    }
  }
}

export default App;
