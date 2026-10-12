/**
 * About page content in English and Arabic.
 *
 * PLACEHOLDERS: career milestones, certificates and both quotations are drafts.
 * - Milestones describe general stages only; institutions and dates read
 *   "to be confirmed" until verified details are provided.
 * - Certificates have no image (`image: null`) — a neutral placeholder is shown.
 *   Add scans of the real certificates (see README) and remove `isPlaceholder`.
 * - Quotations stay unattributed (`attribution: null`) until Dr. Othman Shaker
 *   approves the wording.
 */
import { aboutHeroImage, doctorPortrait } from "./media";
import type { AboutPageContent, Certificate } from "./types";
import { introductionVideo } from "./videos";

const toBeConfirmed = { en: "To be confirmed", ar: "قيد التأكيد" };

const certificatePlaceholders: Certificate[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `certificate-${n}`,
  title: { en: `Certificate ${n} (to be provided)`, ar: `الشهادة ${n} (بانتظار التزويد)` },
  image: null,
  isPlaceholder: true,
}));

export const aboutContent: AboutPageContent = {
  seo: {
    title: {
      en: "About Dr. Othman Shaker — Oncology",
      ar: "عن د. عثمان شاكر — طب الأورام",
    },
    description: {
      en: "Dr. Othman Shaker's approach to oncology care, areas of focus, professional journey and philosophy of care.",
      ar: "تعرّف على نهج د. عثمان شاكر في رعاية مرضى الأورام، ومجالات اهتمامه، ومسيرته المهنية، وفلسفته في الرعاية.",
    },
  },

  hero: {
    eyebrow: { en: "About Dr. Othman Shaker", ar: "عن د. عثمان شاكر" },
    title: { en: "Clarity and compassion", ar: "وضوح ورحمة" },
    titleAccent: { en: "at every step of cancer care.", ar: "في كل خطوة من رعاية الأورام." },
    description: {
      en: "Learn about Dr. Othman Shaker's approach to care, his areas of focus and his professional journey.",
      ar: "تعرّف على نهج د. عثمان شاكر في الرعاية، ومجالات اهتمامه، ومسيرته المهنية.",
    },
    primaryCta: { en: "Book a consultation", ar: "احجز استشارة" },
    secondaryCta: { en: "Professional journey", ar: "المسيرة المهنية" },
    image: aboutHeroImage,
  },

  intro: {
    eyebrow: { en: "Approach to care", ar: "نهج الرعاية" },
    quote: {
      text: {
        en: "Good cancer care begins with understanding — of the diagnosis, of the options, and of the person facing them.",
        ar: "تبدأ رعاية الأورام الجيدة بالفهم: فهم التشخيص، وفهم الخيارات، وفهم الإنسان الذي يواجهها.",
      },
      attribution: null,
      isPlaceholder: true,
    },
    video: introductionVideo,
  },

  specialties: {
    eyebrow: { en: "Areas of focus", ar: "مجالات الاهتمام" },
    title: { en: "Featured medical specialties", ar: "أبرز التخصصات الطبية" },
    description: {
      en: "Five areas of oncology care. The full catalog, with detailed information, is on the Services page.",
      ar: "خمسة مجالات في رعاية الأورام، وتجد القائمة الكاملة بالتفاصيل في صفحة الخدمات.",
    },
    // Entries of the services catalog (content/services.ts)
    serviceIds: ["breast", "thoracic", "gastrointestinal", "gynecologic", "hematologic"],
    cta: {
      label: { en: "View all medical specialties", ar: "عرض جميع التخصصات الطبية" },
      route: "servicesSpecialties",
    },
  },

  career: {
    eyebrow: { en: "Professional journey", ar: "المسيرة المهنية" },
    title: { en: "Training and clinical experience", ar: "التأهيل والخبرة السريرية" },
    description: {
      en: "Key stages of Dr. Othman Shaker's education and clinical career.",
      ar: "أبرز محطات التعليم والمسيرة السريرية للدكتور عثمان شاكر.",
    },
    milestones: [
      {
        id: "medical-degree",
        period: toBeConfirmed,
        title: { en: "Medical degree", ar: "الدرجة الجامعية في الطب" },
        organization: { en: "Faculty of medicine — to be confirmed", ar: "كلية الطب — قيد التأكيد" },
        description: {
          en: "Foundational medical education and clinical rotations across specialties.",
          ar: "التعليم الطبي الأساسي والتدريب السريري في مختلف التخصصات.",
        },
        isPlaceholder: true,
      },
      {
        id: "specialty-training",
        period: toBeConfirmed,
        title: { en: "Specialty training in oncology", ar: "التدريب التخصصي في علاج الأورام" },
        organization: { en: "Training hospital — to be confirmed", ar: "مستشفى التدريب — قيد التأكيد" },
        description: {
          en: "Structured training in the diagnosis and treatment of cancer.",
          ar: "تدريب منهجي في تشخيص الأورام وعلاجها.",
        },
        isPlaceholder: true,
      },
      {
        id: "advanced-qualifications",
        period: toBeConfirmed,
        title: { en: "Advanced qualifications", ar: "المؤهلات المتقدمة" },
        organization: { en: "Details to be confirmed", ar: "التفاصيل قيد التأكيد" },
        description: {
          en: "Postgraduate degrees, fellowships or board certifications, where applicable.",
          ar: "الدرجات العليا أو الزمالات أو شهادات البورد، حسب الحال.",
        },
        isPlaceholder: true,
      },
      {
        id: "current-practice",
        period: toBeConfirmed,
        title: { en: "Current clinical practice", ar: "الممارسة السريرية الحالية" },
        organization: { en: "Clinic or hospital — to be confirmed", ar: "العيادة أو المستشفى — قيد التأكيد" },
        description: {
          en: "Oncology consultations, treatment planning and follow-up care.",
          ar: "استشارات الأورام وتخطيط العلاج والمتابعة.",
        },
        isPlaceholder: true,
      },
    ],
  },

  certificates: {
    eyebrow: { en: "Certificates & qualifications", ar: "الشهادات والمؤهلات" },
    title: { en: "Certificates", ar: "الشهادات" },
    description: {
      en: "Selected certificates and professional qualifications.",
      ar: "مختارات من الشهادات والمؤهلات المهنية.",
    },
    items: certificatePlaceholders,
  },

  philosophy: {
    eyebrow: { en: "Philosophy of care", ar: "فلسفة الرعاية" },
    quote: {
      text: {
        en: "Every patient deserves to understand their illness, to take part in every decision, and to feel supported — not only treated.",
        ar: "يستحق كل مريض أن يفهم مرضه، وأن يكون شريكًا في كل قرار، وأن يشعر بالدعم لا بالعلاج وحده.",
      },
      attribution: null,
      isPlaceholder: true,
    },
    portrait: doctorPortrait,
  },
};
