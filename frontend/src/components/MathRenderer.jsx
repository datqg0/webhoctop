import React, { useMemo } from 'react';
import katex from 'katex';

export default function MathRenderer({ content, className = '' }) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    const escapeHtml = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const renderPlainText = (value) => escapeHtml(value)
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    const mathPattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let html = '';
    let lastIndex = 0;
    let match;

    while ((match = mathPattern.exec(content)) !== null) {
      html += renderPlainText(content.slice(lastIndex, match.index));
      const isBlock = match[1] !== undefined;
      const math = (isBlock ? match[1] : match[2]).trim();
      try {
        const renderedMath = katex.renderToString(math, { displayMode: isBlock, throwOnError: false });
        html += isBlock
          ? `<div class="katex-display my-2 flex justify-center overflow-x-auto">${renderedMath}</div>`
          : `<span class="katex-inline inline-block px-0.5">${renderedMath}</span>`;
      } catch {
        html += renderPlainText(match[0]);
      }
      lastIndex = mathPattern.lastIndex;
    }

    return html + renderPlainText(content.slice(lastIndex));
  }, [content]);

  return (
    <div
      className={`math-content leading-relaxed text-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
