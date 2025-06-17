export default {
  config: {
    // Keep the locales configuration from the example if needed
    locales: ["en"],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Dashboard",
      },
    },
    tutorials: false,
    notifications: {
      releases: false,
      // Disable all notifications including trial
      active: false,
    },
    menu: {
      logo: false,
    },
  },
  bootstrap(app: any) {
    // Enterprise features to remove
    const enterpriseFeatures = [
      "review-workflows",
      "sso",
      "audit-logs",
      "settings.sso",
      "settings.review-workflows",
      "settings.audit-logs",
      "settings.single-sign-on",
      "admin::provider-login-settings",
      "plugin::deployment.deployment",
    ];

    // Protected paths that should redirect to home
    const protectedPaths = ["/admin/plugins/cloud", "/admin/plugins/deployment", "/admin/settings/single-sign-on", "/admin/settings/audit-logs", "/admin/settings/review-workflows"];

    // Add URL protection
    const checkAndRedirect = () => {
      const currentPath = window.location.pathname;
      if (protectedPaths.some((path) => currentPath.startsWith(path))) {
        window.location.href = "/admin/";
      }
    };

    // Check on initial load
    checkAndRedirect();

    // Check on navigation changes
    const pushState = history.pushState;
    history.pushState = function () {
      pushState.apply(history, arguments as any);
      checkAndRedirect();
    };

    window.addEventListener("popstate", checkAndRedirect);

    // Override the menu items to exclude EE features
    if (app.menu) {
      // Get all menu sections
      const menuSections = app.menu.sections;

      Object.keys(menuSections).forEach((sectionKey) => {
        const section = menuSections[sectionKey];
        if (section.links) {
          // Filter out EE features from each section
          section.links = section.links.filter((link: any) => {
            return !enterpriseFeatures.some(
              (feature) => link.to?.includes(feature) || link.id?.includes(feature) || link.intlLabel?.id?.includes(feature) || link.to?.includes("deployment") || link.to?.includes("cloud")
            );
          });
        }
      });
    }

    // Hide EE features from settings
    if (app.settings) {
      // Get global settings
      const globalSettings = app.settings.global?.data?.menu?.links || [];

      // Filter out EE features
      app.settings.global.data.menu.links = globalSettings.filter((link: any) => {
        return !enterpriseFeatures.some(
          (feature) =>
            link.to?.includes(feature) ||
            link.id?.includes(feature) ||
            link.intlLabel?.id?.includes(feature) ||
            link.id?.includes("provider-login-settings") ||
            link.to?.includes("deployment") ||
            link.to?.includes("cloud")
        );
      });
    }

    // Add custom styles to hide any remaining EE features
    const style = document.createElement("style");
    style.textContent = `
      [data-strapi-ee-feature] { display: none !important; }
      [href*="review-workflows"],
      [href*="audit-logs"],
      [href*="sso"],
      [href*="single-sign-on"],
      [href*="provider-login-settings"],
      [href*="deployment"],
      [href*="/admin/plugins/cloud"],
      [href*="cloud"],
      a[href="/admin/plugins/cloud"],
      [data-settings-id*="single-sign-on"],
      [data-settings-id*="sso"],
      [data-settings-id*="provider-login-settings"],
      [data-settings-id*="deployment"],
      [aria-label="Deploy"] { display: none !important; }

      /* Hide the entire list item containing the Deploy link */
      li:has(a[href="/admin/plugins/cloud"]),
      li:has([aria-label="Deploy"]) { 
        display: none !important; 
      }

      /* Hide trial notification banner */
      div:has(> a[href*="chargebeeportal"]),
      a[href*="chargebeeportal"],
      [href*="strapi.chargebeeportal.com"],
      div:has(> span:contains("trial has ended")),
      div:has(> span:contains("Keep access to Growth features")),
      .sc-bzdlUa.kkTCEq,
      div[class*="sc-bzdlUa"],
      div:has(> a[href="https://strapi.chargebeeportal.com"]) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Additional dynamic cleanup for trial banner
    const removeBanner = () => {
      const banners = document.querySelectorAll('div:has(> a[href*="chargebeeportal"])');
      banners.forEach((banner) => {
        if (banner instanceof HTMLElement) {
          banner.style.display = "none";
        }
      });
    };

    // Run banner removal on load and periodically
    removeBanner();
    setInterval(removeBanner, 1000);
  },
};
