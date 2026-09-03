import test from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HighlightText } from '../highlight-text';

test('HighlightText component structure and logic', async (t) => {
  await t.test('returns empty markup when text is empty', () => {
    const html = renderToStaticMarkup(
      React.createElement(HighlightText, { text: '', brandName: 'Stripe' })
    );
    assert.equal(html, '');
  });

  await t.test('returns unhighlighted text when brandName and aliases are empty', () => {
    const html = renderToStaticMarkup(
      React.createElement(HighlightText, { text: 'Hello world', brandName: '', aliases: [] })
    );
    assert.equal(html, '<span class="">Hello world</span>');
  });

  await t.test('renders mark tags highlighting matches case-insensitively and handles multi-word aliases', () => {
    const text = 'Stripe offers Stripe Docs for payments with stripe api';
    const html = renderToStaticMarkup(
      React.createElement(HighlightText, {
        text,
        brandName: 'Stripe',
        aliases: ['Stripe Docs', 'stripe api'],
        className: 'highlighted-container',
      })
    );

    assert.ok(html.includes('class="highlighted-container"'));
    assert.ok(html.includes('<mark class="bg-yellow-200'));
    assert.ok(html.includes('>Stripe<'));
    assert.ok(html.includes('>Stripe Docs<'));
    assert.ok(html.includes('>stripe api<'));
  });
});
