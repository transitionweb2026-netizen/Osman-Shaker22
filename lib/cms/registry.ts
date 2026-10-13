/**
 * Everything the CMS can edit: pages and their sections, shared settings and
 * catalogs, with the fields of each (see `schema.ts`).
 *
 * `documents` is typed against `documentBindings` (lib/cms/model.ts), so every
 * section of the website must be described here or the build fails.
 */
import type { JourneyIcon, SocialPlatform } from "@/content/types";
import type { CatalogKey, DocumentKey, PageKey } from "./model";
import { L, type Field, type Json, type Label, type TextField } from "./schema";

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

type TextOptions = Omit<TextField, "type" | "key" | "label">;
const text = (key: string, label: Label, options: TextOptions = {}): TextField => ({ type: "text", key, label, ...options });
const plain = (key: string, label: Label, options: TextOptions = {}): TextField =>
  text(key, label, { localized: false, ...options });

const eyebrow = text("eyebrow", L("Small label above the title", "العنوان الصغير فوق العنوان"), { required: true, max: 60 });
const title = text("title", L("Title", "العنوان"), { required: true, max: 140 });
const description = text("description", L("Description", "الوصف"), { multiline: true, max: 500 });
const intro: Field[] = [eyebrow, title, description];

const placeholder: Field = {
  type: "placeholder",
  key: "isPlaceholder",
  label: L("Temporary placeholder", "محتوى مؤقت"),
  help: L(
    "Placeholders are listed by the launch check. Switch this off once the real content is in place or approved.",
    "تُدرج العناصر المؤقتة في فحص الإطلاق. أوقف هذا الخيار بعد إضافة المحتوى الحقيقي أو اعتماده.",
  ),
};

const image = (key: string, label: Label, required = true, help?: Label): Field => ({
  type: "image",
  key,
  label,
  required,
  help,
});

const cta = (key = "cta", label = L("Button", "الزر")): Field => ({ type: "cta", key, label });

const quote: Field = {
  type: "group",
  key: "quote",
  label: L("Quotation", "الاقتباس"),
  fields: [
    text("text", L("Quotation text", "نص الاقتباس"), { required: true, multiline: true, max: 400 }),
    {
      type: "optional",
      key: "attribution",
      label: L("Attribution", "نسبة الاقتباس"),
      enableLabel: L("Show an attribution (only once the doctor has approved the wording)", "إظهار اسم القائل (بعد اعتماد الطبيب للصياغة فقط)"),
      field: text("attribution", L("Attribution", "نسبة الاقتباس"), { required: true, max: 80 }),
    },
    placeholder,
  ],
};

const seo: Field[] = [
  text("title", L("Page title (browser tab and search results)", "عنوان الصفحة (في المتصفح ونتائج البحث)"), {
    required: true,
    max: 70,
  }),
  text("description", L("Search result description", "الوصف في نتائج البحث"), { required: true, multiline: true, max: 170 }),
  image(
    "shareImage",
    L("Social sharing image", "صورة المشاركة على مواقع التواصل"),
    false,
    L("Shown when the page is shared. Leave empty to use the site's default image.", "تظهر عند مشاركة الصفحة. اتركها فارغة لاستخدام الصورة الافتراضية."),
  ),
  {
    type: "boolean",
    key: "noindex",
    label: L("Hide this page from search engines", "إخفاء هذه الصفحة عن محركات البحث"),
    help: L(
      "Indexing stays off for the whole site until the launch setting is enabled.",
      "تبقى الفهرسة متوقفة للموقع كله حتى تفعيل إعداد الإطلاق.",
    ),
  },
];

const hero: Field[] = [
  eyebrow,
  text("title", L("Title", "العنوان"), { required: true, max: 90 }),
  text("titleAccent", L("Highlighted end of the title", "الجزء المميّز من العنوان"), { required: true, max: 90 }),
  text("description", L("Description", "الوصف"), { required: true, multiline: true, max: 300 }),
  cta("primaryCta", L("Main button", "الزر الرئيسي")),
  cta("secondaryCta", L("Second button", "الزر الثاني")),
  image("image", L("Background photo", "صورة الخلفية")),
];

const pageHero: Field[] = [
  eyebrow,
  title,
  text("description", L("Description", "الوصف"), { required: true, multiline: true, max: 300 }),
  image("image", L("Background photo", "صورة الخلفية")),
];

const featuredServices = (catalogHelp: Label): Field[] => [
  ...intro,
  {
    type: "references",
    key: "serviceIds",
    catalog: "services",
    count: 5,
    label: L("Featured services (exactly five)", "الخدمات المختارة (خمس بالضبط)"),
    help: catalogHelp,
  },
  cta(),
];

const newId = () => Math.random().toString(36).slice(2, 10);

const journeyIcons: { value: JourneyIcon; label: Label }[] = [
  { value: "consultation", label: L("Consultation", "استشارة") },
  { value: "evaluation", label: L("Evaluation", "تقييم") },
  { value: "discussion", label: L("Discussion", "نقاش") },
  { value: "plan", label: L("Plan", "خطة") },
  { value: "followUp", label: L("Follow-up", "متابعة") },
];

const platforms: { value: SocialPlatform; label: Label }[] = [
  { value: "facebook", label: L("Facebook", "فيسبوك") },
  { value: "instagram", label: L("Instagram", "إنستغرام") },
  { value: "youtube", label: L("YouTube", "يوتيوب") },
];

const phone = (key: string, label: Label): Field => ({
  type: "phone",
  key,
  label,
  help: L(
    "International format without spaces, e.g. +201234567890, plus the number as visitors should see it. Remove it to hide every related button.",
    "بالصيغة الدولية دون مسافات، مثل ‎+201234567890، مع الرقم كما يجب أن يراه الزوار. احذفه لإخفاء كل الأزرار المرتبطة به.",
  ),
});

const labelOf = (item: Json, key: string) => item[key] as Label | string | undefined;

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export type DocumentDef = {
  label: Label;
  description?: Label;
  fields: Field[];
  /** Site-wide settings: administrators only (enforced by the database). */
  adminOnly?: boolean;
  /** A live preview with the website's own components exists. */
  preview?: boolean;
};

export const documents: Record<DocumentKey, DocumentDef> = {
  // ---- Site-wide settings ---------------------------------------------------
  "settings.identity": {
    label: L("Name and description", "الاسم والوصف"),
    description: L("The doctor's name and the short description used in the header and footer.", "اسم الطبيب والوصف المختصر في رأس الصفحة وتذييلها."),
    adminOnly: true,
    fields: [
      text("name", L("Display name", "الاسم المعروض"), { required: true, max: 60 }),
      text("specialty", L("Specialty", "التخصص"), { required: true, max: 40 }),
      text("description", L("Short description (footer)", "وصف مختصر (التذييل)"), { required: true, multiline: true, max: 300 }),
    ],
  },
  "settings.contact": {
    label: L("Contact details", "بيانات التواصل"),
    description: L(
      "Phone and WhatsApp numbers used by every call and WhatsApp button on the site.",
      "رقما الهاتف وواتساب المستخدمان في كل أزرار الاتصال وواتساب في الموقع.",
    ),
    adminOnly: true,
    fields: [
      phone("phone", L("Phone number", "رقم الهاتف")),
      phone("whatsapp", L("WhatsApp number", "رقم واتساب")),
      text("whatsappMessage", L("Default WhatsApp message", "رسالة واتساب الافتراضية"), { required: true, multiline: true, max: 300 }),
    ],
  },
  "settings.socials": {
    label: L("Social media", "مواقع التواصل الاجتماعي"),
    description: L("Profiles shown in the hero and footer. Leave the address empty to hide a platform.", "الحسابات المعروضة في الواجهة والتذييل. اترك العنوان فارغًا لإخفاء المنصة."),
    adminOnly: true,
    fields: [
      {
        type: "list",
        key: "items",
        label: L("Profiles", "الحسابات"),
        max: 3,
        addLabel: L("Add a profile", "إضافة حساب"),
        itemTitle: (item) => labelOf(item, "label"),
        newItem: () => ({ platform: "facebook", label: { en: "", ar: "" }, url: "" }),
        fields: [
          { type: "select", key: "platform", label: L("Platform", "المنصة"), options: platforms },
          text("label", L("Name", "الاسم"), { required: true, max: 30 }),
          plain("url", L("Profile address (https://…)", "عنوان الحساب (‎https://…)"), { format: "url" }),
          placeholder,
        ],
      },
    ],
  },
  "settings.navigation": {
    label: L("Menu", "القائمة"),
    description: L("Order, labels and visibility of the header and footer menu.", "ترتيب عناصر قائمة الرأس والتذييل وتسمياتها وظهورها."),
    adminOnly: true,
    fields: [
      {
        type: "list",
        key: "items",
        label: L("Menu items", "عناصر القائمة"),
        fixed: true,
        itemTitle: (item) => labelOf(item, "label"),
        newItem: () => ({ route: "home", label: { en: "", ar: "" } }),
        fields: [
          text("label", L("Label", "التسمية"), { required: true, max: 30 }),
          { type: "boolean", key: "hidden", label: L("Hide from the menu", "إخفاء من القائمة") },
        ],
      },
    ],
  },
  "settings.quickActions": {
    label: L("Contact shortcuts", "اختصارات التواصل"),
    description: L("Header booking button and the floating WhatsApp and call buttons.", "زر الحجز في الرأس وزرّا واتساب والاتصال العائمان."),
    adminOnly: true,
    fields: [
      { type: "boolean", key: "headerBookButton", label: L("Show the “Book a consultation” button in the header", "إظهار زر «احجز استشارة» في الرأس") },
      { type: "boolean", key: "floatingWhatsapp", label: L("Show the floating WhatsApp button", "إظهار زر واتساب العائم") },
      { type: "boolean", key: "floatingPhone", label: L("Show the floating call button", "إظهار زر الاتصال العائم") },
    ],
  },
  "settings.footer": {
    label: L("Footer", "التذييل"),
    adminOnly: true,
    fields: [
      text("navigationHeading", L("Menu column heading", "عنوان عمود القائمة"), { required: true, max: 30 }),
      text("contactHeading", L("Contact column heading", "عنوان عمود التواصل"), { required: true, max: 30 }),
      text("followHeading", L("Social column heading", "عنوان عمود المتابعة"), { required: true, max: 30 }),
      text("disclaimer", L("Medical disclaimer", "إخلاء المسؤولية الطبية"), { required: true, multiline: true, max: 400 }),
      text("copyright", L("Copyright line", "سطر حقوق النشر"), {
        required: true,
        max: 120,
        help: L("{year} is replaced with the current year.", "يُستبدل {year} بالسنة الحالية."),
      }),
    ],
  },
  "settings.ui": {
    label: L("Interface labels", "تسميات الواجهة"),
    description: L(
      "Small texts used across the site: menu labels, button texts, accessibility labels and messages.",
      "النصوص الصغيرة المستخدمة في الموقع: تسميات القوائم والأزرار ونصوص إمكانية الوصول والرسائل.",
    ),
    adminOnly: true,
    fields: (
      [
        ["skipToContent", "Skip link (keyboard users)", "رابط التخطي (لمستخدمي لوحة المفاتيح)"],
        ["mainNavigation", "Main menu name (screen readers)", "اسم القائمة الرئيسية (قارئات الشاشة)"],
        ["footerNavigation", "Footer menu name (screen readers)", "اسم قائمة التذييل (قارئات الشاشة)"],
        ["openMenu", "Open menu", "فتح القائمة"],
        ["closeMenu", "Close menu", "إغلاق القائمة"],
        ["chooseLanguage", "Language switcher name", "اسم مبدّل اللغة"],
        ["comingSoon", "“Soon” tag", "وسم «قريبًا»"],
        ["opensInNewTab", "“Opens in a new tab” (screen readers)", "«يفتح في علامة تبويب جديدة» (قارئات الشاشة)"],
        ["playVideo", "Play video", "تشغيل الفيديو"],
        ["videoComingSoon", "Video coming soon", "الفيديو قريبًا"],
        ["bookConsultation", "Header booking button", "زر الحجز في الرأس"],
        ["contactPanel", "Contact panel name (screen readers)", "اسم لوحة التواصل (قارئات الشاشة)"],
        ["phone", "“Phone”", "«الهاتف»"],
        ["whatsapp", "“WhatsApp”", "«واتساب»"],
        ["backToTop", "Back to top", "العودة إلى الأعلى"],
        ["scrollHint", "Swipe hint (screen readers)", "تلميح التمرير (قارئات الشاشة)"],
        ["homeLink", "Logo link name (screen readers)", "اسم رابط الشعار (قارئات الشاشة)"],
        ["ratingLabel", "Star rating (screen readers, {rating} = number)", "التقييم بالنجوم (قارئات الشاشة، {rating} = الرقم)"],
        ["ratingPending", "“Rating pending”", "«بانتظار التقييم»"],
        ["faqTopics", "FAQ topics heading", "عنوان موضوعات الأسئلة"],
        ["breadcrumb", "Breadcrumb name (screen readers)", "اسم مسار التنقل (قارئات الشاشة)"],
        ["close", "Close", "إغلاق"],
        ["viewDetails", "View details", "عرض التفاصيل"],
        ["readArticle", "Read article", "اقرأ المقال"],
        ["previous", "Previous", "السابق"],
        ["next", "Next", "التالي"],
        ["enlarge", "View larger", "عرض بحجم أكبر"],
        ["certificatePending", "Certificate image coming soon", "صورة الشهادة قريبًا"],
        ["askAboutService", "Ask about a service on WhatsApp", "الاستفسار عن خدمة عبر واتساب"],
        ["askAboutServiceMessage", "Service enquiry message ({service} = name)", "رسالة الاستفسار عن خدمة ({service} = الاسم)"],
        ["reviewedBy", "Medical reviewer line ({name} = name)", "سطر المراجع الطبي ({name} = الاسم)"],
        ["articleDisclaimer", "Article disclaimer", "إخلاء مسؤولية المقالات"],
        ["quickContact", "Floating buttons name (screen readers)", "اسم الأزرار العائمة (قارئات الشاشة)"],
        ["callClinic", "Call the clinic", "اتصل بالعيادة"],
        ["chatOnWhatsapp", "Chat on WhatsApp", "تواصل عبر واتساب"],
      ] as const
    ).map(([key, en, ar]) => text(key, L(en, ar), { required: true, max: 200, multiline: key === "articleDisclaimer" })),
  },

  // ---- Shared content ----------------------------------------------------------
  "shared.cta": {
    label: L("Consultation card", "بطاقة حجز الاستشارة"),
    description: L(
      "The “Book a consultation” card at the end of the Home, About and Services pages.",
      "بطاقة «احجز استشارتك» في نهاية الصفحة الرئيسية وصفحة الطبيب وصفحة الخدمات.",
    ),
    preview: true,
    fields: [
      ...intro,
      text("whatsappLabel", L("WhatsApp button", "زر واتساب"), { required: true, max: 40 }),
      text("callLabel", L("Call button", "زر الاتصال"), { required: true, max: 40 }),
      image("image", L("Photo", "الصورة")),
    ],
  },
  "shared.introVideo": {
    label: L("Introduction video", "فيديو التعريف"),
    description: L("Shown on the homepage and the About page.", "يظهر في الصفحة الرئيسية وصفحة الطبيب."),
    preview: true,
    fields: [
      text("title", L("Video title", "عنوان الفيديو"), { required: true, max: 100 }),
      { type: "video", key: "source", label: L("Video", "الفيديو") },
      image("poster", L("Cover image (shown before playing)", "صورة الغلاف (قبل التشغيل)")),
      plain("duration", L("Duration (e.g. 3:45)", "المدة (مثل 3:45)"), { max: 8 }),
      placeholder,
    ],
  },

  // ---- Homepage -------------------------------------------------------------
  "home.seo": {
    label: L("Search & sharing", "البحث والمشاركة"),
    fields: [
      ...seo,
      text("ogImageAlt", L("Default sharing image description", "وصف صورة المشاركة الافتراضية"), { required: true, max: 120 }),
    ],
  },
  "home.layout": {
    label: L("Section order", "ترتيب الأقسام"),
    fields: [
      {
        type: "layout",
        key: "sections",
        label: L("Sections below the hero", "الأقسام أسفل الواجهة"),
        sections: [
          { id: "introVideo", label: L("Introduction video", "فيديو التعريف") },
          { id: "about", label: L("About the doctor", "عن الطبيب") },
          { id: "statistics", label: L("Statistics", "الأرقام") },
          { id: "specialties", label: L("Featured specialties", "التخصصات المختارة") },
          { id: "treatments", label: L("Featured treatments", "العلاجات المختارة") },
          { id: "journey", label: L("Patient journey", "رحلة المريض") },
          { id: "whyChoose", label: L("Why choose", "لماذا تختار") },
          { id: "videos", label: L("Featured videos", "الفيديوهات المختارة") },
          { id: "reviewsFaq", label: L("Reviews & FAQ", "الآراء والأسئلة") },
          { id: "cta", label: L("Consultation card", "بطاقة الاستشارة") },
        ],
      },
    ],
  },
  "home.hero": { label: L("Hero", "الواجهة"), preview: true, fields: hero },
  "home.introVideo": {
    label: L("Introduction video section", "قسم فيديو التعريف"),
    description: L("Texts around the video. The video itself is shared with the About page.", "النصوص حول الفيديو. الفيديو نفسه مشترك مع صفحة الطبيب."),
    preview: true,
    fields: intro,
  },
  "home.about": {
    label: L("About the doctor", "عن الطبيب"),
    preview: true,
    fields: [
      eyebrow,
      title,
      { type: "lines", key: "paragraphs", label: L("Paragraphs", "الفقرات"), required: true },
      cta(),
      image("portrait", L("Portrait", "الصورة الشخصية")),
      placeholder,
    ],
  },
  "home.statistics": {
    label: L("Statistics", "الأرقام"),
    description: L("Only publish verified figures.", "انشر الأرقام الموثّقة فقط."),
    preview: true,
    fields: [
      eyebrow,
      title,
      {
        type: "list",
        key: "items",
        label: L("Figures", "الأرقام"),
        min: 1,
        max: 4,
        addLabel: L("Add a figure", "إضافة رقم"),
        itemTitle: (item) => labelOf(item, "label"),
        newItem: () => ({ id: newId(), value: 0, label: { en: "", ar: "" }, isPlaceholder: true }),
        fields: [
          { type: "number", key: "value", label: L("Number", "الرقم"), min: 0, integer: true },
          plain("suffix", L("After the number (e.g. +)", "بعد الرقم (مثل +)"), { max: 3 }),
          text("label", L("Label", "التسمية"), { required: true, max: 60 }),
          placeholder,
        ],
      },
    ],
  },
  "home.specialties": {
    label: L("Featured specialties", "التخصصات المختارة"),
    preview: true,
    fields: featuredServices(L("The cards come from the Services catalog.", "تأتي البطاقات من قائمة الخدمات.")),
  },
  "home.treatments": {
    label: L("Featured treatments", "العلاجات المختارة"),
    preview: true,
    fields: featuredServices(L("The cards come from the Services catalog.", "تأتي البطاقات من قائمة الخدمات.")),
  },
  "home.journey": {
    label: L("Patient journey", "رحلة المريض"),
    preview: true,
    fields: [
      ...intro,
      {
        type: "list",
        key: "steps",
        label: L("Steps", "الخطوات"),
        min: 2,
        max: 6,
        addLabel: L("Add a step", "إضافة خطوة"),
        itemTitle: (item) => labelOf(item, "title"),
        newItem: () => ({ id: newId(), icon: "consultation", title: { en: "", ar: "" }, description: { en: "", ar: "" } }),
        fields: [
          { type: "select", key: "icon", label: L("Icon", "الأيقونة"), options: journeyIcons },
          text("title", L("Title", "العنوان"), { required: true, max: 60 }),
          text("description", L("Description", "الوصف"), { required: true, multiline: true, max: 200 }),
        ],
      },
      text("note", L("Note under the steps", "ملاحظة أسفل الخطوات"), { required: true, max: 160 }),
      cta(),
    ],
  },
  "home.whyChoose": {
    label: L("Why choose", "لماذا تختار"),
    preview: true,
    fields: [
      ...intro,
      {
        type: "list",
        key: "principles",
        label: L("Principles", "المبادئ"),
        min: 1,
        max: 6,
        addLabel: L("Add a principle", "إضافة مبدأ"),
        itemTitle: (item) => labelOf(item, "title"),
        newItem: () => ({ id: newId(), title: { en: "", ar: "" }, description: { en: "", ar: "" } }),
        fields: [
          text("title", L("Title", "العنوان"), { required: true, max: 60 }),
          text("description", L("Description", "الوصف"), { required: true, multiline: true, max: 200 }),
        ],
      },
      image("image", L("Photo", "الصورة")),
      text("caption", L("Caption on the photo", "التعليق على الصورة"), { required: true, max: 120 }),
      placeholder,
    ],
  },
  "home.videos": {
    label: L("Featured videos", "الفيديوهات المختارة"),
    description: L(
      "The cards are the three most important videos: the first three in the Videos list.",
      "البطاقات هي أهم ثلاثة فيديوهات: أول ثلاثة في قائمة الفيديوهات.",
    ),
    preview: true,
    fields: [...intro, cta()],
  },
  "home.reviews": {
    label: L("Reviews (homepage)", "الآراء (الصفحة الرئيسية)"),
    description: L(
      "The cards are the six most important reviews: the first six in the Reviews list. The button sits under the reviews and FAQ.",
      "البطاقات هي أهم ستة آراء: أول ستة في قائمة الآراء. ويقع الزر أسفل الآراء والأسئلة.",
    ),
    preview: true,
    fields: [...intro, cta()],
  },
  "home.faq": {
    label: L("FAQ (homepage)", "الأسئلة الشائعة (الصفحة الرئيسية)"),
    preview: true,
    fields: [
      ...intro,
      {
        type: "references",
        key: "faqIds",
        catalog: "faqs",
        min: 1,
        max: 10,
        label: L("Questions shown", "الأسئلة المعروضة"),
        help: L("Picked from the FAQ catalog; edits there update both pages.", "تُختار من قائمة الأسئلة؛ أي تعديل هناك يظهر في الصفحتين."),
      },
    ],
  },

  // ---- About the Doctor -----------------------------------------------------
  "about.seo": { label: L("Search & sharing", "البحث والمشاركة"), fields: seo },
  "about.layout": {
    label: L("Section order", "ترتيب الأقسام"),
    fields: [
      {
        type: "layout",
        key: "sections",
        label: L("Sections below the hero", "الأقسام أسفل الواجهة"),
        sections: [
          { id: "intro", label: L("Introduction video & quote", "فيديو التعريف والاقتباس") },
          { id: "specialties", label: L("Featured specialties", "التخصصات المختارة") },
          { id: "career", label: L("Career timeline", "المسيرة المهنية") },
          { id: "certificates", label: L("Certificates", "الشهادات") },
          { id: "philosophy", label: L("Philosophy of care", "فلسفة الرعاية") },
          { id: "cta", label: L("Consultation card", "بطاقة الاستشارة") },
        ],
      },
    ],
  },
  "about.hero": { label: L("Hero", "الواجهة"), preview: true, fields: hero },
  "about.intro": {
    label: L("Introduction quote", "اقتباس التعريف"),
    description: L("Beside the shared introduction video.", "بجانب فيديو التعريف المشترك."),
    preview: true,
    fields: [eyebrow, quote],
  },
  "about.specialties": {
    label: L("Featured specialties", "التخصصات المختارة"),
    preview: true,
    fields: featuredServices(
      L("The same records as on the homepage and the Services page.", "هي نفس السجلات في الصفحة الرئيسية وصفحة الخدمات."),
    ),
  },
  "about.career": {
    label: L("Career timeline heading", "عنوان المسيرة المهنية"),
    description: L("The milestones are edited in “Career timeline”.", "تُحرَّر المحطات في «المسيرة المهنية»."),
    fields: intro,
  },
  "about.certificates": {
    label: L("Certificates heading", "عنوان الشهادات"),
    description: L("The certificates are edited in “Certificates”.", "تُحرَّر الشهادات في «الشهادات»."),
    fields: intro,
  },
  "about.philosophy": {
    label: L("Philosophy of care", "فلسفة الرعاية"),
    preview: true,
    fields: [eyebrow, quote, image("portrait", L("Portrait", "الصورة الشخصية"))],
  },

  // ---- Services ------------------------------------------------------------
  "services.seo": { label: L("Search & sharing", "البحث والمشاركة"), fields: seo },
  "services.layout": {
    label: L("Section order", "ترتيب الأقسام"),
    fields: [
      {
        type: "layout",
        key: "sections",
        label: L("Sections below the hero", "الأقسام أسفل الواجهة"),
        sections: [
          { id: "groups", label: L("Service groups", "مجموعات الخدمات") },
          { id: "cta", label: L("Consultation card", "بطاقة الاستشارة") },
        ],
      },
    ],
  },
  "services.hero": { label: L("Hero", "الواجهة"), preview: true, fields: pageHero },

  // ---- Videos ----------------------------------------------------------------
  "videos.seo": { label: L("Search & sharing", "البحث والمشاركة"), fields: seo },
  "videos.hero": { label: L("Hero", "الواجهة"), preview: true, fields: pageHero },
  "videos.list": {
    label: L("Video list", "قائمة الفيديوهات"),
    fields: [
      text("listTitle", L("List heading (for screen readers)", "عنوان القائمة (لقارئات الشاشة)"), { required: true, max: 60 }),
    ],
  },

  // ---- Reviews & FAQs --------------------------------------------------------
  "reviews.seo": { label: L("Search & sharing", "البحث والمشاركة"), fields: seo },
  "reviews.layout": {
    label: L("Section order", "ترتيب الأقسام"),
    fields: [
      {
        type: "layout",
        key: "sections",
        label: L("Sections below the hero", "الأقسام أسفل الواجهة"),
        sections: [
          { id: "reviews", label: L("Patient reviews", "آراء المرضى") },
          { id: "faq", label: L("Frequently asked questions", "الأسئلة الشائعة") },
        ],
      },
    ],
  },
  "reviews.hero": { label: L("Hero", "الواجهة"), preview: true, fields: pageHero },
  "reviews.intro": { label: L("Reviews heading", "عنوان الآراء"), fields: intro },
  "reviews.faq": {
    label: L("FAQ heading & contact card", "عنوان الأسئلة وبطاقة التواصل"),
    fields: [
      ...intro,
      {
        type: "group",
        key: "contact",
        label: L("“Still have a question?” card", "بطاقة «لديك سؤال آخر؟»"),
        fields: [
          text("title", L("Title", "العنوان"), { required: true, max: 60 }),
          text("text", L("Text", "النص"), { required: true, max: 160 }),
          text("whatsappMessage", L("WhatsApp message", "رسالة واتساب"), { required: true, max: 200 }),
          text("contactLabel", L("Contact page button", "زر صفحة التواصل"), { required: true, max: 40 }),
        ],
      },
    ],
  },

  // ---- Articles ----------------------------------------------------------------
  "articles.seo": { label: L("Search & sharing", "البحث والمشاركة"), fields: seo },
  "articles.hero": { label: L("Hero", "الواجهة"), preview: true, fields: pageHero },
  "articles.settings": {
    label: L("Featured article", "المقال المميّز"),
    fields: [
      { type: "reference", key: "featuredId", catalog: "articles", required: true, label: L("Featured article (wide card)", "المقال المميّز (البطاقة العريضة)") },
      text("featuredLabel", L("Featured label", "تسمية المقال المميّز"), { required: true, max: 40 }),
      text("moreTitle", L("Heading above the other articles", "العنوان فوق بقية المقالات"), { required: true, max: 60 }),
    ],
  },

  // ---- Contact ---------------------------------------------------------------
  "contact.seo": { label: L("Search & sharing", "البحث والمشاركة"), fields: seo },
  "contact.hero": { label: L("Hero", "الواجهة"), preview: true, fields: pageHero },
  "contact.form": {
    label: L("Contact form", "نموذج التواصل"),
    fields: [
      title,
      text("description", L("Introduction", "المقدمة"), { required: true, multiline: true, max: 300 }),
      {
        type: "group",
        key: "fields",
        label: L("Field labels", "تسميات الحقول"),
        fields: [
          text("name", L("Name", "الاسم"), { required: true, max: 40 }),
          text("phone", L("Phone", "الهاتف"), { required: true, max: 40 }),
          text("phoneHint", L("Phone hint", "تلميح الهاتف"), { required: true, max: 80 }),
          text("email", L("Email", "البريد الإلكتروني"), { required: true, max: 40 }),
          text("topic", L("Topic", "الموضوع"), { required: true, max: 40 }),
          text("message", L("Message", "الرسالة"), { required: true, max: 40 }),
          text("messageHint", L("Message hint", "تلميح الرسالة"), { required: true, max: 120 }),
          text("consent", L("Consent checkbox", "خانة الموافقة"), { required: true, max: 160 }),
          text("required", L("“Required” marker", "علامة «مطلوب»"), { required: true, max: 20 }),
        ],
      },
      {
        type: "group",
        key: "topics",
        label: L("Topics", "الموضوعات"),
        fields: [
          text("consultation", L("Consultation", "استشارة"), { required: true, max: 40 }),
          text("secondOpinion", L("Second opinion", "رأي ثانٍ"), { required: true, max: 40 }),
          text("question", L("Question", "استفسار"), { required: true, max: 40 }),
          text("other", L("Other", "أخرى"), { required: true, max: 40 }),
        ],
      },
      {
        type: "group",
        key: "errors",
        label: L("Validation messages", "رسائل التحقق"),
        fields: [
          text("required", L("Required field", "حقل مطلوب"), { required: true, max: 120 }),
          text("phone", L("Invalid phone", "هاتف غير صحيح"), { required: true, max: 120 }),
          text("email", L("Invalid email", "بريد غير صحيح"), { required: true, max: 120 }),
          text("consent", L("Consent missing", "الموافقة ناقصة"), { required: true, max: 120 }),
          text("summary", L("Error summary", "ملخص الأخطاء"), { required: true, max: 120 }),
          text("failed", L("Sending failed", "فشل الإرسال"), { required: true, multiline: true, max: 240 }),
        ],
      },
      {
        type: "group",
        key: "whatsappMode",
        label: L("Without a form service (WhatsApp hand-off)", "دون خدمة نماذج (التحويل إلى واتساب)"),
        fields: [
          text("note", L("Note", "ملاحظة"), { required: true, max: 160 }),
          text("submit", L("Button", "الزر"), { required: true, max: 40 }),
          text("success", L("After opening WhatsApp", "بعد فتح واتساب"), { required: true, multiline: true, max: 240 }),
          text("heading", L("First line of the message", "السطر الأول من الرسالة"), { required: true, max: 80 }),
        ],
      },
      {
        type: "group",
        key: "endpointMode",
        label: L("With a form service", "مع خدمة نماذج"),
        fields: [
          text("note", L("Note", "ملاحظة"), { required: true, max: 160 }),
          text("submit", L("Button", "الزر"), { required: true, max: 40 }),
          text("sending", L("While sending", "أثناء الإرسال"), { required: true, max: 40 }),
          text("success", L("Sent", "تم الإرسال"), { required: true, multiline: true, max: 240 }),
        ],
      },
    ],
  },
  "contact.actions": {
    label: L("WhatsApp & call buttons", "زرّا واتساب والاتصال"),
    fields: [
      ...intro,
      text("whatsappLabel", L("WhatsApp button", "زر واتساب"), { required: true, max: 40 }),
      text("callLabel", L("Call button", "زر الاتصال"), { required: true, max: 40 }),
    ],
  },
};

// ---------------------------------------------------------------------------
// Catalogs
// ---------------------------------------------------------------------------

export type CatalogDef = {
  label: Label;
  singular: Label;
  description?: Label;
  table: string;
  /** Admin page listing this catalog. */
  path: string;
  /** Entries belong to an entry of this catalog (services → groups). */
  parent?: CatalogKey;
  fields: Field[];
  itemTitle: (content: Json) => Label | string | undefined;
  newItem: () => Json;
  /** Order matters on the site (importance or display order). */
  orderHelp?: Label;
};

export const catalogs: Record<CatalogKey, CatalogDef> = {
  serviceGroups: {
    label: L("Service groups", "مجموعات الخدمات"),
    singular: L("service group", "مجموعة خدمات"),
    description: L(
      "Each group is a section of the Services page with its own heading and cards. The id is also its link anchor (e.g. /services/#treatments).",
      "كل مجموعة قسم مستقل في صفحة الخدمات بعنوانه وبطاقاته. والمعرّف هو رابط القسم أيضًا (مثل ‎/services/#treatments).",
    ),
    table: "cms_service_groups",
    path: "/admin/services/?tab=groups",
    fields: [...intro],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({ eyebrow: { en: "", ar: "" }, title: { en: "", ar: "" }, description: { en: "", ar: "" } }),
    orderHelp: L("Groups appear on the Services page in this order.", "تظهر المجموعات في صفحة الخدمات بهذا الترتيب."),
  },
  services: {
    label: L("Services", "الخدمات"),
    singular: L("service", "خدمة"),
    description: L(
      "One record per service: its card, its popup and every featured section that shows it.",
      "سجل واحد لكل خدمة: بطاقتها ونافذتها المنبثقة وكل قسم مختار يعرضها.",
    ),
    table: "cms_services",
    path: "/admin/services/",
    parent: "serviceGroups",
    fields: [
      text("title", L("Title", "العنوان"), { required: true, max: 60 }),
      text("summary", L("Card summary", "ملخص البطاقة"), { required: true, multiline: true, max: 200 }),
      image("image", L("Card image", "صورة البطاقة")),
      { type: "blocks", key: "details", label: L("Popup content", "محتوى النافذة المنبثقة"), required: true },
      placeholder,
    ],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({
      title: { en: "", ar: "" },
      summary: { en: "", ar: "" },
      image: { src: "", alt: { en: "", ar: "" } },
      details: [],
      isPlaceholder: true,
    }),
    orderHelp: L("Cards appear in their group in this order.", "تظهر البطاقات داخل مجموعتها بهذا الترتيب."),
  },
  videos: {
    label: L("Videos", "الفيديوهات"),
    singular: L("video", "فيديو"),
    description: L(
      "The Videos page shows every published video; the homepage shows the first three.",
      "تعرض صفحة الفيديوهات كل الفيديوهات المنشورة، وتعرض الصفحة الرئيسية أول ثلاثة.",
    ),
    table: "cms_videos",
    path: "/admin/videos/",
    fields: [
      text("title", L("Title", "العنوان"), { required: true, max: 100 }),
      { type: "video", key: "source", label: L("Video", "الفيديو") },
      image("poster", L("Cover image (portrait 9:16 works best)", "صورة الغلاف (الطولية 9:16 أفضل)")),
      plain("duration", L("Duration (e.g. 3:45)", "المدة (مثل 3:45)"), { max: 8 }),
      placeholder,
    ],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({ title: { en: "", ar: "" }, poster: { src: "", alt: { en: "", ar: "" } }, source: null, duration: null, isPlaceholder: true }),
    orderHelp: L("Ordered by importance: the first three appear on the homepage.", "مرتبة حسب الأهمية: تظهر الثلاثة الأولى في الصفحة الرئيسية."),
  },
  reviews: {
    label: L("Patient reviews", "آراء المرضى"),
    singular: L("review", "رأي"),
    description: L(
      "Only publish reviews with the patient's documented consent and their own rating.",
      "لا تنشر إلا الآراء الموثّقة بموافقة المريض وبتقييمه هو.",
    ),
    table: "cms_reviews",
    path: "/admin/reviews/",
    fields: [
      text("text", L("Review text", "نص الرأي"), { required: true, multiline: true, max: 600 }),
      {
        type: "optional",
        key: "reviewer",
        label: L("Reviewer", "صاحب الرأي"),
        enableLabel: L("Show a reviewer label (initials or a name, only with consent)", "إظهار اسم صاحب الرأي (الأحرف الأولى أو الاسم، بالموافقة فقط)"),
        field: text("reviewer", L("Reviewer label", "اسم صاحب الرأي"), { required: true, max: 60 }),
      },
      { type: "rating", key: "rating", label: L("Rating given by the patient", "التقييم الذي منحه المريض") },
      placeholder,
    ],
    itemTitle: (c) => labelOf(c, "text"),
    newItem: () => ({ text: { en: "", ar: "" }, reviewer: null, rating: null, isPlaceholder: false }),
    orderHelp: L("Ordered by importance: the first six appear on the homepage.", "مرتبة حسب الأهمية: تظهر الستة الأولى في الصفحة الرئيسية."),
  },
  faqCategories: {
    label: L("FAQ topics", "موضوعات الأسئلة"),
    singular: L("topic", "موضوع"),
    table: "cms_faq_categories",
    path: "/admin/faq/?tab=topics",
    fields: [text("title", L("Topic title", "عنوان الموضوع"), { required: true, max: 60 }), placeholder],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({ title: { en: "", ar: "" }, isPlaceholder: true }),
    orderHelp: L("Topics appear on the Reviews & FAQs page in this order.", "تظهر الموضوعات في صفحة الآراء والأسئلة بهذا الترتيب."),
  },
  faqs: {
    label: L("Questions", "الأسئلة"),
    singular: L("question", "سؤال"),
    description: L(
      "Each question belongs to a topic. The homepage shows a selection of them.",
      "ينتمي كل سؤال إلى موضوع، وتعرض الصفحة الرئيسية مجموعة مختارة منها.",
    ),
    table: "cms_faqs",
    path: "/admin/faq/",
    parent: "faqCategories",
    fields: [
      text("question", L("Question", "السؤال"), { required: true, max: 160 }),
      text("answer", L("Answer", "الإجابة"), { required: true, multiline: true, max: 1200 }),
    ],
    itemTitle: (c) => labelOf(c, "question"),
    newItem: () => ({ question: { en: "", ar: "" }, answer: { en: "", ar: "" } }),
    orderHelp: L("Questions appear in their topic in this order.", "تظهر الأسئلة داخل موضوعها بهذا الترتيب."),
  },
  articles: {
    label: L("Articles", "المقالات"),
    singular: L("article", "مقال"),
    description: L(
      "Medical articles go live only with a named clinical reviewer (placeholders excepted).",
      "لا تُنشر المقالات الطبية إلا باسم المراجع الطبي (باستثناء المحتوى المؤقت).",
    ),
    table: "cms_articles",
    path: "/admin/articles/",
    fields: [
      text("title", L("Title", "العنوان"), { required: true, max: 120 }),
      text("category", L("Category", "التصنيف"), { required: true, max: 40 }),
      text("excerpt", L("Excerpt (card)", "المقتطف (البطاقة)"), { required: true, multiline: true, max: 300 }),
      image("image", L("Image", "الصورة")),
      { type: "blocks", key: "body", label: L("Article text", "نص المقال"), required: true },
      {
        type: "optional",
        key: "reviewedBy",
        label: L("Medical reviewer", "المراجع الطبي"),
        enableLabel: L("Reviewed by a clinician (required to publish a real article)", "راجعه طبيب (مطلوب لنشر مقال حقيقي)"),
        field: text("reviewedBy", L("Reviewer name", "اسم المراجع"), { required: true, max: 80 }),
      },
      placeholder,
    ],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({
      title: { en: "", ar: "" },
      category: { en: "", ar: "" },
      excerpt: { en: "", ar: "" },
      image: { src: "", alt: { en: "", ar: "" } },
      body: [],
      reviewedBy: null,
      isPlaceholder: true,
    }),
    orderHelp: L("The order of the article cards (the featured article is chosen separately).", "ترتيب بطاقات المقالات (يُختار المقال المميّز بشكل منفصل)."),
  },
  careerMilestones: {
    label: L("Career timeline", "المسيرة المهنية"),
    singular: L("milestone", "محطة"),
    description: L("Enter only verified details: institutions, dates and roles.", "أدخل التفاصيل الموثّقة فقط: الجهات والتواريخ والأدوار."),
    table: "cms_career_milestones",
    path: "/admin/career/",
    fields: [
      text("period", L("Period", "الفترة"), { required: true, max: 40 }),
      text("title", L("Title", "العنوان"), { required: true, max: 80 }),
      text("organization", L("Institution", "الجهة"), { required: true, max: 100 }),
      text("description", L("Description", "الوصف"), { multiline: true, max: 300 }),
      placeholder,
    ],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({ period: { en: "", ar: "" }, title: { en: "", ar: "" }, organization: { en: "", ar: "" }, isPlaceholder: true }),
    orderHelp: L("Milestones appear on the timeline in this order.", "تظهر المحطات على الخط الزمني بهذا الترتيب."),
  },
  certificates: {
    label: L("Certificates", "الشهادات"),
    singular: L("certificate", "شهادة"),
    description: L("Upload scans of genuine certificates only.", "ارفع صورًا ممسوحة للشهادات الحقيقية فقط."),
    table: "cms_certificates",
    path: "/admin/certificates/",
    fields: [
      text("title", L("Certificate title (also its alt text)", "عنوان الشهادة (ونصها البديل)"), { required: true, max: 120 }),
      image("image", L("Certificate scan", "صورة الشهادة"), false),
      placeholder,
    ],
    itemTitle: (c) => labelOf(c, "title"),
    newItem: () => ({ title: { en: "", ar: "" }, image: null, isPlaceholder: true }),
    orderHelp: L("Certificates appear in the gallery in this order.", "تظهر الشهادات في المعرض بهذا الترتيب."),
  },
};

export const catalogKeys = Object.keys(catalogs) as CatalogKey[];

export const tableToCatalog = Object.fromEntries(catalogKeys.map((key) => [catalogs[key].table, key])) as Record<string, CatalogKey>;

// ---------------------------------------------------------------------------
// Pages (for the Pages overview)
// ---------------------------------------------------------------------------

export type PageSection = {
  /** Layout id when the section can be moved or hidden. */
  id?: string;
  label: Label;
  documents: DocumentKey[];
  catalogs?: CatalogKey[];
};

export type PageDef = {
  key: PageKey;
  /** Path below `/en/` and `/ar/`. */
  path: string;
  label: Label;
  seo: DocumentKey;
  layout?: DocumentKey;
  sections: PageSection[];
};

export const pages: PageDef[] = [
  {
    key: "home",
    path: "",
    label: L("Home", "الرئيسية"),
    seo: "home.seo",
    layout: "home.layout",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["home.hero"] },
      { id: "introVideo", label: L("Introduction video", "فيديو التعريف"), documents: ["home.introVideo", "shared.introVideo"] },
      { id: "about", label: L("About the doctor", "عن الطبيب"), documents: ["home.about"] },
      { id: "statistics", label: L("Statistics", "الأرقام"), documents: ["home.statistics"] },
      { id: "specialties", label: L("Featured specialties", "التخصصات المختارة"), documents: ["home.specialties"], catalogs: ["services"] },
      { id: "treatments", label: L("Featured treatments", "العلاجات المختارة"), documents: ["home.treatments"], catalogs: ["services"] },
      { id: "journey", label: L("Patient journey", "رحلة المريض"), documents: ["home.journey"] },
      { id: "whyChoose", label: L("Why choose", "لماذا تختار"), documents: ["home.whyChoose"] },
      { id: "videos", label: L("Featured videos", "الفيديوهات المختارة"), documents: ["home.videos"], catalogs: ["videos"] },
      {
        id: "reviewsFaq",
        label: L("Reviews & FAQ", "الآراء والأسئلة"),
        documents: ["home.reviews", "home.faq"],
        catalogs: ["reviews", "faqs"],
      },
      { id: "cta", label: L("Consultation card", "بطاقة الاستشارة"), documents: ["shared.cta"] },
    ],
  },
  {
    key: "about",
    path: "about/",
    label: L("About the Doctor", "عن الطبيب"),
    seo: "about.seo",
    layout: "about.layout",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["about.hero"] },
      { id: "intro", label: L("Introduction video & quote", "فيديو التعريف والاقتباس"), documents: ["about.intro", "shared.introVideo"] },
      { id: "specialties", label: L("Featured specialties", "التخصصات المختارة"), documents: ["about.specialties"], catalogs: ["services"] },
      { id: "career", label: L("Career timeline", "المسيرة المهنية"), documents: ["about.career"], catalogs: ["careerMilestones"] },
      { id: "certificates", label: L("Certificates", "الشهادات"), documents: ["about.certificates"], catalogs: ["certificates"] },
      { id: "philosophy", label: L("Philosophy of care", "فلسفة الرعاية"), documents: ["about.philosophy"] },
      { id: "cta", label: L("Consultation card", "بطاقة الاستشارة"), documents: ["shared.cta"] },
    ],
  },
  {
    key: "services",
    path: "services/",
    label: L("Services", "الخدمات"),
    seo: "services.seo",
    layout: "services.layout",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["services.hero"] },
      { id: "groups", label: L("Service groups", "مجموعات الخدمات"), documents: [], catalogs: ["serviceGroups", "services"] },
      { id: "cta", label: L("Consultation card", "بطاقة الاستشارة"), documents: ["shared.cta"] },
    ],
  },
  {
    key: "videos",
    path: "videos/",
    label: L("Videos", "الفيديوهات"),
    seo: "videos.seo",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["videos.hero"] },
      { label: L("Video list", "قائمة الفيديوهات"), documents: ["videos.list"], catalogs: ["videos"] },
    ],
  },
  {
    key: "reviews",
    path: "reviews/",
    label: L("Reviews & FAQs", "الآراء والأسئلة الشائعة"),
    seo: "reviews.seo",
    layout: "reviews.layout",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["reviews.hero"] },
      { id: "reviews", label: L("Patient reviews", "آراء المرضى"), documents: ["reviews.intro"], catalogs: ["reviews"] },
      {
        id: "faq",
        label: L("Frequently asked questions", "الأسئلة الشائعة"),
        documents: ["reviews.faq"],
        catalogs: ["faqCategories", "faqs"],
      },
    ],
  },
  {
    key: "articles",
    path: "articles/",
    label: L("Articles", "المقالات"),
    seo: "articles.seo",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["articles.hero"] },
      { label: L("Featured article & list", "المقال المميّز والقائمة"), documents: ["articles.settings"], catalogs: ["articles"] },
    ],
  },
  {
    key: "contact",
    path: "contact/",
    label: L("Contact", "تواصل معنا"),
    seo: "contact.seo",
    sections: [
      { label: L("Hero", "الواجهة"), documents: ["contact.hero"] },
      { label: L("Contact form", "نموذج التواصل"), documents: ["contact.form"] },
      { label: L("WhatsApp & call buttons", "زرّا واتساب والاتصال"), documents: ["contact.actions"] },
    ],
  },
];

/** Settings and shared content, for the Settings overview. */
export const settingsGroups: { label: Label; documents: DocumentKey[] }[] = [
  {
    label: L("Identity & contact", "الهوية والتواصل"),
    documents: ["settings.identity", "settings.contact", "settings.socials", "settings.quickActions"],
  },
  { label: L("Navigation & footer", "التنقل والتذييل"), documents: ["settings.navigation", "settings.footer"] },
  { label: L("Shared sections", "الأقسام المشتركة"), documents: ["shared.cta", "shared.introVideo"] },
  { label: L("Interface", "الواجهة"), documents: ["settings.ui"] },
];

/** The page a document belongs to, for breadcrumbs. */
export function pageOfDocument(key: DocumentKey): PageDef | null {
  return pages.find((page) => page.seo === key || page.layout === key || page.sections.some((s) => s.documents.includes(key))) ?? null;
}
