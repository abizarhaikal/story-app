import Map from "./utils/map.js";

export async function storyMapper(story) {
  // Cek kalau lat dan lon ada dan bertipe number
  let location = null;
  if (typeof story.lat === "number" && typeof story.lon === "number") {
    const placeName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);
    location = {
      latitude: story.lat,
      longitude: story.lon,
      placeName,
    };
  } else {
    // Kalau lat/lon tidak valid, beri null atau objek kosong supaya tidak error
    location = null;
  }

  return {
    ...story,
    location,
  };
}
