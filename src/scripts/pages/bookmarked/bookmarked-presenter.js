import { getAllBookmarks, deleteBookmark } from "../../data/db.js";

export default class BookmarkedPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async showBookmarks() {
    this.#view.showLoading();
    try {
      const bookmarks = await getAllBookmarks();
      this.#view.populateBookmarkList(bookmarks);
    } catch (err) {
      this.#view.populateBookmarkListError(
        err.message || "Gagal memuat bookmark."
      );
    } finally {
      this.#view.hideLoading();
    }
  }

  async removeBookmark(id) {
    try {
      await deleteBookmark(id);
      // Ambil ulang daftar setelah hapus
      const bookmarks = await getAllBookmarks();
      this.#view.populateBookmarkList(bookmarks);
    } catch (err) {
      this.#view.populateBookmarkListError(
        err.message || "Gagal menghapus bookmark."
      );
    }
  }
}
