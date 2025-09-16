export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const username = url.searchParams.get("username") || "";
    const password = url.searchParams.get("password") || "";

    // Usuarios válidos
    const USERS = { demo: "demo123", testuser: "testpass" };
    const AUTH = USERS[username] === password;

    // Catálogo único definido en un solo sitio
    const CHANNELS = [
      {
        id: "247470",
        name: "ES: Max Avances FHD",
        group: "Deportes",
        // stream directo al origen (no proxyeamos)
        url: "http://trial.123gate.org:80/live/TV-2301039847977/491906379867/247470.m3u8"
      }
    ];

    // Helper respuesta JSON
    const j = (obj, code = 200) =>
      new Response(JSON.stringify(obj), {
        status: code,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });

    // -------------- GET.PHP (playlist M3U) -----------------
    if (pathname === "/get.php") {
      if (!AUTH) return new Response("Invalid credentials", { status: 403 });
      let m3u = "#EXTM3U\n";
      for (const ch of CHANNELS) {
        m3u += `#EXTINF:-1 tvg-id="${ch.id}" group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
      }
      return new Response(m3u, {
        headers: { "Content-Type": "audio/x-mpegurl; charset=utf-8" }
      });
    }

    // -------------- PLAYER_API.PHP (API Xtream) -------------
    if (pathname === "/player_api.php") {
      if (!AUTH) return new Response("Forbidden", { status: 403 });

      const action = url.searchParams.get("action") || "";
      const host = url.host;
      const isHttps = url.protocol === "https:";
      const port = url.port || (isHttps ? "443" : "80");

      // ⚠️ Muchas apps primero llaman SIN action
      if (!action) {
        return j({
          user_info: {
            username,
            password,
            auth: 1,
            status: "Active",
            exp_date: null,           // o timestamp si quieres
            is_trial: "0"
          },
          server_info: {
            url: host,
            port: port,
            https_port: "443",
            server_protocol: isHttps ? "https" : "http",
            rtmp_port: "0",
            timezone: "UTC"
          }
        });
      }

      if (action === "get_live_categories") {
        // una categoría básica
        return j([{ category_id: 1, category_name: "Deportes" }]);
      }

      if (action === "get_live_streams") {
        // lista de canales live
        const list = CHANNELS.map(ch => ({
          name: ch.name,
          stream_id: ch.id,
          stream_icon: "",
          category_id: 1,
          // algunos clientes miran 'cmd' y 'stream_url'
          cmd: ch.url,
          stream_url: ch.url
        }));
        return j(list);
      }

      // VOD opcional (si lo necesitas más tarde)
      if (action === "get_vod_categories") {
        return j([{ category_id: 1, category_name: "Películas" }]);
      }
      if (action === "get_vod_streams") {
        return j([]); // de momento vacío
      }

      return j({ result: "ok" });
    }

    // -------------- Ping sencillo ---------------------------
    if (pathname === "/") {
      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }
};
