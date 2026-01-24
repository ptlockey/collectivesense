'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatRelativeTime, getStatusLabel, getProgressPercentage } from '@/lib/utils'
import type { ProblemWithCategory } from '@/types'

interface ProblemCardProps {
  problem: ProblemWithCategory
  variant?: 'list' | 'detail' | 'contribute'
  showStatus?: boolean
  showProgress?: boolean
  className?: string
}

export function ProblemCard({
  problem,
  variant = 'list',
  showStatus = true,
  showProgress = true,
  className,
}: ProblemCardProps) {
  const isOpinion = problem.problem_type === 'opinion'

  return (
    <div
      className={cn(
        'border border-border rounded-xl p-5 hover:border-primary/50 transition-colors',
        variant === 'detail' && 'p-6',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-start justify-between gap-4',
        variant === 'contribute' && 'mb-4'
      )}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ProblemTypeBadge type={problem.problem_type} />
            {problem.categories?.name && (
              <span className="text-xs text-secondary">
                {problem.categories.name}
              </span>
            )}
          </div>
          <h2 className={cn(
            'font-medium',
            variant === 'detail' && 'text-xl mt-1'
          )}>
            {problem.title}
          </h2>
        </div>
        {variant === 'list' && (
          <span className="text-xs text-secondary whitespace-nowrap">
            {formatRelativeTime(problem.created_at)}
          </span>
        )}
      </div>

      {/* Details - shown in detail and contribute variants */}
      {(variant === 'detail' || variant === 'contribute') && (
        <div className="space-y-4 text-sm mt-4">
          {problem.situation && (
            <div>
              <h3 className="font-medium text-secondary mb-1">
                {isOpinion ? 'Context' : 'Situation'}
              </h3>
              <p className="whitespace-pre-wrap">{problem.situation}</p>
            </div>
          )}

          {problem.tried_already && (
            <div>
              <h3 className="font-medium text-secondary mb-1">
                Already tried
              </h3>
              <p className="whitespace-pre-wrap">{problem.tried_already}</p>
            </div>
          )}

          {problem.desired_outcome && (
            <div>
              <h3 className="font-medium text-secondary mb-1">
                Desired outcome
              </h3>
              <p className="whitespace-pre-wrap">{problem.desired_outcome}</p>
            </div>
          )}

          {problem.constraints && (
            <div>
              <h3 className="font-medium text-secondary mb-1">
                Constraints
              </h3>
              <p className="whitespace-pre-wrap">{problem.constraints}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress/Status footer */}
      {showStatus && (
        <div className={cn(
          'mt-4',
          (variant === 'detail' || variant === 'contribute') && 'pt-4 border-t border-border'
        )}>
          {problem.status === 'gathering' && showProgress && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-secondary">
                  {getStatusLabel(problem.status)}
                </span>
                <span className="text-secondary">
                  {problem.contribution_count}/{problem.contribution_threshold}
                </span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${getProgressPercentage(
                      problem.contribution_count,
                      problem.contribution_threshold
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {problem.status === 'synthesising' && (
            <p className="text-sm text-warning">
              Creating synthesis...
            </p>
          )}

          {problem.status === 'complete' && variant === 'list' && (
            <Link
              href={`/problems/${problem.id}/synthesis`}
              className="inline-block text-sm text-success hover:text-success/80"
            >
              View synthesis
            </Link>
          )}

          {problem.status === 'closed' && (
            <p className="text-sm text-secondary">Closed</p>
          )}
        </div>
      )}
    </div>
  )
}

interface ProblemTypeBadgeProps {
  type: 'advice' | 'opinion'
  className?: string
}

export function ProblemTypeBadge({ type, className }: ProblemTypeBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 text-xs rounded-full',
        type === 'opinion'
          ? 'bg-highlight/10 text-highlight'
          : 'bg-primary/10 text-primary',
        className
      )}
    >
      {type === 'opinion' ? 'Opinion' : 'Advice'}
    </span>
  )
}

interface ProblemProgressBarProps {
  count: number
  threshold: number
  showLabel?: boolean
}

export function ProblemProgressBar({
  count,
  threshold,
  showLabel = true,
}: ProblemProgressBarProps) {
  const percentage = getProgressPercentage(count, threshold)

  return (
    <div>
      {showLabel && (
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-secondary">Gathering thoughts</span>
          <span className="text-secondary">
            {count}/{threshold}
          </span>
        </div>
      )}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
