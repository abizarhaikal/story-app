import { getAllBookmarks, deleteBookmark } from "../../data/db";

export default class BookmarkedPage {
  async render() {
    return `
      <section class="container">
        <h1 class="section-title">Cerita yang Disimpan</h1>
        <div class="stories-list__container" id="bookmarked-list" role="list">
          <!-- Daftar bookmark akan dimuat di sini lewat JS -->
        </div>
        <div id="bookmarked-list-loading-container" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    this.showLoading();
    try {
      const bookmarks = await getAllBookmarks();
      this.populateBookmarkList(bookmarks);
    } catch (err) {
      this.populateBookmarkListError(
        err.message || "Gagal memuat data bookmark."
      );
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    const loader = document.getElementById("bookmarked-list-loading-container");
    if (loader) loader.textContent = "Memuat cerita yang disimpan...";
  }

  hideLoading() {
    const loader = document.getElementById("bookmarked-list-loading-container");
    if (loader) loader.textContent = "";
  }

  /**
   * @param {Array} bookmarks
   */
  populateBookmarkList(bookmarks) {
    const container = document.getElementById("bookmarked-list");
    if (!container) return;

    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = `<p>Tidak ada cerita yang disimpan.</p>`;
      return;
    }

    container.innerHTML = bookmarks
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
        <div style="display: flex; gap: 8px; margin-top: 1rem;">
          <a class="btn story-item__read-more" href="#/story/${story.id}">
            <i class="bi bi-book"></i> Detail
          </a>
          <button class="btn btn-outline story-item__remove-bookmark" data-id="${
            story.id
          }" aria-label="Hapus Bookmark">
            <i class="bi bi-bookmark-x"></i> Hapus
          </button>
        </div>
      </article>
    `
      )
      .join("");

    // Tambahkan event untuk tombol hapus bookmark
    container
      .querySelectorAll(".story-item__remove-bookmark")
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = btn.getAttribute("data-id");
          await deleteBookmark(id);
          // Hapus dari tampilan tanpa reload seluruh halaman
          btn.closest("article.story-item").remove();
          // Jika kosong, tampilkan pesan
          if (container.querySelectorAll("article.story-item").length === 0) {
            container.innerHTML = `<p>Tidak ada cerita yang disimpan.</p>`;
          }
        });
      });
  }

  populateBookmarkListError(message) {
    const container = document.getElementById("bookmarked-list");
    if (!container) return;
    container.innerHTML = `
      <div class="error-message">
        <h2>Gagal memuat cerita yang disimpan</h2>
        <p>${message || "Silakan coba lagi nanti."}</p>
      </div>
    `;
  }
}
