import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import heroStyles from "@/components/sections/PageHero.module.css";
import { ServiceGroups } from "@/components/sections/services/ServiceGroups";
import { Icon } from "@/components/ui/Icon";
import { getServicesPage, getSite, navLabel } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, page] = await Promise.all([getSite(locale), getServicesPage(locale)]);
  return pageMetadata({ locale, path: "services/", ...page.seo, siteName: site.name });
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, page] = await Promise.all([getSite(locale), getServicesPage(locale)]);

  return (
    <>
      <PageHero locale={locale} site={site} content={page.hero} pageLabel={navLabel(site, "services")}>
        {/* Jump links to each service group */}
        <ul className={heroStyles.links}>
          {page.groups.map((group) => (
            <li key={group.id}>
              <GlassPanel as="a" href={`#${group.id}`} blur className={heroStyles.chip}>
                {group.eyebrow}
                <Icon name="arrowUp" size={16} />
              </GlassPanel>
            </li>
          ))}
        </ul>
      </PageHero>
      <ServiceGroups locale={locale} groups={page.groups} site={site} />
      <FinalCta site={site} />
    </>
  );
}
