import { useState, type FormEvent } from "react"
import {
  AuthNotConfiguredError,
  signInWithRole,
  type LoginRole,
} from "../../services/authService"

type LoginFormProps = {
  role: LoginRole
  onBack: () => void
}

type FormErrors = {
  studentId?: string
  identifier?: string
  password?: string
}

type SubmitFeedback = {
  kind: "info" | "error"
  message: string
  detail?: string
}

const roleContent: Record<LoginRole, { heading: string; description: string; identifierLabel: string }> = {
  student: {
    heading: "ශිෂ්‍ය පිවිසුම",
    description: "ඔබගේ ඉගෙනුම් ගිණුමට පිවිසෙන්න.",
    identifierLabel: "ශිෂ්‍ය හැඳුනුම් අංකය / විද්‍යුත් තැපැල් ලිපිනය",
  },
  teacher: {
    heading: "ගුරු පිවිසුම",
    description: "ඔබගේ ගුරු ගිණුමට පිවිසෙන්න.",
    identifierLabel: "විද්‍යුත් තැපැල් ලිපිනය",
  },
  parent: {
    heading: "දෙමාපිය පිවිසුම",
    description: "ඔබගේ දෙමාපිය ගිණුමට පිවිසෙන්න.",
    identifierLabel: "විද්‍යුත් තැපැල් ලිපිනය",
  },
  admin: {
    heading: "පරිපාලක පිවිසුම",
    description: "පරිපාලක පිවිසුම් තොරතුරු ඇතුළත් කරන්න.",
    identifierLabel: "විද්‍යුත් තැපැල් ලිපිනය",
  },
}

const messages = {
  required: "කරුණාකර මෙම තොරතුර ඇතුළත් කරන්න.",
  invalidEmail: "කරුණාකර නිවැරදි විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.",
  incorrectCredentials: "ඔබ ඇතුළත් කළ තොරතුරු නිවැරදි නොවේ. නැවත උත්සාහ කරන්න.",
  loginFailure: "පිවිසීමේදී ගැටලුවක් ඇති විය. නැවත උත්සාහ කරන්න.",
  loading: "පිවිසෙමින්...",
  authUnavailable: "සත්‍ය පිවිසුම් සේවාව තවම සම්බන්ධ කර නැත. මෙම තිරය දැනට අතුරුමුහුණත් පරීක්ෂාව සඳහා පමණි.",
  forgotUnavailable: "මුරපදය නැවත සැකසීමේ සේවාව තවම සම්බන්ධ කර නැත.",
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {visible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 4" />
          <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5" />
        </>
      )}
    </svg>
  )
}

export default function LoginForm({ role, onBack }: LoginFormProps) {
  const content = roleContent[role]
  const isStudent = role === "student"
  const [studentId, setStudentId] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [feedback, setFeedback] = useState<SubmitFeedback | null>(null)
  const [forgotNotice, setForgotNotice] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    setForgotNotice("")

    const nextErrors: FormErrors = {}
    const normalizedStudentId = studentId.trim()
    const normalizedIdentifier = identifier.trim()

    if (isStudent && !normalizedStudentId) {
      nextErrors.studentId = messages.required
    }

    if (!normalizedIdentifier) {
      nextErrors.identifier = messages.required
    } else if (!isValidEmail(normalizedIdentifier)) {
      nextErrors.identifier = messages.invalidEmail
    }

    if (!password) {
      nextErrors.password = messages.required
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    try {
      const session = await signInWithRole({
        role,
        identifier: normalizedIdentifier,
        password,
        studentId: isStudent ? normalizedStudentId : undefined,
      })

      if (session.role === "student") {
        window.location.assign("/student-dashboard")
      }
    } catch (error) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined

      if (error instanceof AuthNotConfiguredError) {
        setFeedback({ kind: "info", message: messages.authUnavailable })
      } else if (errorCode === "INVALID_CREDENTIALS") {
        setFeedback({ kind: "error", message: messages.incorrectCredentials })
      } else {
        setFeedback({ kind: "error", message: messages.loginFailure })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="login-form-step" aria-labelledby="login-form-heading">
      <button className="login-back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span>
        ආපසු යන්න
      </button>

      <div className="login-section-heading login-form-heading">
        <span className="login-eyebrow">OmniSign SL</span>
        <h1 id="login-form-heading">{content.heading}</h1>
        <p>{content.description}</p>
      </div>

      <form className="login-form" noValidate onSubmit={handleSubmit}>
        {isStudent && (
          <div className="login-field">
            <label htmlFor="login-student-id">{content.identifierLabel.split(" / ")[0]}</label>
            <input
              id="login-student-id"
              type="text"
              autoComplete="username"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value)
                setErrors((current) => ({ ...current, studentId: undefined }))
                setFeedback(null)
              }}
              placeholder={content.identifierLabel.split(" / ")[0]}
              aria-invalid={Boolean(errors.studentId)}
              aria-describedby={errors.studentId ? "login-student-id-error" : undefined}
            />
            {errors.studentId && <p className="login-field-error" id="login-student-id-error">{errors.studentId}</p>}
          </div>
        )}
        <div className="login-field">
          <label htmlFor="login-identifier">{isStudent ? content.identifierLabel.split(" / ")[1] : content.identifierLabel}</label>
          <input
            id="login-identifier"
            type="email"
            inputMode="email"
            autoComplete={isStudent ? "username" : "email"}
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value)
              setErrors((current) => ({ ...current, identifier: undefined }))
              setFeedback(null)
            }}
            placeholder={isStudent ? content.identifierLabel.split(" / ")[1] : content.identifierLabel}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? "login-identifier-error" : undefined}
          />
          {errors.identifier && <p className="login-field-error" id="login-identifier-error">{errors.identifier}</p>}
        </div>

        <div className="login-field">
          <label htmlFor="login-password">මුරපදය</label>
          <div className="login-password-control">
            <input
              id="login-password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrors((current) => ({ ...current, password: undefined }))
                setFeedback(null)
              }}
              placeholder="මුරපදය"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
            />
            <button
              className="login-password-toggle"
              type="button"
              aria-label={passwordVisible ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න"}
              title={passwordVisible ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න"}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              <PasswordVisibilityIcon visible={passwordVisible} />
            </button>
          </div>
          {errors.password && <p className="login-field-error" id="login-password-error">{errors.password}</p>}
        </div>

        {isStudent && (
          <div className="login-forgot-row">
            <button
              className="login-text-button"
              type="button"
              onClick={() => setForgotNotice(messages.forgotUnavailable)}
            >
              මුරපදය අමතකද?
            </button>
          </div>
        )}

        {forgotNotice && <p className="login-form-notice" role="status">{forgotNotice}</p>}
        {feedback && (
          <div className={"login-feedback login-feedback--" + feedback.kind} role={feedback.kind === "error" ? "alert" : "status"}>
            <p>{feedback.message}</p>
            {feedback.detail && <p>{feedback.detail}</p>}
          </div>
        )}

        <button className="login-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? messages.loading : "ඇතුල්වන්න"}
          {!isLoading && <span aria-hidden="true">→</span>}
        </button>
      </form>
    </section>
  )
}
