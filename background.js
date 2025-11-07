// === CONFIGURACIÓN ===
const URL = "https://aulavirtual.uji.es/"; // usa el host real
const COOKIE_NAMES = [
  "MDL_SSP_AuthToken",
  "MDL_SSP_SessID",
  "MoodleSessionaulavirtualuji"
];
const DAYS = 1;

function futureTimestamp(days) {
  return Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.startsWith(URL)) {
    COOKIE_NAMES.forEach(name => {
      chrome.cookies.get({ url: URL, name }, cookie => {
        if (!cookie) {
          console.warn(`[Extensión] Cookie ${name} no encontrada`);
          return;
        }

        const setDetails = {
          url: URL,
          name: cookie.name,
          value: cookie.value,
          path: cookie.path || "/",
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
          expirationDate: futureTimestamp(DAYS)
        };

        // IMPORTANT: only set domain if the original cookie is NOT host-only.
        // If the original is host-only (cookie.hostOnly === true), omit domain to preserve host-only behavior.
        if (!cookie.hostOnly && cookie.domain) {
          setDetails.domain = cookie.domain; // e.g. ".aulavirtual.uji.es"
        }

        chrome.cookies.set(setDetails, newCookie => {
          if (chrome.runtime.lastError) {
            console.error("Error setting cookie:", chrome.runtime.lastError);
          } else {
            console.log(`[Extensión] Cookie ${name} extendida (${cookie.hostOnly ? "host-only" : cookie.domain})`);
          }
        });
      });
    });
  }
});
