export default class AddPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showAddFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("Error initializing map:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, lat, lon }) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description,
        photo,
        lat,
        lon,
      };
      const response = await this.#model.postStoryData(data);

      if (!response.ok) {
        console.error("postStoryData failed:", response);
        this.#view.storeFailed(
          response.message || "Gagal mengirim cerita baru"
        );
        return;
      }

      this.#view.storeSuccessfully(response.message, response.story);
    } catch (error) {
      console.error("Error posting new story:", error);
      this.#view.storeFailed(
        "Terjadi kesalahan saat mengirim cerita baru. Silakan coba lagi nanti."
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
