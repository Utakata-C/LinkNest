// Preserve the original site's integration IDs. Never send local preview traffic.
// Set VITE_LEGACY_INTEGRATIONS=false at build time to disable these integrations.
export function loadLegacyIntegrations() {
  if (!import.meta.env.PROD || import.meta.env.VITE_LEGACY_INTEGRATIONS === 'false' || location.hostname !== 'tangsu.house') return;
  const legacyWindow = window as Window & {
    _hmt?: unknown[];
    adsbygoogle?: unknown[];
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  const script = (src: string) => {
    const element = document.createElement('script');
    element.async = true;
    element.src = src;
    document.head.append(element);
  };
  legacyWindow._hmt = legacyWindow._hmt || [];
  script('https://hm.baidu.com/hm.js?c05bb16ea908292af9f6c513087a1cc3');
  legacyWindow.adsbygoogle = legacyWindow.adsbygoogle || [];
  script('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  legacyWindow.adsbygoogle.push({ google_ad_client: 'ca-pub-8550836177608334', enable_page_level_ads: true });
  legacyWindow.dataLayer = legacyWindow.dataLayer || [];
  legacyWindow.gtag = function () { legacyWindow.dataLayer!.push(arguments); };
  script('https://www.googletagmanager.com/gtag/js?id=UA-111463289-1');
  legacyWindow.gtag('js', new Date());
  legacyWindow.gtag('config', 'UA-111463289-1');
}
