import { openDB } from "idb";

const DB_NAME = "storyAppDB";
const STORE_NAME = "bookmarked";
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade: (database) => {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, {
        keyPath: "id",
      });
    }
  },
});

const Database = {
  async saveBookmark(story) {
    if (!Object.hasOwn(story, "id")) {
      throw new Error("Story must have an 'id' property.");
    }
    return (await dbPromise).put(STORE_NAME, story);
  },

  async getBookmark(id) {
    if (!id) throw new Error("Story ID is required.");
    return (await dbPromise).get(STORE_NAME, id);
  },

  async getAllBookmarks() {
    return (await dbPromise).getAll(STORE_NAME);
  },

  async deleteBookmark(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  },
};

export default Database;
export const { saveBookmark, getBookmark, getAllBookmarks, deleteBookmark } =
  Database;
