// Read-only current-state aid. Run only through a permitted browser API.
(() => {
  const safeUrl = value => {
    if (!value) return '';
    try {
      const url = new URL(value, location.href);
      if (url.protocol === 'data:') return 'data:[body omitted]';
      url.username = ''; url.password = '';
      for (const key of [...url.searchParams.keys()]) if (/token|secret|password|authorization|api[_-]?key|session/i.test(key)) url.searchParams.set(key, '[redacted]');
      return url.href;
    } catch { return '[invalid URL]'; }
  };
  const box = element => {
    const r = element.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };
  const sample = [...document.querySelectorAll('h1,h2,h3,p,button,a,img,video,input,select,textarea')].slice(0, 500);
  return {
    schemaVersion: 1, url: safeUrl(location.href), title: document.title, capturedAt: new Date().toISOString(),
    viewport: { width: innerWidth, height: innerHeight, deviceScale: devicePixelRatio },
    scroll: { x: scrollX, y: scrollY, height: document.documentElement.scrollHeight },
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    text: (document.body?.innerText ?? '').slice(0, 100000),
    metadata: [...document.querySelectorAll('meta[name],meta[property]')].map(meta => ({ name: meta.name || meta.getAttribute('property'), content: meta.content })),
    resources: performance.getEntriesByType('resource').map(resource => safeUrl(resource.name)),
    fonts: [...document.fonts].map(font => ({ family: font.family, weight: font.weight, style: font.style, status: font.status })),
    links: [...document.querySelectorAll('a[href]')].map(a => ({ text: a.textContent.trim().slice(0, 100), href: safeUrl(a.href), target: a.target })),
    forms: [...document.forms].map(form => ({ action: safeUrl(form.action), method: form.method })),
    images: [...document.images].map(img => ({ src: safeUrl(img.currentSrc || img.src), loaded: img.complete && img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight, box: box(img) })),
    media: [...document.querySelectorAll('video,audio')].map(media => ({ src: safeUrl(media.currentSrc), time: media.currentTime, paused: media.paused, readyState: media.readyState })),
    animations: document.getAnimations().map(animation => ({ playState: animation.playState, currentTime: typeof animation.currentTime === 'number' ? animation.currentTime : null, timing: animation.effect?.getTiming() ?? null })),
    elements: sample.map(element => {
      const css = getComputedStyle(element);
      return { tag: element.tagName.toLowerCase(), text: element.textContent.trim().slice(0, 160), box: box(element), font: css.fontFamily, size: css.fontSize, weight: css.fontWeight, lineHeight: css.lineHeight, color: css.color, background: css.backgroundColor, transform: css.transform, objectFit: css.objectFit };
    }),
    limits: { sampledElements: sample.length, elementSampleLimit: 500, textTruncated: (document.body?.innerText ?? '').length > 100000, scope: 'Current document/state only; no console, network failure history, iframe, closed shadow DOM or motion parity evidence.' },
  };
})();
