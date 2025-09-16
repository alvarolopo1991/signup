export default { 
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const username = url.searchParams.get("username") || "";
    const password = url.searchParams.get("password") || "";

    // 🔐 usuarios permitidos
    const USERS = {
      "demo": "demo123",
      "testuser": "testpass"
    };

    function checkAuth(u, p) {
      return USERS[u] && USERS[u] === p;
    }

    // ⬇️ GET.PHP
    if (pathname === "/get.php") {
      if (!checkAuth(username, password)) {
        return new Response("Invalid credentials", { status: 403 });
      }

      // 👉 Canal de ejemplo
      const channels = [
        {
          id: "247470",
          name: "ES: Max Avances FHD",
          group: "Deportes",
          url: "http://trial.123gate.org:80/live/TV-2301039847977/491906379867/247470.m3u8"
        }
      ];

      let m3u = "#EXTM3U\n";
      for (const ch of channels) {
        m3u += `#EXTINF:-1 tvg-id="${ch.id}" group-title="${ch.group}",${ch.name}\n${ch.url}\n`;
      }

      return new Response(m3u, {
        headers: { "Content-Type": "audio/x-mpegurl; charset=utf-8" }
      });
    }

    // ⬇️ PLAYER_API.PHP
    if (pathname === "/player_api.php") {
      if (!checkAuth(username, password)) {
        return new Response("Forbidden", { status: 403 });
      }

      const action = url.searchParams.get("action") || "";

      if (action === "get_live_categories") {
        return Response.json([{ category_id: 1, category_name: "Deportes" }]);
      }

      if (action === "get_live_streams") {
        return Response.json([
          {
            name: "ES: Max Avances FHD",
            stream_id: "247470",
            stream_icon: "",
            category_id: 1,
            cmd: "http://trial.123gate.org:80/live/TV-2301039847977/491906379867/247470.m3u8"
          }
        ]);
      }

      return Response.json({ result: "ok" });
    }

    return new Response("Not Found", { status: 404 });
  }
};
