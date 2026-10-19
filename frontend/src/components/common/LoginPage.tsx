import { useState } from "react"
import logo from "../../Images/Logo.png"
import studentIllustration from "../../Images/login-research-illustration.png"
import type { LoginRole } from "../../services/authService"
import LoginForm from "./LoginForm"
import RoleSelector from "./RoleSelector"
import "./Login.css"

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null)
  const [step, setStep] = useState<"roles" | "form">("roles")

  return (
    <main className="omni-login-page" lang="si-LK">
      <div className="omni-login-layout">
        <header className="omni-login-brandbar">
          <a className="omni-login-brand" href="/" aria-label="OmniSign SL — මුල් පිටුව">
            <img src={logo} alt="OmniSign SL ලාංඡනය" />
            <span className="omni-login-brand-copy">
              <strong>OmniSign SL</strong>
              <span>සංඥාවෙන් ඉගෙනුමට</span>
            </span>
          </a>
          <a className="omni-login-home-link" href="/">මුල් පිටුවට ආපසු</a>
        </header>

        <section className="omni-login-panel">
          <div
            className="omni-login-art"
            role="img"
            aria-label="අත් සංඥා, ස්මාර්ට් අත්වැසුම සහ AI ඉගෙනුම් සහායකයක් භාවිතා කරන ශිෂ්‍යයෙක්"
          >
            <img className="omni-login-art-image" src={studentIllustration} alt="" />
          </div>          <div className="omni-login-content">
            {step === "form" && selectedRole ? (
              <LoginForm role={selectedRole} onBack={() => setStep("roles")} />
            ) : (
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                onContinue={() => {
                  if (selectedRole) setStep("form")
                }}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}