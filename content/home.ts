/**
 * Homepage content in English and Arabic.
 *
 * All copy is professionally written, general PLACEHOLDER content. It avoids
 * credentials, outcomes and testimonials that have not been verified. Items
 * marked `isPlaceholder: true` must be replaced or approved by Dr. Othman
 * Shaker before publication (`npm run check:content` lists them).
 *
 * Featured specialties, treatments, videos and reviews are referenced by `id`
 * from their catalogs (content/services.ts, videos.ts, reviews.ts).
 */
import { doctorPortrait, heroImage, ogImages, whyChooseImage } from "./media";
import type { HomePageContent } from "./types";
import { introductionVideo } from "./videos";

export const homeContent: HomePageContent = {
  seo: {
    title: {
      en: "Dr. Othman Shaker — Oncology Care",
      ar: "د. عثمان شاكر — رعاية مرضى الأورام",
    },
    description: {
      en: "Thoughtful oncology care with clear communication and individualized treatment planning. Learn about specialties, treatments and what to expect.",
      ar: "رعاية متخصصة لمرضى الأورام تقوم على التواصل الواضح والتخطيط العلاجي الفردي. تعرّف على التخصصات والعلاجات وما يمكنك توقعه.",
    },
    ogImage: ogImages,
    ogImageAlt: {
      en: "Dr. Othman Shaker — Oncology care",
      ar: "د. عثمان شاكر — رعاية مرضى الأورام",
    },
  },

  // Order and visibility of the sections below the hero
  layout: {
    sections: [
      { id: "introVideo" },
      { id: "about" },
      { id: "statistics" },
      { id: "specialties" },
      { id: "treatments" },
      { id: "journey" },
      { id: "whyChoose" },
      { id: "videos" },
      { id: "reviewsFaq" },
      { id: "cta" },
    ],
  },

  hero: {
    eyebrow: { en: "Oncology · Personalized care", ar: "طب الأورام · رعاية شخصية" },
    title: { en: "Expert cancer care", ar: "رعاية متخصصة لمرضى الأورام" },
    titleAccent: { en: "that begins with listening.", ar: "تبدأ بالإصغاء إليك." },
    description: {
      en: "Clear explanations, thoughtful planning and steady support at every stage of your care.",
      ar: "شرح واضح، وتخطيط مدروس، ودعم متواصل في كل مرحلة من مراحل رحلتك العلاجية.",
    },
    primaryCta: { label: { en: "Book a consultation", ar: "احجز استشارة" }, action: { kind: "whatsapp" } },
    secondaryCta: { label: { en: "Explore specialties", ar: "تعرّف على التخصصات" }, action: { kind: "section", anchor: "specialties" } },
    image: heroImage,
  },

  introVideo: {
    eyebrow: { en: "Introduction", ar: "تعريف" },
    title: { en: "Meet Dr. Othman Shaker", ar: "تعرّف على د. عثمان شاكر" },
    description: {
      en: "A short introduction to Dr. Othman’s approach to care, and what you can expect when you visit the clinic.",
      ar: "مقدمة قصيرة عن نهج د. عثمان في الرعاية، وما يمكنك توقعه عند زيارتك للعيادة.",
    },
    video: introductionVideo,
  },

  about: {
    eyebrow: { en: "About the doctor", ar: "عن الطبيب" },
    title: {
      en: "A calm, considered approach to cancer care",
      ar: "نهج هادئ ومدروس في رعاية مرضى الأورام",
    },
    paragraphs: {
      en: [
        "A cancer diagnosis brings difficult questions. Dr. Othman Shaker believes every patient deserves time, clear answers and a plan they truly understand.",
        "Each consultation focuses on your diagnosis, your priorities and your questions — so that decisions about your care are made together, with you and your family.",
      ],
      ar: [
        "يحمل تشخيص السرطان معه أسئلة صعبة، ويؤمن د. عثمان شاكر بأن كل مريض يستحق الوقت الكافي، وإجابات واضحة، وخطة علاجية يفهمها جيدًا.",
        "تركّز كل استشارة على حالتك وأولوياتك وأسئلتك، لتُتخذ القرارات المتعلقة برعايتك معك ومع عائلتك، خطوة بخطوة.",
      ],
    },
    cta: { label: { en: "More about Dr. Othman", ar: "المزيد عن د. عثمان" }, action: { kind: "page", route: "about" } },
    portrait: doctorPortrait,
    isPlaceholder: true,
  },

  statistics: {
    eyebrow: { en: "At a glance", ar: "لمحة سريعة" },
    title: { en: "Care built on experience and attention", ar: "رعاية قوامها الخبرة والاهتمام" },
    // PLACEHOLDER figures — replace with verified numbers (or remove) before publication.
    items: [
      {
        id: "experience",
        value: 15,
        suffix: "+",
        label: { en: "Years of clinical experience", ar: "عامًا من الخبرة السريرية" },
        isPlaceholder: true,
      },
      {
        id: "consultations",
        value: 5000,
        suffix: "+",
        label: { en: "Patient consultations", ar: "استشارة طبية" },
        isPlaceholder: true,
      },
      {
        id: "specialties",
        value: 5,
        label: { en: "Specialty areas", ar: "مجالات تخصص" },
        isPlaceholder: true,
      },
      {
        id: "treatments",
        value: 5,
        label: { en: "Treatment approaches", ar: "أساليب علاجية" },
        isPlaceholder: true,
      },
    ],
  },

  specialties: {
    eyebrow: { en: "Medical specialties", ar: "التخصصات الطبية" },
    title: {
      en: "Focused care across common cancers",
      ar: "رعاية مركّزة لأنواع الأورام الشائعة",
    },
    description: {
      en: "Care for a range of cancer types, with every plan shaped around the specific diagnosis — and the person behind it.",
      ar: "رعاية لأنواع متعددة من الأورام، مع خطة تُبنى حول التشخيص الدقيق والإنسان صاحب الحالة.",
    },
    // Entries of the services catalog (content/services.ts)
    serviceIds: ["breast", "thoracic", "gastrointestinal", "gynecologic", "hematologic"],
    cta: {
      label: { en: "View all specialties", ar: "عرض جميع التخصصات" },
      action: { kind: "page", route: "servicesSpecialties" },
    },
  },

  treatments: {
    eyebrow: { en: "Treatments", ar: "العلاجات" },
    title: {
      en: "Modern treatment options, explained clearly",
      ar: "خيارات علاجية حديثة، بشرح واضح",
    },
    description: {
      en: "Any recommendation depends on the type and stage of cancer, your overall health and your preferences — and is always discussed with you first.",
      ar: "تعتمد أي توصية علاجية على نوع الورم ومرحلته وحالتك الصحية العامة وتفضيلاتك، وتُناقش معك دائمًا قبل البدء.",
    },
    serviceIds: ["chemotherapy", "immunotherapy", "targeted", "hormonal", "supportive"],
    cta: { label: { en: "Explore treatments", ar: "استكشف العلاجات" }, action: { kind: "page", route: "servicesTreatments" } },
  },

  journey: {
    eyebrow: { en: "Your patient journey", ar: "رحلتك العلاجية" },
    title: { en: "What to expect, step by step", ar: "ما الذي تتوقعه، خطوة بخطوة" },
    description: {
      en: "A general outline of how care usually unfolds. Your own pathway is shaped around your diagnosis and needs.",
      ar: "تصوّر عام لكيفية سير الرعاية عادةً، بينما يُصمَّم مسارك الخاص وفق تشخيصك واحتياجاتك.",
    },
    steps: [
      {
        id: "consultation",
        icon: "consultation",
        title: { en: "Initial consultation", ar: "الاستشارة الأولى" },
        description: {
          en: "A first conversation to understand your history, reports and concerns.",
          ar: "لقاء أول للتعرّف على تاريخك المرضي وتقاريرك ومخاوفك.",
        },
      },
      {
        id: "evaluation",
        icon: "evaluation",
        title: { en: "Clinical evaluation", ar: "التقييم السريري" },
        description: {
          en: "A careful review of examinations, imaging and pathology results.",
          ar: "مراجعة دقيقة للفحوص ونتائج الأشعة والتحاليل النسيجية.",
        },
      },
      {
        id: "discussion",
        icon: "discussion",
        title: { en: "Discussing next steps", ar: "مناقشة الخطوات التالية" },
        description: {
          en: "An open discussion of suitable options, in language that is easy to follow.",
          ar: "نقاش صريح حول الخيارات المناسبة، بلغة واضحة وسهلة الفهم.",
        },
      },
      {
        id: "plan",
        icon: "plan",
        title: { en: "Individualized care plan", ar: "خطة رعاية فردية" },
        description: {
          en: "A plan built around your diagnosis, your health and your personal priorities.",
          ar: "خطة تُبنى حول تشخيصك وحالتك الصحية وأولوياتك الشخصية.",
        },
      },
      {
        id: "follow-up",
        icon: "followUp",
        title: { en: "Follow-up & ongoing support", ar: "المتابعة والدعم المستمر" },
        description: {
          en: "Regular follow-up and clear communication during and after treatment.",
          ar: "متابعة منتظمة وتواصل واضح أثناء العلاج وبعده.",
        },
      },
    ],
    note: {
      en: "These stages are illustrative — every patient’s care is different.",
      ar: "هذه المراحل توضيحية، فلكل مريض مسار رعاية مختلف.",
    },
    cta: { label: { en: "Learn about treatments", ar: "تعرّف على العلاجات" }, action: { kind: "page", route: "servicesTreatments" } },
  },

  whyChoose: {
    eyebrow: { en: "Why Dr. Othman Shaker?", ar: "لماذا د. عثمان شاكر؟" },
    title: {
      en: "Care that keeps you informed, involved and supported",
      ar: "رعاية تُبقيك على اطلاع، وشريكًا في القرار، ومحاطًا بالدعم",
    },
    description: {
      en: "Facing cancer is about more than treatment. It is about understanding what is happening, trusting the people beside you and feeling heard at every visit.",
      ar: "مواجهة السرطان لا تقتصر على العلاج وحده، بل تشمل أن تفهم ما يحدث، وأن تثق بمن يرافقك، وأن تشعر بأن صوتك مسموع في كل زيارة.",
    },
    principles: [
      {
        id: "communication",
        title: { en: "Clear communication", ar: "تواصل واضح" },
        description: {
          en: "Diagnoses, results and options explained in plain language, with time for every question.",
          ar: "شرح التشخيص والنتائج والخيارات بلغة بسيطة، مع وقت كافٍ لكل سؤال.",
        },
      },
      {
        id: "thoughtful",
        title: { en: "Thoughtful care", ar: "رعاية مدروسة" },
        description: {
          en: "Recommendations weighed carefully — benefits, side effects and what matters to you.",
          ar: "توصيات تُدرس بعناية، توازن بين الفوائد والآثار الجانبية وما يهمك أنت.",
        },
      },
      {
        id: "individual",
        title: { en: "Individual attention", ar: "اهتمام فردي" },
        description: {
          en: "Your plan is shaped around you: your diagnosis, your health and your life.",
          ar: "خطتك مصممة حولك أنت: تشخيصك وصحتك وحياتك.",
        },
      },
      {
        id: "continuity",
        title: { en: "Continuity of support", ar: "دعم متواصل" },
        description: {
          en: "Consistent follow-up, so you always know the next step.",
          ar: "متابعة منتظمة، لتعرف دائمًا خطوتك التالية.",
        },
      },
    ],
    image: whyChooseImage,
    caption: {
      en: "Every question deserves an answer you can understand.",
      ar: "كل سؤال يستحق إجابة يمكنك فهمها.",
    },
    isPlaceholder: true,
  },

  videos: {
    eyebrow: { en: "Featured videos", ar: "فيديوهات مختارة" },
    title: {
      en: "Short, clear answers to common questions",
      ar: "إجابات قصيرة وواضحة عن الأسئلة الشائعة",
    },
    description: {
      en: "Educational videos to help patients and families feel more prepared.",
      ar: "فيديوهات توعوية تساعد المرضى وعائلاتهم على الاستعداد بثقة أكبر.",
    },
    // The cards are the first three videos of the catalog (content/videos.ts), which is ordered by importance
    cta: { label: { en: "View all videos", ar: "عرض جميع الفيديوهات" }, action: { kind: "page", route: "videos" } },
  },

  reviews: {
    eyebrow: { en: "Patient reviews", ar: "آراء المرضى" },
    title: { en: "Experiences shared by patients", ar: "تجارب يشاركها المرضى" },
    description: {
      en: "Reviews are published only with each patient’s permission.",
      ar: "تُنشر الآراء فقط بإذن أصحابها.",
    },
    // The cards are the first six reviews of the catalog (content/reviews.ts), which is ordered by importance.
    // The button sits centered under both the reviews and the FAQ.
    cta: { label: { en: "Reviews & FAQs", ar: "الآراء والأسئلة الشائعة" }, action: { kind: "page", route: "reviews" } },
  },

  faq: {
    eyebrow: { en: "Questions & answers", ar: "أسئلة وأجوبة" },
    title: { en: "Frequently asked questions", ar: "الأسئلة الشائعة" },
    description: {
      en: "General information to help you prepare. For advice about your own situation, please book a consultation.",
      ar: "معلومات عامة تساعدك على الاستعداد، وللحصول على نصيحة تخص حالتك يُرجى حجز استشارة.",
    },
    // Questions from the FAQ catalog (content/faq.ts); the full list is on the Reviews & FAQs page
    faqIds: ["bring", "companion", "plan", "second-opinion", "side-effects", "advice", "booking"],
  },
};
