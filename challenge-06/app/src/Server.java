import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * The gatekeeper accounts API.
 *
 * Clients authenticate by sending their token in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * GET /account returns the caller's account. Users with the "admin" role also
 * see the admin panel.
 */
public class Server {

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8080), 0);
        server.createContext("/account", Server::account);
        server.setExecutor(null);
        server.start();
        System.out.println("gatekeeper listening on 127.0.0.1:8080");
    }

    private static void account(HttpExchange ex) throws IOException {
        String auth = ex.getRequestHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            send(ex, 401, "missing bearer token\n");
            return;
        }

        String token = auth.substring("Bearer ".length()).trim();
        User user;
        try {
            user = TokenService.parse(token);
        } catch (Exception e) {
            send(ex, 401, "invalid token\n");
            return;
        }

        String body = "user=" + user.subject + " role=" + user.role + "\n";
        if ("admin".equals(user.role)) {
            body += "ADMIN PANEL: all customer records, billing, and API keys.\n";
        } else {
            body += "Welcome. Standard user access.\n";
        }
        send(ex, 200, body);
    }

    private static void send(HttpExchange ex, int code, String body) throws IOException {
        byte[] b = body.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(code, b.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(b);
        }
    }
}
