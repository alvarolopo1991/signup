export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // credenciales simples
    const USER = "demo";
    const PASS = "demo123";

    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");

    // si no coinciden, pedir login
    if (username !== USER || password !== PASS) {
      return new Response("Forbidden", { status: 403 });
    }

    // sirve el archivo enlaces.m3u
    const m3uFile = await env.ASSETS.fetch("https://fakehost/enlaces.m3u");
    return new Response(await m3uFile.text(), {
      headers: { "Content-Type": "audio/x-mpegurl; charset=utf-8" }
    });
  }
};
