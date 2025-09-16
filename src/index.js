export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // usuario y contraseña esperados
    const USER = "demo";
    const PASS = "demo123";

    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");

    // comprueba credenciales
    if (username !== USER || password !== PASS) {
      return new Response("Forbidden", { status: 403 });
    }

    // busca si piden el archivo enlaces.m3u
    if (url.pathname.endsWith("enlaces.m3u")) {
      const m3uFile = await env.ASSETS.fetch("https://fakehost/enlaces.m3u");
      return new Response(await m3uFile.text(), {
        headers: { "Content-Type": "audio/x-mpegurl; charset=utf-8" }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
