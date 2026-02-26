import { supabase } from './supabase';

// Generate a unique visitor ID (fingerprint)
export function generateVisitorId(): string {
  const getOrCreateVisitorId = () => {
    const stored = localStorage.getItem('visitor_id');
    if (stored) return stored;

    // Create fingerprint from available browser data
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      screen.colorDepth,
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const visitorId = `visitor_${Math.abs(hash)}_${Date.now()}`;
    localStorage.setItem('visitor_id', visitorId);
    return visitorId;
  };

  return getOrCreateVisitorId();
}

// Get device type
export function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Get browser name
export function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
}

// Get OS name
export function getOSName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

// Get session ID
export function getSessionId(): string {
  const stored = sessionStorage.getItem('session_id');
  if (stored) return stored;

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
}

// Get UTM parameters from URL
export function getUTMParams() {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

// Get geolocation data from IP
export async function getGeolocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch geolocation');

    const data = await response.json();
    return {
      ip: data.ip,
      country: data.country_name,
      country_code: data.country_code,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return {
      ip: undefined,
      country: undefined,
      country_code: undefined,
      city: undefined,
      region: undefined,
      timezone: undefined,
    };
  }
}

// Track page view
export async function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    const visitorId = generateVisitorId();
    const sessionId = getSessionId();
    const geo = await getGeolocation();
    const utm = getUTMParams();

    const pageViewData = {
      visitor_id: visitorId,
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: document.referrer || undefined,
      session_id: sessionId,
      ip_address: geo.ip,
      country: geo.country,
      country_code: geo.country_code,
      city: geo.city,
      user_agent: navigator.userAgent,
      browser: getBrowserName(),
      device: getDeviceType(),
      os: getOSName(),
      screen_width: screen.width,
      screen_height: screen.height,
      ...utm,
    };

    // Insert page view
    const { error: pageViewError } = await supabase
      .from('page_views')
      .insert([pageViewData]);

    if (pageViewError) {
      console.error('Error tracking page view:', pageViewError);
      return;
    }

    // Update or create visitor record
    const { data: existingVisitor } = await supabase
      .from('visitors')
      .select('*')
      .eq('visitor_id', visitorId)
      .single();

    if (existingVisitor) {
      // Update existing visitor
      await supabase
        .from('visitors')
        .update({
          last_seen: new Date().toISOString(),
          total_visits: existingVisitor.total_visits + 1,
          ip_address: geo.ip,
          country: geo.country,
          country_code: geo.country_code,
          city: geo.city,
          region: geo.region,
          timezone: geo.timezone,
        })
        .eq('visitor_id', visitorId);
    } else {
      // Create new visitor
      await supabase
        .from('visitors')
        .insert([{
          visitor_id: visitorId,
          ip_address: geo.ip,
          country: geo.country,
          country_code: geo.country_code,
          city: geo.city,
          region: geo.region,
          timezone: geo.timezone,
          user_agent: navigator.userAgent,
          browser: getBrowserName(),
          device: getDeviceType(),
          os: getOSName(),
        }]);
    }
  } catch (error) {
    console.error('Error in trackPageView:', error);
  }
}
