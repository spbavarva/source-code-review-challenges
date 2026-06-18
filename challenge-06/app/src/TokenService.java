import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Issues and reads the JWT-style tokens that authenticate requests to the
 * gatekeeper accounts API.
 *
 * A token has three dot-separated parts: header.payload.signature. The payload
 * carries the user's subject and role. The signature is an HMAC-SHA256 over
 * "header.payload" using the server's secret, so only this server can produce a
 * valid token.
 */
public class TokenService {

    // Shared secret used to sign tokens this service issues.
    private static final String SECRET = System.getenv()
            .getOrDefault("JWT_SECRET", "gatekeeper-signing-key-do-not-share");

    /** Create a signed token for a user who has just logged in. */
    public static String issue(String subject, String role) {
        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Url(
                String.format("{\"sub\":\"%s\",\"role\":\"%s\"}", subject, role));
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    /** Read the user described by a token. */
    public static User parse(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("malformed token");
        }

        String payloadJson = new String(
                Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

        String subject = field(payloadJson, "sub");
        String role = field(payloadJson, "role");
        return new User(subject, role);
    }

    /** Compute the HMAC-SHA256 signature for the given data. */
    private static String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static String base64Url(String s) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    // Tiny hand-rolled field reader so we do not need a JSON library.
    private static String field(String json, String name) {
        String key = "\"" + name + "\"";
        int i = json.indexOf(key);
        if (i < 0) {
            return null;
        }
        int colon = json.indexOf(':', i);
        int q1 = json.indexOf('"', colon + 1);
        int q2 = json.indexOf('"', q1 + 1);
        return json.substring(q1 + 1, q2);
    }
}
