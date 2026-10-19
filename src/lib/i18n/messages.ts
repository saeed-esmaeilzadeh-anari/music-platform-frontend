export type Locale = "fa" | "en";

export const messages = {
  fa: {
    language: { label: "زبان", persian: "فارسی", english: "English", switchTo: "تغییر زبان" },
    navigation: { home: "خانه", search: "جست‌وجو", library: "کتابخانه", favourites: "علاقه‌مندی‌ها", history: "تاریخچه", upload: "بارگذاری", dashboard: "داشبورد", yourMusic: "موسیقی شما", playlists: "فهرست‌های پخش", admin: "مدیریت" },
    common: { signIn: "ورود", signUp: "ثبت‌نام", notifications: "اعلان‌ها", searchMusic: "جست‌وجوی موسیقی", searchPlaceholder: "هنرمند، آلبوم یا آهنگ…", clearSearch: "پاک کردن جست‌وجو", openNavigation: "باز کردن ناوبری", goBack: "بازگشت", goForward: "جلو رفتن", nothingPlaying: "چیزی در حال پخش نیست", mute: "بی‌صدا", unmute: "با صدا", volume: "بلندی صدا", seek: "موقعیت پخش", shuffle: "پخش تصادفی", previous: "قبلی", next: "بعدی", likeTrack: "پسندیدن آهنگ", profile: "پروفایل", settings: "تنظیمات", subscription: "اشتراک", logout: "خروج", roleListener: "شنونده", roleArtist: "هنرمند", roleModerator: "ناظر", roleAdmin: "مدیر" },
    auth: { signInTitle: "ورود", signInDescription: "برای ورود به حساب ساندوِیو اطلاعات خود را وارد کنید.", musicLivesHere: "موسیقی اینجاست.", musicSubtitle: "میلیون‌ها آهنگ را پخش کنید، هنرمندان محبوبتان را دنبال کنید و فهرست‌های پخشی بسازید که با شما همراه‌اند.", welcomeBack: "خوش برگشتید", credentials: "برای ادامه اطلاعات ورود را وارد کنید.", noAccount: "حساب کاربری ندارید؟", createOne: "ایجاد حساب", signUpTitle: "ایجاد حساب", forgotPassword: "بازیابی رمز عبور" },
    admin: { general: "عمومی", community: "مدیریت کاربران", content: "مدیریت محتوا", welcome: "خوش آمدید", site: "مشاهده سایت", adminPanel: "پنل مدیریت", menuOpen: "باز کردن منو", menuClose: "بستن منو" },
  },
  en: {
    language: { label: "Language", persian: "فارسی", english: "English", switchTo: "Change language" },
    navigation: { home: "Home", search: "Search", library: "Library", favourites: "Favourites", history: "History", upload: "Upload", dashboard: "Dashboard", yourMusic: "Your music", playlists: "Playlists", admin: "Admin" },
    common: { signIn: "Sign in", signUp: "Sign up", notifications: "Notifications", searchMusic: "Search music", searchPlaceholder: "Artists, albums, tracks…", clearSearch: "Clear search", openNavigation: "Open navigation", goBack: "Go back", goForward: "Go forward", nothingPlaying: "Nothing playing", mute: "Mute", unmute: "Unmute", volume: "Volume", seek: "Seek", shuffle: "Shuffle", previous: "Previous", next: "Next", likeTrack: "Like track", profile: "Profile", settings: "Settings", subscription: "Subscription", logout: "Log out", roleListener: "Listener", roleArtist: "Artist", roleModerator: "Moderator", roleAdmin: "Admin" },
    auth: { signInTitle: "Sign in", signInDescription: "Sign in to your Soundwave account.", musicLivesHere: "Music lives here.", musicSubtitle: "Stream millions of tracks, follow your favourite artists, and build playlists that move with you.", welcomeBack: "Welcome back", credentials: "Enter your credentials to continue.", noAccount: "Don't have an account?", createOne: "Create one", signUpTitle: "Create account", forgotPassword: "Forgot password?" },
    admin: { general: "General", community: "Community management", content: "Content management", welcome: "Welcome", site: "View site", adminPanel: "Admin panel", menuOpen: "Open menu", menuClose: "Close menu" },
  },
} as const;

export type MessageKey = keyof typeof messages.en;
