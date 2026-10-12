/**
 * Services catalog and Services page content, in English and Arabic.
 *
 * This is the single source for every specialty, treatment and care service.
 * The homepage and About page show featured entries by `id`
 * (see `serviceIds` in content/home.ts and content/about.ts).
 *
 * All entries are general, medically cautious PLACEHOLDER content built from
 * the existing homepage categories. They must be reviewed and approved by
 * Dr. Othman Shaker before publication (`isPlaceholder: true`).
 */
import { heading, list, note, paragraph } from "./blocks";
import { careServiceImages, pageHeroImages, specialtyImages, treatmentImages } from "./media";
import type { ServicesPageContent } from "./types";

export const servicesPage: ServicesPageContent = {
  seo: {
    title: {
      en: "Oncology Services — Dr. Othman Shaker",
      ar: "خدمات علاج الأورام — د. عثمان شاكر",
    },
    description: {
      en: "Medical specialties, cancer treatments and ongoing care, explained clearly — from the first consultation to long-term follow-up.",
      ar: "التخصصات الطبية وعلاجات الأورام والرعاية المستمرة بشرح واضح، من الاستشارة الأولى وحتى المتابعة طويلة المدى.",
    },
  },

  hero: {
    eyebrow: { en: "Services", ar: "الخدمات" },
    title: {
      en: "Specialties, treatments and ongoing care",
      ar: "التخصصات والعلاجات والرعاية المستمرة",
    },
    description: {
      en: "An overview of the cancers treated, the treatments that may be recommended and the support offered along the way. Select any card for more detail.",
      ar: "نظرة شاملة على أنواع الأورام التي نتعامل معها، والعلاجات التي قد يُوصى بها، والدعم المقدَّم في كل مرحلة. اختر أي بطاقة لمزيد من التفاصيل.",
    },
    image: pageHeroImages.services,
  },

  groups: [
    {
      id: "medical-specialties",
      eyebrow: { en: "Medical specialties", ar: "التخصصات الطبية" },
      title: { en: "Cancers we care for", ar: "أنواع الأورام التي نعتني بها" },
      description: {
        en: "Each type of cancer behaves differently. Care is shaped around the organ involved, the stage and the person's overall health.",
        ar: "يختلف سلوك كل نوع من الأورام عن غيره، لذا تُصمَّم الرعاية وفق العضو المصاب والمرحلة والحالة الصحية العامة.",
      },
      services: [
        {
          id: "breast",
          title: { en: "Breast cancer", ar: "أورام الثدي" },
          summary: {
            en: "Thoughtful guidance through diagnosis, treatment options and long-term follow-up.",
            ar: "متابعة مدروسة عبر مراحل التشخيص وخيارات العلاج والمتابعة طويلة المدى.",
          },
          image: specialtyImages.breast,
          details: [
            paragraph(
              "Breast cancer care is planned around the specific type of tumor, its stage and test results such as hormone receptor and HER2 status. These details help guide which treatments are likely to be most suitable.",
              "تُخطَّط رعاية سرطان الثدي وفق نوع الورم ومرحلته ونتائج الفحوص، مثل مستقبلات الهرمونات وحالة HER2. وتساعد هذه التفاصيل في تحديد العلاجات الأنسب لكل حالة.",
            ),
            heading("What care may include", "ما قد تشمله الرعاية"),
            list(
              [
                "Reviewing imaging, biopsy and pathology results",
                "Discussing the roles of surgery, radiotherapy and medicines with the wider care team",
                "Systemic treatments such as chemotherapy, hormonal therapy or targeted therapy, when appropriate",
                "Long-term follow-up and support after treatment",
              ],
              [
                "مراجعة صور الأشعة ونتائج الخزعة والتحليل النسيجي",
                "مناقشة دور الجراحة والعلاج الإشعاعي والأدوية مع فريق الرعاية",
                "العلاجات الدوائية مثل العلاج الكيميائي أو الهرموني أو الموجّه عند الحاجة",
                "المتابعة والدعم على المدى الطويل بعد انتهاء العلاج",
              ],
            ),
            heading("Questions you may want to ask", "أسئلة قد ترغب في طرحها"),
            list(
              [
                "What type and stage of breast cancer do I have?",
                "What is the goal of the recommended treatment?",
                "Which side effects should I watch for?",
              ],
              [
                "ما نوع سرطان الثدي لديّ وما مرحلته؟",
                "ما الهدف من العلاج المقترح؟",
                "ما الآثار الجانبية التي ينبغي أن أنتبه لها؟",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "thoracic",
          title: { en: "Lung & thoracic cancers", ar: "أورام الرئة والصدر" },
          summary: {
            en: "Careful review of imaging and pathology to plan the right next steps.",
            ar: "مراجعة دقيقة لنتائج الأشعة والتحاليل النسيجية لتحديد الخطوات المناسبة.",
          },
          image: specialtyImages.thoracic,
          details: [
            paragraph(
              "Cancers of the lung and chest are assessed using imaging, biopsy results and, increasingly, molecular tests on the tumor. Together these help determine the stage and which treatment approaches may be suitable.",
              "تُقيَّم أورام الرئة والصدر بالاعتماد على صور الأشعة ونتائج الخزعة، ومن خلال الفحوص الجزيئية للورم بصورة متزايدة. وتساعد هذه المعطيات مجتمعةً في تحديد المرحلة وأساليب العلاج الملائمة.",
            ),
            heading("What care may include", "ما قد تشمله الرعاية"),
            list(
              [
                "Careful review of CT, PET and other imaging",
                "Discussing molecular or biomarker testing when relevant",
                "Treatment planning that may involve medicines, radiotherapy or surgery",
                "Attention to breathing, cough and other symptoms",
              ],
              [
                "مراجعة دقيقة للأشعة المقطعية والمسح البوزيتروني وغيرها",
                "مناقشة الفحوص الجزيئية أو المؤشرات الحيوية عند الحاجة",
                "تخطيط علاجي قد يشمل الأدوية أو العلاج الإشعاعي أو الجراحة",
                "الاهتمام بالتنفس والسعال وغيرها من الأعراض",
              ],
            ),
            note(
              "Stopping smoking helps at any stage of care. Support is available if you would like it.",
              "الإقلاع عن التدخين مفيد في أي مرحلة من مراحل الرعاية، والدعم متاح إن رغبت فيه.",
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "gastrointestinal",
          title: { en: "Gastrointestinal cancers", ar: "أورام الجهاز الهضمي" },
          summary: {
            en: "Care for cancers of the stomach, colon, liver and pancreas, with attention to everyday wellbeing.",
            ar: "رعاية لأورام المعدة والقولون والكبد والبنكرياس، مع اهتمام بجودة الحياة اليومية.",
          },
          image: specialtyImages.gastrointestinal,
          details: [
            paragraph(
              "Gastrointestinal cancers include tumors of the esophagus, stomach, bowel, liver and pancreas. Each behaves differently, so care is tailored to the organ involved, the stage and the person's overall health.",
              "تشمل أورام الجهاز الهضمي أورام المريء والمعدة والأمعاء والكبد والبنكرياس. ولكلٍّ منها سلوك مختلف، لذا تُصمَّم الرعاية وفق العضو المصاب والمرحلة والحالة الصحية العامة.",
            ),
            heading("What care may include", "ما قد تشمله الرعاية"),
            list(
              [
                "Reviewing endoscopy, imaging and pathology reports",
                "Planning medical treatment before or after surgery when appropriate",
                "Coordinating with surgeons and other specialists",
                "Attention to nutrition, digestion and weight",
              ],
              [
                "مراجعة تقارير المناظير والأشعة والتحاليل النسيجية",
                "تخطيط العلاج الدوائي قبل الجراحة أو بعدها عند الحاجة",
                "التنسيق مع الجراحين وغيرهم من المتخصصين",
                "الاهتمام بالتغذية والهضم والوزن",
              ],
            ),
            heading("Good to know", "معلومة مفيدة"),
            paragraph(
              "Eating can be affected by both the illness and its treatment. Mentioning changes in appetite or weight early helps them be addressed sooner.",
              "قد تتأثر الشهية والتغذية بالمرض وبالعلاج معًا، والإبلاغ المبكر عن أي تغيّر في الشهية أو الوزن يساعد على التعامل معه في وقت أبكر.",
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "gynecologic",
          title: { en: "Gynecologic cancers", ar: "أورام النساء" },
          summary: {
            en: "Sensitive, private care for ovarian, uterine and cervical cancers.",
            ar: "رعاية تراعي الخصوصية لأورام المبيض والرحم وعنق الرحم.",
          },
          image: specialtyImages.gynecologic,
          details: [
            paragraph(
              "Gynecologic cancers include cancers of the ovary, uterus and cervix. Care is planned with sensitivity to privacy, questions about fertility and quality of life.",
              "تشمل أورام النساء سرطانات المبيض والرحم وعنق الرحم، وتُخطَّط رعايتها بما يراعي الخصوصية والأسئلة المتعلقة بالخصوبة وجودة الحياة.",
            ),
            heading("What care may include", "ما قد تشمله الرعاية"),
            list(
              [
                "Reviewing imaging, surgical and pathology findings",
                "Discussing chemotherapy and other medical treatments when needed",
                "Coordinating with gynecologic surgeons and radiotherapy teams",
                "Follow-up visits and support after treatment",
              ],
              [
                "مراجعة نتائج الأشعة والجراحة والتحليل النسيجي",
                "مناقشة العلاج الكيميائي وغيره من العلاجات الدوائية عند الحاجة",
                "التنسيق مع جراحي أورام النساء وفرق العلاج الإشعاعي",
                "زيارات المتابعة والدعم بعد انتهاء العلاج",
              ],
            ),
            heading("Topics worth raising", "موضوعات تستحق الطرح"),
            list(
              [
                "Questions about fertility or menopause",
                "Side effects that affect daily life",
                "Emotional support for you and your family",
              ],
              [
                "الأسئلة المتعلقة بالخصوبة أو انقطاع الطمث",
                "الآثار الجانبية التي تؤثر في الحياة اليومية",
                "الدعم النفسي لكِ ولأسرتكِ",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "hematologic",
          title: { en: "Blood cancers & lymphoma", ar: "أورام الدم والغدد الليمفاوية" },
          summary: {
            en: "Clear explanations of test results and treatment pathways for lymphoma and leukemia.",
            ar: "شرح واضح لنتائج التحاليل ومسارات العلاج لأورام الغدد الليمفاوية وسرطان الدم.",
          },
          image: specialtyImages.hematologic,
          details: [
            paragraph(
              "Lymphomas, leukemias and related conditions affect the blood, bone marrow or lymphatic system. Diagnosis relies on blood tests, biopsies and specialized laboratory studies.",
              "تصيب الأورام الليمفاوية وسرطانات الدم والحالات المرتبطة بها الدمَ أو نخاع العظم أو الجهاز الليمفاوي، ويعتمد تشخيصها على تحاليل الدم والخزعات والدراسات المخبرية المتخصصة.",
            ),
            heading("What care may include", "ما قد تشمله الرعاية"),
            list(
              [
                "Explaining blood counts and laboratory results clearly",
                "Discussing treatment options, which may include chemotherapy, immunotherapy or targeted medicines",
                "Monitoring during treatment with regular blood tests",
                "Referral for specialized treatments when needed",
              ],
              [
                "شرح صورة الدم ونتائج التحاليل بوضوح",
                "مناقشة خيارات العلاج، وقد تشمل العلاج الكيميائي أو المناعي أو الأدوية الموجّهة",
                "المتابعة أثناء العلاج بتحاليل دم منتظمة",
                "الإحالة إلى العلاجات المتخصصة عند الحاجة",
              ],
            ),
            note(
              "Some blood cancers are monitored closely before any treatment begins, when this is the safest approach for the individual.",
              "تُتابَع بعض أورام الدم عن كثب قبل البدء بأي علاج، عندما يكون ذلك هو النهج الأكثر أمانًا للمريض.",
            ),
          ],
          isPlaceholder: true,
        },
      ],
    },

    {
      id: "treatments",
      eyebrow: { en: "Treatments", ar: "العلاجات" },
      title: { en: "Treatment options", ar: "الخيارات العلاجية" },
      description: {
        en: "Recommendations depend on the type and stage of cancer, overall health and personal preferences — and are always discussed with you first.",
        ar: "تعتمد التوصيات على نوع الورم ومرحلته والحالة الصحية العامة والتفضيلات الشخصية، وتُناقش معك دائمًا قبل البدء.",
      },
      services: [
        {
          id: "chemotherapy",
          title: { en: "Chemotherapy", ar: "العلاج الكيميائي" },
          summary: {
            en: "Medicines that act on rapidly dividing cells, given in carefully monitored cycles.",
            ar: "أدوية تستهدف الخلايا سريعة الانقسام، تُعطى على دورات تخضع لمتابعة دقيقة.",
          },
          image: treatmentImages.chemotherapy,
          details: [
            paragraph(
              "Chemotherapy uses medicines that affect rapidly dividing cells. Depending on the situation, it may be given before or after surgery, together with radiotherapy, or as the main treatment.",
              "يعتمد العلاج الكيميائي على أدوية تؤثر في الخلايا سريعة الانقسام. وبحسب الحالة، قد يُعطى قبل الجراحة أو بعدها، أو مع العلاج الإشعاعي، أو كعلاج أساسي.",
            ),
            heading("How it is given", "كيف يُعطى"),
            list(
              [
                "Usually in cycles, with rest periods that allow the body to recover",
                "Through a vein (infusion) or as tablets, depending on the medicine",
                "With blood tests and a check-up before each cycle",
              ],
              [
                "عادةً على دورات تتخللها فترات راحة تتيح للجسم التعافي",
                "عن طريق الوريد أو على شكل أقراص بحسب نوع الدواء",
                "مع تحاليل دم وفحص طبي قبل كل دورة",
              ],
            ),
            heading("About side effects", "عن الآثار الجانبية"),
            paragraph(
              "Side effects depend on the specific medicines and vary from person to person. They may include tiredness, nausea or a higher risk of infection. Many can be prevented or eased, so it is important to report them.",
              "تختلف الآثار الجانبية باختلاف الأدوية ومن شخص لآخر، وقد تشمل الإرهاق أو الغثيان أو ارتفاع خطر العدوى. ويمكن الوقاية من كثير منها أو تخفيفه، لذا من المهم الإبلاغ عنها.",
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "immunotherapy",
          title: { en: "Immunotherapy", ar: "العلاج المناعي" },
          summary: {
            en: "Treatments that help the immune system recognize and respond to cancer cells.",
            ar: "علاجات تساعد الجهاز المناعي على التعرّف على الخلايا السرطانية والتصدي لها.",
          },
          image: treatmentImages.immunotherapy,
          details: [
            paragraph(
              "Immunotherapy helps the body's own immune system recognize and attack cancer cells. It is used for certain cancer types and situations, often guided by tests on the tumor.",
              "يساعد العلاج المناعي جهاز المناعة في الجسم على التعرّف على الخلايا السرطانية ومهاجمتها، ويُستخدم لأنواع وحالات محددة من الأورام، وغالبًا ما تسترشد قراراته بفحوص الورم.",
            ),
            heading("Good to know", "معلومات مهمة"),
            list(
              [
                "It works differently from chemotherapy, so its side effects are different too",
                "The immune system can sometimes affect healthy organs, such as the skin, bowel or thyroid",
                "New symptoms should be reported promptly, even weeks after a dose",
              ],
              [
                "يعمل بطريقة مختلفة عن العلاج الكيميائي، لذا تختلف آثاره الجانبية أيضًا",
                "قد يؤثر الجهاز المناعي أحيانًا في أعضاء سليمة مثل الجلد أو الأمعاء أو الغدة الدرقية",
                "ينبغي الإبلاغ عن أي أعراض جديدة فورًا، حتى بعد أسابيع من الجرعة",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "targeted",
          title: { en: "Targeted therapy", ar: "العلاج الموجّه" },
          summary: {
            en: "Medicines chosen for specific features of a tumor, often guided by molecular testing.",
            ar: "أدوية تُختار وفق خصائص محددة في الورم، وغالبًا ما تسترشد بنتائج الفحوص الجزيئية.",
          },
          image: treatmentImages.targeted,
          details: [
            paragraph(
              "Targeted therapies act on specific changes in cancer cells, such as particular genes or proteins. Testing the tumor helps identify whether a suitable targeted treatment exists.",
              "تستهدف العلاجات الموجّهة تغيّرات محددة في الخلايا السرطانية، مثل جينات أو بروتينات بعينها، ويساعد فحص الورم على معرفة ما إذا كان هناك علاج موجّه مناسب.",
            ),
            heading("What it involves", "ما الذي يتضمنه"),
            list(
              [
                "Molecular or biomarker testing of tumor tissue or blood",
                "Medicines given as tablets or infusions",
                "Regular monitoring of response and side effects",
              ],
              [
                "فحوص جزيئية أو للمؤشرات الحيوية على نسيج الورم أو الدم",
                "أدوية تُعطى على شكل أقراص أو عن طريق الوريد",
                "متابعة منتظمة للاستجابة وللآثار الجانبية",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "hormonal",
          title: { en: "Hormonal therapy", ar: "العلاج الهرموني" },
          summary: {
            en: "Treatment for hormone-sensitive cancers, such as some breast and prostate cancers.",
            ar: "علاج للأورام الحساسة للهرمونات، مثل بعض أنواع سرطان الثدي والبروستاتا.",
          },
          image: treatmentImages.hormonal,
          details: [
            paragraph(
              "Some cancers, including many breast and prostate cancers, grow in response to hormones. Hormonal therapy lowers hormone levels or blocks their effect on cancer cells.",
              "تنمو بعض الأورام، ومنها كثير من أورام الثدي والبروستاتا، استجابةً للهرمونات. ويعمل العلاج الهرموني على خفض مستوى الهرمونات أو منع تأثيرها في الخلايا السرطانية.",
            ),
            heading("Good to know", "معلومات مهمة"),
            list(
              [
                "It is often taken as daily tablets or regular injections",
                "Treatment may continue for several years",
                "Side effects can include hot flushes, tiredness or joint aches, and can often be managed",
              ],
              [
                "يُؤخذ غالبًا على شكل أقراص يومية أو حقن منتظمة",
                "قد يستمر العلاج عدة سنوات",
                "قد تشمل آثاره الجانبية الهبّات الساخنة أو الإرهاق أو آلام المفاصل، ويمكن التعامل معها في كثير من الأحيان",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "supportive",
          title: { en: "Supportive care", ar: "الرعاية الداعمة" },
          summary: {
            en: "Managing symptoms and side effects to protect comfort and quality of life.",
            ar: "التعامل مع الأعراض والآثار الجانبية للحفاظ على الراحة وجودة الحياة.",
          },
          image: treatmentImages.supportive,
          details: [
            paragraph(
              "Supportive care focuses on comfort and quality of life at every stage — during treatment, after it, and alongside other care.",
              "تركّز الرعاية الداعمة على الراحة وجودة الحياة في كل مرحلة: أثناء العلاج، وبعده، وجنبًا إلى جنب مع الرعاية الأخرى.",
            ),
            heading("It may help with", "قد تساعد في"),
            list(
              [
                "Pain, nausea and fatigue",
                "Appetite and nutrition",
                "Sleep, mood and anxiety",
                "Practical and emotional support for families",
              ],
              [
                "الألم والغثيان والإرهاق",
                "الشهية والتغذية",
                "النوم والحالة المزاجية والقلق",
                "الدعم العملي والنفسي للأسرة",
              ],
            ),
            note(
              "Supportive care is not only for advanced illness; it can begin from the time of diagnosis.",
              "الرعاية الداعمة ليست مقتصرة على المراحل المتقدمة، بل يمكن أن تبدأ منذ التشخيص.",
            ),
          ],
          isPlaceholder: true,
        },
      ],
    },

    {
      id: "consultation-care",
      eyebrow: { en: "Consultation & ongoing care", ar: "الاستشارة والرعاية المستمرة" },
      title: { en: "From first visit to follow-up", ar: "من الزيارة الأولى إلى المتابعة" },
      description: {
        en: "The stages of the patient journey, offered as services in their own right — including independent second opinions.",
        ar: "مراحل الرحلة العلاجية كخدمات قائمة بذاتها، ومنها الرأي الطبي الثاني المستقل.",
      },
      services: [
        {
          id: "consultation",
          title: { en: "Consultation & second opinion", ar: "الاستشارة والرأي الطبي الثاني" },
          summary: {
            en: "An unhurried first visit, or an independent view of an existing diagnosis or plan.",
            ar: "زيارة أولى دون استعجال، أو رأي مستقل في تشخيص أو خطة علاجية قائمة.",
          },
          image: careServiceImages.consultation,
          details: [
            paragraph(
              "The first consultation is a chance to review your medical history, reports and scans, and to talk through your questions. A second opinion offers an independent view of a diagnosis or treatment plan you have already received.",
              "الاستشارة الأولى فرصة لمراجعة تاريخك المرضي وتقاريرك وصور الأشعة، ومناقشة أسئلتك. أما الرأي الطبي الثاني فيقدّم رؤية مستقلة لتشخيص أو خطة علاجية حصلت عليها بالفعل.",
            ),
            heading("Helpful to bring", "يُفضَّل إحضار"),
            list(
              [
                "Pathology and biopsy reports",
                "Imaging scans and their written reports",
                "Recent blood tests and a list of current medicines",
                "Your questions, written down in advance",
              ],
              [
                "تقارير التحليل النسيجي والخزعة",
                "صور الأشعة وتقاريرها المكتوبة",
                "أحدث تحاليل الدم وقائمة بالأدوية الحالية",
                "أسئلتك مكتوبةً مسبقًا",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "evaluation",
          title: { en: "Review of reports & imaging", ar: "مراجعة التقارير والأشعة" },
          summary: {
            en: "Careful review of pathology, imaging and laboratory results, explained in clear language.",
            ar: "مراجعة دقيقة لنتائج التحليل النسيجي والأشعة والتحاليل، مع شرحها بلغة واضحة.",
          },
          image: careServiceImages.evaluation,
          details: [
            paragraph(
              "Understanding test results is central to planning care. Reports are reviewed together and explained step by step, including what they mean and whether further tests may be needed.",
              "فهم نتائج الفحوص أساس التخطيط للرعاية، لذا تُراجَع التقارير معًا وتُشرح خطوة بخطوة، بما في ذلك دلالتها ومدى الحاجة إلى فحوص إضافية.",
            ),
            heading("This may include", "قد يشمل ذلك"),
            list(
              [
                "Pathology and molecular test reports",
                "CT, MRI, PET and other imaging",
                "Blood tests and tumor markers when relevant",
              ],
              [
                "تقارير التحليل النسيجي والفحوص الجزيئية",
                "الأشعة المقطعية والرنين المغناطيسي والمسح البوزيتروني وغيرها",
                "تحاليل الدم ودلالات الأورام عند الحاجة",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "planning",
          title: { en: "Individualized treatment planning", ar: "تخطيط علاجي فردي" },
          summary: {
            en: "A plan built around your diagnosis, your health and what matters most to you.",
            ar: "خطة تُبنى حول تشخيصك وصحتك وما يهمك أكثر.",
          },
          image: careServiceImages.planning,
          details: [
            paragraph(
              "A treatment plan brings together the details of the diagnosis, current medical evidence and your own priorities. Options are discussed openly, including their expected benefits and possible side effects.",
              "تجمع الخطة العلاجية بين تفاصيل التشخيص والأدلة الطبية الحالية وأولوياتك الشخصية، وتُناقش الخيارات بصراحة، بما في ذلك فوائدها المتوقعة وآثارها الجانبية المحتملة.",
            ),
            heading("A plan usually covers", "تشمل الخطة عادةً"),
            list(
              [
                "The goals of treatment",
                "Which treatments are recommended, and in what order",
                "How progress will be monitored",
                "Who to contact with questions or concerns",
              ],
              [
                "أهداف العلاج",
                "العلاجات الموصى بها وترتيبها",
                "كيفية متابعة الاستجابة والتقدم",
                "جهة التواصل عند وجود أسئلة أو مخاوف",
              ],
            ),
          ],
          isPlaceholder: true,
        },
        {
          id: "follow-up",
          title: { en: "Follow-up & survivorship care", ar: "المتابعة والرعاية بعد العلاج" },
          summary: {
            en: "Regular follow-up during and after treatment, with attention to long-term wellbeing.",
            ar: "متابعة منتظمة أثناء العلاج وبعده، مع اهتمام بالصحة على المدى الطويل.",
          },
          image: careServiceImages.followUp,
          details: [
            paragraph(
              "Follow-up continues after active treatment ends. Visits monitor recovery, look for any signs of the illness returning and address long-term effects of treatment.",
              "تستمر المتابعة بعد انتهاء العلاج الفعّال، إذ تهدف الزيارات إلى متابعة التعافي، ورصد أي علامات لعودة المرض، والتعامل مع الآثار طويلة المدى للعلاج.",
            ),
            heading("Follow-up may include", "قد تشمل المتابعة"),
            list(
              [
                "Regular check-ups and tests, as recommended",
                "Managing lasting side effects",
                "Guidance on returning to daily activities",
                "A clear point of contact between visits",
              ],
              [
                "فحوصات وتحاليل دورية حسب التوصيات",
                "التعامل مع الآثار الجانبية المستمرة",
                "إرشادات للعودة إلى الأنشطة اليومية",
                "جهة تواصل واضحة بين الزيارات",
              ],
            ),
          ],
          isPlaceholder: true,
        },
      ],
    },
  ],
};
