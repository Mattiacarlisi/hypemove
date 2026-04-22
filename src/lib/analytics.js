export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";

export const DOWNLOAD_ANDROID_EVENT = "download_android_click";
export const DOWNLOAD_IPHONE_EVENT = "download_iphone_click";
export const DEFAULT_ANDROID_BUTTON_TEXT = "Scarica Gratis per Android";
export const DEFAULT_IPHONE_BUTTON_TEXT = "iPhone in arrivo";

const GA_EVENT_TIMEOUT_MS = 700;

function isModifiedNavigation(event) {
  return (
    event?.button !== 0 ||
    event?.metaKey ||
    event?.ctrlKey ||
    event?.shiftKey ||
    event?.altKey ||
    event?.currentTarget?.target === "_blank"
  );
}

function getGtag() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return null;
  }

  return window.gtag;
}

export function trackAndroidDownloadClick({
  buttonText = DEFAULT_ANDROID_BUTTON_TEXT,
  location,
  eventCallback,
} = {}) {
  const gtag = getGtag();

  if (!gtag) {
    eventCallback?.();
    return false;
  }

  gtag("event", DOWNLOAD_ANDROID_EVENT, {
    button_text: buttonText,
    location,
    event_callback: eventCallback,
    event_timeout: GA_EVENT_TIMEOUT_MS,
  });

  return true;
}

export function trackIphoneDownloadClick({
  buttonText = DEFAULT_IPHONE_BUTTON_TEXT,
  location,
  eventCallback,
} = {}) {
  const gtag = getGtag();

  if (!gtag) {
    eventCallback?.();
    return false;
  }

  gtag("event", DOWNLOAD_IPHONE_EVENT, {
    button_text: buttonText,
    location,
    event_callback: eventCallback,
    event_timeout: GA_EVENT_TIMEOUT_MS,
  });

  return true;
}

export function handleAndroidDownloadClick(event, {
  buttonText = DEFAULT_ANDROID_BUTTON_TEXT,
  href = PLAY_STORE_URL,
  location,
} = {}) {
  if (isModifiedNavigation(event)) {
    trackAndroidDownloadClick({ buttonText, location });
    return;
  }

  event?.preventDefault();

  if (typeof window === "undefined") {
    return;
  }

  let hasNavigated = false;
  const navigate = () => {
    if (hasNavigated) return;
    hasNavigated = true;
    window.location.assign(href);
  };

  const fallbackTimer = window.setTimeout(navigate, GA_EVENT_TIMEOUT_MS);
  const tracked = trackAndroidDownloadClick({
    buttonText,
    location,
    eventCallback: () => {
      window.clearTimeout(fallbackTimer);
      navigate();
    },
  });

  if (!tracked) {
    window.clearTimeout(fallbackTimer);
    navigate();
  }
}

export function handleIphoneDownloadClick(event, {
  buttonText = DEFAULT_IPHONE_BUTTON_TEXT,
  href,
  location,
} = {}) {
  if (isModifiedNavigation(event)) {
    trackIphoneDownloadClick({ buttonText, location });
    return;
  }

  event?.preventDefault();

  if (typeof window === "undefined") {
    return;
  }

  let hasNavigated = false;
  const navigate = () => {
    if (hasNavigated || !href) return;
    hasNavigated = true;
    window.location.assign(href);
  };

  const fallbackTimer = window.setTimeout(navigate, GA_EVENT_TIMEOUT_MS);
  const tracked = trackIphoneDownloadClick({
    buttonText,
    location,
    eventCallback: () => {
      window.clearTimeout(fallbackTimer);
      navigate();
    },
  });

  if (!tracked) {
    window.clearTimeout(fallbackTimer);
    navigate();
  }
}
