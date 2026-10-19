import type { LoginRole } from "../../services/authService"

type RoleSelectorProps = {
  selectedRole: LoginRole | null
  onSelectRole: (role: LoginRole) => void
  onContinue: () => void
}

const roleOptions: { role: LoginRole; label: string; description: string }[] = [
  { role: "student", label: "ශිෂ්‍ය", description: "ඔබගේ පාඩම් සහ ඉගෙනුම් ප්‍රගතිය වෙත පිවිසෙන්න." },
  { role: "teacher", label: "ගුරු", description: "ඔබගේ ඉගැන්වීම් සහ පන්ති තොරතුරු වෙත පිවිසෙන්න." },
  { role: "parent", label: "දෙමාපිය", description: "ඔබගේ දරුවාගේ ඉගෙනුම් තොරතුරු බලන්න." },
  { role: "admin", label: "පරිපාලක", description: "පද්ධති පරිපාලන පිවිසුම තෝරන්න." },
]

function RoleIcon({ role }: { role: LoginRole }) {
  const commonProps = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  }

  if (role === "student") {
    return <svg {...commonProps}><path d="M5 8.5c4.3-1.3 7.7-.7 11 1.6v15c-3.3-2.3-6.7-2.9-11-1.6z" /><path d="M27 8.5c-4.3-1.3-7.7-.7-11 1.6v15c3.3-2.3 6.7-2.9 11-1.6z" /><path d="M16 10v15" /></svg>
  }
  if (role === "teacher") {
    return <svg {...commonProps}><rect x="5" y="5" width="22" height="16" rx="2" /><path d="M12 27h8M16 21v6M10 10h8M10 14h5" /><path d="m22 12 2 2-2 2" /></svg>
  }
  if (role === "parent") {
    return <svg {...commonProps}><circle cx="12" cy="11" r="4" /><circle cx="22" cy="12" r="3.5" /><path d="M4.5 26c.6-5 3.1-7.5 7.5-7.5s6.9 2.5 7.5 7.5" /><path d="M20 19c4.5-.5 6.8 1.8 7.5 6" /></svg>
  }
  return <svg {...commonProps}><path d="M16 3 26 7v7c0 6.2-4.2 11.5-10 14-5.8-2.5-10-7.8-10-14V7z" /><path d="m11.5 15.5 3 3 6-6" /></svg>
}

export default function RoleSelector({
  selectedRole,
  onSelectRole,
  onContinue,
}: RoleSelectorProps) {
  return (
    <section className="login-role-step" aria-labelledby="login-role-heading">
      <div className="login-section-heading">
        <span className="login-eyebrow">OmniSign SL</span>
        <h1 id="login-role-heading">ඔබ කවුරුන්ද?</h1>
        <p>ඔබට අදාළ පිවිසුම් වර්ගය තෝරන්න.</p>
      </div>

      <div className="login-role-grid" role="group" aria-label="පිවිසුම් වර්ගය තෝරන්න">
        {roleOptions.map(({ role, label, description }) => {
          const selected = selectedRole === role
          return (
            <button
              className={selected ? "login-role-card is-selected" : "login-role-card"}
              type="button"
              key={role}
              aria-pressed={selected}
              onClick={() => onSelectRole(role)}
            >
              <span className={"login-role-icon login-role-icon--" + role}>
                <RoleIcon role={role} />
              </span>
              <span className="login-role-copy">
                <strong>{label}</strong>
                <span>{description}</span>
              </span>
              <span className="login-role-check" aria-hidden="true">{selected ? "✓" : ""}</span>
            </button>
          )
        })}
      </div>

      <button
        className="login-primary-button"
        type="button"
        disabled={!selectedRole}
        onClick={onContinue}
      >
        ඉදිරියට යන්න
        <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}