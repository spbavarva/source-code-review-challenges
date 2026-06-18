/** A user identified by a token. */
public class User {
    public final String subject;
    public final String role;

    public User(String subject, String role) {
        this.subject = subject;
        this.role = role;
    }
}
