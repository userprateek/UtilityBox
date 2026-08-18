import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdSlot } from './AdSlot';

describe('AdSlot Component', () => {
  it('renders placeholder preview when showPlaceholder is true and no credentials are set', () => {
    render(<AdSlot format="leaderboard" showPlaceholder={true} />);

    expect(screen.getByText('SPONSORED AD SPACE')).toBeInTheDocument();
    expect(screen.getByText(/Google AdSense Ready \(leaderboard\)/i)).toBeInTheDocument();
  });

  it('renders nothing when no credentials are set and showPlaceholder is false', () => {
    const { container } = render(<AdSlot format="banner" showPlaceholder={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders adsbygoogle ins tag when client and slot are provided', () => {
    const { container } = render(
      <AdSlot format="rectangle" client="ca-pub-1234567890" slot="9876543210" />
    );

    const ins = container.querySelector('ins.adsbygoogle');
    expect(ins).toBeInTheDocument();
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-1234567890');
    expect(ins).toHaveAttribute('data-ad-slot', '9876543210');
  });
});
