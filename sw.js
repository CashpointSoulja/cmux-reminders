// Runs in the background on the iPhone or iPad. Apple's push service wakes it with each encrypted
// message from the Mac (the browser decrypts it); it shows the notification and keeps a short history
// for the page.

const HISTORY = "cmux-history";
const LIMIT = 40;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let m;
  try {
    m = event.data.json();
  } catch {
    m = { title: "cmux Reminders", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(show(m));
});

async function show(m) {
  const tag = m.id || "cmux";
  // One notification per tab. iOS doesn't always replace by tag, so close the old one first.
  for (const old of await self.registration.getNotifications({ tag })) old.close();
  await self.registration.showNotification(m.title || "cmux Reminders", {
    body: m.body || "",
    tag,
    data: m,
    icon: "icon-192.png",
    silent: m.state === "working",
  });
  if ("setAppBadge" in navigator && typeof m.badge === "number") {
    try { m.badge > 0 ? await navigator.setAppBadge(m.badge) : await navigator.clearAppBadge(); } catch {}
  }
  if (m.id !== "cmux-reminders-test") await remember(m);
  for (const page of await self.clients.matchAll({ type: "window" })) page.postMessage("updated");
}

// The latest message per tab, newest first.
async function remember(m) {
  const cache = await caches.open(HISTORY);
  const saved = await cache.match("history");
  const list = saved ? await saved.json() : [];
  const next = [m, ...list.filter((x) => x.id !== m.id)].slice(0, LIMIT);
  await cache.put("history", new Response(JSON.stringify(next), { headers: { "Content-Type": "application/json" } }));
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const pages = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (pages.length) return pages[0].focus();
    return self.clients.openWindow("./");
  })());
});
