import { SectionHeading } from "@/components/ui/SectionHeading";
import type { About, Site } from "@/lib/content";
import { CertificateGallery } from "./CertificateGallery";

type CertificatesProps = {
  content: About["certificates"];
  ui: Site["ui"];
};

export function Certificates({ content, ui }: CertificatesProps) {
  return (
    <section id="certificates" className="section" aria-labelledby="certificates-title">
      <div className="container">
        <SectionHeading
          id="certificates-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <div data-reveal>
          <CertificateGallery items={content.items} label={content.title} ui={ui} />
        </div>
      </div>
    </section>
  );
}
