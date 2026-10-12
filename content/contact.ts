/**
 * Contact page content in English and Arabic.
 *
 * The form works without a server. By default it hands the message over to
 * WhatsApp (the visitor presses send there). When
 * `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` is set (e.g. a Formspree/Web3Forms URL or
 * a Supabase Edge Function), it posts the message there instead and reports
 * success only after the service confirms it.
 */
import { pageHeroImages } from "./media";
import type { ContactPageContent } from "./types";

export const contactPage: ContactPageContent = {
  seo: {
    title: { en: "Contact — Dr. Othman Shaker", ar: "تواصل معنا — د. عثمان شاكر" },
    description: {
      en: "Contact the clinic of Dr. Othman Shaker by message, WhatsApp or phone to arrange a consultation.",
      ar: "تواصل مع عيادة د. عثمان شاكر برسالة أو عبر واتساب أو الهاتف لترتيب موعد استشارة.",
    },
  },

  hero: {
    eyebrow: { en: "Contact", ar: "تواصل معنا" },
    title: { en: "Get in touch with the clinic", ar: "تواصل مع العيادة" },
    description: {
      en: "Send a message, chat on WhatsApp or call to arrange a consultation or ask a question.",
      ar: "أرسل رسالة، أو تواصل عبر واتساب، أو اتصل بنا لترتيب استشارة أو طرح سؤال.",
    },
    image: pageHeroImages.contact,
  },

  form: {
    title: { en: "Send a message", ar: "أرسل رسالة" },
    description: {
      en: "Share a few details about your enquiry. Please keep medical information brief — it is best discussed during your consultation.",
      ar: "شاركنا بعض التفاصيل عن استفسارك، ويُرجى الاختصار في المعلومات الطبية، فمكانها الأنسب هو الاستشارة.",
    },
    fields: {
      name: { en: "Full name", ar: "الاسم الكامل" },
      phone: { en: "Phone number", ar: "رقم الهاتف" },
      // \u200E (left-to-right mark) keeps "+20" in the right order inside Arabic text
      phoneHint: { en: "Including country code, e.g. +20…", ar: "مع رمز الدولة، مثل \u200E+20…" },
      email: { en: "Email (optional)", ar: "البريد الإلكتروني (اختياري)" },
      topic: { en: "Topic", ar: "موضوع الرسالة" },
      message: { en: "Message", ar: "الرسالة" },
      messageHint: {
        en: "Please do not include detailed medical records here.",
        ar: "يُرجى عدم إرفاق تفاصيل السجل الطبي هنا.",
      },
      consent: {
        en: "I agree to be contacted about my enquiry.",
        ar: "أوافق على التواصل معي بخصوص استفساري.",
      },
      required: { en: "required", ar: "مطلوب" },
    },
    topics: {
      consultation: { en: "Book a consultation", ar: "حجز استشارة" },
      secondOpinion: { en: "Second opinion", ar: "رأي طبي ثانٍ" },
      question: { en: "General question", ar: "استفسار عام" },
      other: { en: "Other", ar: "أخرى" },
    },
    errors: {
      required: { en: "This field is required.", ar: "هذا الحقل مطلوب." },
      phone: { en: "Please enter a valid phone number.", ar: "يُرجى إدخال رقم هاتف صحيح." },
      email: { en: "Please enter a valid email address.", ar: "يُرجى إدخال بريد إلكتروني صحيح." },
      consent: { en: "Please confirm that we may contact you.", ar: "يُرجى الموافقة على التواصل معك." },
      summary: { en: "Please correct the highlighted fields.", ar: "يُرجى تصحيح الحقول المحددة." },
      failed: {
        en: "Your message could not be sent. Please try again, or contact the clinic by WhatsApp or phone.",
        ar: "تعذّر إرسال رسالتك. يُرجى المحاولة مرة أخرى، أو التواصل مع العيادة عبر واتساب أو الهاتف.",
      },
    },
    whatsappMode: {
      note: {
        en: "Your message will open in WhatsApp, ready for you to send.",
        ar: "ستُفتح رسالتك في واتساب جاهزةً للإرسال.",
      },
      submit: { en: "Continue in WhatsApp", ar: "المتابعة عبر واتساب" },
      success: {
        en: "WhatsApp has opened with your message. Press send in WhatsApp to deliver it.",
        ar: "فُتح واتساب ومعه رسالتك. اضغط «إرسال» في واتساب لإيصالها.",
      },
      heading: { en: "New enquiry from the website", ar: "استفسار جديد من الموقع" },
    },
    endpointMode: {
      note: {
        en: "Your message is sent securely to the clinic.",
        ar: "تُرسل رسالتك بأمان إلى العيادة.",
      },
      submit: { en: "Send message", ar: "إرسال الرسالة" },
      sending: { en: "Sending…", ar: "جارٍ الإرسال…" },
      success: {
        en: "Thank you — your message has been sent. The clinic will contact you soon.",
        ar: "شكرًا لك، تم إرسال رسالتك وستتواصل معك العيادة قريبًا.",
      },
    },
  },

  actions: {
    eyebrow: { en: "Prefer to talk now?", ar: "تفضّل التحدث الآن؟" },
    title: { en: "Chat or call the clinic directly", ar: "راسل العيادة أو اتصل بها مباشرة" },
    whatsappLabel: { en: "Chat on WhatsApp", ar: "تواصل عبر واتساب" },
    callLabel: { en: "Call the clinic", ar: "اتصل بالعيادة" },
  },
};
