/**
 * FAQ catalog, grouped by topic. The Reviews & FAQs page shows every topic;
 * the homepage features questions by `id` (content/home.ts).
 *
 * DRAFT — general information written for the website. Each topic stays a
 * placeholder until the doctor has reviewed and approved its answers
 * (`npm run check:content` lists them). Keep answers general: advice about a
 * patient's own situation belongs in a consultation, and clinic details
 * (hours, fees, locations) should only be added once confirmed.
 */
import type { FaqCategory } from "./types";

export const faqCategories: FaqCategory[] = [
  {
    id: "before-visit",
    title: { en: "Before your first visit", ar: "قبل زيارتك الأولى" },
    isPlaceholder: true,
    items: [
      {
        id: "booking",
        question: { en: "How can I book an appointment?", ar: "كيف يمكنني حجز موعد؟" },
        answer: {
          en: "You can contact the clinic by WhatsApp or by phone using the options on this page.",
          ar: "يمكنك التواصل مع العيادة عبر واتساب أو الاتصال الهاتفي من خلال الوسائل الموجودة في هذه الصفحة.",
        },
      },
      {
        id: "bring",
        question: {
          en: "What should I bring to my first consultation?",
          ar: "ماذا أُحضر معي في الاستشارة الأولى؟",
        },
        answer: {
          en: "It helps to bring any medical reports you have — such as pathology results, imaging scans and their reports, recent blood tests — and a list of the medicines you take. Writing your questions down beforehand can also make the visit easier.",
          ar: "يُفضّل إحضار ما لديك من تقارير طبية، مثل نتائج التحليل النسيجي، وصور الأشعة وتقاريرها، وأحدث تحاليل الدم، إضافة إلى قائمة بالأدوية التي تتناولها. كما يساعد تدوين أسئلتك مسبقًا على جعل الزيارة أيسر.",
        },
      },
      {
        id: "companion",
        question: {
          en: "Can a family member come with me?",
          ar: "هل يمكن أن يرافقني أحد أفراد عائلتي؟",
        },
        answer: {
          en: "Many patients find it helpful to bring someone they trust. A companion can help you listen, take notes and remember the questions you want to ask.",
          ar: "يجد كثير من المرضى أن اصطحاب شخص يثقون به أمر مفيد؛ إذ يمكنه المساعدة في الإصغاء وتدوين الملاحظات وتذكّر الأسئلة التي تودّ طرحها.",
        },
      },
      {
        id: "prepare-questions",
        question: {
          en: "How can I make the most of my consultation?",
          ar: "كيف أستفيد من الاستشارة على أفضل وجه؟",
        },
        answer: {
          en: "Write your questions down beforehand and start with the ones that matter most to you. You can always ask for something to be explained again, in simpler words — every question is worth asking.",
          ar: "دوّن أسئلتك مسبقًا وابدأ بأكثرها أهمية بالنسبة إليك. ويمكنك دائمًا طلب إعادة شرح أي أمر بكلمات أبسط، فكل سؤال يستحق أن يُطرح.",
        },
      },
      {
        id: "reports-in-advance",
        question: {
          en: "Can I send my reports before the visit?",
          ar: "هل يمكنني إرسال تقاريري قبل الزيارة؟",
        },
        answer: {
          en: "Please ask when you book. If reports can be reviewed in advance, the clinic will explain how to share them. Detailed medical records should not be sent through the website’s contact form.",
          ar: "يُرجى السؤال عن ذلك عند الحجز؛ فإن أمكن الاطلاع على التقارير مسبقًا، ستوضح لك العيادة طريقة إرسالها. ولا ينبغي إرسال السجلات الطبية المفصلة عبر نموذج التواصل في الموقع.",
        },
      },
    ],
  },
  {
    id: "diagnosis",
    title: { en: "Diagnosis & second opinions", ar: "التشخيص والرأي الطبي الثاني" },
    isPlaceholder: true,
    items: [
      {
        id: "second-opinion",
        question: {
          en: "Is it reasonable to ask for a second opinion?",
          ar: "هل من المناسب طلب رأي طبي ثانٍ؟",
        },
        answer: {
          en: "Yes. Seeking a second opinion is a common and reasonable step, especially before an important decision about treatment.",
          ar: "نعم، فطلب رأي طبي ثانٍ خطوة شائعة ومعقولة، خاصةً قبل اتخاذ قرار مهم يتعلق بالعلاج.",
        },
      },
      {
        id: "second-opinion-records",
        question: {
          en: "What is needed for a second opinion?",
          ar: "ما الذي أحتاجه للحصول على رأي طبي ثانٍ؟",
        },
        answer: {
          en: "Usually the pathology report, imaging scans with their reports, recent test results and a summary of any treatment you have already received. Your treating doctor or hospital can help you obtain copies.",
          ar: "عادةً ما يلزم تقرير التحليل النسيجي، وصور الأشعة وتقاريرها، وأحدث نتائج الفحوص، وملخص لأي علاج تلقيته من قبل. ويمكن لطبيبك المعالج أو المستشفى مساعدتك في الحصول على نسخ منها.",
        },
      },
      {
        id: "staging",
        question: { en: "What does the stage of a cancer mean?", ar: "ماذا تعني مرحلة الورم؟" },
        answer: {
          en: "The stage describes how large a tumor is and whether — and how far — it has spread. Together with other test results, it helps guide treatment choices. Staging systems differ between cancer types, so ask the doctor what your stage means for you.",
          ar: "تصف المرحلة حجم الورم، وما إذا كان قد انتشر ومدى انتشاره. وتساعد، مع نتائج الفحوص الأخرى، في توجيه اختيار العلاج. وتختلف أنظمة تحديد المراحل بين أنواع الأورام، لذا اسأل الطبيب عمّا تعنيه مرحلتك بالنسبة إليك.",
        },
      },
      {
        id: "more-tests",
        question: {
          en: "Why might more tests be needed after a diagnosis?",
          ar: "لماذا قد أحتاج إلى فحوص إضافية بعد التشخيص؟",
        },
        answer: {
          en: "Further tests can show whether the cancer has spread and reveal features of the tumor — such as hormone receptors or genetic changes — that help decide which treatments are most suitable.",
          ar: "قد تُظهر الفحوص الإضافية ما إذا كان الورم قد انتشر، وتكشف خصائص فيه — مثل مستقبلات الهرمونات أو التغيرات الجينية — تساعد في تحديد العلاجات الأنسب.",
        },
      },
    ],
  },
  {
    id: "treatment",
    title: { en: "Treatment", ar: "العلاج" },
    isPlaceholder: true,
    items: [
      {
        id: "plan",
        question: { en: "How is a treatment plan decided?", ar: "كيف تُحدَّد خطة العلاج؟" },
        answer: {
          en: "Treatment plans depend on many factors, including the type and stage of cancer, test results, your overall health and your personal preferences. Options are discussed with you so that decisions are made together.",
          ar: "تعتمد خطة العلاج على عوامل عديدة، منها نوع الورم ومرحلته، ونتائج الفحوص، وحالتك الصحية العامة، وتفضيلاتك الشخصية. وتُناقش الخيارات معك حتى تُتخذ القرارات بشكل مشترك.",
        },
      },
      {
        id: "same-treatment",
        question: {
          en: "Does everyone with the same type of cancer receive the same treatment?",
          ar: "هل يتلقى كل المصابين بالنوع نفسه من الأورام العلاج ذاته؟",
        },
        answer: {
          en: "Not necessarily. Two people with the same type of cancer may need different treatments, depending on the stage, the tumor’s features, their overall health and their own preferences.",
          ar: "ليس بالضرورة؛ فقد يحتاج شخصان مصابان بالنوع نفسه من الأورام إلى علاجين مختلفين، تبعًا للمرحلة وخصائص الورم والحالة الصحية العامة وتفضيلات كلٍّ منهما.",
        },
      },
      {
        id: "side-effects",
        question: {
          en: "Will I know which side effects to expect?",
          ar: "هل سأعرف الآثار الجانبية المتوقعة؟",
        },
        answer: {
          en: "Possible side effects vary between treatments and from person to person. Before treatment begins, common side effects and ways to manage them are explained, along with when to seek medical help.",
          ar: "تختلف الآثار الجانبية المحتملة باختلاف العلاج ومن شخص لآخر. وقبل بدء العلاج تُشرح الآثار الشائعة وطرق التعامل معها، ومتى ينبغي طلب المساعدة الطبية.",
        },
      },
      {
        id: "supplements",
        question: {
          en: "Should I mention supplements or herbal products I take?",
          ar: "هل ينبغي أن أذكر المكملات أو المنتجات العشبية التي أتناولها؟",
        },
        answer: {
          en: "Yes. Some vitamins, supplements and herbal products can interact with cancer treatments or affect test results, so tell your care team about everything you take — even if it seems harmless.",
          ar: "نعم، فبعض الفيتامينات والمكملات والمنتجات العشبية قد تتداخل مع علاجات الأورام أو تؤثر في نتائج الفحوص؛ لذا أخبر فريق الرعاية بكل ما تتناوله، حتى لو بدا غير ضار.",
        },
      },
      {
        id: "daily-life",
        question: {
          en: "Can I keep working or studying during treatment?",
          ar: "هل يمكنني مواصلة العمل أو الدراسة أثناء العلاج؟",
        },
        answer: {
          en: "Many people continue some of their usual activities during treatment, but it depends on the treatment and on how you feel. Discuss your plans with your care team so they can help you prepare.",
          ar: "يواصل كثيرون بعض أنشطتهم المعتادة أثناء العلاج، لكن ذلك يعتمد على نوع العلاج وعلى ما تشعر به. ناقش خططك مع فريق الرعاية ليساعدك على الاستعداد.",
        },
      },
    ],
  },
  {
    id: "follow-up",
    title: { en: "Follow-up & support", ar: "المتابعة والدعم" },
    isPlaceholder: true,
    items: [
      {
        id: "after-treatment",
        question: { en: "What happens after treatment ends?", ar: "ماذا يحدث بعد انتهاء العلاج؟" },
        answer: {
          en: "Follow-up visits continue after treatment to check your recovery, look for any signs of the cancer returning and help with longer-term side effects. How often they take place depends on your situation.",
          ar: "تستمر زيارات المتابعة بعد انتهاء العلاج للاطمئنان على تعافيك، ورصد أي علامات لعودة الورم، والمساعدة في التعامل مع الآثار الجانبية طويلة المدى. ويعتمد تواترها على حالتك.",
        },
      },
      {
        id: "between-visits",
        question: {
          en: "What should I do if I feel unwell between visits?",
          ar: "ماذا أفعل إذا شعرت بتوعك بين الزيارات؟",
        },
        answer: {
          en: "Follow the instructions your care team gives you for your treatment. In an emergency — for example, difficulty breathing, chest pain or a high fever during treatment — go to the nearest emergency department straight away. For questions that are not urgent, contact the clinic.",
          ar: "اتبع التعليمات التي يقدمها لك فريق الرعاية بشأن علاجك. وفي الحالات الطارئة — مثل صعوبة التنفس أو ألم الصدر أو ارتفاع الحرارة أثناء العلاج — توجّه فورًا إلى أقرب قسم للطوارئ. أما الأسئلة غير العاجلة فيمكنك طرحها بالتواصل مع العيادة.",
        },
      },
      {
        id: "emotional-support",
        question: {
          en: "Is it normal to feel anxious or low?",
          ar: "هل من الطبيعي أن أشعر بالقلق أو الحزن؟",
        },
        answer: {
          en: "Yes. Strong emotions are common after a cancer diagnosis and during treatment. You do not have to face them alone — tell your care team how you feel, so they can talk with you about sources of support.",
          ar: "نعم، فالمشاعر القوية شائعة بعد تشخيص الورم وأثناء العلاج. ولست مضطرًا إلى مواجهتها وحدك؛ أخبر فريق الرعاية بما تشعر به ليتحدث معك عن مصادر الدعم المتاحة.",
        },
      },
      {
        id: "family-questions",
        question: { en: "Can my family ask questions too?", ar: "هل يمكن لعائلتي طرح الأسئلة أيضًا؟" },
        answer: {
          en: "Yes. With your permission, family members can join the discussion and ask their own questions. You decide how much is shared, and with whom.",
          ar: "نعم، يمكن لأفراد عائلتك المشاركة في النقاش وطرح أسئلتهم بإذنك، وأنت من يقرر ما يُشارَك من معلومات ومع من.",
        },
      },
    ],
  },
  {
    id: "website",
    title: { en: "About this website", ar: "عن هذا الموقع" },
    isPlaceholder: true,
    items: [
      {
        id: "advice",
        question: {
          en: "Does the information on this website replace a consultation?",
          ar: "هل تُغني المعلومات في هذا الموقع عن الاستشارة الطبية؟",
        },
        answer: {
          en: "No. The content here is general and educational. Every situation is different, so please consult a doctor for advice about your own health.",
          ar: "لا، فالمحتوى هنا عام وتثقيفي، ولكل حالة ظروفها الخاصة؛ لذا يُرجى استشارة الطبيب للحصول على نصيحة تخص حالتك الصحية.",
        },
      },
      {
        id: "reviews-policy",
        question: { en: "How are patient reviews published?", ar: "كيف تُنشر آراء المرضى؟" },
        answer: {
          en: "Reviews are published only with each patient’s permission. Names appear only with explicit consent, and the star rating shown is the one the patient gave.",
          ar: "تُنشر الآراء فقط بإذن أصحابها، ولا تظهر الأسماء إلا بموافقة صريحة، والتقييم بالنجوم المعروض هو الذي منحه المريض نفسه.",
        },
      },
      {
        id: "contact-form",
        question: { en: "What should I write in the contact form?", ar: "ماذا أكتب في نموذج التواصل؟" },
        answer: {
          en: "A short description of your enquiry and the best way to reach you is enough. Please keep medical details brief — they are best discussed during your consultation.",
          ar: "يكفي وصف موجز لاستفسارك وأفضل طريقة للتواصل معك. ويُرجى الإيجاز في التفاصيل الطبية، فالأفضل مناقشتها خلال الاستشارة.",
        },
      },
    ],
  },
];
