import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container/Container';
import { getAllTools, getToolBySlug } from '@/config/tools/registry';
import { siteConfig } from '@/config/site';
import { ToolPageClient } from './ToolPageClient';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { ToolGuide } from '@/components/tool/ToolGuide/ToolGuide';
import { ToolFaq } from '@/components/tool/ToolFaq/ToolFaq';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateToolJsonLd, generateBreadcrumbJsonLd, getDefaultToolFaqs } from '@/lib/seo/schema';

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
      title: 'Tool Not Found | UtilityBox',
    };
  }

  const pageUrl = `${siteConfig.url}/tools/${tool.slug}`;

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: pageUrl,
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
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
      creator: `@${siteConfig.name}`,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const pageUrl = `${siteConfig.url}/tools/${tool.slug}`;
  const breadcrumbItems = [
    { name: 'All Tools', url: '/tools' },
    { name: tool.name, url: `/tools/${tool.slug}` },
  ];

  const toolJsonLd = generateToolJsonLd(tool);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'All Tools', url: `${siteConfig.url}/tools` },
    { name: tool.name, url: pageUrl },
  ]);
  const faqs = getDefaultToolFaqs(tool);

  return (
    <>
      {/* Structured Data (JSON-LD) for Search Engines */}
      <JsonLd schema={toolJsonLd} />
      <JsonLd schema={breadcrumbJsonLd} />

      <Container size="lg" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        {/* Semantic Breadcrumbs Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Interactive Tool Workflow */}
        <ToolPageClient tool={tool} />

        {/* Step-by-Step How-To Guide for Organic Keywords */}
        <ToolGuide tool={tool} />

        {/* Semantic FAQ Section with FAQPage Schema */}
        <ToolFaq toolName={tool.name} faqs={faqs} />
      </Container>
    </>
  );
}
