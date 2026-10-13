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
  /** CMS media library entry (`cms_media.id`); `npm run cms:sync` sets `src` from it. */
  assetId?: string;
};

export type VideoSource =
  | { kind: "youtube"; id: string }
  | { kind: "file"; src: string; type?: string; assetId?: string };

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

/**
 * What a button does. A closed set of validated actions (no free-form
 * scripts or URLs with arbitrary schemes).
 */
export type CtaAction =
  /** A page of the site, or a section of a page (route keys such as `servicesTreatments`). */
  | { kind: "page"; route: RouteKey }
  /** A section on the same page, by its id (e.g. `specialties`). */
  | { kind: "section"; anchor: string }
  /** Opens WhatsApp with the clinic number; `message` overrides the default greeting. */
  | { kind: "whatsapp"; message?: Localized }
  /** Calls the clinic number. */
  | { kind: "phone" }
  /** An external website (https only). */
  | { kind: "external"; url: string; newTab: boolean };

export type Cta = {
  label: Localized;
  action: CtaAction;
  /** Screen-reader label when the visible label alone is not descriptive enough. */
  ariaLabel?: Localized;
  /** Hidden buttons are kept in the content but not shown. */
  hidden?: boolean;
};

/** Order and visibility of a page's sections (the hero always comes first). */
export type PageLayout<Id extends string = string> = { sections: { id: Id; hidden?: boolean }[] };

export type HomeSectionId =
  | "introVideo"
  | "about"
  | "statistics"
  | "specialties"
  | "treatments"
  | "journey"
  | "whyChoose"
  | "videos"
  | "reviewsFaq"
  | "cta";

export type AboutSectionId = "intro" | "specialties" | "career" | "certificates" | "philosophy" | "cta";

export type ServicesSectionId = "groups" | "cta";

export type ReviewsSectionId = "reviews" | "faq";

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

export type NavItem = {
  route: RouteKey;
  label: Localized;
  /** Hidden from the header and footer menus (the page itself still exists). */
  hidden?: boolean;
};

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
  /** Site-wide contact shortcuts (each needs the matching phone / WhatsApp number). */
  quickActions: {
    /** "Book a consultation" WhatsApp button in the header. */
    headerBookButton: boolean;
    /** Floating WhatsApp button on every page. */
    floatingWhatsapp: boolean;
    /** Floating call button on every page. */
    floatingPhone: boolean;
  };
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
export type FeaturedServices = SectionIntro & { serviceIds: Five<string>; cta: Cta };

export type HeroContent = {
  eyebrow: Localized;
  title: Localized;
  titleAccent: Localized;
  description: Localized;
  primaryCta: Cta;
  secondaryCta: Cta;
  image: MediaAsset;
};

/** Hero used by internal pages. */
export type PageHeroContent = {
  eyebrow: Localized;
  title: Localized;
  description: Localized;
  image: MediaAsset;
};

export type PageSeo = {
  title: Localized;
  description: Localized;
  /** Social sharing image; the site default is used when empty. */
  shareImage?: MediaAsset | null;
  /** Asks search engines not to index this page (indexing is also off site-wide until launch). */
  noindex?: boolean;
};

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
  /** `ogImage`: the generated sharing images (`npm run og`), used unless `shareImage` is set. */
  seo: PageSeo & { ogImage: Localized<string>; ogImageAlt: Localized };
  layout: PageLayout<HomeSectionId>;
  hero: HeroContent;
  introVideo: SectionIntro & { video: Video };
  about: SectionIntro &
    Placeholder & {
      paragraphs: Localized<string[]>;
      cta: Cta;
      portrait: MediaAsset;
    };
  statistics: SectionIntro & { items: Statistic[] };
  specialties: FeaturedServices;
  treatments: FeaturedServices;
  journey: SectionIntro & { steps: JourneyStep[]; note: Localized; cta: Cta };
  whyChoose: SectionIntro &
    Placeholder & {
      principles: Principle[];
      image: MediaAsset;
      caption: Localized;
    };
  /** Shows the three most important videos: the first entries of the catalog (content/videos.ts). */
  videos: SectionIntro & { cta: Cta };
  /**
   * Shows the six most important reviews: the first entries of the catalog
   * (content/reviews.ts). `cta` is the button centered under the reviews and FAQ columns.
   */
  reviews: SectionIntro & { cta: Cta };
  /** Questions from the FAQ catalog (content/faq.ts). */
  faq: SectionIntro & { faqIds: string[] };
};

export type AboutPageContent = {
  seo: PageSeo;
  layout: PageLayout<AboutSectionId>;
  hero: HeroContent;
  intro: { eyebrow: Localized; quote: Quote; video: Video };
  specialties: FeaturedServices;
  career: SectionIntro & { milestones: CareerMilestone[] };
  certificates: SectionIntro & { items: Certificate[] };
  philosophy: { eyebrow: Localized; quote: Quote; portrait: MediaAsset };
};

export type ServicesPageContent = {
  seo: PageSeo;
  layout: PageLayout<ServicesSectionId>;
  hero: PageHeroContent;
  groups: ServiceGroup[];
};

export type VideosPageContent = {
  seo: PageSeo;
  hero: PageHeroContent;
  /** Heading of the video list (visually hidden). */
  listTitle: Localized;
  /** Ordered by importance: the homepage shows the first three. */
  items: Video[];
};

export type ReviewsPageContent = {
  seo: PageSeo;
  layout: PageLayout<ReviewsSectionId>;
  hero: PageHeroContent;
  reviewsIntro: SectionIntro;
  /** Ordered by importance: the homepage shows the first six. */
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
