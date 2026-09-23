const PREFIX = '/demos/el-paso';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== PREFIX && !url.pathname.startsWith(`${PREFIX}/`)) {
      return new Response('Not found', { status: 404 });
    }

    let assetPath = url.pathname.slice(PREFIX.length) || '/';
    if (assetPath === '/') assetPath = '/index.html';

    const assetUrl = new URL(request.url);
    assetUrl.pathname = assetPath;
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
};
