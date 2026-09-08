"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const consentKey = "growthminute_analytics_consent";

type Consent = "accepted" | "declined";

function getConsent(): Consent | null {
  const saved = window.localStorage.getItem(consentKey);
  return saved === "accepted" || saved === "declined" ? saved : null;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("growthminute-analytics-consent", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("growthminute-analytics-consent", onChange);
  };
}

export function GoogleAnalytics() {
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);

  function choose(next: Consent) {
    window.localStorage.setItem(consentKey, next);
    window.dispatchEvent(new Event("growthminute-analytics-consent"));
  }

  if (!measurementId) return null;

  return <>
    {consent === "accepted" && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="growthminute-google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `}</Script>
    </>}
    {consent === null && <aside className="analytics-consent" aria-label="Analytics preferences">
      <div><strong>Help us improve GrowthMinute</strong><p>We use Google Analytics to understand visits and how people use the website. Analytics runs only if you accept.</p></div>
      <div className="analytics-consent-actions"><button type="button" onClick={() => choose("declined")}>Decline</button><button type="button" className="accept" onClick={() => choose("accepted")}>Accept analytics</button></div>
    </aside>}
  </>;
}
