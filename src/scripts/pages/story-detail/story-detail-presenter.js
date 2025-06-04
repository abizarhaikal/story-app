import { storyMapper } from "../../api-mapper";
import { getBookmark, saveBookmark, deleteBookmark } from "../../data/db";

export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #storyObj;

  constructor(storyId, { view, apiModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("Error initializing map:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#apiModel.getStoryDetail(this.#storyId);
      if (!response.ok) {
        this.#view.populateStoryDetailError(
          response.message || "Gagal memuat detail cerita"
        );
        return;
      }
      if (!response.story)
        throw new Error("Story object is missing from response.");

      const story = await storyMapper(response.story);
      this.#storyObj = story;

      // Cek bookmark status
      const bookmarked = await getBookmark(story.id);
      this.#view.populateStoryDetailAndInitialMap(
        response.message,
        story,
        !!bookmarked
      );
    } catch (error) {
      this.#view.populateStoryDetailError(
        "Terjadi kesalahan saat mengambil detail cerita. Silakan coba lagi nanti."
      );
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  async toggleBookmark(isBookmarked) {
    if (!this.#storyObj) return;
    if (isBookmarked) {
      await deleteBookmark(this.#storyObj.id);
    } else {
      await saveBookmark(this.#storyObj);
    }
    // Refresh button state
    const bookmarked = await getBookmark(this.#storyObj.id);
    this.#view.renderBookmarkButton(!!bookmarked);
  }

  async showBookmarkButton(bookmarked) {
    this.#view.renderBookmarkButton(bookmarked);
  }
}
