export default {
  async fetch(request, env) {
    // Sirve archivos estáticos desde /public (incluye enlaces.m3u)
    return env.ASSETS.fetch(request);
  }
};
