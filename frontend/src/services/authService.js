export class AuthNotConfiguredError extends Error {
    constructor() {
        super("AUTH_NOT_CONFIGURED");
        this.code = "AUTH_NOT_CONFIGURED";
        this.name = "AuthNotConfiguredError";
    }
}
/**
 * The project does not have Firebase credentials or an authentication backend yet.
 * Keep this service as the integration boundary and fail closed until one is configured.
 */
export async function signInWithRole(_request) {
    throw new AuthNotConfiguredError();
}
