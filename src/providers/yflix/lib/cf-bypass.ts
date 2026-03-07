export const cf_capcha_status = [403, 503, 429]
export const cf_signatures = [
  'window._cf_chl_opt',             // Turnstile / JS Challenge config object
  '<title>Just a moment...</title>', // Modern default challenge title
  '<title>Attention Required! | Cloudflare</title>', // Legacy block title
  'id="challenge-form"',            // Hidden form used for token submission
  '__cf_chl_tk'                     // Token parameter in scripts/URLs
];

import { connect } from "puppeteer-real-browser";
import { Logger } from "../../../core/logger";

interface ClearanceResult {
  success: boolean;
  cfClearance?: string;
  userAgent?: string;
  ttl?: number;      
  allCookies?: any[]; 
  error?: string;
}

const TIMEOUT = 30_000; 

// Global singletons to keep the browser warm
let browserInstance: any = null;
let persistentPage: any = null;

async function initBrowser(): Promise<void> {
  // Failsafe: kill any hanging instances before launching a new one
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
  }

  Logger.info("Cold start: Launching persistent anti-detect browser...");
  const { browser, page } = await connect({
    headless: false,       
    turnstile: true,       // Hooked directly to this specific 'page'
    disableXvfb: false,    
    ignoreAllFlags: false  
  });

  browserInstance = browser;
  persistentPage = page;
}

export async function getCloudflareClearance(targetUrl: string): Promise<ClearanceResult> {
  // If the browser hasn't been launched yet, or if the page crashed/closed, restart it
  if (!browserInstance || !persistentPage || persistentPage.isClosed()) {
    await initBrowser();
  }

  try {
    Logger.info(`Navigating to ${targetUrl} using warm browser...`);
    await persistentPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    Logger.info("Polling every 500ms for the cf_clearance cookie...");
    
    const extractionData = await new Promise<{ cookies: any[], cfClearance: string, userAgent: string, ttl: number }>((resolve, reject) => {
      let checkInterval: NodeJS.Timeout;
      
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Timeout: cf_clearance cookie never appeared."));
      }, TIMEOUT);

      checkInterval = setInterval(async () => {
        try {
          if (persistentPage.isClosed()) return;
          
          const cookies = await persistentPage.cookies();
          const cfCookie = cookies.find((c: any) => c.name === 'cf_clearance');
          
          if (cfCookie) {
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            
            let ttlSeconds = 3600; 
            if (cfCookie.expires) {
              const currentUnixTime = Math.floor(Date.now() / 1000);
              ttlSeconds = Math.floor(cfCookie.expires) - currentUnixTime;
              if (ttlSeconds <= 0) ttlSeconds = 3600; 
            }
            
            const userAgent = await persistentPage.evaluate((): string => navigator.userAgent);
            
            resolve({ 
              cookies, 
              cfClearance: cfCookie.value, 
              userAgent, 
              ttl: ttlSeconds 
            });
          }
        } catch (err) {
          // Suppress context errors that happen during rapid page reloads
        }
      }, 500);
    });

    Logger.info(`Got the cookie! TTL is ${extractionData.ttl} seconds. Parking the browser...`);

    // Park the browser on a blank page immediately to free up CPU/Memory from the target site's JS
    persistentPage.goto('about:blank').catch(() => {});

    return {
      success: true,
      cfClearance: extractionData.cfClearance,
      userAgent: extractionData.userAgent,
      ttl: extractionData.ttl, 
      allCookies: extractionData.cookies
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Failed to bypass:", errorMessage);
    
    // If we hit a critical error, park the browser just in case
    if (persistentPage && !persistentPage.isClosed()) {
      persistentPage.goto('about:blank').catch(() => {});
    }
    
    return { success: false, error: errorMessage };
  }
}