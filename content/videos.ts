/**
 * Videos: the introduction video and the catalog shown on the Videos page.
 * The homepage features three catalog entries by `id` (content/home.ts).
 *
 * No real videos exist yet: every `source` is `null`, so cards show a
 * "coming soon" state without play controls. To publish a video, set
 * `source` to `{ kind: "youtube", id: "…" }` or `{ kind: "file", src: "/media/….mp4" }`,
 * add `duration` from the real file and remove `isPlaceholder`.
 */
import { featuredVideoPosters, introductionVideoPoster, morePosters, pageHeroImages } from "./media";
import type { Video, VideosPageContent } from "./types";

/** Shown on the homepage and the About page. */
export const introductionVideo: Video = {
  id: "introduction",
  title: { en: "Introduction to Dr. Othman Shaker", ar: "تعريف بالدكتور عثمان شاكر" },
  poster: introductionVideoPoster,
  source: null,
  duration: null,
  isPlaceholder: true,
};

export const videosPage: VideosPageContent = {
  seo: {
    title: {
      en: "Educational Videos — Dr. Othman Shaker",
      ar: "فيديوهات توعوية — د. عثمان شاكر",
    },
    description: {
      en: "Short, clear videos about cancer care, treatments and everyday wellbeing, for patients and families.",
      ar: "فيديوهات قصيرة وواضحة عن رعاية الأورام والعلاجات والحياة اليومية، للمرضى وعائلاتهم.",
    },
  },

  hero: {
    eyebrow: { en: "Videos", ar: "الفيديوهات" },
    title: { en: "Short, clear answers to common questions", ar: "إجابات قصيرة وواضحة عن الأسئلة الشائعة" },
    description: {
      en: "Educational videos to help patients and families feel more prepared at every stage of care.",
      ar: "فيديوهات توعوية تساعد المرضى وعائلاتهم على الاستعداد بثقة أكبر في كل مرحلة من مراحل الرعاية.",
    },
    image: pageHeroImages.videos,
  },

  listTitle: { en: "All videos", ar: "جميع الفيديوهات" },

  items: [
    {
      id: "first-visit",
      title: {
        en: "What to expect at your first oncology visit",
        ar: "ماذا تتوقع في زيارتك الأولى لطبيب الأورام",
      },
      poster: featuredVideoPosters.firstVisit,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "medications",
      title: { en: "Understanding your treatment medicines", ar: "فهم أدويتك العلاجية" },
      poster: featuredVideoPosters.medications,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "pathology",
      title: {
        en: "How pathology results guide treatment",
        ar: "كيف توجّه نتائج التحليل النسيجي خطة العلاج",
      },
      poster: featuredVideoPosters.pathology,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "chemotherapy",
      title: {
        en: "Preparing for your first chemotherapy session",
        ar: "الاستعداد لجلسة العلاج الكيميائي الأولى",
      },
      poster: morePosters.chemotherapy,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "immunotherapy",
      title: { en: "Immunotherapy, explained simply", ar: "العلاج المناعي بشرح مبسّط" },
      poster: morePosters.immunotherapy,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "when-to-call",
      title: { en: "When to contact your care team", ar: "متى تتواصل مع فريق الرعاية" },
      poster: morePosters.sideEffects,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "nutrition",
      title: { en: "Eating well during treatment", ar: "التغذية الجيدة أثناء العلاج" },
      poster: morePosters.nutrition,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "second-opinion",
      title: { en: "Why a second opinion can help", ar: "لماذا قد يفيدك الرأي الطبي الثاني" },
      poster: morePosters.secondOpinion,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
    {
      id: "family-support",
      title: {
        en: "Supporting a family member through treatment",
        ar: "دعم أحد أفراد الأسرة خلال العلاج",
      },
      poster: morePosters.family,
      source: null,
      duration: null,
      isPlaceholder: true,
    },
  ],
};
