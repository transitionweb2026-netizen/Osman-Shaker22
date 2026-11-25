/**
 * Site-wide content: identity, contact details, social links, navigation,
 * footer and interface labels — in English and Arabic.
 *
 * Contact details and social links below are PLACEHOLDERS. Replace them with
 * verified details before publication (`npm run check:content` lists them).
 * Set a social `url` to `null` to hide that platform everywhere.
 */
import { ctaImage } from "./media";
import type { SiteContent } from "./types";

export const siteContent: SiteContent = {
  name: { en: "Dr. Othman Shaker", ar: "د. عثمان شاكر" },
  specialty: { en: "Oncology", ar: "طب الأورام" },
  description: {
    en: "Thoughtful oncology care built on clear explanations, individual attention and steady support — from the first consultation to follow-up.",
    ar: "رعاية متخصصة في طب الأورام تقوم على الشرح الواضح والاهتمام الفردي والدعم المستمر، من الاستشارة الأولى وحتى المتابعة.",
  },

  contact: {
    phone: { e164: "+201558884480", display: "01558884480" },
    whatsapp: { e164: "+201558884480", display: "01558884480" },
    whatsappMessage: {
      en: "Hello, I would like to book a consultation with Dr. Othman Shaker.",
      ar: "مرحبًا، أودّ حجز استشارة مع د. عثمان شاكر.",
    },
    clinic: {
      title: { en: "Visit the clinic", ar: "نورونا في العيادة" },
      addressLabel: { en: "Address", ar: "العنوان" },
      address: {
        en: "86 Ahmed El-Zomor St., Zaker Hussein extension, opposite Al-Nahar Al-Wafaa Wal-Amal Hospital, above Sahm Electronics, Nasr City, Cairo",
        ar: "86 شارع أحمد الزمر، امتداد ذاكر حسين، أمام مستشفى النهار الوفاء والأمل، أعلى سهم للأجهزة الإلكترونية، مدينة نصر، القاهرة",
      },
      mapUrl: "https://maps.app.goo.gl/oxncb71FgKVTt1fc9",
      mapLabel: { en: "Open in Google Maps", ar: "افتح الموقع على الخريطة" },
      phonesLabel: { en: "To book, call", ar: "للحجز كلمونا على" },
      phones: [
        { e164: "+20222733017", display: "22733017" },
        { e164: "+2026708818", display: "026708818" },
        { e164: "+201092374994", display: "01092374994" },
        { e164: "+201558884480", display: "01558884480" },
        { e164: "+201555694335", display: "01555694335" },
      ],
      hoursLabel: { en: "Hours", ar: "المواعيد" },
      hours: { en: "Every day except Friday, 7 pm to 10 pm", ar: "جميع أيام الأسبوع من 7 م إلى 10 م، ماعدا الجمعة" },
      feeLabel: { en: "Consultation fee", ar: "سعر الكشف" },
      fee: { en: "500 EGP", ar: "500 جنيه" },
    },
  },

  // Instagram and YouTube stay hidden (empty address) until the doctor's profiles are provided.
  socials: [
    {
      platform: "facebook",
      label: { en: "Facebook", ar: "فيسبوك" },
      url: "https://www.facebook.com/osmanshaker83",
    },
    {
      platform: "instagram",
      label: { en: "Instagram", ar: "إنستغرام" },
      url: "",
    },
    {
      platform: "youtube",
      label: { en: "YouTube", ar: "يوتيوب" },
      url: "",
    },
  ],

  navigation: [
    { route: "home", label: { en: "Home", ar: "الرئيسية" } },
    { route: "about", label: { en: "About the Doctor", ar: "عن الطبيب" } },
    { route: "services", label: { en: "Services", ar: "الخدمات" } },
    { route: "videos", label: { en: "Videos", ar: "الفيديوهات" } },
    { route: "reviews", label: { en: "Reviews & FAQs", ar: "الآراء والأسئلة الشائعة" } },
    { route: "articles", label: { en: "Articles", ar: "المقالات" } },
    { route: "contact", label: { en: "Contact", ar: "تواصل معنا" } },
  ],

  quickActions: {
    headerBookButton: true,
    floatingWhatsapp: true,
    floatingPhone: true,
  },

  footer: {
    navigationHeading: { en: "Explore", ar: "استكشف" },
    contactHeading: { en: "Contact", ar: "التواصل" },
    followHeading: { en: "Follow", ar: "تابعنا" },
    disclaimer: {
      en: "The information on this website is for general education only and is not a substitute for a personal medical consultation.",
      ar: "المعلومات الواردة في هذا الموقع للتثقيف العام فقط، ولا تُغني عن الاستشارة الطبية الشخصية.",
    },
    copyright: {
      en: "© {year} Dr. Othman Shaker. All rights reserved.",
      ar: "© {year} د. عثمان شاكر. جميع الحقوق محفوظة.",
    },
  },

  cta: {
    eyebrow: { en: "Book a consultation", ar: "احجز استشارتك" },
    title: {
      en: "Take the next step with clarity and support",
      ar: "خطوتك التالية، بوضوح ودعم",
    },
    description: {
      en: "Reach out to arrange a consultation — and bring your questions with you.",
      ar: "تواصل معنا لترتيب موعد استشارتك، واحمل معك أسئلتك.",
    },
    whatsappLabel: { en: "Message on WhatsApp", ar: "راسلنا عبر واتساب" },
    callLabel: { en: "Call the clinic", ar: "اتصل بالعيادة" },
    image: ctaImage,
  },

  ui: {
    skipToContent: { en: "Skip to main content", ar: "انتقل إلى المحتوى الرئيسي" },
    mainNavigation: { en: "Main navigation", ar: "التنقل الرئيسي" },
    footerNavigation: { en: "Footer navigation", ar: "روابط التذييل" },
    openMenu: { en: "Open menu", ar: "فتح القائمة" },
    closeMenu: { en: "Close menu", ar: "إغلاق القائمة" },
    chooseLanguage: { en: "Choose language", ar: "اختر اللغة" },
    comingSoon: { en: "Soon", ar: "قريبًا" },
    opensInNewTab: { en: "(opens in a new tab)", ar: "(يفتح في علامة تبويب جديدة)" },
    playVideo: { en: "Play video", ar: "تشغيل الفيديو" },
    videoComingSoon: { en: "Video coming soon", ar: "الفيديو قريبًا" },
    bookConsultation: { en: "Book a consultation", ar: "احجز استشارة" },
    contactPanel: { en: "Contact and social media", ar: "وسائل التواصل" },
    phone: { en: "Phone", ar: "الهاتف" },
    whatsapp: { en: "WhatsApp", ar: "واتساب" },
    backToTop: { en: "Back to top", ar: "العودة إلى الأعلى" },
    scrollHint: { en: "scroll sideways to see more", ar: "مرّر أفقيًا لعرض المزيد" },
    homeLink: { en: "Dr. Othman Shaker — home", ar: "د. عثمان شاكر — الصفحة الرئيسية" },
    ratingLabel: { en: "Rated {rating} out of 5", ar: "التقييم {rating} من ٥" },
    ratingPending: { en: "Rating pending", ar: "بانتظار التقييم" },
    faqTopics: { en: "Topics", ar: "الموضوعات" },
    breadcrumb: { en: "Breadcrumb", ar: "مسار التنقل" },
    close: { en: "Close", ar: "إغلاق" },
    viewDetails: { en: "View details", ar: "عرض التفاصيل" },
    readArticle: { en: "Read article", ar: "اقرأ المقال" },
    previous: { en: "Previous", ar: "السابق" },
    next: { en: "Next", ar: "التالي" },
    enlarge: { en: "View larger", ar: "عرض بحجم أكبر" },
    certificatePending: { en: "Certificate image coming soon", ar: "صورة الشهادة قريبًا" },
    askAboutService: { en: "Ask about this on WhatsApp", ar: "استفسر عبر واتساب" },
    askAboutServiceMessage: {
      en: "Hello, I would like to ask about: {service}",
      ar: "مرحبًا، أودّ الاستفسار عن: {service}",
    },
    reviewedBy: { en: "Medically reviewed by {name}", ar: "مراجعة طبية: {name}" },
    articleDisclaimer: {
      en: "This article provides general information and is not a substitute for personal medical advice.",
      ar: "يقدّم هذا المقال معلومات عامة، ولا يُغني عن الاستشارة الطبية الشخصية.",
    },
    quickContact: { en: "Quick contact", ar: "تواصل سريع" },
    callClinic: { en: "Call the clinic", ar: "اتصل بالعيادة" },
    chatOnWhatsapp: { en: "Chat on WhatsApp", ar: "تواصل عبر واتساب" },
  },
};
