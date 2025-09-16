export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const username = url.searchParams.get("username") || "";
    const password = url.searchParams.get("password") || "";
    const action   = url.searchParams.get("action") || "";

    const USERS = {
      "demo": "demo123",
      "testuser": "testpass"
    };

    const CHANNELS = [
      {
        id: "247470",
        name: "ES: Max Avances FHD",
        group: "Deportes",
        url: "http://trial.123gate.org:80/live/TV-2301039847977/491906379867/247470.m3u8"
      }
    ];

    function checkAuth(u, p) {
      return USERS[u] && USERS[u] === p;
    }

    // GET.PHP
    if (pathname === "/get.php") {
      if (!checkAuth(username, password)) {
        return new Response("Invalid credentials", { status: 403 });
      }
      let m3u = "#EXTM3U\n";
      for (const ch of CHANNELS) {
        m3u += `#EXTINF:-1 group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
      }
      return new Response(m3u, { headers: { "Content-Type": "audio/x-mpegurl" } });
    }

    // PLAYER_API.PHP
    if (pathname === "/player_api.php") {
      if (!checkAuth(username, password)) {
        return new Response("Forbidden", { status: 403 });
      }

      if (action === "get_live_categories") {
        return Response.json([{ category_id: 1, category_name: "Deportes" }]);
      }

      if (action === "get_live_streams") {
        return Response.json(CHANNELS.map((ch, i) => ({
          num: i + 1,
          name: ch.name,
          stream_id: ch.id,
          category_id: 1,
          stream_icon: "",
          cmd: ch.url
        })));
      }

      // 👇 Respuesta básica inicial
      return Response.json({
        user_info: {
          username,
          password,
          auth: 1,
          status: "Active",
          exp_date: "1893456000"
        },
        server_info: {
          url: url.hostname,
          port: url.port || (url.protocol === "https:" ? "443" : "80"),
          https_port: "443",
          server_protocol: url.protocol.replace(":", "")
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
