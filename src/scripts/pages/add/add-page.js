import AddPresenter from "./add-presenter";
import { convertBase64ToBlob } from "../../utils";
import * as CityCareAPI from "../../data/api";
import Camera from "../../utils/camera";
import Map from "../../utils/map";

export default class AddPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenPhoto = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Buat Cerita Baru</h1>
            <p class="new-story__header__description">
              Silakan lengkapi formulir di bawah untuk menambahkan cerita baru.<br>
              Pastikan data yang dimasukkan sudah benar.
            </p>
          </div>
        </div>
      </section>
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Cerita</label>
              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Tulis cerita atau pengalamanmu..."
                  required
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <label for="photo-input" class="new-form__photo__title">Foto</label>
              <div id="photo-more-info">Upload 1 foto untuk cerita.</div>
              <div class="new-form__photo__container">
                <input
                  id="photo-input"
                  name="photo"
                  type="file"
                  accept="image/*"
                  aria-describedby="photo-more-info"
                >
                <button id="open-camera-button" class="btn btn-outline" type="button">
                  Buka Kamera
                </button>
                <div id="camera-container" class="new-form__camera__container" style="display:none;">
                  <video id="camera-video" class="new-form__camera__video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <button id="camera-take-button" class="btn" type="button">
                      Ambil Gambar
                    </button>
                  </div>
                </div>
                <div id="taken-photo-preview"></div>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>
              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="map" class="new-form__location__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="lat" id="lat-input" placeholder="Latitude" step="any" required disabled>
                  <input type="number" name="lon" id="lon-input" placeholder="Longitude" step="any" required disabled>
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Buat Cerita</button>
              </span>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddPresenter({
      view: this,
      model: CityCareAPI,
    });
    this.#takenPhoto = null;
    await this.#setupForm();
    await this.initialMap();
  }

  async #setupForm() {
    this.#form = document.getElementById("new-form");

    // Handle form submit
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const description = this.#form.elements.namedItem("description").value;
      const lat = this.#form.elements.namedItem("lat").value;
      const lon = this.#form.elements.namedItem("lon").value;

      // Gunakan hasil kamera jika ada, kalau tidak file upload
      const photoInput = this.#form.elements.namedItem("photo");
      let photoFile = this.#takenPhoto;
      if (!photoFile && photoInput.files[0]) {
        photoFile = photoInput.files[0];
      }

      if (!photoFile) {
        alert("Silakan upload foto atau ambil foto!");
        return;
      }

      await this.#presenter.postNewStory({
        description,
        photo: photoFile,
        lat,
        lon,
      });
    });

    // Handle file input
    document
      .getElementById("photo-input")
      .addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
          this.#takenPhoto = file;
          this.#showTakenPhotoPreview(file);
        }
      });

    // Camera
    const cameraContainer = document.getElementById("camera-container");
    document
      .getElementById("open-camera-button")
      .addEventListener("click", async (event) => {
        cameraContainer.style.display =
          cameraContainer.style.display === "none" ? "block" : "none";
        this.#isCameraOpen = cameraContainer.style.display === "block";

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = "Tutup Kamera";
          await this.#setupCamera();
          await this.#camera.launch();
          return;
        }
        event.currentTarget.textContent = "Buka Kamera";
        this.#camera?.stop();
      });
  }

  async initialMap() {
    // Bangun peta dengan opsi zoom dan locate user (jika bisa)
    this.#map = await Map.build("#map", {
      zoom: 15,
      locate: true,
    });

    // Ambil koordinat pusat peta
    const centerCoordinate = this.#map.getCenter();

    // Update input lat/lon form dengan koordinat pusat saat inisialisasi
    this.#updateLatLngInput(
      centerCoordinate.latitude,
      centerCoordinate.longitude
    );

    // Tambah marker draggable di pusat peta
    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: true }
    );

    // Saat marker digeser, update input latitude dan longitude
    draggableMarker.addEventListener("move", (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    // Saat klik pada peta, pindahkan marker ke lokasi klik dan update input lat/lon
    this.#map.addMapEventListener("click", (event) => {
      const clickedLatLng = event.latlng;
      draggableMarker.setLatLng(clickedLatLng);

      // Gerakkan kamera ke posisi klik
      event.sourceTarget.flyTo(clickedLatLng);

      // Update input lat/lon form dengan posisi klik
      this.#updateLatLngInput(clickedLatLng.lat, clickedLatLng.lng);
    });
  }

  // Fungsi pembantu update input latitude & longitude
  #updateLatLngInput(latitude, longitude) {
    if (!this.#form) return;

    const latInput = this.#form.elements.namedItem("lat");
    const lonInput = this.#form.elements.namedItem("lon");

    if (latInput) latInput.value = latitude;
    if (lonInput) lonInput.value = longitude;
  }

  async #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        cameraSelect: document.getElementById("camera-select"),
        canvas: document.getElementById("camera-canvas"),
      });
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const imageBlob = await this.#camera.takePicture();
      this.#takenPhoto = imageBlob;
      this.#showTakenPhotoPreview(imageBlob);
    });
  }

  #showTakenPhotoPreview(fileOrBlob) {
    const previewDiv = document.getElementById("taken-photo-preview");
    const url = URL.createObjectURL(fileOrBlob);
    previewDiv.innerHTML = `<img src="${url}" alt="Foto cerita" style="max-width:120px;max-height:120px;">`;
  }

  storeSuccessfully(message) {
    alert(message || "Cerita berhasil disimpan!");
    this.clearForm();
    location.hash = "/";
  }

  storeFailed(message) {
    alert(message || "Gagal menyimpan cerita!");
  }

  clearForm() {
    this.#form.reset();
    this.#takenPhoto = null;
    document.getElementById("taken-photo-preview").innerHTML = "";
  }

  showMapLoading() {
    const el = document.getElementById("map-loading-container");
    if (el) el.innerHTML = `<div class="loader loader-absolute"></div>`;
  }

  hideMapLoading() {
    const el = document.getElementById("map-loading-container");
    if (el) el.innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Cerita
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Buat Cerita</button>
    `;
  }
}
