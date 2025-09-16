export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const username = url.searchParams.get("username") || "";
    const password = url.searchParams.get("password") || "";

    // 🔐 usuarios permitidos (puedes ampliarlo o cargar de KV si quieres)
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

      const channels = [
        {
          id: "249998",
          name: "Futsal 10",
          group: "Sports"
        },
        {
          id: "249997",
          name: "Futsal 9",
          group: "Sports"
        }
      ];

      let m3u = "#EXTM3U\n";
      for (const ch of channels) {
        const streamUrl = `${env.DEFAULT_SERVER}/live/${username}/${password}/${ch.id}.m3u8`;
        m3u += `#EXTINF:-1 tvg-id="${ch.id}" group-title="${ch.group}",${ch.name}\n${streamUrl}\n`;
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
        return Response.json([{ category_id: 1, category_name: "Sports" }]);
      }

      if (action === "get_live_streams") {
        return Response.json([
          {
            name: "Futsal 10",
            stream_id: "249998",
            stream_icon: "",
            category_id: 1,
            cmd: `${env.DEFAULT_SERVER}/live/${username}/${password}/249998.m3u8`
          },
          {
            name: "Futsal 9",
            stream_id: "249997",
            stream_icon: "",
            category_id: 1,
            cmd: `${env.DEFAULT_SERVER}/live/${username}/${password}/249997.m3u8`
          }
        ]);
      }

      return Response.json({ result: "ok" });
    }

    return new Response("Not Found", { status: 404 });
  }
};
