import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container/Container';
import { getAllTools, getToolBySlug } from '@/config/tools/registry';
import { siteConfig } from '@/config/site';
import { ToolPageClient } from './ToolPageClient';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { ToolOverview } from '@/components/tool/ToolOverview/ToolOverview';
import { ToolGuide } from '@/components/tool/ToolGuide/ToolGuide';
import { ToolFaq } from '@/components/tool/ToolFaq/ToolFaq';
import { RelatedTools } from '@/components/tool/RelatedTools/RelatedTools';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  generateToolJsonLd,
  generateHowToJsonLd,
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
  getDefaultToolFaqs,
} from '@/lib/seo/schema';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const tools = getAllTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: `Tool Not Found | ${siteConfig.name}`,
      robots: { index: false, follow: true },
    };
  }

  const pageUrl = `${siteConfig.url}/${tool.slug}`;

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const pageUrl = `${siteConfig.url}/${tool.slug}`;
  const breadcrumbItems = [
    { name: 'All Tools', url: '/tools' },
    { name: tool.name, url: `/${tool.slug}` },
  ];

  const toolJsonLd = generateToolJsonLd(tool);
  const howToJsonLd = generateHowToJsonLd(tool);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'All Tools', url: `${siteConfig.url}/tools` },
    { name: tool.name, url: pageUrl },
  ]);
  const faqs = getDefaultToolFaqs(tool);
  const faqJsonLd = generateFaqJsonLd(faqs);

  return (
    <>
      <JsonLd schema={toolJsonLd} />
      <JsonLd schema={howToJsonLd} />
      <JsonLd schema={breadcrumbJsonLd} />
      <JsonLd schema={faqJsonLd} />

      <Container size="lg" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <Breadcrumbs items={breadcrumbItems} />

        <ToolPageClient tool={tool} />

        <ToolOverview tool={tool} />

        <ToolGuide tool={tool} />

        <ToolFaq toolName={tool.name} faqs={faqs} />

        <RelatedTools currentSlug={tool.slug} />
      </Container>
    </>
  );
}
