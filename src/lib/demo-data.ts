import type { Category, Problem, Synthesis, Profile } from '@/types'

export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL

export const demoCategories: Category[] = [
  { id: 1, name: 'Life Admin', slug: 'life-admin', description: 'Bureaucracy, paperwork, organising', icon: '📋' },
  { id: 2, name: 'Finances', slug: 'finances', description: 'Budgeting, debt, money decisions', icon: '💰' },
  { id: 3, name: 'Work & Career', slug: 'work', description: 'Job issues, career decisions, workplace problems', icon: '💼' },
  { id: 4, name: 'Relationships', slug: 'relationships', description: 'Family, friends, partners, neighbours', icon: '❤️' },
  { id: 5, name: 'Parenting', slug: 'parenting', description: 'Raising children, family dynamics', icon: '👶' },
  { id: 6, name: 'Health Decisions', slug: 'health', description: 'Navigating healthcare, lifestyle choices', icon: '🏥' },
  { id: 7, name: 'Practical & DIY', slug: 'practical', description: 'Home, car, technical problems', icon: '🔧' },
  { id: 8, name: 'Big Decisions', slug: 'decisions', description: 'Life crossroads, major choices', icon: '🤔' },
]

export const demoProfile: Profile = {
  id: 'demo-user',
  email: 'demo@example.com',
  display_name: 'Demo User',
  ethos_confirmed_at: new Date().toISOString(),
  contributions_count: 12,
  problems_submitted: 3,
  is_admin: false,
  created_at: new Date().toISOString(),
}

export const demoProblems: (Problem & { categories: Category | null })[] = [
  {
    id: 'demo-problem-1',
    user_id: 'demo-user',
    title: 'Should I ask for a raise or look for a new job?',
    category_id: 3,
    categories: demoCategories[2],
    situation: `I've been at my company for 3 years and haven't had a significant raise despite taking on more responsibilities. My manager seems to value my work, but the company has had budget constraints. I've started seeing job postings that offer 20-30% more than I currently make.

I'm torn because I genuinely like my team and the work I do, but I also feel undervalued. The job market in my field seems strong right now, but I know changing jobs is always a risk.`,
    tried_already: `I mentioned compensation in my last review but was told budgets were frozen. I've also been documenting my achievements but haven't formally presented a case for a raise.`,
    desired_outcome: `I want to feel fairly compensated for my work while maintaining good relationships. Ideally I'd get a meaningful raise at my current job, but I'm open to other paths.`,
    constraints: `I have a mortgage and can't afford to be unemployed for long. My partner is supportive but nervous about change. I also have a promotion review coming up in 4 months.`,
    status: 'complete',
    problem_type: 'advice',
    contribution_threshold: 5,
    contribution_count: 7,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-problem-2',
    user_id: 'demo-user',
    title: 'How to handle a difficult conversation with aging parents about driving',
    category_id: 4,
    categories: demoCategories[3],
    situation: `My dad is 78 and his driving has become noticeably worse. He's had a few minor scrapes in parking lots, and my mum (who doesn't drive) has mentioned feeling unsafe as a passenger. Last week he ran a red light while I was in the car with him.

The problem is that driving represents independence to him. They live in a suburban area where public transport isn't great, and giving up the car would be a huge lifestyle change.`,
    tried_already: `I've made gentle comments after incidents, but he gets defensive and says "I've been driving for 55 years." My sister tried raising it once and they didn't speak for a week.`,
    desired_outcome: `I want my parents to be safe, and I want other people on the road to be safe too. But I also want to preserve my relationship with my dad and his dignity.`,
    constraints: `I live 2 hours away so I can't easily provide regular transport. They're on a fixed income so expensive solutions like regular taxis aren't realistic long-term.`,
    status: 'gathering',
    problem_type: 'advice',
    contribution_threshold: 5,
    contribution_count: 3,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-problem-3',
    user_id: 'demo-user',
    title: 'Struggling to set boundaries with work emails outside hours',
    category_id: 3,
    categories: demoCategories[2],
    situation: `My boss and colleagues regularly send emails at 9-10pm and on weekends. There's no explicit expectation to respond immediately, but I've noticed that people who do respond quickly seem to be viewed more favourably.

I find myself checking my phone constantly, even during family dinners or when I'm trying to relax. It's affecting my sleep and my partner has started commenting on it.`,
    tried_already: `I tried turning off notifications but then felt anxious about what I might be missing. I also tried setting "focus time" but it didn't stick.`,
    desired_outcome: `I want to be seen as committed and responsive at work, but also have genuine time off where I'm not thinking about emails.`,
    constraints: `I'm up for promotion next year and don't want to be seen as "not a team player." My role does occasionally have genuine urgent issues that need quick responses.`,
    status: 'gathering',
    problem_type: 'advice',
    contribution_threshold: 5,
    contribution_count: 1,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const demoSynthesis: Synthesis & {
  common_themes: Array<{ theme: string; explanation: string }>
  divergent_views: Array<{ view: string; alternative: string }>
  considerations: string[]
  warnings: string[]
} = {
  id: 'demo-synthesis-1',
  problem_id: 'demo-problem-1',
  summary: `The collective wisdom suggests approaching this as a two-track process: prepare a strong case for a raise at your current company while simultaneously exploring the market to understand your true value. People generally advise against making ultimatums, but being informed about alternatives strengthens your position. The timing of your upcoming promotion review is seen as both an opportunity and a reason to act thoughtfully rather than hastily.`,
  common_themes: [
    {
      theme: 'Know your market value first',
      explanation: 'Multiple contributors emphasised the importance of interviewing elsewhere, even if you hope to stay. This gives you concrete data points and confidence, and removes the "grass is greener" uncertainty.',
    },
    {
      theme: 'Document your impact, not just your tasks',
      explanation: 'Several people suggested framing your raise request around business impact—revenue generated, costs saved, problems solved—rather than just responsibilities taken on. Numbers speak louder than narratives.',
    },
    {
      theme: 'The promotion review is your moment',
      explanation: 'Contributors saw the 4-month timeline as an advantage. It gives you time to prepare thoroughly and presents a natural moment for compensation discussions without seeming out of the blue.',
    },
    {
      theme: 'Relationships matter, but so does self-respect',
      explanation: 'While people acknowledged the value of liking your team, several noted that staying somewhere you feel undervalued can breed resentment over time, which ultimately harms those same relationships.',
    },
  ],
  divergent_views: [
    {
      view: 'Have the raise conversation now, before interviewing elsewhere',
      alternative: 'Get an outside offer first to have leverage in the conversation',
    },
    {
      view: 'Be transparent with your manager that you\'re considering other options',
      alternative: 'Keep your job search private until you have a concrete decision to make',
    },
  ],
  considerations: [
    'What would it take for you to feel valued beyond just money? Title, flexibility, interesting projects?',
    'How would you feel if you got a raise but it was less than the 20-30% market rate?',
    'Is the budget constraint genuine and temporary, or a sign of deeper company issues?',
    'What\'s the opportunity cost of waiting 4 months for the promotion review?',
  ],
  warnings: [
    'Be cautious about accepting a counter-offer if you do get an outside offer—research suggests many people who accept counter-offers leave within a year anyway.',
    'Don\'t let the comfort of your current role prevent you from honestly evaluating whether it\'s still the right fit.',
  ],
  contribution_count: 7,
  helpful_count: 4,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
}

// Sample problem for the contribute page (not owned by demo user)
export const demoProblemToContribute: Problem & { categories: Category | null } = {
  id: 'demo-contribute-1',
  user_id: 'other-user',
  title: 'How to restart a hobby I abandoned years ago without feeling like a beginner again',
  category_id: 8,
  categories: demoCategories[7],
  situation: `I used to play piano seriously through my teens and early twenties—I was quite good and it brought me a lot of joy. Then life happened: career, kids, moving cities. I haven't played properly in about 12 years.

Recently I've felt drawn back to it. We even have a piano in the house that barely gets used. But every time I sit down, I get frustrated. My fingers don't do what my brain remembers they could do. I end up feeling worse than before I started.`,
  tried_already: `I've sat down a few times but give up after 10-15 minutes of frustration. I watched some YouTube tutorials but they felt either too basic or assumed current skill I don't have.`,
  desired_outcome: `I want to enjoy playing again, even if I never reach my previous level. I'd love it to become a regular source of relaxation rather than frustration.`,
  constraints: `I have maybe 20-30 minutes a few times a week, max. I can't commit to regular lessons right now due to schedule and cost. My family is supportive but I feel self-conscious playing badly when they can hear.`,
  status: 'gathering',
  problem_type: 'advice',
  contribution_threshold: 5,
  contribution_count: 2,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
}

export const demoUser = {
  id: 'demo-user',
  email: 'demo@example.com',
}
