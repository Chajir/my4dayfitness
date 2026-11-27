import { locale, t } from "./i18n";
// App version (from package.json) and build date, shown in the You tab.
export const APP_VERSION = __APP_VERSION__;
export const BUILD_DATE = __BUILD_DATE__;
export const versionLabel = () =>
  `${t("Version")} ${APP_VERSION.replace(/\.0$/, "")} · ${new Date(BUILD_DATE).toLocaleDateString(locale(), { month: "short", day: "numeric", year: "numeric" })}`;

// Owner access: an account is the owner when a document named after its user ID
// exists in the Firestore "owners" collection. Create it once in the Firebase console.
// Nobody can create or change that collection from the app (see firestore.rules).
export const OWNERS_COLLECTION = "owners";
