import HomePresenter from "./home-presenter.js";
import * as StoryApi from "../../data/api.js";

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <section class="reports-list__map__container">
        <div id="map" class="reports-list__map" role="region" aria-label="Peta lokasi laporan"></div>
        <div id="map-loading-container" aria-live="polite" style="visibility: hidden;">Memuat peta...</div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>
        <div class="stories-list__container" id="stories-list" role="list">
          <!-- Daftar cerita akan dimuat di sini lewat JS di afterRender -->
        </div>
        <div id="stories-list-loading-container" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryApi,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  showLoading() {
    const loader = document.getElementById("stories-list-loading-container");
    if (loader) loader.textContent = "Memuat data cerita...";
  }

  hideLoading() {
    const loader = document.getElementById("stories-list-loading-container");
    if (loader) loader.textContent = "";
  }

  showMapLoading() {
    const loader = document.getElementById("map-loading-container");
    if (loader) loader.style.visibility = "visible";
  }

  hideMapLoading() {
    const loader = document.getElementById("map-loading-container");
    if (loader) loader.style.visibility = "hidden";
  }

  populateStoryList(message, stories) {
    const container = document.getElementById("stories-list");
    if (!container) return;

    if (!stories || stories.length === 0) {
      container.innerHTML = `<p>Tidak ada cerita yang tersedia.</p>`;
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
    <article class="story-item" tabindex="0" data-storyid="${story.id}">
      ${
        story.photoUrl
          ? `<img class="story-item__image" src="${story.photoUrl}" alt="Gambar story: ${story.name}">`
          : ""
      }
      <div class="story-item__content">
        <h2 class="story-item__title">${story.name}</h2>
        <p class="story-item__text">${story.description}</p>
        <div class="story-item__meta">
          <span class="story-item__author">By: ${story.name}</span>
          <span class="story-item__date">${new Date(
            story.createdAt
          ).toLocaleDateString()}</span>
        </div>
      </div>
      <a class="btn story-item__read-more" href="#/story/${
        story.id
      }">Baca Selengkapnya &raquo;</a>
    </article>
  `
      )
      .join("");
  }

  async initialMap() {
    if (this._map) return; // inisialisasi hanya sekali

    this._map = L.map("map").setView([-6.2, 106.816666], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this._map);
  }

  populateStoryListError(message) {
    const container = document.getElementById("stories-list");
    if (!container) return;

    container.innerHTML = `
      <div class="error-message">
        <h2>Gagal memuat daftar cerita</h2>
        <p>${message || "Silakan coba lagi nanti."}</p>
      </div>
    `;
  }

  addMarkersToMap(stories) {
    if (!this._map) return;

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        // Sesuaikan properti latitude & longitude dari data
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);
        marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });
  }
}
