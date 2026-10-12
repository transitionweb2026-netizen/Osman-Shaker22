/**
 * Media manifest — the single place where homepage images are referenced.
 *
 * Every entry below is a TEMPORARY placeholder (`isPlaceholder: true`):
 * licensed stock photography from Unsplash (Unsplash License — free for
 * commercial use, no attribution required). None of these photos show
 * Dr. Othman Shaker; alt text therefore describes what is pictured.
 *
 * To replace an image:
 *   1. Put the approved photo in `assets-src/` using the same file name
 *      (e.g. `assets-src/doctor/doctor-portrait.jpg`) and delete the placeholder
 *      in `assets-src/placeholders/`.
 *   2. Run `npm run images` to regenerate the responsive WebP files.
 *   3. Update `alt`, adjust `position` if needed and remove `isPlaceholder`.
 * Remote URLs (e.g. Supabase Storage) can be used as `src` directly.
 */
import type { MediaAsset } from "./types";

const unsplash = (id: string) => `Unsplash — https://images.unsplash.com/${id}`;

export const heroImage: MediaAsset = {
  src: "/media/hero-doctor",
  alt: {
    en: "Doctor in a white coat with a stethoscope, standing with arms crossed",
    ar: "طبيب يرتدي معطفًا أبيض وسماعة طبية، يقف عاقدًا ذراعيه",
  },
  position: "62% 22%",
  positionMobile: "40% 18%",
  mirrorInRtl: true,
  isPlaceholder: true,
  credit: unsplash("photo-1612349317150-e413f6a5b16d"),
};

export const doctorPortrait: MediaAsset = {
  src: "/media/doctor-portrait",
  alt: {
    en: "Portrait of a doctor wearing glasses and a white coat",
    ar: "صورة شخصية لطبيب يرتدي نظارة ومعطفًا أبيض",
  },
  position: "50% 18%",
  isPlaceholder: true,
  credit: unsplash("photo-1612531386530-97286d97c2d2"),
};

export const introductionVideoPoster: MediaAsset = {
  src: "/media/intro-video-poster",
  alt: {
    en: "A doctor explaining a CT scan displayed on a computer screen",
    ar: "طبيبة تشرح صورة أشعة مقطعية معروضة على شاشة الحاسوب",
  },
  position: "55% 45%",
  isPlaceholder: true,
  credit: unsplash("photo-1666214280557-f1b5022eb634"),
};

export const specialtyImages = {
  breast: {
    src: "/media/specialty-breast",
    alt: {
      en: "A patient with a radiographer during a mammogram",
      ar: "مريضة برفقة أخصائية الأشعة أثناء فحص الماموجرام",
    },
    position: "58% 40%",
    isPlaceholder: true,
    credit: unsplash("photo-1579154341098-e4e158cc7f55"),
  },
  thoracic: {
    src: "/media/specialty-thoracic",
    alt: {
      en: "A doctor examining scan images on a light box",
      ar: "طبيب يفحص صور الأشعة على لوح الإضاءة",
    },
    position: "60% 35%",
    isPlaceholder: true,
    credit: unsplash("photo-1581595219315-a187dd40c322"),
  },
  gastrointestinal: {
    src: "/media/specialty-gastrointestinal",
    alt: {
      en: "Two doctors discussing medical images on a monitor",
      ar: "طبيبان يناقشان صورًا طبية على الشاشة",
    },
    position: "68% 40%",
    isPlaceholder: true,
    credit: unsplash("photo-1666214280391-8ff5bd3c0bf0"),
  },
  gynecologic: {
    src: "/media/specialty-gynecologic",
    alt: {
      en: "A doctor caring for an older woman during a clinic visit",
      ar: "طبيبة تعتني بسيدة خلال زيارة للعيادة",
    },
    // Keeps the doctor's face in the narrow homepage cards; both faces stay in wider crops
    position: "72% 40%",
    isPlaceholder: true,
    credit: unsplash("photo-1576765608535-5f04d1e3f289"),
  },
  hematologic: {
    src: "/media/specialty-hematologic",
    alt: {
      en: "Blood sample tubes in a laboratory rack",
      ar: "أنابيب عينات دم في حامل داخل المختبر",
    },
    position: "40% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1581594693702-fbdc51b2763b"),
  },
} satisfies Record<string, MediaAsset>;

export const treatmentImages = {
  chemotherapy: {
    src: "/media/treatment-chemotherapy",
    alt: {
      en: "An infusion stand holding an intravenous bag",
      ar: "حامل محاليل وريدية يحمل كيس العلاج",
    },
    position: "50% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1516574187841-cb9cc2ca948b"),
  },
  immunotherapy: {
    src: "/media/treatment-immunotherapy",
    alt: {
      en: "Microscope image of cells stained blue and magenta",
      ar: "صورة مجهرية لخلايا ملوّنة بالأزرق والأرجواني",
    },
    position: "50% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1576086213369-97a306d36557"),
  },
  targeted: {
    src: "/media/treatment-targeted",
    alt: {
      en: "Illustration of a DNA double helix",
      ar: "رسم توضيحي للحمض النووي بشكله الحلزوني المزدوج",
    },
    position: "35% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1628595351029-c2bf17511435"),
  },
  hormonal: {
    src: "/media/treatment-hormonal",
    alt: {
      en: "Capsules beside a medicine bottle on an orange background",
      ar: "كبسولات دوائية بجوار عبوة دواء على خلفية برتقالية",
    },
    position: "62% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1587854692152-cbe660dbde88"),
  },
  supportive: {
    src: "/media/treatment-supportive",
    alt: {
      en: "Two people holding hands in support",
      ar: "شخصان يمسكان بأيدي بعضهما في لفتة دعم ومساندة",
    },
    position: "45% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1584515933487-779824d29309"),
  },
} satisfies Record<string, MediaAsset>;

export const featuredVideoPosters = {
  firstVisit: {
    src: "/media/video-first-visit",
    alt: {
      en: "A doctor measuring a patient's blood pressure",
      ar: "طبيب يقيس ضغط الدم لمريضة",
    },
    position: "50% 40%",
    isPlaceholder: true,
    credit: unsplash("photo-1631815588090-d4bfec5b1ccb"),
  },
  medications: {
    src: "/media/video-medications",
    alt: {
      en: "A pharmacist reviewing a medicine bottle",
      ar: "صيدلي يراجع عبوة دواء",
    },
    position: "50% 30%",
    isPlaceholder: true,
    credit: unsplash("photo-1580281658626-ee379f3cce93"),
  },
  pathology: {
    src: "/media/video-pathology",
    alt: {
      en: "A scientist working at a microscope in a laboratory",
      ar: "باحثة تعمل على المجهر في المختبر",
    },
    position: "55% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1582719471384-894fbb16e074"),
  },
} satisfies Record<string, MediaAsset>;

export const whyChooseImage: MediaAsset = {
  src: "/media/why-choose",
  alt: {
    en: "Doctors reviewing medical images together in a bright clinic office",
    ar: "أطباء يراجعون صورًا طبية معًا في مكتب عيادة مضيء",
  },
  position: "72% 40%",
  isPlaceholder: true,
  credit: unsplash("photo-1666214277657-e60f05c40b04"),
};

export const ctaImage: MediaAsset = {
  src: "/media/cta-consultation",
  alt: {
    en: "A clinician measuring a patient's blood pressure during a visit",
    ar: "أخصائية تقيس ضغط الدم لمريضة خلال زيارتها",
  },
  position: "40% 35%",
  isPlaceholder: true,
  credit: unsplash("photo-1631815589968-fdb09a223b1e"),
};

/** Hero of the About page — currently the same placeholder photo as the homepage hero. */
export const aboutHeroImage: MediaAsset = { ...heroImage };

/** Heroes of the internal pages. */
export const pageHeroImages = {
  services: {
    src: "/media/page-services",
    alt: {
      en: "Two doctors reviewing medical images on computer screens",
      ar: "طبيبان يراجعان صورًا طبية على شاشات الحاسوب",
    },
    position: "70% 35%",
    positionMobile: "75% 30%",
    isPlaceholder: true,
    credit: unsplash("photo-1666214280391-8ff5bd3c0bf0"),
  },
  videos: { ...introductionVideoPoster, position: "60% 40%", positionMobile: "68% 35%" },
  reviews: {
    src: "/media/page-reviews",
    alt: {
      en: "Two hands reaching toward each other",
      ar: "يدان تمتدان نحو بعضهما",
    },
    position: "50% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1544027993-37dbfe43562a"),
  },
  articles: {
    src: "/media/page-articles",
    alt: {
      en: "Hands typing on a laptop beside a stethoscope",
      ar: "يدان تكتبان على حاسوب محمول بجوار سماعة طبية",
    },
    position: "60% 50%",
    positionMobile: "70% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1576091160550-2173dba999ef"),
  },
  contact: {
    src: "/media/page-contact",
    alt: {
      en: "A bright, modern clinic waiting area with plants",
      ar: "منطقة انتظار مضيئة وحديثة في عيادة تزينها النباتات",
    },
    position: "60% 55%",
    positionMobile: "65% 55%",
    isPlaceholder: true,
    credit: unsplash("photo-1631248055158-edec7a3c072b"),
  },
} satisfies Record<string, MediaAsset>;

/** Cards of the "Consultation & ongoing care" service group (reusing existing placeholders). */
export const careServiceImages = {
  consultation: { ...featuredVideoPosters.firstVisit, position: "50% 35%" },
  evaluation: { ...introductionVideoPoster, position: "45% 40%" },
  planning: {
    src: "/media/article-questions",
    alt: {
      en: "A hand writing a checklist in a notebook",
      ar: "يد تكتب قائمة مهام في دفتر",
    },
    position: "55% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1484480974693-6ca0a78fb36b"),
  },
  followUp: {
    src: "/media/video-side-effects",
    alt: {
      en: "A doctor holding a stethoscope",
      ar: "طبيبة تمسك سماعة طبية",
    },
    position: "45% 45%",
    isPlaceholder: true,
    credit: unsplash("photo-1638202993928-7267aad84c31"),
  },
} satisfies Record<string, MediaAsset>;

/** Posters of the remaining videos in the catalog (content/videos.ts). */
export const morePosters = {
  chemotherapy: { ...treatmentImages.chemotherapy, position: "42% 50%" },
  immunotherapy: { ...treatmentImages.immunotherapy, position: "50% 50%" },
  sideEffects: {
    src: "/media/video-side-effects",
    alt: {
      en: "A doctor holding a stethoscope",
      ar: "طبيبة تمسك سماعة طبية",
    },
    position: "50% 35%",
    isPlaceholder: true,
    credit: unsplash("photo-1638202993928-7267aad84c31"),
  },
  nutrition: {
    src: "/media/video-nutrition",
    alt: {
      en: "A bowl of vegetables, eggs and grilled tofu",
      ar: "طبق من الخضروات والبيض والتوفو المشوي",
    },
    position: "50% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1546069901-ba9599a7e63c"),
  },
  secondOpinion: {
    src: "/media/video-second-opinion",
    alt: {
      en: "A doctor with arms crossed holding a red stethoscope",
      ar: "طبيب عاقد ذراعيه يمسك سماعة طبية حمراء",
    },
    position: "55% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1532938911079-1b06ac7ceec7"),
  },
  family: {
    src: "/media/video-family",
    alt: {
      en: "A group of people sitting together, arms around each other",
      ar: "مجموعة من الأشخاص يجلسون معًا متشابكي الأذرع",
    },
    position: "45% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1529156069898-49953e39b3ac"),
  },
} satisfies Record<string, MediaAsset>;

export const articleImages = {
  firstConsultation: {
    src: "/media/article-first-consultation",
    alt: {
      en: "An open notebook titled “Notes” with a pen and glasses",
      ar: "دفتر مفتوح بعنوان «ملاحظات» مع قلم ونظارة",
    },
    position: "40% 55%",
    isPlaceholder: true,
    credit: unsplash("photo-1517842645767-c639042777db"),
  },
  pathology: {
    src: "/media/article-pathology",
    alt: {
      en: "Cell cultures in laboratory wells seen from above",
      ar: "مزارع خلوية في آبار مختبرية من الأعلى",
    },
    position: "50% 45%",
    isPlaceholder: true,
    credit: unsplash("photo-1579154392429-0e6b4e850ad2"),
  },
  nutrition: {
    src: "/media/article-nutrition",
    alt: {
      en: "A colorful bowl of salad and vegetables",
      ar: "طبق ملوّن من السلطة والخضروات",
    },
    position: "40% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1512621776951-a57141f2eefd"),
  },
  fatigue: {
    src: "/media/article-fatigue",
    alt: {
      en: "A person sitting quietly on a terrace at sunset",
      ar: "شخص يجلس بهدوء على شرفة وقت الغروب",
    },
    position: "50% 45%",
    isPlaceholder: true,
    credit: unsplash("photo-1506126613408-eca07ce68773"),
  },
  immunotherapy: {
    src: "/media/article-immunotherapy",
    alt: {
      en: "A pipette releasing a drop into a laboratory vial",
      ar: "ماصّة تُسقط قطرة في أنبوب مختبري",
    },
    position: "45% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1579165466741-7f35e4755660"),
  },
  questions: {
    src: "/media/article-questions",
    alt: {
      en: "A hand writing a checklist in a notebook",
      ar: "يد تكتب قائمة مهام في دفتر",
    },
    position: "55% 50%",
    isPlaceholder: true,
    credit: unsplash("photo-1484480974693-6ca0a78fb36b"),
  },
  family: {
    src: "/media/article-family",
    alt: {
      en: "A family walking together on a beach at sunset",
      ar: "عائلة تسير معًا على الشاطئ وقت الغروب",
    },
    position: "50% 60%",
    isPlaceholder: true,
    credit: unsplash("photo-1511895426328-dc8714191300"),
  },
} satisfies Record<string, MediaAsset>;

/** Social sharing images (1200×630), generated by `npm run og` from the hero photo. */
export const ogImages = {
  en: "/og/og-en.jpg",
  ar: "/og/og-ar.jpg",
};
