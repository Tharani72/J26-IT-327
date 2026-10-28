export type LessonArtworkKind = "single-hand" | "paired-hands" | "dog" | "apple"

export interface StudentLearningSession {
  id: string
  date: string
  lessonTitle: string
  artwork: LessonArtworkKind
  completed: boolean
  completionRate: number
  gestureAccuracy: number
  learningProgress: number
  attentionScore: number
  responseTimeSeconds: number
  gazeDurationSeconds: number | null
  lookingAwayCount: number
  onTaskRatio: number
  attemptCount: number
  mistakeRate: number
  accuracyChange: number
  attentionChange: number
  responseTimeChange: number
  accuracyRolling3: number
  attentionRolling3: number
  responseTimeRolling3: number
}

export interface StudentRecommendation {
  title: string
  description: string
}

export interface StudentDemoProfile {
  studentId: string
  email: string
  displayName: string
  grade: string
  sessions: StudentLearningSession[]
  recommendation: StudentRecommendation
}

type StudentDemoSeed = Omit<StudentDemoProfile, "sessions"> & {
  completed: boolean[]
  accuracy: number[]
  attention: number[]
  learningProgress: number[]
  responseTime: number[]
  mistakeRate: number[]
  lookingAwayCount: number[]
  onTaskRatio: number[]
  attemptCount: number[]
  completionRate: number[]
}

const sessionDates = [
  "2026-09-07",
  "2026-09-14",
  "2026-09-21",
  "2026-09-28",
  "2026-10-05",
  "2026-10-12",
  "2026-10-19",
]

const lessonCatalog: { title: string; artwork: LessonArtworkKind }[] = [
  {
    "title": "\u0dc3\u0d82\u0da5\u0dcf \u0d85\u0d9a\u0dd4\u0dbb\u0dd4 - 1",
    "artwork": "single-hand"
  },
  {
    "title": "\u0dc3\u0d82\u0da5\u0dcf \u0d85\u0d9a\u0dd4\u0dbb\u0dd4 - 2",
    "artwork": "paired-hands"
  },
  {
    "title": "\u0dc3\u0dad\u0dd4\u0db1\u0dca - 1",
    "artwork": "dog"
  },
  {
    "title": "\u0db4\u0dbd\u0dad\u0dd4\u0dbb\u0dd4 - 1",
    "artwork": "apple"
  },
  {
    "title": "\u0daf\u0ddb\u0db1\u0dd2\u0d9a \u0dc0\u0da0\u0db1 - 1",
    "artwork": "single-hand"
  },
  {
    "title": "\u0db4\u0dcf\u0dc3\u0dbd\u0dca \u0dc0\u0da0\u0db1 - 1",
    "artwork": "paired-hands"
  },
  {
    "title": "\u0dc4\u0dd0\u0d9f\u0dd3\u0db8\u0dca - 1",
    "artwork": "dog"
  }
]

const studentSeeds: StudentDemoSeed[] = [
  {
    "studentId": "ST001",
    "email": "st001@omnisign.demo",
    "displayName": "\u0db1\u0dd2\u0db8\u0dbd\u0dd2",
    "grade": "3 \u0dc1\u0dca\u200d\u0dbb\u0dda\u0dab\u0dd2\u0dba",
    "recommendation": {
      "title": "\u0dc3\u0d82\u0da5\u0dcf \u0d85\u0d9a\u0dd4\u0dbb\u0dd4 - 2",
      "description": "\u0d94\u0db6\u0d9c\u0dda \u0d85\u0d9a\u0dca\u0dc2\u0dbb \u0dc4\u0db3\u0dd4\u0db1\u0dcf\u0d9c\u0dd0\u0db1\u0dd3\u0db8\u0dda \u0db4\u0dca\u200d\u0dbb\u0d9c\u0dad\u0dd2\u0dba\u0da7 \u0d9c\u0dd0\u0dc5\u0db4\u0dd9\u0db1 \u0d85\u0db8\u0dad\u0dbb \u0dc3\u0d82\u0da5\u0dcf \u0db4\u0dd4\u0dc4\u0dd4\u0dab\u0dd4\u0dc0\u0d9a\u0dd2."
    },
    "accuracy": [
      40,
      57,
      65,
      72,
      80,
      85,
      89
    ],
    "attention": [
      48,
      54,
      61,
      67,
      72,
      76,
      82
    ],
    "learningProgress": [
      18,
      29,
      38,
      47,
      56,
      64,
      72
    ],
    "responseTime": [
      4.8,
      4.4,
      4,
      3.6,
      3.2,
      2.8,
      2.4
    ],
    "mistakeRate": [
      32,
      28,
      23,
      18,
      14,
      10,
      7
    ],
    "lookingAwayCount": [
      7,
      6,
      5,
      4,
      3,
      2,
      2
    ],
    "onTaskRatio": [
      58,
      62,
      67,
      72,
      78,
      83,
      88
    ],
    "attemptCount": [
      5,
      5,
      4,
      4,
      3,
      3,
      2
    ],
    "completionRate": [
      55,
      62,
      68,
      74,
      82,
      88,
      92
    ],
    "completed": [
      true,
      true,
      true,
      true,
      true,
      true,
      true
    ]
  },
  {
    "studentId": "ST002",
    "email": "st002@omnisign.demo",
    "displayName": "\u0d9a\u0dc0\u0dd2\u0db3\u0dd4",
    "grade": "4 \u0dc1\u0dca\u200d\u0dbb\u0dda\u0dab\u0dd2\u0dba",
    "recommendation": {
      "title": "\u0dc3\u0dad\u0dd4\u0db1\u0dca - 1",
      "description": "\u0dc3\u0dad\u0dd4\u0db1\u0dca \u0dc3\u0db8\u0dca\u0db6\u0db1\u0dca\u0db0 \u0dc3\u0d82\u0da5\u0dcf \u0db4\u0dd4\u0dc4\u0dd4\u0dab\u0dd4\u0dc0\u0dd9\u0db1\u0dca \u0d85\u0dbd\u0dd4\u0dad\u0dca \u0dc0\u0da0\u0db1 \u0db8\u0dad\u0d9a \u0dad\u0db6\u0dcf\u0d9c\u0dd0\u0db1\u0dd3\u0db8\u0da7 \u0d8b\u0daf\u0dc0\u0dd4 \u0dc0\u0dda."
    },
    "accuracy": [
      35,
      42,
      50,
      55,
      63,
      69,
      76
    ],
    "attention": [
      39,
      45,
      51,
      58,
      62,
      68,
      72
    ],
    "learningProgress": [
      15,
      24,
      32,
      39,
      45,
      53,
      59
    ],
    "responseTime": [
      5.4,
      5,
      4.8,
      4.2,
      3.9,
      3.7,
      3.4
    ],
    "mistakeRate": [
      40,
      35,
      30,
      25,
      21,
      17,
      13
    ],
    "lookingAwayCount": [
      8,
      7,
      6,
      5,
      5,
      4,
      4
    ],
    "onTaskRatio": [
      45,
      50,
      55,
      61,
      64,
      69,
      73
    ],
    "attemptCount": [
      6,
      5,
      5,
      4,
      4,
      3,
      3
    ],
    "completionRate": [
      38,
      45,
      52,
      61,
      68,
      74,
      78
    ],
    "completed": [
      true,
      true,
      true,
      true,
      true,
      false,
      false
    ]
  },
  {
    "studentId": "ST003",
    "email": "st003@omnisign.demo",
    "displayName": "\u0dc3\u0dd9\u0dc0\u0dca\u0db8\u0dd2",
    "grade": "3 \u0dc1\u0dca\u200d\u0dbb\u0dda\u0dab\u0dd2\u0dba",
    "recommendation": {
      "title": "\u0db4\u0dbd\u0dad\u0dd4\u0dbb\u0dd4 - 1",
      "description": "\u0db4\u0dbd\u0dad\u0dd4\u0dbb\u0dd4 \u0db4\u0dd2\u0dc5\u0dd2\u0db6\u0db3 \u0dc3\u0d82\u0da5\u0dcf \u0db4\u0dd4\u0dc4\u0dd4\u0dab\u0dd4\u0dc0 \u0d94\u0db6\u0d9c\u0dda \u0dc0\u0da0\u0db1 \u0db8\u0dcf\u0dbd\u0dcf\u0dc0 \u0dad\u0dc0\u0daf\u0dd4\u0dbb\u0da7\u0dad\u0dca \u0daf\u0dd2\u0dba\u0dd4\u0dab\u0dd4 \u0d9a\u0dbb\u0dba\u0dd2."
    },
    "accuracy": [
      62,
      70,
      74,
      82,
      87,
      90,
      94
    ],
    "attention": [
      61,
      66,
      71,
      77,
      81,
      85,
      89
    ],
    "learningProgress": [
      30,
      38,
      47,
      56,
      64,
      72,
      81
    ],
    "responseTime": [
      3.8,
      3.5,
      3.2,
      2.9,
      2.6,
      2.4,
      2.1
    ],
    "mistakeRate": [
      25,
      21,
      18,
      14,
      10,
      7,
      4
    ],
    "lookingAwayCount": [
      5,
      4,
      4,
      3,
      2,
      2,
      1
    ],
    "onTaskRatio": [
      67,
      72,
      77,
      82,
      86,
      90,
      93
    ],
    "attemptCount": [
      4,
      4,
      3,
      3,
      2,
      2,
      1
    ],
    "completionRate": [
      68,
      74,
      80,
      86,
      90,
      94,
      98
    ],
    "completed": [
      true,
      true,
      true,
      true,
      true,
      true,
      true
    ]
  },
  {
    "studentId": "ST004",
    "email": "st004@omnisign.demo",
    "displayName": "\u0dad\u0dbb\u0dd4\u0dc2\u0dd2",
    "grade": "5 \u0dc1\u0dca\u200d\u0dbb\u0dda\u0dab\u0dd2\u0dba",
    "recommendation": {
      "title": "\u0dc3\u0d82\u0da5\u0dcf \u0d85\u0d9a\u0dd4\u0dbb\u0dd4 - 1",
      "description": "\u0db8\u0dd6\u0dbd\u0dd2\u0d9a \u0d85\u0d9a\u0dca\u0dc2\u0dbb \u0dc3\u0d82\u0da5\u0dcf \u0db1\u0dd0\u0dc0\u0dad \u0db4\u0dd4\u0dc4\u0dd4\u0dab\u0dd4 \u0d9a\u0dbb\u0db8\u0dd2\u0db1\u0dca \u0db1\u0dd2\u0dc0\u0dd0\u0dbb\u0daf\u0dd2\u0db7\u0dcf\u0dc0\u0dba \u0dc0\u0dd0\u0da9\u0dd2 \u0d9a\u0dbb\u0db8\u0dd4."
    },
    "accuracy": [
      25,
      38,
      44,
      52,
      60,
      64,
      69
    ],
    "attention": [
      35,
      41,
      48,
      53,
      59,
      63,
      68
    ],
    "learningProgress": [
      12,
      20,
      27,
      34,
      41,
      47,
      54
    ],
    "responseTime": [
      6,
      5.6,
      5.1,
      4.8,
      4.4,
      4.1,
      3.8
    ],
    "mistakeRate": [
      48,
      42,
      36,
      31,
      26,
      22,
      18
    ],
    "lookingAwayCount": [
      9,
      8,
      7,
      6,
      6,
      5,
      4
    ],
    "onTaskRatio": [
      40,
      46,
      52,
      58,
      63,
      67,
      71
    ],
    "attemptCount": [
      7,
      6,
      5,
      5,
      4,
      4,
      3
    ],
    "completionRate": [
      30,
      42,
      50,
      58,
      65,
      70,
      75
    ],
    "completed": [
      true,
      true,
      true,
      false,
      true,
      false,
      false
    ]
  },
  {
    "studentId": "ST005",
    "email": "st005@omnisign.demo",
    "displayName": "\u0daf\u0dd2\u0db1\u0dd4\u0d9a",
    "grade": "4 \u0dc1\u0dca\u200d\u0dbb\u0dda\u0dab\u0dd2\u0dba",
    "recommendation": {
      "title": "\u0db4\u0dcf\u0dc3\u0dbd\u0dca \u0dc0\u0da0\u0db1 - 1",
      "description": "\u0db4\u0dcf\u0dc3\u0dbd\u0dca \u0dc0\u0da0\u0db1 \u0dc3\u0dc4\u0dd2\u0dad \u0d85\u0db1\u0dca\u0dad\u0dbb\u0dca\u0d9a\u0dca\u200d\u0dbb\u0dd2\u0dba\u0dcf\u0d9a\u0dcf\u0dbb\u0dd3 \u0db4\u0dcf\u0da9\u0db8\u0d9a\u0dca \u0d94\u0db6\u0d9c\u0dda \u0d89\u0daf\u0dd2\u0dbb\u0dd2 \u0db4\u0dd2\u0dba\u0dc0\u0dbb\u0da7 \u0d9c\u0dd0\u0dc5\u0db4\u0dda."
    },
    "accuracy": [
      46,
      51,
      61,
      67,
      72,
      79,
      84
    ],
    "attention": [
      52,
      57,
      63,
      68,
      73,
      79,
      84
    ],
    "learningProgress": [
      22,
      31,
      40,
      49,
      57,
      66,
      75
    ],
    "responseTime": [
      4.5,
      4.2,
      3.8,
      3.5,
      3.1,
      2.7,
      2.4
    ],
    "mistakeRate": [
      30,
      26,
      22,
      18,
      15,
      11,
      8
    ],
    "lookingAwayCount": [
      6,
      5,
      5,
      4,
      3,
      2,
      2
    ],
    "onTaskRatio": [
      60,
      65,
      70,
      75,
      80,
      86,
      90
    ],
    "attemptCount": [
      5,
      4,
      4,
      3,
      3,
      2,
      2
    ],
    "completionRate": [
      50,
      58,
      66,
      73,
      81,
      87,
      93
    ],
    "completed": [
      true,
      true,
      true,
      true,
      false,
      true,
      true
    ]
  }
]

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function rollingAverage(values: number[], index: number) {
  return average(values.slice(Math.max(0, index - 2), index + 1))
}

function buildSessions(seed: StudentDemoSeed): StudentLearningSession[] {
  return sessionDates.map((date, index) => {
    const gestureAccuracy = seed.accuracy[index]
    const attentionScore = seed.attention[index]
    const responseTimeSeconds = seed.responseTime[index]
    const previousIndex = Math.max(0, index - 1)
    const lesson = lessonCatalog[index % lessonCatalog.length]

    return {
      id: seed.studentId + "-session-" + (index + 1),
      date,
      lessonTitle: lesson.title,
      artwork: lesson.artwork,
      completed: seed.completed[index],
      completionRate: seed.completionRate[index],
      gestureAccuracy,
      learningProgress: seed.learningProgress[index],
      attentionScore,
      responseTimeSeconds,
      gazeDurationSeconds: Math.round((3.2 + attentionScore * 0.02) * 10) / 10,
      lookingAwayCount: seed.lookingAwayCount[index],
      onTaskRatio: seed.onTaskRatio[index],
      attemptCount: seed.attemptCount[index],
      mistakeRate: seed.mistakeRate[index],
      accuracyChange: index === 0 ? 0 : gestureAccuracy - seed.accuracy[previousIndex],
      attentionChange: index === 0 ? 0 : attentionScore - seed.attention[previousIndex],
      responseTimeChange: index === 0 ? 0 : responseTimeSeconds - seed.responseTime[previousIndex],
      accuracyRolling3: Math.round(rollingAverage(seed.accuracy, index) * 10) / 10,
      attentionRolling3: Math.round(rollingAverage(seed.attention, index) * 10) / 10,
      responseTimeRolling3: Math.round(rollingAverage(seed.responseTime, index) * 10) / 10,
    }
  })
}

const studentSeedsWithSessions = studentSeeds.map((seed) => ({
  ...seed,
  sessions: buildSessions(seed),
}))

function publicProfile(seed: (typeof studentSeedsWithSessions)[number]): StudentDemoProfile {
  return {
    studentId: seed.studentId,
    email: seed.email,
    displayName: seed.displayName,
    grade: seed.grade,
    sessions: seed.sessions,
    recommendation: seed.recommendation,
  }
}

export function getDemoStudentById(studentId: string): StudentDemoProfile | null {
  const match = studentSeedsWithSessions.find((seed) => seed.studentId === studentId.toUpperCase())
  return match ? publicProfile(match) : null
}

