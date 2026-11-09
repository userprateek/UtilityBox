import React from 'react';

/** Both languages stay in the HTML. CSS on `html[data-lang]` shows one before paint. */
export function Bi({ en, hi }: { en: React.ReactNode; hi: React.ReactNode }) {
  return (
    <>
      <span data-i18n="en">{en}</span>
      <span data-i18n="hi">{hi}</span>
    </>
  );
}
