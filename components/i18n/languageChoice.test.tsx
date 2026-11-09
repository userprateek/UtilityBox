import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebsiteLanguageProvider } from './WebsiteLanguageProvider';
import { LanguagePrompt } from './LanguagePrompt';
import { ToolGuideLangShell } from '@/components/tool/ToolGuide/ToolGuideLangShell';
import { LanguageSwitch } from './LanguageSwitch';
import { WEBSITE_LANGUAGE_KEY } from '@/lib/i18n/websiteLanguage';

function Harness() {
  return (
    <WebsiteLanguageProvider>
      <LanguagePrompt />
      <ToolGuideLangShell titles={<span>Guide title</span>}>
        <p>Guide body</p>
      </ToolGuideLangShell>
    </WebsiteLanguageProvider>
  );
}

function HeaderAndGuide() {
  return (
    <WebsiteLanguageProvider>
      <LanguageSwitch />
      <ToolGuideLangShell titles={<span>Guide title</span>}>
        <p>Guide body</p>
      </ToolGuideLangShell>
    </WebsiteLanguageProvider>
  );
}

describe('first-visit language choice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.removeAttribute('data-lang');
  });

  it('shows the prompt until a language is chosen', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const dialog = screen.getByRole('dialog', { name: /choose your language/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'हिंदी' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.getAttribute('data-lang')).toBe('en');
  });

  it('applies hindi from the prompt and keeps the guide toggle in sync', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'हिंदी' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('hi');
    expect(document.documentElement.getAttribute('data-lang')).toBe('hi');
    expect(screen.getByRole('button', { name: 'Switch to Hindi guide' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('does not show the prompt again when a preference is already stored', () => {
    localStorage.setItem(WEBSITE_LANGUAGE_KEY, 'hi');
    render(<Harness />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-lang')).toBe('hi');
    expect(screen.getByRole('button', { name: 'Switch to Hindi guide' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('updates the same stored preference from the guide toggle', async () => {
    const user = userEvent.setup();
    localStorage.setItem(WEBSITE_LANGUAGE_KEY, 'en');
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Switch to Hindi guide' }));

    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch to English guide' }));
    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('keeps the header switch and the guide toggle on the same preference', async () => {
    const user = userEvent.setup();
    localStorage.setItem(WEBSITE_LANGUAGE_KEY, 'en');
    render(<HeaderAndGuide />);

    await user.click(screen.getByRole('button', { name: 'हिंदी' }));

    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(screen.getByRole('button', { name: 'Switch to Hindi guide' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByRole('button', { name: 'Switch to English guide' }));

    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('en');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('still applies a choice when localStorage cannot be written', async () => {
    const user = userEvent.setup();
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'हिंदी' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-lang')).toBe('hi');
  });
});
