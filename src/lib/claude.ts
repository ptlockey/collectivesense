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
  problem_type?: 'advice' | 'opinion'
}

export async function synthesiseContributions(
  problem: ProblemContext,
  contributions: string[]
): Promise<SynthesisResult> {
  const isOpinion = problem.problem_type === 'opinion'

  const advicePrompt = `You are synthesising multiple anonymous contributions to help someone with a problem. Your role is to distill collective wisdom, not summarise individual posts.

THE PROBLEM:
Title: ${problem.title}
Category: ${problem.category}
Situation: ${problem.situation}
Already tried: ${problem.tried_already || 'Not specified'}
Desired outcome: ${problem.desired_outcome || 'Not specified'}
Constraints: ${problem.constraints || 'None specified'}

CONTRIBUTIONS FROM ${contributions.length} PEOPLE:
${contributions.map((c) => `---\n${c}\n---`).join('\n')}

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

  const opinionPrompt = `You are synthesising multiple anonymous opinions on a question. Your role is to distill the collective view, not summarise individual responses.

THE QUESTION:
${problem.title}
Category: ${problem.category}
Context: ${problem.situation || 'No additional context provided'}

OPINIONS FROM ${contributions.length} PEOPLE:
${contributions.map((c) => `---\n${c}\n---`).join('\n')}

---

Create a synthesis with these sections:

1. SUMMARY: A clear paragraph summarising the collective opinion. If there's a clear majority view, state it (e.g., "Most people think X"). If it's split, say so. Write as "The collective opinion is..." or "People generally think..." - never attribute to individuals.

2. COMMON THEMES: What reasons or points appeared multiple times? List 3-5 themes, each with a brief explanation of why people mentioned this.

3. DIVERGENT VIEWS: Where did opinions differ? Present both sides fairly - different perspectives help the person make their own decision.

4. CONSIDERATIONS: "It depends" factors - things people said would change their answer depending on circumstances.

5. CAUTIONS: Any "watch out for" points or things to be aware of. Only include if genuinely present in contributions.

Tone: Balanced, practical, conversational. This is collective opinion from people who took time to share their view.

Do not:
- Attribute anything to specific contributors
- Make up opinions not present in contributions
- Be preachy or lecture
- Try to tell the person what they "should" do - just share what people think

Respond in JSON format:
{
  "summary": "string",
  "common_themes": [{"theme": "string", "explanation": "string"}],
  "divergent_views": [{"view": "string", "alternative": "string"}],
  "considerations": ["string"],
  "warnings": ["string"]
}`

  const prompt = isOpinion ? opinionPrompt : advicePrompt

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

  try {
    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields exist
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Invalid synthesis: missing or invalid summary')
    }
    if (!Array.isArray(parsed.common_themes)) {
      parsed.common_themes = []
    }
    if (!Array.isArray(parsed.divergent_views)) {
      parsed.divergent_views = []
    }
    if (!Array.isArray(parsed.considerations)) {
      parsed.considerations = []
    }
    if (!Array.isArray(parsed.warnings)) {
      parsed.warnings = []
    }

    return parsed as SynthesisResult
  } catch (parseError) {
    console.error('Failed to parse Claude JSON response:', textBlock.text)
    throw new Error(`Failed to parse synthesis JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
  }
}

export interface ContentSafetyResult {
  safe: boolean
  reason?: string
}

export async function checkContentSafety(content: string): Promise<ContentSafetyResult> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Evaluate if this contribution to a problem-solving platform is appropriate. It should be helpful, not harmful, abusive, spam, or off-topic.

Content: "${content}"

Respond in this exact JSON format:
{"safe": true} or {"safe": false, "reason": "brief explanation"}`,
        },
      ],
    })

    const textBlock = message.content.find(block => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { safe: false, reason: 'Unable to evaluate content' }
    }

    const responseText = textBlock.text.trim()

    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          safe: parsed.safe === true,
          reason: parsed.reason,
        }
      }
    } catch {
      // Fall back to simple check
    }

    // Fallback to simple SAFE/UNSAFE check
    const isSafe = responseText.toUpperCase().includes('SAFE') &&
                   !responseText.toUpperCase().includes('UNSAFE')

    return {
      safe: isSafe,
      reason: isSafe ? undefined : 'Content may not be appropriate for this platform',
    }
  } catch (error) {
    console.error('Content safety check failed:', error)
    // Default to safe on error to avoid blocking legitimate content
    return { safe: true }
  }
}
