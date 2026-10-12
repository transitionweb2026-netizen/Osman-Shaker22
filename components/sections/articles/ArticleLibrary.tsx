import type { CSSProperties } from "react";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { DetailView } from "@/components/content/DetailView";
import { Dialog } from "@/components/dialog/Dialog";
import { DialogTrigger } from "@/components/dialog/DialogTrigger";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import buttonStyles from "@/components/ui/Button.module.css";
import type { ArticlesPage, Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import styles from "./ArticleLibrary.module.css";

type Article = ArticlesPage["articles"][number];

type ArticleLibraryProps = {
  page: ArticlesPage;
  ui: Site["ui"];
};

const dialogIdFor = (article: Article) => `article-${article.id}`;

function ArticleCard({ article, ui }: { article: Article; ui: Site["ui"] }) {
  return (
    <GlassPanel as="article" ink="mixed" className={styles.card}>
      <div className={styles.cardMedia}>
        <MediaImage image={article.image} sizes="(min-width: 1100px) 380px, (min-width: 680px) 46vw, 92vw" />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.category}>{article.category}</p>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <span className={styles.cue} aria-hidden="true">
          {ui.readArticle}
          <Icon name="arrow" size={16} />
        </span>
      </div>
      {/* Transparent button over the whole card */}
      <DialogTrigger target={dialogIdFor(article)} className={styles.trigger}>
        <span className="sr-only">
          {ui.readArticle}: {article.title}
        </span>
      </DialogTrigger>
    </GlassPanel>
  );
}

function ArticleDialog({ article, ui }: { article: Article; ui: Site["ui"] }) {
  const id = dialogIdFor(article);
  return (
    <Dialog id={id} labelledBy={`${id}-title`} closeLabel={ui.close} variant="article">
      <DetailView
        titleId={`${id}-title`}
        eyebrow={article.category}
        title={article.title}
        image={article.image}
        reading
        meta={
          article.reviewedBy && (
            <p className={styles.reviewed}>{ui.reviewedBy.replace("{name}", article.reviewedBy)}</p>
          )
        }
      >
        <p className={styles.lead}>{article.excerpt}</p>
        <ContentBlocks blocks={article.body} reading />
        <p className={styles.disclaimer}>{ui.articleDisclaimer}</p>
      </DetailView>
    </Dialog>
  );
}

/** Featured article, six further articles, and a reading popup for each. */
export function ArticleLibrary({ page, ui }: ArticleLibraryProps) {
  const featured = page.articles.find((article) => article.id === page.featuredId) ?? page.articles[0];
  const others = page.articles.filter((article) => article !== featured);

  return (
    <>
      <section className={cx("section", styles.featuredSection)} aria-labelledby="featured-article-title">
        <div className="container">
          <GlassPanel as="article" ink="mixed" animateInk grain className={styles.featured} data-reveal="scale">
            <div className={styles.featuredMedia}>
              <MediaImage image={featured.image} sizes="(min-width: 1000px) 640px, 94vw" />
            </div>
            <div className={styles.featuredBody}>
              <p className="eyebrow">{page.featuredLabel}</p>
              <p className={styles.category}>{featured.category}</p>
              <h2 id="featured-article-title" className={styles.featuredTitle}>
                {featured.title}
              </h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <DialogTrigger
                target={dialogIdFor(featured)}
                className={cx(buttonStyles.button, buttonStyles.primary, buttonStyles.large)}
              >
                <span>{ui.readArticle}</span>
                <Icon name="arrow" size={18} />
              </DialogTrigger>
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="section" aria-labelledby="more-articles-title">
        <div className="container">
          <SectionHeading id="more-articles-title" eyebrow={page.hero.eyebrow} title={page.moreTitle} />
          <ul className={styles.grid}>
            {others.map((article, index) => (
              <li key={article.id} data-reveal style={{ "--reveal-delay": (index % 3) * 100 } as CSSProperties}>
                <ArticleCard article={article} ui={ui} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {page.articles.map((article) => (
        <ArticleDialog key={article.id} article={article} ui={ui} />
      ))}
    </>
  );
}
