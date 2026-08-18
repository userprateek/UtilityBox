import React from 'react';
import Link from 'next/link';
import { Compass, Home, Grid } from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { Button } from '@/components/common/Button/Button';

export default function NotFound() {
  return (
    <Container size="md" style={{ paddingTop: '5rem', paddingBottom: '7rem', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-bg)',
          color: 'var(--color-primary)',
          marginBottom: '1.5rem',
        }}
      >
        <Compass size={42} />
      </div>

      <h1
        style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          margin: '0 0 0.5rem 0',
          color: 'var(--color-text-primary)',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          margin: '0 0 1rem 0',
          color: 'var(--color-text-primary)',
        }}
      >
        Page or Tool Not Found
      </h2>

      <p
        style={{
          fontSize: '1rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '480px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6,
        }}
      >
        The page you are looking for doesn&apos;t exist or has been moved. Explore our popular tools
        or return to the homepage.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/">
          <Button variant="primary" size="lg" leftIcon={<Home size={18} />}>
            Back to Home
          </Button>
        </Link>
        <Link href="/tools">
          <Button variant="secondary" size="lg" leftIcon={<Grid size={18} />}>
            Browse All Tools
          </Button>
        </Link>
      </div>
    </Container>
  );
}
