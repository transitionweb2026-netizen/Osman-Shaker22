/**
 * Articles page content in English and Arabic.
 *
 * DRAFTS: every article is general educational content written as a
 * placeholder. Each must be reviewed by Dr. Othman Shaker (set `reviewedBy`)
 * and approved before publication (`isPlaceholder: true`).
 * Bodies are structured blocks (content/blocks.ts), ready to move to a CMS.
 */
import { heading, list, note, paragraph } from "./blocks";
import { articleImages, pageHeroImages } from "./media";
import type { ArticlesPageContent } from "./types";

const gettingStarted = { en: "Getting started", ar: "البداية" };
const livingWell = { en: "Living well", ar: "العيش بصحة" };

export const articlesPage: ArticlesPageContent = {
  seo: {
    title: { en: "Articles — Dr. Othman Shaker", ar: "مقالات — د. عثمان شاكر" },
    description: {
      en: "Clear, practical articles about cancer care, treatments and everyday wellbeing, for patients and families.",
      ar: "مقالات واضحة وعملية عن رعاية الأورام والعلاجات والحياة اليومية، للمرضى وعائلاتهم.",
    },
  },

  hero: {
    eyebrow: { en: "Articles", ar: "المقالات" },
    title: { en: "Understanding cancer care", ar: "فهم رعاية الأورام" },
    description: {
      en: "Practical, plain-language articles to help you prepare for appointments, understand treatment and look after yourself.",
      ar: "مقالات عملية بلغة بسيطة تساعدك على الاستعداد للمواعيد وفهم العلاج والعناية بنفسك.",
    },
    image: pageHeroImages.articles,
  },

  featuredLabel: { en: "Featured article", ar: "مقال مميز" },
  featuredId: "first-consultation",
  moreTitle: { en: "More articles", ar: "مقالات أخرى" },

  articles: [
    {
      id: "first-consultation",
      category: gettingStarted,
      title: {
        en: "Preparing for your first oncology consultation",
        ar: "الاستعداد لاستشارتك الأولى في طب الأورام",
      },
      excerpt: {
        en: "A little preparation can make your first visit calmer and more useful. Here is what to bring, what to ask and what to expect.",
        ar: "قليل من الاستعداد يجعل زيارتك الأولى أكثر هدوءًا وفائدة. إليك ما تحضره، وما تسأل عنه، وما يمكنك توقعه.",
      },
      image: articleImages.firstConsultation,
      body: [
        paragraph(
          "A first appointment with an oncologist can feel overwhelming. Preparing in advance helps you make the most of the time and leave with a clearer picture of the next steps.",
          "قد تبدو الزيارة الأولى لطبيب الأورام مُربكة، لكن الاستعداد المسبق يساعدك على الاستفادة من الوقت والخروج بتصوّر أوضح للخطوات التالية.",
        ),
        heading("What to bring", "ما الذي تُحضره معك"),
        list(
          [
            "Pathology or biopsy reports",
            "Imaging scans (on a disc or USB drive, if available) and their written reports",
            "Recent blood test results",
            "A list of all medicines and supplements you take",
            "Details of allergies and previous illnesses",
          ],
          [
            "تقارير التحليل النسيجي أو الخزعة",
            "صور الأشعة (على قرص أو ذاكرة USB إن توفرت) وتقاريرها المكتوبة",
            "أحدث نتائج تحاليل الدم",
            "قائمة بجميع الأدوية والمكملات التي تتناولها",
            "تفاصيل الحساسية والأمراض السابقة",
          ],
        ),
        heading("Questions you may want to ask", "أسئلة قد ترغب في طرحها"),
        list(
          [
            "What type of cancer do I have, and what stage is it?",
            "Are further tests needed?",
            "What treatment options are available, and what are their goals?",
            "How might treatment affect my daily life and work?",
          ],
          [
            "ما نوع الورم لديّ وما مرحلته؟",
            "هل أحتاج إلى فحوص إضافية؟",
            "ما الخيارات العلاجية المتاحة، وما أهدافها؟",
            "كيف قد يؤثر العلاج في حياتي اليومية وعملي؟",
          ],
        ),
        heading("During the visit", "أثناء الزيارة"),
        paragraph(
          "Expect a conversation about your health, symptoms and concerns, and a review of your reports. It is fine to ask for anything to be repeated or written down. Bringing someone you trust can help you remember what was discussed.",
          "توقّع حديثًا عن صحتك وأعراضك ومخاوفك، ومراجعةً لتقاريرك. ولا حرج في أن تطلب إعادة أي معلومة أو كتابتها، كما أن اصطحاب شخص تثق به يساعدك على تذكّر ما دار في الزيارة.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
    {
      id: "pathology-report",
      category: { en: "Understanding your diagnosis", ar: "فهم التشخيص" },
      title: { en: "Understanding your pathology report", ar: "فهم تقرير التحليل النسيجي" },
      excerpt: {
        en: "Pathology reports can be technical. This guide explains common terms and why they matter for your care.",
        ar: "قد تبدو تقارير التحليل النسيجي معقدة. يشرح هذا الدليل المصطلحات الشائعة وأهميتها في رعايتك.",
      },
      image: articleImages.pathology,
      body: [
        paragraph(
          "A pathology report describes what was found when a tissue sample was examined under a microscope. It is one of the most important documents in planning cancer treatment.",
          "يصف تقرير التحليل النسيجي ما تبيّن عند فحص عينة من النسيج تحت المجهر، وهو من أهم الوثائق في التخطيط لعلاج الأورام.",
        ),
        heading("Common terms", "مصطلحات شائعة"),
        list(
          [
            "Tumor type: the kind of cell in which the cancer started",
            "Grade: how different the cells look from normal cells, which can suggest how quickly they may grow",
            "Margins: whether cancer cells reach the edge of a sample removed during surgery",
            "Biomarkers: specific proteins or genetic changes that can guide treatment choices",
          ],
          [
            "نوع الورم: نوع الخلايا التي نشأ منها الورم",
            "الدرجة: مدى اختلاف الخلايا عن الخلايا الطبيعية، وقد تشير إلى سرعة نموها",
            "الحواف: ما إذا كانت الخلايا السرطانية تصل إلى حافة العينة المستأصلة جراحيًا",
            "المؤشرات الحيوية: بروتينات أو تغيّرات جينية محددة قد توجّه اختيار العلاج",
          ],
        ),
        heading("Why it matters", "لماذا هو مهم"),
        paragraph(
          "Together with imaging, the pathology report helps determine the stage of the cancer and which treatments are most likely to help. Sometimes additional tests on the same sample are requested to answer specific questions.",
          "يساعد تقرير التحليل النسيجي، مع صور الأشعة، في تحديد مرحلة الورم والعلاجات الأكثر احتمالًا للفائدة، وقد تُطلب أحيانًا فحوص إضافية على العينة نفسها للإجابة عن أسئلة محددة.",
        ),
        paragraph(
          "Reports use specialized language, so it is normal to have questions. Your doctor can go through the report with you and explain what each part means for your care.",
          "تستخدم التقارير لغة متخصصة، لذا من الطبيعي أن تكون لديك أسئلة، ويمكن لطبيبك مراجعة التقرير معك وشرح دلالة كل جزء منه على رعايتك.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
    {
      id: "nutrition",
      category: livingWell,
      title: { en: "Eating well during cancer treatment", ar: "التغذية الجيدة أثناء علاج الأورام" },
      excerpt: {
        en: "Treatment can change appetite and taste. Simple, practical habits can help you keep your strength.",
        ar: "قد يغيّر العلاج الشهية وحاسة التذوق، لكن عادات بسيطة وعملية تساعدك على الحفاظ على قوتك.",
      },
      image: articleImages.nutrition,
      body: [
        paragraph(
          "Good nutrition helps the body cope with treatment and recover afterwards. At the same time, treatment can affect appetite, taste and digestion, so eating well may need a flexible approach.",
          "تساعد التغذية الجيدة الجسم على تحمّل العلاج والتعافي بعده، وفي الوقت نفسه قد يؤثر العلاج في الشهية والتذوق والهضم، لذا قد تتطلب التغذية الجيدة شيئًا من المرونة.",
        ),
        heading("Practical tips", "نصائح عملية"),
        list(
          [
            "Eat small, frequent meals if large meals feel difficult",
            "Include a source of protein — such as eggs, dairy, fish, poultry or legumes — at most meals",
            "Drink fluids regularly through the day unless you have been advised otherwise",
            "Keep easy snacks within reach for days when energy is low",
          ],
          [
            "تناول وجبات صغيرة ومتكررة إن كانت الوجبات الكبيرة صعبة",
            "احرص على مصدر للبروتين، مثل البيض أو الألبان أو الأسماك أو الدواجن أو البقوليات، في معظم الوجبات",
            "اشرب السوائل بانتظام على مدار اليوم ما لم يُنصح بغير ذلك",
            "احتفظ بوجبات خفيفة سهلة في متناولك للأيام التي تقل فيها طاقتك",
          ],
        ),
        heading("When to ask for help", "متى تطلب المساعدة"),
        paragraph(
          "Let your care team know if you are losing weight without trying, have difficulty swallowing, or have ongoing nausea, vomiting or diarrhea. These problems can often be treated.",
          "أخبر فريق الرعاية إن كنت تفقد وزنك دون قصد، أو تجد صعوبة في البلع، أو تعاني غثيانًا أو قيئًا أو إسهالًا مستمرًا، فكثيرًا ما يمكن علاج هذه المشكلات.",
        ),
        note(
          "Check with your doctor before starting supplements or herbal products, as some may interact with cancer treatment.",
          "استشر طبيبك قبل البدء بأي مكملات أو منتجات عشبية، فبعضها قد يتداخل مع علاج الأورام.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
    {
      id: "fatigue",
      category: livingWell,
      title: { en: "Coping with fatigue during treatment", ar: "التعامل مع الإرهاق أثناء العلاج" },
      excerpt: {
        en: "Fatigue is one of the most common effects of cancer and its treatment. Small changes can make it easier to manage.",
        ar: "الإرهاق من أكثر آثار الأورام وعلاجها شيوعًا، وقد تساعد تغييرات بسيطة على التعامل معه بسهولة أكبر.",
      },
      image: articleImages.fatigue,
      body: [
        paragraph(
          "Cancer-related fatigue is different from ordinary tiredness: it may not improve fully with rest and can affect concentration and mood. It is common, and it is worth talking about.",
          "يختلف الإرهاق المرتبط بالأورام عن التعب المعتاد؛ فقد لا يتحسن تمامًا بالراحة، وقد يؤثر في التركيز والمزاج. وهو شائع، ويستحق الحديث عنه.",
        ),
        heading("Strategies that may help", "أساليب قد تساعد"),
        list(
          [
            "Plan important activities for the times of day when you have more energy",
            "Balance rest with gentle activity, such as short walks, if your doctor agrees",
            "Accept offers of help with daily tasks",
            "Keep a regular sleep routine",
          ],
          [
            "خطّط للأنشطة المهمة في الأوقات التي تكون فيها طاقتك أعلى",
            "وازن بين الراحة والنشاط الخفيف، كالمشي القصير، بعد موافقة طبيبك",
            "تقبّل عروض المساعدة في المهام اليومية",
            "حافظ على مواعيد نوم منتظمة",
          ],
        ),
        heading("Causes worth checking", "أسباب تستحق الفحص"),
        paragraph(
          "Fatigue can sometimes be made worse by treatable problems such as anemia, poor sleep, pain or low mood. Mentioning it to your care team allows these to be looked for.",
          "قد يزداد الإرهاق أحيانًا بسبب مشكلات قابلة للعلاج، مثل فقر الدم أو اضطراب النوم أو الألم أو انخفاض المزاج، وإخبار فريق الرعاية بذلك يتيح البحث عنها.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
    {
      id: "immunotherapy",
      category: { en: "Treatments", ar: "العلاجات" },
      title: { en: "How immunotherapy works", ar: "كيف يعمل العلاج المناعي" },
      excerpt: {
        en: "Immunotherapy uses the body's own defenses against cancer. A simple explanation of what it is and what to watch for.",
        ar: "يستعين العلاج المناعي بدفاعات الجسم الطبيعية ضد الأورام. إليك شرحًا مبسطًا لماهيته وما ينبغي الانتباه إليه.",
      },
      image: articleImages.immunotherapy,
      body: [
        paragraph(
          "The immune system normally protects the body by recognizing and removing abnormal cells. Some cancer cells develop ways to hide from it. Immunotherapy medicines help the immune system recognize these cells again.",
          "يحمي الجهاز المناعي الجسم عادةً بالتعرّف على الخلايا غير الطبيعية والتخلص منها، لكن بعض الخلايا السرطانية تطوّر طرقًا للاختباء منه، وتساعد أدوية العلاج المناعي الجهاز المناعي على التعرّف على هذه الخلايا من جديد.",
        ),
        heading("Who it may help", "لمن قد يكون مفيدًا"),
        paragraph(
          "Immunotherapy is effective for some cancer types and situations, but not all. Tests on the tumor, together with its type and stage, help decide whether it is a suitable option.",
          "العلاج المناعي فعّال في بعض أنواع الأورام وحالاتها دون غيرها، وتساعد فحوص الورم، إلى جانب نوعه ومرحلته، في تحديد ما إذا كان خيارًا مناسبًا.",
        ),
        heading("Side effects to know about", "آثار جانبية ينبغي معرفتها"),
        paragraph(
          "Because immunotherapy activates the immune system, it can sometimes cause inflammation in healthy organs. Possible signs include:",
          "لأن العلاج المناعي ينشّط الجهاز المناعي، فقد يسبب أحيانًا التهابًا في أعضاء سليمة، ومن العلامات المحتملة:",
        ),
        list(
          [
            "New or worsening diarrhea",
            "Skin rash or itching",
            "Cough or shortness of breath",
            "Unusual tiredness or other new symptoms",
          ],
          [
            "إسهال جديد أو متزايد",
            "طفح جلدي أو حكة",
            "سعال أو ضيق في التنفس",
            "إرهاق غير معتاد أو أي أعراض جديدة أخرى",
          ],
        ),
        note(
          "Report new symptoms to your care team promptly, even if they appear weeks after treatment.",
          "أبلغ فريق الرعاية فورًا عن أي أعراض جديدة، حتى لو ظهرت بعد أسابيع من العلاج.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
    {
      id: "treatment-questions",
      category: gettingStarted,
      title: {
        en: "Questions to ask about your treatment plan",
        ar: "أسئلة تطرحها حول خطتك العلاجية",
      },
      excerpt: {
        en: "Understanding your plan helps you take part in decisions. These questions can guide the conversation.",
        ar: "فهم خطتك العلاجية يساعدك على المشاركة في القرار، وهذه الأسئلة قد توجّه الحديث مع طبيبك.",
      },
      image: articleImages.questions,
      body: [
        paragraph(
          "Treatment decisions are best made together. Asking questions helps you understand the reasons behind a recommendation and what it will mean for you.",
          "تُتخذ قرارات العلاج على أفضل وجه بصورة مشتركة، وطرح الأسئلة يساعدك على فهم أسباب التوصية وما تعنيه بالنسبة إليك.",
        ),
        heading("About the plan", "عن الخطة"),
        list(
          [
            "What is the goal of this treatment?",
            "Are there other options, and how do they compare?",
            "How long will treatment last, and how often will I need to visit?",
          ],
          [
            "ما الهدف من هذا العلاج؟",
            "هل توجد خيارات أخرى، وكيف تقارن بها؟",
            "كم سيستغرق العلاج، وكم مرة سأحتاج إلى الزيارة؟",
          ],
        ),
        heading("About daily life", "عن الحياة اليومية"),
        list(
          [
            "Which side effects are most likely, and how can they be managed?",
            "Can I continue working or travelling during treatment?",
            "Who should I contact if I feel unwell?",
          ],
          [
            "ما الآثار الجانبية الأكثر احتمالًا، وكيف يمكن التعامل معها؟",
            "هل يمكنني مواصلة العمل أو السفر أثناء العلاج؟",
            "بمن أتواصل إذا شعرت بتوعك؟",
          ],
        ),
        paragraph(
          "Writing your questions down before the appointment, and noting the answers, can make it easier to remember what was discussed.",
          "كتابة أسئلتك قبل الموعد وتدوين الإجابات يسهّلان تذكّر ما دار من نقاش.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
    {
      id: "supporting-loved-one",
      category: { en: "Family & support", ar: "الأسرة والدعم" },
      title: {
        en: "Supporting a loved one through cancer care",
        ar: "دعم أحد أحبائك خلال رحلة العلاج",
      },
      excerpt: {
        en: "Family members play an important role. Practical help and open communication can support everyone involved.",
        ar: "لأفراد الأسرة دور مهم، والمساعدة العملية والتواصل الصريح يدعمان الجميع.",
      },
      image: articleImages.family,
      body: [
        paragraph(
          "When someone close to you is diagnosed with cancer, it is natural to want to help but to be unsure how. Support often matters most in small, practical ways.",
          "عندما يُشخَّص شخص قريب منك بالسرطان، من الطبيعي أن ترغب في المساعدة دون أن تعرف كيف، وكثيرًا ما يكون الدعم الأهم في تفاصيل صغيرة وعملية.",
        ),
        heading("Ways to help", "طرق للمساعدة"),
        list(
          [
            "Offer to come to appointments and take notes",
            "Help with everyday tasks such as meals, transport or childcare",
            "Listen without needing to have all the answers",
            "Respect their wishes about what to share, and with whom",
          ],
          [
            "اعرض مرافقته إلى المواعيد وتدوين الملاحظات",
            "ساعد في المهام اليومية، كإعداد الطعام أو التنقل أو رعاية الأطفال",
            "أنصت إليه دون أن تشعر بأن عليك امتلاك كل الإجابات",
            "احترم رغبته فيما يشاركه ومع من يشاركه",
          ],
        ),
        heading("Looking after yourself", "اعتنِ بنفسك أيضًا"),
        paragraph(
          "Caring for someone can be tiring. Taking breaks, accepting help from others and talking about your own feelings will help you keep offering support.",
          "قد تكون رعاية شخص آخر مُتعبة، وأخذ فترات للراحة، وقبول المساعدة من الآخرين، والتعبير عن مشاعرك، كلها أمور تساعدك على الاستمرار في تقديم الدعم.",
        ),
      ],
      reviewedBy: null,
      isPlaceholder: true,
    },
  ],
};
