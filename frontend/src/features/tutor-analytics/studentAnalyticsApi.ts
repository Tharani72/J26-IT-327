export interface AnalyticsSessionRecord {
  id: string
  student_code: string
  session_number: number
  recorded_at: string | null
  data_source: "synthetic"
  gesture_accuracy: number
  attention_score: number
  response_time: number
  mistake_rate: number
  looking_away_count: number
  on_task_ratio: number
  completion_rate: number
  attempt_count: number
  accuracy_change: number
  attention_change: number
  response_time_change: number
  accuracy_rolling_3: number
  attention_rolling_3: number
  response_time_rolling_3: number
}

export interface StudentDashboardResponse {
  student: {
    studentCode: string
    fullName: string
    email: string | null
    grade: string | null
  }
  sessions: AnalyticsSessionRecord[]
  prediction: {
    value: number
    rawValue: number
    wasClipped: boolean
    modelName: string
    modelVersion: string
    generatedAt: string
    realWorldValidation: string
    sourceSessionNumber: number
    persisted: false
  }
}

export async function fetchStudentDashboard(): Promise<StudentDashboardResponse> {
  const response = await fetch("/api/student/dashboard", { credentials: "include" })
  if (!response.ok) {
    let code = "DASHBOARD_UNAVAILABLE"
    try {
      const payload = await response.json()
      code = payload?.detail?.code ?? payload?.code ?? code
    } catch {
      // Use the generic message if the response body is not JSON.
    }
    const error = new Error(code)
    Object.assign(error, { status: response.status, code })
    throw error
  }
  return response.json() as Promise<StudentDashboardResponse>
}