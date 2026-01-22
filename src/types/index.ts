// Re-export all database types
export * from './database'

// Additional app-specific types

export interface CategoryOption {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
}

export interface ProblemFormData {
  title: string
  category_id: number | null
  situation: string
  tried_already?: string
  desired_outcome?: string
  constraints?: string
}

export interface ContributionFormData {
  problem_id: string
  content: string
}

// User session info
export interface UserSession {
  id: string
  email: string
  ethosConfirmed: boolean
}
