import "../styles/styles.css";
import App from "./pages/app";
import { registerServiceWorker } from "./utils";
import { updateNotifButton, togglePushSubscription } from "./push";

/** Hamburger menu SPA-safe */
function setupHamburgerMenu() {
  const drawerBtn = document.getElementById("drawer-button");
  const navDrawer = document.getElementById("navigation-drawer");
  if (!drawerBtn || !navDrawer) return;

  // Hapus event biar ga double
  drawerBtn.onclick = null;

  drawerBtn.onclick = (e) => {
    navDrawer.classList.toggle("open");
    // Optional: scroll lock saat drawer open (UX)
    document.body.style.overflow = navDrawer.classList.contains("open")
      ? "hidden"
      : "";
  };

  // Klik luar drawer untuk close (UX)
  function closeDrawerOnClickOutside(event) {
    if (
      navDrawer.classList.contains("open") &&
      !navDrawer.contains(event.target) &&
      event.target !== drawerBtn
    ) {
      navDrawer.classList.remove("open");
      document.body.style.overflow = "";
    }
  }
  // Pastikan hanya ada satu listener
  document.removeEventListener("click", closeDrawerOnClickOutside);
  document.addEventListener("click", closeDrawerOnClickOutside);
}

/** Push notification button SPA-safe */
async function setupNotifButton(registration) {
  const notifBtn = document.getElementById("notif-btn");
  if (notifBtn) {
    await updateNotifButton(registration, notifBtn);
    // Hindari double event: clone dulu
    const newBtn = notifBtn.cloneNode(true);
    notifBtn.replaceWith(newBtn);
    newBtn.addEventListener("click", () =>
      togglePushSubscription(registration, newBtn)
    );
  }
}

async function mainRender() {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  // Hamburger menu
  setupHamburgerMenu();

  // Push notif button
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await setupNotifButton(registration);
  }
}

// ==== INIT SPA ====
document.addEventListener("DOMContentLoaded", async () => {
  await registerServiceWorker();
  await mainRender();

  window.addEventListener("hashchange", mainRender);
});
