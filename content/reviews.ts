/**
 * Patient reviews catalog and Reviews & FAQs page content (the FAQ catalog
 * itself is in content/faq.ts). The catalog is ordered by importance: the
 * homepage shows its first six reviews, so moving a review up or down changes
 * both pages.
 *
 * PLACEHOLDERS — no testimonials have been provided. These cards describe the
 * review policy instead of inventing patient experiences, and their stars stay
 * empty ("rating pending"). Replace them with approved reviews: text, a
 * consented reviewer label and the rating the patient actually gave (1–5).
 */
import { faqCategories } from "./faq";
import { pageHeroImages } from "./media";
import type { Review, ReviewsPageContent } from "./types";

const pendingLabel = { en: "Patient review · coming soon", ar: "رأي مريض · قريبًا" };

const reviews: Review[] = [
  {
    id: "review-1",
    text: {
      en: "This space is reserved for a verified patient review, shared with the patient’s permission.",
      ar: "هذه المساحة مخصصة لرأي موثّق من أحد المرضى، يُنشر بإذنه.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-2",
    text: {
      en: "Real experiences from patients and families will appear here once they are approved for publication.",
      ar: "ستظهر هنا تجارب حقيقية لمرضى وعائلاتهم بعد اعتمادها للنشر.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-3",
    text: {
      en: "Every review on this page will come directly from a patient or a family member.",
      ar: "كل رأي في هذه الصفحة سيكون من مريض أو أحد أفراد عائلته مباشرة.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-4",
    text: {
      en: "Patient privacy comes first — names are shown only with explicit consent.",
      ar: "خصوصية المرضى أولًا؛ فلا تُعرض الأسماء إلا بموافقة صريحة.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-5",
    text: {
      en: "Each experience shared here is personal — every patient’s care is different.",
      ar: "كل تجربة تُنشر هنا شخصية، فلكل مريض مسار رعاية مختلف.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-6",
    text: {
      en: "Would you like to share your experience? You are welcome to contact the clinic at any time.",
      ar: "هل تودّ مشاركة تجربتك؟ يسعدنا تواصلك مع العيادة في أي وقت.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-7",
    text: {
      en: "This card will show a patient’s own words once a review is approved for publication.",
      ar: "ستعرض هذه البطاقة كلمات أحد المرضى بعد اعتماد رأيه للنشر.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-8",
    text: {
      en: "Experiences shared by family members are welcome too, published with their permission.",
      ar: "تجارب أفراد العائلة مرحّب بها أيضًا، وتُنشر بإذن أصحابها.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
  {
    id: "review-9",
    text: {
      en: "Star ratings will appear exactly as each patient gives them.",
      ar: "ستظهر التقييمات بالنجوم كما يمنحها كل مريض تمامًا.",
    },
    reviewer: pendingLabel,
    rating: null,
    isPlaceholder: true,
  },
];

export const reviewsPage: ReviewsPageContent = {
  seo: {
    title: {
      en: "Reviews & FAQs — Dr. Othman Shaker",
      ar: "الآراء والأسئلة الشائعة — د. عثمان شاكر",
    },
    description: {
      en: "Patient experiences, published only with permission, and answers to common questions about consultations, diagnosis, treatment and follow-up.",
      ar: "تجارب المرضى المنشورة بإذنهم، وإجابات عن الأسئلة الشائعة حول الاستشارة والتشخيص والعلاج والمتابعة.",
    },
  },
  // Order and visibility of the sections below the hero
  layout: { sections: [{ id: "reviews" }, { id: "faq" }] },
  hero: {
    eyebrow: { en: "Reviews & FAQs", ar: "الآراء والأسئلة الشائعة" },
    title: {
      en: "Patient experiences and answers to your questions",
      ar: "تجارب المرضى وإجابات عن أسئلتكم",
    },
    description: {
      en: "Reviews are published only with each patient’s permission. Below them, you will find answers to the questions patients and families ask most often.",
      ar: "تُنشر الآراء فقط بإذن أصحابها، وتجد أسفلها إجابات عن أكثر الأسئلة التي يطرحها المرضى وعائلاتهم.",
    },
    image: pageHeroImages.reviews,
  },
  reviewsIntro: {
    eyebrow: { en: "Patient reviews", ar: "آراء المرضى" },
    title: { en: "Experiences shared by patients and families", ar: "تجارب يشاركها المرضى وعائلاتهم" },
    description: {
      en: "Names appear only with explicit consent, and every star rating comes from the patient.",
      ar: "لا تظهر الأسماء إلا بموافقة صريحة، وكل تقييم بالنجوم يأتي من المريض نفسه.",
    },
  },
  items: reviews,
  faq: {
    eyebrow: { en: "Questions & answers", ar: "أسئلة وأجوبة" },
    title: { en: "Frequently asked questions", ar: "الأسئلة الشائعة" },
    description: {
      en: "General information to help you prepare. For advice about your own situation, please book a consultation.",
      ar: "معلومات عامة تساعدك على الاستعداد، وللحصول على نصيحة تخص حالتك يُرجى حجز استشارة.",
    },
    categories: faqCategories,
    contact: {
      title: { en: "Still have a question?", ar: "لديك سؤال آخر؟" },
      text: {
        en: "Send it to the clinic — the team will be glad to help.",
        ar: "أرسله إلى العيادة، ويسعد الفريق بمساعدتك.",
      },
      whatsappMessage: {
        en: "Hello, I have a question for Dr. Othman Shaker’s clinic.",
        ar: "مرحبًا، لديّ سؤال لعيادة د. عثمان شاكر.",
      },
      contactLabel: { en: "Go to the contact page", ar: "صفحة التواصل" },
    },
  },
};
