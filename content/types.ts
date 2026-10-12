/**
 * Content schema for the website.
 *
 * Every editable value lives in `content/*.ts` and follows these types, so the
 * same shapes can later be loaded from Supabase (see `docs/SUPABASE.md`)
 * without touching the presentation components.
 *
 * `isPlaceholder: true` marks temporary content or media that must be replaced
 * or approved before publication. `npm run check:content` lists every one.
 */
import type { Localized } from "@/lib/localize";
import type { RouteKey } from "@/lib/routes";

export type { Localized };

type Placeholder = { isPlaceholder?: boolean };

export type MediaAsset = Placeholder & {
  /**
   * `/media/<name>` for photos processed by `npm run images` (responsive WebP),
   * or an absolute URL (e.g. Supabase Storage).
   */
  src: string;
  alt: Localized;
  /** CSS `object-position` used for cropping, e.g. `"50% 30%"`. */
  position?: string;
  /** Cropping on phones (below 768px), when the subject needs a different focus. */
  positionMobile?: string;
  /** Mirror horizontally in Arabic so the subject faces the text. Use only for images without text or logos. */
  mirrorInRtl?: boolean;
  /** Source and licence of a temporary image. */
  credit?: string;
};

export type VideoSource =
  | { kind: "youtube"; id: string }
  | { kind: "file"; src: string; type?: string };

export type Video = Placeholder & {
  id: string;
  title: Localized;
  description?: Localized;
  poster: MediaAsset;
  /** `null` until a real video exists — the card then shows a "coming soon" state. */
  source: VideoSource | null;
  /** Display duration such as `"3:45"`. Only set from real video metadata. */
  duration: string | null;
};

export type SectionIntro = {
  eyebrow: Localized;
  title: Localized;
  description?: Localized;
};

export type RouteCta = { label: Localized; route: RouteKey };

export type Statistic = Placeholder & {
  id: string;
  value: number;
  /** Appended to the number, e.g. `"+"`. */
  suffix?: string;
  label: Localized;
};

export type JourneyIcon = "consultation" | "evaluation" | "discussion" | "plan" | "followUp";

export type JourneyStep = {
  id: string;
  icon: JourneyIcon;
  title: Localized;
  description: Localized;
};

export type Principle = { id: string; title: Localized; description: Localized };

export type Review = Placeholder & {
  id: string;
  text: Localized;
  /** Approved reviewer label (e.g. initials). `null` to omit. */
  reviewer: Localized | null;
  /**
   * The star rating the patient gave. Required once the review is real
   * (the build fails otherwise); `null` only on placeholders, which show the
   * stars as "rating pending".
   */
  rating: 1 | 2 | 3 | 4 | 5 | null;
};

export type FaqItem = { id: string; question: Localized; answer: Localized };

/** A topic of the FAQ catalog (Reviews & FAQs page); the homepage features questions by `id`. */
export type FaqCategory = Placeholder & { id: string; title: Localized; items: FaqItem[] };

export type SocialPlatform = "facebook" | "instagram" | "youtube";

export type SocialLink = Placeholder & {
  platform: SocialPlatform;
  label: Localized;
  /** `null` hides the link everywhere. */
  url: string | null;
};

export type PhoneNumber = Placeholder & {
  /** International format without spaces, e.g. `+201234567890`. */
  e164: string;
  /** Human-readable form shown on the page. */
  display: string;
};

export type NavItem = { route: RouteKey; label: Localized };

export type UiStrings = {
  skipToContent: Localized;
  mainNavigation: Localized;
  footerNavigation: Localized;
  openMenu: Localized;
  closeMenu: Localized;
  chooseLanguage: Localized;
  comingSoon: Localized;
  opensInNewTab: Localized;
  playVideo: Localized;
  videoComingSoon: Localized;
  bookConsultation: Localized;
  contactPanel: Localized;
  phone: Localized;
  whatsapp: Localized;
  backToTop: Localized;
  scrollHint: Localized;
  homeLink: Localized;
  /** `{rating}` is replaced with the review's rating. */
  ratingLabel: Localized;
  /** Shown with empty stars on placeholder reviews. */
  ratingPending: Localized;
  faqTopics: Localized;
  breadcrumb: Localized;
  close: Localized;
  viewDetails: Localized;
  readArticle: Localized;
  previous: Localized;
  next: Localized;
  enlarge: Localized;
  certificatePending: Localized;
  askAboutService: Localized;
  /** `{service}` is replaced with the service name. */
  askAboutServiceMessage: Localized;
  /** `{name}` is replaced with the reviewer's name. */
  reviewedBy: Localized;
  articleDisclaimer: Localized;
  quickContact: Localized;
  callClinic: Localized;
  chatOnWhatsapp: Localized;
};

export type SiteContent = {
  name: Localized;
  specialty: Localized;
  description: Localized;
  contact: {
    phone: PhoneNumber | null;
    whatsapp: PhoneNumber | null;
    /** Pre-filled WhatsApp message. */
    whatsappMessage: Localized;
  };
  socials: SocialLink[];
  navigation: NavItem[];
  footer: {
    navigationHeading: Localized;
    contactHeading: Localized;
    followHeading: Localized;
    disclaimer: Localized;
    /** `{year}` is replaced with the build year. */
    copyright: Localized;
  };
  /** Consultation call-to-action card shared by several pages. */
  cta: SectionIntro & {
    whatsappLabel: Localized;
    callLabel: Localized;
    image: MediaAsset;
  };
  ui: UiStrings;
};

type Five<T> = [T, T, T, T, T];

/** Long-form content (service details, articles). Stored as a JSON array in a CMS. */
export type ContentBlock =
  | { type: "heading"; text: Localized }
  | { type: "paragraph"; text: Localized }
  | { type: "list"; items: Localized<string[]> }
  | { type: "note"; text: Localized };

/** One entry of the services catalog (content/services.ts). */
export type Service = Placeholder & {
  /** Stable identifier, referenced by featured sections. */
  id: string;
  title: Localized;
  /** Short text on the card. */
  summary: Localized;
  image: MediaAsset;
  /** Full description shown in the service popup. */
  details: ContentBlock[];
};

export type ServiceGroup = {
  /** Also the in-page anchor, e.g. `/en/services/#treatments`. */
  id: string;
  eyebrow: Localized;
  title: Localized;
  description: Localized;
  services: Service[];
};

/** A featured selection of catalog services (homepage, About page). */
export type FeaturedServices = SectionIntro & { serviceIds: Five<string>; cta: RouteCta };

export type HeroContent = {
  eyebrow: Localized;
  title: Localized;
  titleAccent: Localized;
  description: Localized;
  primaryCta: Localized;
  secondaryCta: Localized;
  image: MediaAsset;
};

/** Hero used by internal pages. */
export type PageHeroContent = {
  eyebrow: Localized;
  title: Localized;
  description: Localized;
  image: MediaAsset;
};

export type PageSeo = { title: Localized; description: Localized };

export type Quote = Placeholder & {
  text: Localized;
  /** Shown only once the doctor has approved the wording; `null` keeps it unattributed. */
  attribution: Localized | null;
};

export type CareerMilestone = Placeholder & {
  id: string;
  period: Localized;
  title: Localized;
  organization: Localized;
  description?: Localized;
};

export type Certificate = Placeholder & {
  id: string;
  /** Used as alt text and in the enlarged view; not shown on the card. */
  title: Localized;
  /** Scan of the real certificate; `null` until provided (a neutral placeholder is shown). */
  image: MediaAsset | null;
};

export type Article = Placeholder & {
  id: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  image: MediaAsset;
  body: ContentBlock[];
  /** Clinician who reviewed the article; shown only when set. */
  reviewedBy: Localized | null;
};

export type HomePageContent = {
  seo: {
    title: Localized;
    description: Localized;
    ogImage: Localized<string>;
    ogImageAlt: Localized;
  };
  hero: HeroContent;
  introVideo: SectionIntro & { video: Video };
  about: SectionIntro &
    Placeholder & {
      paragraphs: Localized<string[]>;
      cta: RouteCta;
      portrait: MediaAsset;
    };
  statistics: SectionIntro & { items: Statistic[] };
  specialties: FeaturedServices;
  treatments: FeaturedServices;
  journey: SectionIntro & { steps: JourneyStep[]; note: Localized; cta: RouteCta };
  whyChoose: SectionIntro &
    Placeholder & {
      principles: Principle[];
      image: MediaAsset;
      caption: Localized;
    };
  /** Three entries of the videos catalog (content/videos.ts). */
  videos: SectionIntro & { videoIds: [string, string, string]; cta: RouteCta };
  /** Four entries of the reviews catalog (content/reviews.ts). */
  reviews: SectionIntro & { reviewIds: [string, string, string, string] };
  /** Questions from the FAQ catalog (content/faq.ts), linking to the full list. */
  faq: SectionIntro & { faqIds: string[]; cta: RouteCta };
};

export type AboutPageContent = {
  seo: PageSeo;
  hero: HeroContent;
  intro: { eyebrow: Localized; quote: Quote; video: Video };
  specialties: FeaturedServices;
  career: SectionIntro & { milestones: CareerMilestone[] };
  certificates: SectionIntro & { items: Certificate[] };
  philosophy: { eyebrow: Localized; quote: Quote; portrait: MediaAsset };
};

export type ServicesPageContent = {
  seo: PageSeo;
  hero: PageHeroContent;
  groups: ServiceGroup[];
};

export type VideosPageContent = {
  seo: PageSeo;
  hero: PageHeroContent;
  /** Heading of the video list (visually hidden). */
  listTitle: Localized;
  items: Video[];
};

export type ReviewsPageContent = {
  seo: PageSeo;
  hero: PageHeroContent;
  reviewsIntro: SectionIntro;
  items: Review[];
  faq: SectionIntro & {
    categories: FaqCategory[];
    /** "Still have a question?" card beside the topics. */
    contact: { title: Localized; text: Localized; whatsappMessage: Localized; contactLabel: Localized };
  };
};

export type ArticlesPageContent = {
  seo: PageSeo;
  hero: PageHeroContent;
  featuredLabel: Localized;
  featuredId: string;
  moreTitle: Localized;
  articles: Article[];
};

export type ContactTopic = "consultation" | "secondOpinion" | "question" | "other";

export type ContactPageContent = {
  seo: PageSeo;
  hero: PageHeroContent;
  form: {
    title: Localized;
    description: Localized;
    fields: {
      name: Localized;
      phone: Localized;
      phoneHint: Localized;
      email: Localized;
      topic: Localized;
      message: Localized;
      messageHint: Localized;
      consent: Localized;
      required: Localized;
    };
    topics: Record<ContactTopic, Localized>;
    errors: {
      required: Localized;
      phone: Localized;
      email: Localized;
      consent: Localized;
      summary: Localized;
      failed: Localized;
    };
    /** Without a form endpoint the message is handed over to WhatsApp. */
    whatsappMode: { note: Localized; submit: Localized; success: Localized; heading: Localized };
    endpointMode: { note: Localized; submit: Localized; sending: Localized; success: Localized };
  };
  actions: SectionIntro & { whatsappLabel: Localized; callLabel: Localized };
};
