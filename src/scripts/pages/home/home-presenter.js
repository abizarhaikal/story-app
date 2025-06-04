export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoryListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("Error initializing map:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showStoryListMap();

      const response = await this.#model.getStoryData();

      console.log("Story list response:", response);

      if (!response.ok) {
        this.#view.populateStoryListError(
          response.message || "Gagal memuat cerita"
        );
        return;
      }

      const stories = Array.isArray(response.listStory)
        ? response.listStory
        : [];

      this.#view.populateStoryList(
        response.message || "Daftar cerita",
        stories
      );

      // Tambahkan marker ke map
      this.#view.addMarkersToMap(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      this.#view.populateStoryListError(
        "Terjadi kesalahan saat mengambil daftar cerita. Silakan coba lagi nanti."
      );
    } finally {
      this.#view.hideLoading();
    }
  }
}
