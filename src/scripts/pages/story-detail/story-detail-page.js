import StoryDetailPresenter from "./story-detail-presenter.js";
import { parseActivePathname } from "../../routes/url-parser";
import * as StoryAPI from "../../data/api.js";
import Map from "../../utils/map.js";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;
  #currentBookmarkState = false;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StoryAPI,
    });
    await this.#presenter.showStoryDetail();
  }

  /**
   *
   * @param {string} message
   * @param {object} story
   * @param {boolean} bookmarked
   */
  async populateStoryDetailAndInitialMap(message, story, bookmarked = false) {
    const container = document.getElementById("story-detail");
    container.innerHTML = "";

    // Header
    const detailDiv = document.createElement("div");
    detailDiv.className = "story-detail__header";
    detailDiv.style.position = "relative";

    // Judul
    const titleEl = document.createElement("h1");
    titleEl.className = "story-detail__title";
    titleEl.textContent = story.name || story.title || "-";
    detailDiv.appendChild(titleEl);

    // === BOOKMARK ICON BUTTON DI POJOK KANAN ATAS ===
    this.renderBookmarkIconButton(detailDiv, bookmarked);

    // Info tanggal & lokasi
    const infoDiv = document.createElement("div");
    infoDiv.className = "story-detail__more-info";
    // ... (isi info tetap sama)
    const createdAt = document.createElement("div");
    createdAt.className = "story-detail__createdat";
    createdAt.innerHTML = `<i class="fas fa-calendar-alt"></i> ${new Date(
      story.createdAt
    ).toLocaleDateString()}`;
    infoDiv.appendChild(createdAt);

    const placeName = document.createElement("div");
    placeName.className = "story-detail__location__place-name";
    placeName.innerHTML = `<i class="fas fa-map"></i> ${
      story.location?.placeName || "-"
    }`;
    infoDiv.appendChild(placeName);

    const lat = document.createElement("div");
    lat.className = "story-detail__location__latitude";
    lat.textContent = `Latitude: ${story.lat}`;
    infoDiv.appendChild(lat);

    const lon = document.createElement("div");
    lon.className = "story-detail__location__longitude";
    lon.textContent = `Longitude: ${story.lon}`;
    infoDiv.appendChild(lon);

    const author = document.createElement("div");
    author.className = "story-detail__author";
    author.textContent = `By: ${story.name || "-"}`;
    infoDiv.appendChild(author);

    detailDiv.appendChild(infoDiv);
    container.appendChild(detailDiv);

    // Gambar utama
    const imgContainer = document.createElement("div");
    imgContainer.className = "story-detail__images__container";
    const img = document.createElement("img");
    img.className = "story-detail__image";
    img.src = story.photoUrl || "images/placeholder-image.jpg";
    img.alt = story.name || "-";
    imgContainer.appendChild(img);
    container.appendChild(imgContainer);

    // Deskripsi dan Peta
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "story-detail__body container";

    // Deskripsi
    const descContainer = document.createElement("div");
    descContainer.className = "story-detail__body__description__container";
    const descTitle = document.createElement("h2");
    descTitle.className = "story-detail__description__title";
    descTitle.textContent = "Deskripsi";
    descContainer.appendChild(descTitle);

    const descBody = document.createElement("div");
    descBody.className = "story-detail__description__body";
    descBody.textContent = story.description || "";
    descContainer.appendChild(descBody);
    bodyContainer.appendChild(descContainer);

    // Map container
    const mapContainer = document.createElement("div");
    mapContainer.className = "story-detail__body__map__container";
    const mapTitle = document.createElement("h2");
    mapTitle.className = "story-detail__map__title";
    mapTitle.textContent = "Peta Lokasi";
    mapContainer.appendChild(mapTitle);

    const mapDiv = document.createElement("div");
    mapDiv.id = "map";
    mapDiv.className = "story-detail__map";
    mapContainer.appendChild(mapDiv);

    bodyContainer.appendChild(mapContainer);
    container.appendChild(bodyContainer);

    // Inisialisasi peta dan marker
    await this.initialMap();
    if (this.#map && story.lat != null && story.lon != null) {
      const coords = [story.lat, story.lon];
      this.#map.changeCamera(coords);
      this.#map.addMarker(coords, { alt: story.name }, { content: story.name });
    }

    this.addNotifyMeEventListener();
  }

  // --- BOOKMARK BUTTON DI HEADER ---
  // --- BOOKMARK BUTTON DI HEADER ---
  renderBookmarkIconButton(parent, isBookmarked) {
    this.#currentBookmarkState = !!isBookmarked;

    // Hapus existing icon kalau ada
    let oldBtn = parent.querySelector("#story-detail-bookmark-icon");
    if (oldBtn) oldBtn.remove();

    // Button
    const btn = document.createElement("button");
    btn.id = "story-detail-bookmark-icon";
    btn.className = "btn btn-transparent";
    btn.style.position = "absolute";
    btn.style.top = "2rem";
    btn.style.right = "2rem";
    btn.style.zIndex = "10";
    btn.setAttribute(
      "aria-label",
      isBookmarked ? "Hapus Bookmark" : "Simpan ke Bookmark"
    );

    btn.innerHTML = isBookmarked
      ? `<i class="bi bi-bookmark-fill" style="font-size:2rem;color:gold;"></i>`
      : `<i class="bi bi-bookmark" style="font-size:2rem;color:#fff;"></i>`;

    btn.addEventListener("click", () => {
      this.#presenter.toggleBookmark(this.#currentBookmarkState);
    });

    parent.appendChild(btn);
  }

  // Dapat dipanggil dari presenter saat toggle status
  renderBookmarkButton(isBookmarked) {
    // Cari header section lalu update icon
    const detailDiv = document.querySelector(".story-detail__header");
    if (detailDiv) this.renderBookmarkIconButton(detailDiv, isBookmarked);
  }

  populateStoryDetailError(message) {
    const container = document.getElementById("story-detail");
    container.innerHTML = `
      <div class="error-message">
        <h2>Gagal memuat detail cerita</h2>
        <p>${message || "Silakan coba lagi nanti."}</p>
      </div>
    `;
  }

  async initialMap() {
    this.#map = await Map.build("#map", { zoom: 15 });
  }

  addNotifyMeEventListener() {
    const notifyBtn = document.getElementById("story-detail-notify-me");
    if (notifyBtn) {
      notifyBtn.addEventListener("click", () => {
        alert("Fitur notifikasi cerita akan segera hadir!");
      });
    }
  }

  showStoryDetailLoading() {
    const container = document.getElementById("story-detail-loading-container");
    if (container) {
      container.innerHTML = `
      <div class="loader loader-absolute"></div>
    `;
    }
  }

  hideStoryDetailLoading() {
    const container = document.getElementById("story-detail-loading-container");
    if (container) {
      container.innerHTML = "";
    }
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML = `
      <div class="loader loader-absolute"></div>
    `;
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }
}
