export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const username = url.searchParams.get("username") || "";
    const password = url.searchParams.get("password") || "";
    const action   = url.searchParams.get("action") || "";

    // 🔐 Usuarios válidos
    const USERS = {
      "demo": "demo123",
      "testuser": "testpass"
    };

    // 🔗 Canales disponibles (puedes añadir más)
    const CHANNELS = [
      {
        id: "247470",
        name: "ES: Max Avances FHD",
        group: "Deportes",
        url: "http://trial.123gate.org:80/live/TV-2301039847977/491906379867/247470.m3u8"
      },
      {
        id: "249998",
        name: "ES: Futsal 10",
        group: "Deportes",
        url: "http://trial.123gate.org:80/live/TV-2301039847977/491906379867/249998.m3u8"
      }
    ];

    function checkAuth(u, p) {
      return USERS[u] && USERS[u] === p;
    }

    // ------------------------
    // /get.php → devuelve M3U
    // ------------------------
    if (pathname === "/get.php") {
      if (!checkAuth(username, password)) {
        return new Response("Invalid credentials", { status: 403 });
      }

      let m3u = "#EXTM3U\n";
      for (const ch of CHANNELS) {
        m3u += `#EXTINF:-1 tvg-id="${ch.id}" group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
      }

      return new Response(m3u, {
        headers: { "Content-Type": "audio/x-mpegurl; charset=utf-8" }
      });
    }

    // -----------------------------------
    // /player_api.php → API estilo Xtream
    // -----------------------------------
    if (pathname === "/player_api.php") {
      if (!checkAuth(username, password)) {
        return new Response("Forbidden", { status: 403 });
      }

      // Categorías
      if (action === "get_live_categories") {
        const cats = [...new Set(CHANNELS.map(c => c.group))];
        return Response.json(
          cats.map((c, i) => ({ category_id: i + 1, category_name: c }))
        );
      }

      // Lista de streams
      if (action === "get_live_streams") {
        const list = CHANNELS.map((ch, i) => ({
          num: i + 1,
          name: ch.name,
          stream_id: ch.id,
          stream_icon: "",
          category_id: 1,
          cmd: ch.url
        }));
        return Response.json(list);
      }

      // 👇 Respuesta básica que muchas apps piden primero (sin action)
      return Response.json({
        user_info: {
          username,
          password,
          auth: 1,
          status: "Active",
          exp_date: "1893456000", // opcional: fecha de expiración en timestamp (2030)
          is_trial: "0",
          active_cons: "1"
        },
        server_info: {
          url: url.hostname,
          port: url.port || (url.protocol === "https:" ? "443" : "80"),
          https_port: "443",
          server_protocol: url.protocol.replace(":", ""), // http o https
          rtmp_port: "0",
          timezone: "UTC"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
