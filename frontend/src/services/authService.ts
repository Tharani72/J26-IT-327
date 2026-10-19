export type LoginRole = "student" | "teacher" | "parent" | "admin"

export type SignInRequest = {
  role: LoginRole
  identifier: string
  password: string
  studentId?: string
}

export class AuthNotConfiguredError extends Error {
  readonly code = "AUTH_NOT_CONFIGURED"

  constructor() {
    super("AUTH_NOT_CONFIGURED")
    this.name = "AuthNotConfiguredError"
  }
}

export class InvalidCredentialsError extends Error {
  readonly code = "INVALID_CREDENTIALS"

  constructor() {
    super("INVALID_CREDENTIALS")
    this.name = "InvalidCredentialsError"
  }
}

export type StudentDemoSession = {
  role: "student"
  studentId: string
}

async function responseCode(response: Response): Promise<string | undefined> {
  try {
    const payload = await response.json()
    return payload?.detail?.code ?? payload?.code
  } catch {
    return undefined
  }
}

/** Credentials are sent to the server; no password or identity is stored in browser storage. */
export async function signInWithRole(request: SignInRequest): Promise<StudentDemoSession> {
  if (request.role !== "student") {
    throw new AuthNotConfiguredError()
  }

  let response: Response
  try {
    response = await fetch("/api/auth/demo/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: request.studentId ?? "",
        email: request.identifier,
        password: request.password,
      }),
    })
  } catch {
    throw new AuthNotConfiguredError()
  }

  if (!response.ok) {
    const code = await responseCode(response)
    if (code === "INVALID_CREDENTIALS") throw new InvalidCredentialsError()
    if (code === "AUTH_NOT_CONFIGURED" || response.status >= 500) throw new AuthNotConfiguredError()
    throw new Error(code ?? "LOGIN_FAILED")
  }

  return response.json() as Promise<StudentDemoSession>
}

export async function getCurrentStudentSession(): Promise<StudentDemoSession | null> {
  try {
    const response = await fetch("/api/auth/session", { credentials: "include" })
    if (!response.ok) return null
    const session = (await response.json()) as Partial<StudentDemoSession>
    if (session.role !== "student" || typeof session.studentId !== "string") return null
    return { role: "student", studentId: session.studentId }
  } catch {
    return null
  }
}

export async function signOutDemoStudent(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  } catch {
    // Navigation to the login screen still ends the current browser flow.
  }
}