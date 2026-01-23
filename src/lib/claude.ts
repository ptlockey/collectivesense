import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface SynthesisResult {
  summary: string
  common_themes: Array<{ theme: string; explanation: string }>
  divergent_views: Array<{ view: string; alternative: string }>
  considerations: string[]
  warnings: string[]
}

export interface ProblemContext {
  title: string
  category: string
  situation: string
  tried_already?: string | null
  desired_outcome?: string | null
  constraints?: string | null
}

export async function synthesiseContributions(
  problem: ProblemContext,
  contributions: string[]
): Promise<SynthesisResult> {
  const prompt = `You are synthesising multiple anonymous contributions to help someone with a problem. Your role is to distill collective wisdom, not summarise individual posts.

THE PROBLEM:
Title: ${problem.title}
Category: ${problem.category}
Situation: ${problem.situation}
Already tried: ${problem.tried_already || 'Not specified'}
Desired outcome: ${problem.desired_outcome || 'Not specified'}
Constraints: ${problem.constraints || 'None specified'}

CONTRIBUTIONS FROM ${contributions.length} PEOPLE:
${contributions.map((c, i) => `---\n${c}\n---`).join('\n')}

---

Create a synthesis with these sections:

1. SUMMARY: A warm, helpful paragraph synthesising the collective advice. Write as "People generally suggest..." or "The collective view is..." - never attribute to individuals.

2. COMMON THEMES: What suggestions or ideas appeared multiple times? List 3-5 themes, each with a brief explanation.

3. DIVERGENT VIEWS: Where did contributors disagree or offer different approaches? Present these fairly - disagreement is valuable information.

4. CONSIDERATIONS: Important factors or questions that contributors raised for the person to think about.

5. CAUTIONS: Any warnings, risks, or "watch out for" points that were raised. Only include if genuinely present in contributions.

Tone: Warm, practical, non-judgmental. This is collective wisdom from people who took time to help a stranger.

Do not:
- Attribute anything to specific contributors
- Make up advice not present in contributions
- Be preachy or lecture
- Include generic advice not specifically raised in contributions

Respond in JSON format:
{
  "summary": "string",
  "common_themes": [{"theme": "string", "explanation": "string"}],
  "divergent_views": [{"view": "string", "alternative": "string"}],
  "considerations": ["string"],
  "warnings": ["string"]
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract the text content from the response
  const textBlock = message.content.find(block => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Parse the JSON response
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response')
  }

  return JSON.parse(jsonMatch[0]) as SynthesisResult
}

export async function checkContentSafety(content: string): Promise<boolean> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-20250514',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: `Evaluate if this contribution to a problem-solving platform is appropriate. It should be helpful, not harmful, abusive, or spam. Respond with only "SAFE" or "UNSAFE".

Content: "${content}"`,
      },
    ],
  })

  const textBlock = message.content.find(block => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return false
  }

  return textBlock.text.trim().toUpperCase() === 'SAFE'
}
