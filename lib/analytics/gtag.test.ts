import {
  pageview,
  trackHomeVisit,
  trackToolView,
  trackToolDownload,
  trackToolUse,
  trackEvent,
  GA_MEASUREMENT_ID,
} from './gtag';

describe('Google Analytics (gtag) Utilities', () => {
  let originalGtag: typeof window.gtag;

  beforeEach(() => {
    originalGtag = window.gtag;
    window.gtag = jest.fn();
  });

  afterEach(() => {
    window.gtag = originalGtag;
  });

  it('tracks pageviews accurately when gtag is available', () => {
    pageview('/image-compressor');

    if (GA_MEASUREMENT_ID) {
      expect(window.gtag).toHaveBeenCalledWith('config', GA_MEASUREMENT_ID, {
        page_path: '/image-compressor',
      });
    }
  });

  it('tracks home page visit event', () => {
    trackHomeVisit();

    expect(window.gtag).toHaveBeenCalledWith('event', 'home_visit', {
      event_category: 'Navigation',
      event_label: 'Homepage Visit',
    });
  });

  it('tracks tool view event when user lands on a tool page', () => {
    trackToolView('passport-photo-maker', 'Passport Size Photo Maker', 'image');

    expect(window.gtag).toHaveBeenCalledWith('event', 'tool_view', {
      tool_slug: 'passport-photo-maker',
      tool_name: 'Passport Size Photo Maker',
      tool_category: 'image',
      event_category: 'Tool Page',
      event_label: 'View: passport-photo-maker',
    });
  });

  it('tracks file downloads with both standard and custom events', () => {
    trackToolDownload('image-compressor', {
      fileName: 'photo_compressed_docswala.net.jpg',
      fileExtension: 'jpg',
      fileCount: 1,
      fileSize: 45000,
      toolName: 'Image Compressor',
    });

    expect(window.gtag).toHaveBeenCalledWith('event', 'file_download', {
      file_name: 'photo_compressed_docswala.net.jpg',
      file_extension: 'jpg',
      tool_slug: 'image-compressor',
      file_count: 1,
      value: 45000,
    });

    expect(window.gtag).toHaveBeenCalledWith('event', 'tool_use', {
      tool_slug: 'image-compressor',
      tool_name: 'Image Compressor',
      action_type: 'download',
      event_category: 'Tool Conversion',
      event_label: 'Download: image-compressor',
      file_name: 'photo_compressed_docswala.net.jpg',
      file_extension: 'jpg',
      file_count: 1,
      file_size: 45000,
    });
  });

  it('tracks custom tool_use events with metadata', () => {
    trackToolUse('image-compressor', 'compress_complete', {
      file_count: 3,
      quality: 80,
    });

    expect(window.gtag).toHaveBeenCalledWith('event', 'tool_use', {
      tool_slug: 'image-compressor',
      action_type: 'compress_complete',
      event_category: 'Tool Action',
      event_label: 'image-compressor:compress_complete',
      file_count: 3,
      quality: 80,
    });
  });

  it('tracks generic events', () => {
    trackEvent('user_signup_click', { button_id: 'hero_btn' });

    expect(window.gtag).toHaveBeenCalledWith('event', 'user_signup_click', {
      button_id: 'hero_btn',
    });
  });

  it('handles missing window.gtag safely without throwing exceptions', () => {
    window.gtag = undefined;

    expect(() => {
      pageview('/about');
      trackHomeVisit();
      trackToolView('pdf-merger');
      trackToolDownload('pdf-merger');
      trackToolUse('pdf-merger', 'merge');
      trackEvent('custom_event');
    }).not.toThrow();
  });
});
