import { isPushSubscribed, subscribePush, unsubscribePush } from "./utils";
import { subscribePushBackend, unsubscribePushBackend } from "./data/api";
import { PUBLIC_VAPID_KEY } from "./config";

export async function updateNotifButton(registration, notifBtn) {
  const subscribed = await isPushSubscribed(registration);
  notifBtn.textContent = subscribed
    ? "🔕 Berhenti Berlangganan Notifikasi"
    : "🔔 Aktifkan Notifikasi";
}

export async function togglePushSubscription(registration, notifBtn) {
  const subscribed = await isPushSubscribed(registration);
  if (!subscribed) {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      alert("Izin notifikasi ditolak. Tidak bisa berlangganan.");
      return;
    }
    try {
      // Subscribe ke PushManager
      const subscription = await subscribePush(registration, PUBLIC_VAPID_KEY);
      // Kirim subscription ke backend
      const result = await subscribePushBackend(subscription);
      if (result.error === false) {
        alert("Berlangganan notifikasi berhasil!");
      } else {
        alert("Gagal berlangganan ke backend: " + (result.message || ""));
      }
    } catch (err) {
      alert("Gagal berlangganan notifikasi: " + err);
    }
  } else {
    try {
      const subscription = await registration.pushManager.getSubscription();
      await unsubscribePushBackend(subscription);
      await unsubscribePush(registration);
      alert("Berhenti berlangganan notifikasi!");
    } catch (err) {
      alert("Gagal unsubscribe: " + err);
    }
  }
  await updateNotifButton(registration, notifBtn);
}
