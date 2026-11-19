/**
 * Surgical service groups (4–9 on the Services page), in English and Arabic.
 *
 * General, medically cautious PLACEHOLDER content, based on the topics of the
 * articles written in the CMS. It must be reviewed and approved by
 * Dr. Othman Shaker before publication (`isPlaceholder: true`); the photos
 * are temporary stock images to replace in the CMS media library.
 *
 * The same entries were added to the CMS database by
 * supabase/data/20261119_six_service_groups.sql, where they are edited from now on.
 */
import { heading, list, paragraph } from "./blocks";
import {
  ctaImage,
  featuredVideoPosters,
  introductionVideoPoster,
  pageHeroImages,
  specialtyImages,
  treatmentImages,
  whyChooseImage,
} from "./media";
import type { ServiceGroup } from "./types";

const careMayInclude = heading("What care may include", "ما قد تشمله الرعاية");
const urgentSigns = heading("Signs that need urgent care", "علامات تستدعي رعاية عاجلة");

export const surgicalServiceGroups: ServiceGroup[] = [
  {
    id: "hernia-surgery",
    eyebrow: { en: "Hernia surgery", ar: "جراحة الفتق" },
    title: { en: "Hernias and the abdominal wall", ar: "الفتق وجدار البطن" },
    description: {
      en: "Assessment and repair of hernias of the groin, the navel and previous scars, open or laparoscopic, planned around each patient's health and daily life.",
      ar: "تقييم وإصلاح فتق الأربية والسرة وفتق الجروح السابقة، بالجراحة المفتوحة أو بالمنظار، وفق الحالة الصحية ونمط الحياة لكل مريض.",
    },
    services: [
      {
        id: "inguinal-hernia",
        title: { en: "Inguinal hernia", ar: "الفتق الإربي" },
        summary: {
          en: "A bulge in the groin, assessed and repaired with a surgical mesh, often by laparoscopy.",
          ar: "انتفاخ في منطقة الأربية يُقيَّم ويُصلَح غالبًا باستخدام شبكة جراحية، وكثيرًا ما يكون ذلك بالمنظار.",
        },
        image: featuredVideoPosters.firstVisit,
        details: [
          paragraph(
            "An inguinal hernia happens when tissue pushes through a weak spot in the lower abdominal wall, causing a bulge in the groin that may ache when lifting, coughing or standing for long.",
            "يحدث الفتق الإربي عندما تبرز أنسجة من نقطة ضعف في جدار البطن السفلي، فيظهر انتفاخ في منطقة الأربية قد يؤلم عند رفع الأشياء أو السعال أو الوقوف طويلًا.",
          ),
          careMayInclude,
          list(
            [
              "Clinical examination and, when needed, an ultrasound",
              "Repair with a surgical mesh, open or laparoscopic",
              "Advice on returning to work, lifting and exercise",
              "Urgent assessment if the bulge becomes painful, hard or cannot be pushed back",
            ],
            [
              "فحص سريري، وأشعة بالموجات فوق الصوتية عند الحاجة",
              "الإصلاح باستخدام شبكة جراحية بالجراحة المفتوحة أو بالمنظار",
              "إرشادات العودة إلى العمل ورفع الأشياء وممارسة الرياضة",
              "تقييم عاجل إذا أصبح الانتفاخ مؤلمًا أو صلبًا أو تعذّر إرجاعه",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "umbilical-hernia",
        title: { en: "Umbilical hernia", ar: "الفتق السري" },
        summary: {
          en: "Hernias at or near the navel, repaired to relieve symptoms and prevent complications.",
          ar: "فتق عند السرة أو بالقرب منها يُصلَح لتخفيف الأعراض والوقاية من المضاعفات.",
        },
        image: ctaImage,
        details: [
          paragraph(
            "Umbilical and paraumbilical hernias appear as a bulge at or around the navel. They are more common with weight gain, pregnancy or a persistent cough.",
            "يظهر الفتق السري أو المجاور للسرة على شكل انتفاخ عند السرة أو حولها، ويزداد شيوعه مع زيادة الوزن أو الحمل أو السعال المزمن.",
          ),
          careMayInclude,
          list(
            [
              "Assessing the size of the hernia and its contents",
              "Repair with stitches or a mesh, depending on its size",
              "Guidance on weight and activity to reduce recurrence",
              "Urgent review if pain, redness or vomiting appear",
            ],
            [
              "تقييم حجم الفتق ومحتواه",
              "الإصلاح بالغرز أو بالشبكة الجراحية حسب حجمه",
              "إرشادات بشأن الوزن والنشاط للحد من تكرار الفتق",
              "مراجعة عاجلة عند ظهور ألم أو احمرار أو قيء",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "incisional-hernia",
        title: { en: "Incisional hernia", ar: "الفتق الجراحي" },
        summary: {
          en: "A hernia at the scar of a previous operation, planned carefully because of its size and position.",
          ar: "فتق يظهر مكان جرح عملية سابقة، ويُخطَّط لإصلاحه بعناية وفق حجمه وموضعه.",
        },
        image: whyChooseImage,
        details: [
          paragraph(
            "An incisional hernia develops where the abdominal wall did not heal fully after surgery. Its repair is tailored to its size, the previous operation and the patient's general health.",
            "ينشأ الفتق الجراحي حين لا يلتئم جدار البطن تمامًا بعد عملية سابقة، ويُصمَّم إصلاحه بحسب حجمه وطبيعة العملية السابقة والحالة الصحية العامة.",
          ),
          heading("Planning may include", "قد يشمل التخطيط"),
          list(
            [
              "Imaging such as a CT scan to measure the defect",
              "Preparing for surgery, including advice on weight and smoking",
              "Mesh repair, open or laparoscopic",
              "Follow-up to check the healing of the wound and the abdominal wall",
            ],
            [
              "فحوص تصويرية مثل الأشعة المقطعية لقياس الفتحة",
              "التحضير للجراحة، بما في ذلك إرشادات الوزن والتدخين",
              "الإصلاح بالشبكة الجراحية بالجراحة المفتوحة أو بالمنظار",
              "المتابعة للتأكد من التئام الجرح وجدار البطن",
            ],
          ),
        ],
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "gallbladder-surgery",
    eyebrow: { en: "Gallbladder", ar: "المرارة" },
    title: { en: "Gallbladder and bile duct surgery", ar: "جراحة المرارة والقنوات المرارية" },
    description: {
      en: "Care for gallstones and their complications, with laparoscopic surgery as the usual approach when an operation is recommended.",
      ar: "رعاية حصوات المرارة ومضاعفاتها، مع اعتماد الجراحة بالمنظار عادةً عندما يُوصى بالتدخل الجراحي.",
    },
    services: [
      {
        id: "laparoscopic-cholecystectomy",
        title: { en: "Laparoscopic gallbladder removal", ar: "استئصال المرارة بالمنظار" },
        summary: {
          en: "The usual operation for gallstones that cause symptoms, through small incisions with a short hospital stay.",
          ar: "العملية المعتادة لحصوات المرارة المسببة للأعراض، عبر فتحات صغيرة مع إقامة قصيرة في المستشفى.",
        },
        image: introductionVideoPoster,
        details: [
          paragraph(
            "When gallstones cause pain or complications, removing the gallbladder by laparoscopy is usually recommended. Most people go home within a day or two and return to their activities gradually.",
            "عندما تسبب حصوات المرارة ألمًا أو مضاعفات، يُوصى عادةً باستئصال المرارة بالمنظار، ويعود معظم المرضى إلى منازلهم خلال يوم أو يومين ثم يستأنفون نشاطهم تدريجيًا.",
          ),
          heading("What to expect", "ما يمكن توقعه"),
          list(
            [
              "An ultrasound and blood tests before the operation",
              "General anesthesia and a few small incisions",
              "Pain relief and walking early after surgery",
              "Advice on diet and activity during recovery",
            ],
            [
              "أشعة بالموجات فوق الصوتية وتحاليل دم قبل العملية",
              "تخدير كلي وبضع فتحات صغيرة",
              "تسكين الألم والحركة المبكرة بعد الجراحة",
              "إرشادات حول الغذاء والنشاط خلال فترة التعافي",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "acute-cholecystitis",
        title: { en: "Acute cholecystitis", ar: "التهاب المرارة الحاد" },
        summary: {
          en: "Sudden inflammation of the gallbladder, usually caused by a gallstone, which needs prompt assessment.",
          ar: "التهاب مفاجئ في المرارة يحدث غالبًا بسبب حصوة، ويحتاج إلى تقييم سريع.",
        },
        image: specialtyImages.thoracic,
        details: [
          paragraph(
            "Acute cholecystitis causes persistent pain in the upper right abdomen, often with fever and nausea. Treatment starts in hospital, and removing the gallbladder is usually advised, early or once the inflammation settles.",
            "يسبب التهاب المرارة الحاد ألمًا مستمرًا في أعلى البطن من الجهة اليمنى، وكثيرًا ما يصاحبه ارتفاع في الحرارة وغثيان. يبدأ العلاج في المستشفى، ويُنصح عادةً باستئصال المرارة مبكرًا أو بعد هدوء الالتهاب.",
          ),
          urgentSigns,
          list(
            [
              "Severe pain under the right ribs lasting several hours",
              "Fever or shivering",
              "Yellowing of the eyes or skin",
              "Repeated vomiting",
            ],
            [
              "ألم شديد أسفل الضلوع اليمنى يستمر عدة ساعات",
              "ارتفاع الحرارة أو الرعشة",
              "اصفرار العينين أو الجلد",
              "القيء المتكرر",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "bile-duct-stones",
        title: { en: "Bile duct stones", ar: "حصوات القناة المرارية" },
        summary: {
          en: "Stones that move into the bile duct, treated in coordination with endoscopy specialists.",
          ar: "حصوات تنتقل إلى القناة المرارية، وتُعالج بالتنسيق مع أطباء المناظير.",
        },
        image: pageHeroImages.services,
        details: [
          paragraph(
            "Gallstones can pass into the common bile duct and block the flow of bile, causing jaundice, pain or infection. They are often removed by endoscopy (ERCP), and the gallbladder is removed afterwards.",
            "قد تنتقل حصوات المرارة إلى القناة المرارية الرئيسية فتعيق تدفق العصارة الصفراوية، مسببةً الصفراء أو الألم أو الالتهاب. وكثيرًا ما تُستخرج بالمنظار الداخلي (ERCP)، ثم تُستأصل المرارة بعد ذلك.",
          ),
          careMayInclude,
          list(
            [
              "Blood tests and imaging such as an MRCP",
              "Coordination with the endoscopy team",
              "Timing the gallbladder removal once the duct is cleared",
              "Follow-up of liver tests",
            ],
            [
              "تحاليل دم وفحوص تصويرية مثل الرنين المغناطيسي للقنوات المرارية",
              "التنسيق مع فريق المناظير",
              "تحديد موعد استئصال المرارة بعد تنظيف القناة",
              "متابعة تحاليل وظائف الكبد",
            ],
          ),
        ],
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "colorectal-surgery",
    eyebrow: { en: "Colon & rectum", ar: "القولون والمستقيم" },
    title: { en: "Colorectal and anal surgery", ar: "جراحة القولون والمستقيم والشرج" },
    description: {
      en: "From colon and rectal tumors to common problems that people often find hard to talk about, such as hemorrhoids, fissures and fistulas — discussed openly and treated with care.",
      ar: "من أورام القولون والمستقيم إلى المشكلات الشائعة التي قد يتحرّج البعض من الحديث عنها، مثل البواسير والشرخ والناسور، تُناقش بصراحة وتُعالج بعناية.",
    },
    services: [
      {
        id: "colorectal-tumors",
        title: { en: "Colorectal tumor surgery", ar: "جراحة أورام القولون والمستقيم" },
        summary: {
          en: "Surgery as part of a plan agreed with the oncology team, open or laparoscopic.",
          ar: "الجراحة كجزء من خطة علاجية متفق عليها مع فريق الأورام، بالجراحة المفتوحة أو بالمنظار.",
        },
        image: specialtyImages.gastrointestinal,
        details: [
          paragraph(
            "Removing the affected part of the colon or rectum, with the nearby lymph nodes, is central to treating most colorectal tumors. The plan is agreed with the oncology team and may include treatment before or after the operation.",
            "يُعد استئصال الجزء المصاب من القولون أو المستقيم مع الغدد الليمفاوية المجاورة محورًا أساسيًا في علاج معظم أورام القولون والمستقيم، وتُتفق الخطة مع فريق الأورام، وقد تشمل علاجًا قبل العملية أو بعدها.",
          ),
          careMayInclude,
          list(
            [
              "Reviewing colonoscopy, biopsy and scan results",
              "Discussing the operation and whether a stoma may be needed",
              "An enhanced recovery program after surgery",
              "Follow-up with the oncology team",
            ],
            [
              "مراجعة نتائج منظار القولون والعينة والأشعة",
              "مناقشة العملية واحتمال الحاجة إلى فتحة مؤقتة أو دائمة في البطن",
              "برنامج التعافي السريع بعد الجراحة",
              "المتابعة مع فريق الأورام",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "hemorrhoids",
        title: { en: "Hemorrhoids", ar: "البواسير" },
        summary: {
          en: "Treatment matched to the grade of the hemorrhoids, from diet and medicines to simple procedures and surgery.",
          ar: "علاج يتناسب مع درجة البواسير، من الغذاء والأدوية إلى الإجراءات البسيطة والجراحة.",
        },
        image: treatmentImages.hormonal,
        details: [
          paragraph(
            "Hemorrhoids can cause bleeding, swelling or discomfort. Many improve with fiber, fluids and medicines; persistent or advanced cases may need a procedure or surgery.",
            "قد تسبب البواسير نزيفًا أو تورمًا أو انزعاجًا، ويتحسن كثير منها بالألياف والسوائل والأدوية، بينما قد تحتاج الحالات المستمرة أو المتقدمة إلى إجراء بسيط أو جراحة.",
          ),
          heading("Good to know", "معلومات مهمة"),
          list(
            [
              "Rectal bleeding should always be examined, even when hemorrhoids are suspected",
              "Treatment depends on the grade of the hemorrhoids and on the symptoms",
              "Avoiding constipation helps prevent recurrence",
            ],
            [
              "ينبغي فحص أي نزيف من الشرج دائمًا، حتى عند الاشتباه في البواسير",
              "يعتمد العلاج على درجة البواسير والأعراض",
              "تجنّب الإمساك يساعد على منع تكرارها",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "anal-fissure",
        title: { en: "Anal fissure", ar: "الشرخ الشرجي" },
        summary: {
          en: "A small tear that causes sharp pain with bowel movements, usually treated without surgery first.",
          ar: "تمزق صغير يسبب ألمًا حادًا أثناء التبرز، ويُعالج عادةً دون جراحة في البداية.",
        },
        image: featuredVideoPosters.medications,
        details: [
          paragraph(
            "An anal fissure causes sharp, burning pain during and after bowel movements, sometimes with light bleeding. Most heal with stool softeners and prescribed creams; long-standing fissures may need a minor operation.",
            "يسبب الشرخ الشرجي ألمًا حادًا وحرقانًا أثناء التبرز وبعده، وأحيانًا نزيفًا بسيطًا. يلتئم معظمه بملينات البراز والكريمات العلاجية، وقد يحتاج الشرخ المزمن إلى جراحة بسيطة.",
          ),
          careMayInclude,
          list(
            [
              "An examination to confirm the diagnosis",
              "Diet advice, stool softeners and prescribed creams",
              "A Botox injection or a minor operation for fissures that do not heal",
            ],
            [
              "فحص لتأكيد التشخيص",
              "إرشادات غذائية وملينات وكريمات علاجية",
              "حقن البوتوكس أو جراحة بسيطة للشرخ الذي لا يلتئم",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "anal-fistula",
        title: { en: "Anal fistula and abscess", ar: "الناسور والخراج الشرجي" },
        summary: {
          en: "Draining an abscess and treating a fistula while protecting continence.",
          ar: "تصريف الخراج وعلاج الناسور مع الحفاظ على التحكم في الإخراج.",
        },
        image: ctaImage,
        details: [
          paragraph(
            "An abscess near the anus causes painful swelling and fever and needs drainage. Some abscesses leave a fistula, a small tunnel that discharges, which is treated with a procedure chosen to protect the sphincter muscles.",
            "يسبب الخراج بجوار فتحة الشرج تورمًا مؤلمًا وارتفاعًا في الحرارة، ويحتاج إلى تصريف. وقد يترك بعض الخراجات ناسورًا، وهو قناة صغيرة تفرز إفرازات، ويُعالج بإجراء يُختار للحفاظ على عضلات التحكم.",
          ),
          careMayInclude,
          list(
            [
              "Prompt drainage of an abscess",
              "An MRI to map a complex fistula when needed",
              "A procedure tailored to each case, sometimes in stages",
              "Wound care and follow-up until healed",
            ],
            [
              "تصريف الخراج دون تأخير",
              "رنين مغناطيسي لتحديد مسار الناسور المعقّد عند الحاجة",
              "إجراء مناسب لكل حالة، وأحيانًا على مراحل",
              "العناية بالجرح والمتابعة حتى الالتئام",
            ],
          ),
        ],
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "upper-gi-surgery",
    eyebrow: { en: "Esophagus & stomach", ar: "المريء والمعدة" },
    title: { en: "Esophageal and stomach surgery", ar: "جراحة المريء والمعدة" },
    description: {
      en: "Surgical care for reflux and hiatal hernia, stomach tumors and the complications of ulcers, after a careful assessment of symptoms and test results.",
      ar: "رعاية جراحية لحالات الارتجاع وفتق الحجاب الحاجز وأورام المعدة ومضاعفات القرحة، بعد تقييم دقيق للأعراض ونتائج الفحوص.",
    },
    services: [
      {
        id: "hiatal-hernia-reflux",
        title: { en: "Hiatal hernia and reflux", ar: "فتق الحجاب الحاجز والارتجاع" },
        summary: {
          en: "Laparoscopic repair for reflux and hiatal hernia when medicines and lifestyle changes are not enough.",
          ar: "إصلاح بالمنظار للارتجاع وفتق الحجاب الحاجز عندما لا تكفي الأدوية وتغيير نمط الحياة.",
        },
        image: specialtyImages.gastrointestinal,
        details: [
          paragraph(
            "A hiatal hernia lets part of the stomach slide up into the chest and can make acid reflux worse. Most people are treated with medicines and lifestyle changes; surgery is considered for persistent symptoms, complications or large hernias.",
            "يسمح فتق الحجاب الحاجز بانزلاق جزء من المعدة إلى التجويف الصدري، وقد يزيد الارتجاع الحمضي سوءًا. يُعالج معظم المرضى بالأدوية وتغيير نمط الحياة، وتُدرس الجراحة عند استمرار الأعراض أو حدوث مضاعفات أو كِبر حجم الفتق.",
          ),
          heading("Before deciding on surgery", "قبل اتخاذ قرار الجراحة"),
          list(
            [
              "An upper endoscopy to examine the esophagus and stomach",
              "Swallowing and acid tests when needed",
              "Laparoscopic repair of the hernia with a fundoplication",
              "Diet advice for the first weeks after the operation",
            ],
            [
              "منظار علوي لفحص المريء والمعدة",
              "فحوص البلع والحموضة عند الحاجة",
              "إصلاح الفتق بالمنظار مع عملية لفّ أعلى المعدة",
              "إرشادات غذائية للأسابيع الأولى بعد العملية",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "stomach-tumors",
        title: { en: "Stomach tumor surgery", ar: "جراحة أورام المعدة" },
        summary: {
          en: "Surgery planned with the oncology team, often combined with treatment before and after the operation.",
          ar: "جراحة تُخطَّط مع فريق الأورام، وكثيرًا ما تُدمج مع علاج قبل العملية وبعدها.",
        },
        image: whyChooseImage,
        details: [
          paragraph(
            "Stomach tumors are diagnosed by endoscopy and biopsy, then staged with scans. When surgery is recommended, part or all of the stomach is removed with the nearby lymph nodes, usually alongside chemotherapy.",
            "تُشخَّص أورام المعدة بالمنظار وأخذ العينة، ثم تُحدَّد مرحلتها بالأشعة. وعندما يُوصى بالجراحة يُستأصل جزء من المعدة أو المعدة كلها مع الغدد الليمفاوية المجاورة، وغالبًا ما يصاحب ذلك علاج كيميائي.",
          ),
          careMayInclude,
          list(
            [
              "Reviewing endoscopy, pathology and staging scans",
              "Discussion at a multidisciplinary meeting",
              "Nutritional support before and after surgery",
              "Long-term follow-up and advice on eating",
            ],
            [
              "مراجعة نتائج المنظار والعينة وأشعة تحديد المرحلة",
              "مناقشة الحالة في اجتماع متعدد التخصصات",
              "دعم غذائي قبل الجراحة وبعدها",
              "متابعة طويلة المدى وإرشادات حول الأكل",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "peptic-ulcer-complications",
        title: { en: "Ulcer complications", ar: "مضاعفات قرحة المعدة والاثني عشر" },
        summary: {
          en: "Urgent surgical care for a perforated or bleeding ulcer when other treatments are not enough.",
          ar: "رعاية جراحية عاجلة لثقب القرحة أو نزيفها عندما لا تكفي العلاجات الأخرى.",
        },
        image: featuredVideoPosters.firstVisit,
        details: [
          paragraph(
            "Most ulcers heal with medicines. Surgery is needed when an ulcer perforates, bleeds heavily despite endoscopic treatment, or narrows the outlet of the stomach.",
            "تلتئم معظم القرح بالأدوية، وتصبح الجراحة ضرورية عندما يحدث ثقب في القرحة، أو نزيف شديد رغم العلاج بالمنظار، أو ضيق في مخرج المعدة.",
          ),
          urgentSigns,
          list(
            [
              "Sudden, severe abdominal pain",
              "Vomiting blood or passing black stools",
              "Dizziness or fainting",
              "Repeated vomiting after meals",
            ],
            ["ألم مفاجئ وشديد في البطن", "قيء دموي أو براز أسود", "دوخة أو إغماء", "قيء متكرر بعد الوجبات"],
          ),
        ],
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "endocrine-surgery",
    eyebrow: { en: "Endocrine glands", ar: "الغدد الصماء" },
    title: { en: "Thyroid, parathyroid and adrenal surgery", ar: "جراحة الغدة الدرقية والجار درقية والكظرية" },
    description: {
      en: "Operations on the hormone glands, planned with endocrinologists and guided by blood tests, imaging and, when needed, biopsies.",
      ar: "عمليات على الغدد المسؤولة عن الهرمونات، تُخطَّط مع أطباء الغدد الصماء وتسترشد بالتحاليل والأشعة والعينات عند الحاجة.",
    },
    services: [
      {
        id: "thyroid-surgery",
        title: { en: "Thyroid surgery", ar: "جراحة الغدة الدرقية" },
        summary: {
          en: "Removal of part or all of the thyroid for nodules, goiter, overactivity or cancer.",
          ar: "استئصال جزء من الغدة الدرقية أو كلها في حالات العقد أو التضخم أو فرط النشاط أو الأورام.",
        },
        image: specialtyImages.thoracic,
        details: [
          paragraph(
            "Thyroid nodules are common and most are benign. Surgery may be advised for suspicious or cancerous nodules, a large goiter that presses on the neck, or overactivity that is not controlled otherwise.",
            "تنتشر عقد الغدة الدرقية، ومعظمها حميد. وقد يُنصح بالجراحة للعقد المشتبه بها أو الخبيثة، أو للتضخم الكبير الذي يضغط على الرقبة، أو لفرط النشاط الذي لا يُسيطر عليه بوسائل أخرى.",
          ),
          careMayInclude,
          list(
            [
              "An ultrasound and a fine-needle biopsy when needed",
              "Checking the vocal cords and calcium levels",
              "Removal of one lobe or of the whole gland",
              "Thyroid hormone tablets after surgery when needed",
            ],
            [
              "أشعة بالموجات فوق الصوتية وعينة بالإبرة الدقيقة عند الحاجة",
              "فحص الأحبال الصوتية ومستوى الكالسيوم",
              "استئصال فص من الغدة أو الغدة كاملة",
              "أقراص هرمون الغدة الدرقية بعد الجراحة عند الحاجة",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "parathyroid-surgery",
        title: { en: "Parathyroid surgery", ar: "جراحة الغدد الجار درقية" },
        summary: {
          en: "Removing an overactive parathyroid gland that raises the calcium in the blood.",
          ar: "استئصال غدة جار درقية زائدة النشاط ترفع نسبة الكالسيوم في الدم.",
        },
        image: specialtyImages.hematologic,
        details: [
          paragraph(
            "An overactive parathyroid gland raises the calcium in the blood, which can cause kidney stones, thinning of the bones, fatigue or low mood. Removing the affected gland is the usual cure.",
            "يؤدي فرط نشاط الغدة الجار درقية إلى ارتفاع الكالسيوم في الدم، مما قد يسبب حصوات الكلى أو هشاشة العظام أو الإرهاق أو تقلب المزاج، ويُعد استئصال الغدة المصابة العلاج المعتاد.",
          ),
          careMayInclude,
          list(
            [
              "Blood tests for calcium and parathyroid hormone",
              "Scans to locate the overactive gland",
              "A focused operation through a small neck incision when possible",
              "Calcium checks after surgery",
            ],
            [
              "تحاليل دم للكالسيوم وهرمون الغدة الجار درقية",
              "أشعة لتحديد مكان الغدة زائدة النشاط",
              "جراحة موضعية عبر فتحة صغيرة في الرقبة متى أمكن",
              "متابعة مستوى الكالسيوم بعد الجراحة",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "adrenal-surgery",
        title: { en: "Laparoscopic adrenal surgery", ar: "استئصال الغدة الكظرية بالمنظار" },
        summary: {
          en: "Removal of adrenal tumors that produce excess hormones or look suspicious on scans.",
          ar: "استئصال أورام الغدة الكظرية التي تفرز هرمونات زائدة أو تبدو مشتبهًا بها في الأشعة.",
        },
        image: pageHeroImages.services,
        details: [
          paragraph(
            "Many adrenal masses are found by chance and need no surgery. Removal, usually by laparoscopy, is advised for tumors that produce hormones, grow over time or look suspicious.",
            "تُكتشف كثير من أورام الغدة الكظرية بالصدفة ولا تحتاج إلى جراحة، ويُنصح بالاستئصال، بالمنظار غالبًا، للأورام التي تفرز هرمونات أو تكبر مع الوقت أو تبدو مشتبهًا بها.",
          ),
          careMayInclude,
          list(
            [
              "Hormone tests on blood and urine",
              "A CT scan or MRI to assess the mass",
              "Preparation with medicines when the tumor produces hormones",
              "Hormone checks during follow-up",
            ],
            [
              "تحاليل دم وبول للهرمونات",
              "أشعة مقطعية أو رنين مغناطيسي لتقييم الورم",
              "التحضير بالأدوية إذا كان الورم يفرز هرمونات",
              "متابعة مستوى الهرمونات بعد الجراحة",
            ],
          ),
        ],
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "surgical-oncology",
    eyebrow: { en: "Surgical oncology", ar: "جراحة الأورام" },
    title: { en: "Tumor surgery and related procedures", ar: "جراحة الأورام والإجراءات المصاحبة" },
    description: {
      en: "Operations and procedures that are part of cancer care — from removing tumors to taking biopsies and placing ports — coordinated with the rest of the treatment plan.",
      ar: "عمليات وإجراءات تمثل جزءًا من رعاية الأورام، من استئصال الأورام إلى أخذ العينات وتركيب البورت، بالتنسيق مع باقي الخطة العلاجية.",
    },
    services: [
      {
        id: "breast-tumor-surgery",
        title: { en: "Breast tumor surgery", ar: "جراحة أورام الثدي" },
        summary: {
          en: "Breast-conserving surgery or mastectomy, with lymph node surgery, as part of a shared plan.",
          ar: "جراحة تحفظ الثدي أو استئصاله، مع جراحة الغدد الليمفاوية، ضمن خطة علاجية مشتركة.",
        },
        image: specialtyImages.breast,
        details: [
          paragraph(
            "Surgery for breast tumors ranges from removing the lump with a margin of healthy tissue to removing the whole breast. The choice depends on the tumor, the breast and the patient's preferences, and is made together with the oncology team.",
            "تتراوح جراحة أورام الثدي بين استئصال الورم مع هامش من الأنسجة السليمة واستئصال الثدي بالكامل، ويعتمد الاختيار على طبيعة الورم والثدي وتفضيلات المريضة، ويُتخذ القرار بالتعاون مع فريق الأورام.",
          ),
          careMayInclude,
          list(
            [
              "Reviewing mammogram, ultrasound and biopsy results",
              "A sentinel lymph node biopsy when appropriate",
              "Discussing reconstruction options",
              "Coordinating radiotherapy and medical treatment after surgery",
            ],
            [
              "مراجعة نتائج الماموجرام والموجات فوق الصوتية والعينة",
              "أخذ عينة من الغدة الليمفاوية الحارسة عند الحاجة",
              "مناقشة خيارات إعادة بناء الثدي",
              "التنسيق للعلاج الإشعاعي والدوائي بعد الجراحة",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "soft-tissue-tumors",
        title: { en: "Soft tissue lumps", ar: "أورام الأنسجة الرخوة والكتل الدهنية" },
        summary: {
          en: "Assessment and removal of lumps under the skin, from simple lipomas to tumors that need specialist care.",
          ar: "تقييم واستئصال الكتل تحت الجلد، من الأورام الدهنية البسيطة إلى الأورام التي تحتاج إلى رعاية متخصصة.",
        },
        image: featuredVideoPosters.pathology,
        details: [
          paragraph(
            "Most lumps under the skin, such as lipomas and cysts, are benign and can be removed under local anesthesia. Lumps that are large, deep, painful or growing need imaging, and sometimes a biopsy, before surgery.",
            "معظم الكتل تحت الجلد، مثل الأورام الدهنية والأكياس، حميدة ويمكن استئصالها بالتخدير الموضعي، أما الكتل الكبيرة أو العميقة أو المؤلمة أو التي تكبر فتحتاج إلى أشعة، وأحيانًا إلى عينة، قبل الجراحة.",
          ),
          heading("Signs worth checking", "علامات تستحق الفحص"),
          list(
            [
              "A lump larger than about 5 cm",
              "A lump that is growing",
              "A lump deep under the muscle",
              "A lump that comes back after removal",
            ],
            [
              "كتلة يزيد حجمها على 5 سم تقريبًا",
              "كتلة يزداد حجمها",
              "كتلة عميقة تحت العضلة",
              "كتلة تعود بعد استئصالها",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "lymph-node-biopsy",
        title: { en: "Lymph node biopsy", ar: "عينة الغدد الليمفاوية" },
        summary: {
          en: "Removing a lymph node, or part of it, so the pathologist can make an accurate diagnosis.",
          ar: "استئصال غدة ليمفاوية أو جزء منها ليتمكن طبيب الأنسجة من وضع تشخيص دقيق.",
        },
        image: treatmentImages.immunotherapy,
        details: [
          paragraph(
            "When a lymph node stays enlarged or a needle biopsy is not conclusive, removing the node gives the pathologist enough tissue to diagnose conditions such as lymphoma or the spread of a tumor.",
            "عندما تظل الغدة الليمفاوية متضخمة أو لا تكون نتيجة العينة بالإبرة حاسمة، يتيح استئصال الغدة لطبيب الأنسجة كمية كافية من النسيج لتشخيص حالات مثل الأورام الليمفاوية أو انتشار الأورام.",
          ),
          heading("What to expect", "ما يمكن توقعه"),
          list(
            [
              "Usually a short procedure, often without an overnight stay",
              "Local or general anesthesia, depending on where the node is",
              "Results discussed with you once the pathology report is ready",
            ],
            [
              "إجراء قصير غالبًا، وكثيرًا ما يكون دون مبيت",
              "تخدير موضعي أو كلي حسب موضع الغدة",
              "مناقشة النتائج معك فور صدور تقرير التحليل النسيجي",
            ],
          ),
        ],
        isPlaceholder: true,
      },
      {
        id: "chemotherapy-port",
        title: { en: "Chemotherapy port insertion", ar: "تركيب بورت للعلاج الكيميائي" },
        summary: {
          en: "A small device under the skin that makes chemotherapy and blood tests easier and spares the veins.",
          ar: "جهاز صغير تحت الجلد يسهّل إعطاء العلاج الكيميائي وسحب التحاليل ويحافظ على الأوردة.",
        },
        image: treatmentImages.chemotherapy,
        details: [
          paragraph(
            "A port is a small reservoir placed under the skin of the chest and connected to a large vein. It allows chemotherapy, fluids and blood tests without repeated needles in the veins of the arm.",
            "البورت خزان صغير يوضع تحت جلد الصدر ويتصل بوريد كبير، ويتيح إعطاء العلاج الكيميائي والمحاليل وسحب التحاليل دون وخز متكرر في أوردة الذراع.",
          ),
          heading("Good to know", "معلومات مهمة"),
          list(
            [
              "Placed in a short procedure, usually under local anesthesia",
              "Flushed regularly to keep it working",
              "Fever, redness or swelling around it should be reported promptly",
              "Removed easily once treatment is complete",
            ],
            [
              "يُركَّب في إجراء قصير، غالبًا بالتخدير الموضعي",
              "يُغسل بانتظام للحفاظ على عمله",
              "ينبغي الإبلاغ فورًا عن الحرارة أو الاحمرار أو التورم حوله",
              "يُزال بسهولة بعد انتهاء العلاج",
            ],
          ),
        ],
        isPlaceholder: true,
      },
    ],
  },
];
