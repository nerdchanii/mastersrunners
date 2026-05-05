const CLOUDFLARE_ANALYTICS_SCRIPT_ID = "cloudflare-web-analytics";

function getAnalyticsToken() {
  return import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN?.trim();
}

export function ensureCloudflareAnalytics() {
  const token = getAnalyticsToken();
  if (!token || typeof document === "undefined") {
    return;
  }

  if (document.getElementById(CLOUDFLARE_ANALYTICS_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = CLOUDFLARE_ANALYTICS_SCRIPT_ID;
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token }));

  document.head.appendChild(script);
}
