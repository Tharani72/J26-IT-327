export type LoginRole = "student" | "teacher" | "parent" | "admin"

export type SignInRequest = {
  role: LoginRole
  identifier: string
  password: string
  studentId?: string
  teacherId?: string
}

export class AuthNotConfiguredError extends Error {
  readonly code = "AUTH_NOT_CONFIGURED"

  constructor() {
    super("AUTH_NOT_CONFIGURED")
    this.name = "AuthNotConfiguredError"
  }
}

export class AuthUnavailableError extends Error {
  readonly code = "AUTH_UNAVAILABLE"

  constructor() {
    super("AUTH_UNAVAILABLE")
    this.name = "AuthUnavailableError"
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

export type TeacherSession = {
  role: "teacher"
  teacherId: string
}

export type AuthSession = StudentDemoSession | TeacherSession

async function responseCode(response: Response): Promise<string | undefined> {
  try {
    const payload = await response.json()
    return payload?.detail?.code ?? payload?.code
  } catch {
    return undefined
  }
}

/** Credentials go to the server; no password or identity is stored in browser storage. */
export async function signInWithRole(request: SignInRequest): Promise<AuthSession> {
  if (request.role !== "student" && request.role !== "teacher") throw new AuthNotConfiguredError()
  let response: Response
  try {
    response = await fetch(request.role === "student" ? "/api/auth/demo/login" : "/api/auth/teacher/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.role === "student"
        ? {
            studentId: request.studentId ?? "",
            email: request.identifier,
            password: request.password,
          }
        : {
            teacherId: request.teacherId ?? request.identifier,
            password: request.password,
          }),
    })
  } catch {
    throw new AuthUnavailableError()
  }

  if (!response.ok) {
    const code = await responseCode(response)
    if (code === "INVALID_CREDENTIALS") throw new InvalidCredentialsError()
    if (code === "AUTH_NOT_CONFIGURED") throw new AuthNotConfiguredError()
    if (code === "AUTH_UNAVAILABLE" || response.status >= 500) throw new AuthUnavailableError()
    throw new Error(code ?? "LOGIN_FAILED")
  }

  const session = (await response.json()) as { role?: unknown; studentId?: unknown; teacherId?: unknown }
  if (request.role === "student" && session.role === "student" && typeof session.studentId === "string") {
    return { role: "student", studentId: session.studentId }
  }
  if (request.role === "teacher" && session.role === "teacher" && typeof session.teacherId === "string") {
    return { role: "teacher", teacherId: session.teacherId }
  }
  throw new Error("LOGIN_FAILED")
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const response = await fetch("/api/auth/session", { credentials: "include" })
    if (!response.ok) return null
    const session = (await response.json()) as { role?: unknown; studentId?: unknown; teacherId?: unknown }
    if (session.role === "student" && typeof session.studentId === "string") {
      return { role: "student", studentId: session.studentId }
    }
    if (session.role === "teacher" && typeof session.teacherId === "string") {
      return { role: "teacher", teacherId: session.teacherId }
    }
    return null
  } catch {
    return null
  }
}

export async function getCurrentStudentSession(): Promise<StudentDemoSession | null> {
  const session = await getCurrentSession()
  return session?.role === "student" ? session : null
}

export async function signOutCurrentSession(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  } catch {
    // Navigation to the login screen still ends the current browser flow.
  }
}

export const signOutDemoStudent = signOutCurrentSession
