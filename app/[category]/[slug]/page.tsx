import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container/Container';
import { getAllTools, getToolByCategoryAndSlug } from '@/config/tools/registry';
import { siteConfig } from '@/config/site';
import { ToolPageClient } from '../../[slug]/ToolPageClient';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
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
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  const tools = getAllTools();
  const params: { category: string; slug: string }[] = [];

  tools.forEach((tool) => {
    params.push({ category: tool.category, slug: tool.slug });
    if (tool.categoryAlias) {
      params.push({ category: tool.category, slug: tool.categoryAlias });
    }
  });

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const tool = getToolByCategoryAndSlug(category, slug);

  if (!tool) {
    return {
      title: `Tool Not Found | ${siteConfig.name}`,
    };
  }

  const pageUrl = `${siteConfig.url}/${category}/${slug}`;

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

export default async function CategoryToolPage({ params }: Props) {
  const { category, slug } = await params;
  const tool = getToolByCategoryAndSlug(category, slug);

  if (!tool) {
    notFound();
  }

  const pageUrl = `${siteConfig.url}/${category}/${slug}`;
  const breadcrumbItems = [
    { name: 'All Tools', url: '/tools' },
    { name: category.toUpperCase(), url: `/tools?category=${category}` },
    { name: tool.name, url: pageUrl },
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
        <ToolGuide tool={tool} />
        <ToolFaq toolName={tool.name} faqs={faqs} />
        <RelatedTools currentSlug={tool.slug} />
      </Container>
    </>
  );
}
