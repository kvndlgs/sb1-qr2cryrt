import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export interface RapStyle {
  tempo: 'slow' | 'medium' | 'fast'
  complexity: 'simple' | 'moderate' | 'complex'
  attitude: 'aggressive' | 'conscious' | 'humorous' | 'technical'
  rhymeScheme: 'ABAB' | 'AABB' | 'ABCB' | 'complex'
}

export interface VerseParams {
  character: {
    name: string
    style: RapStyle
    personality: string
    signature: string[]
  }
  topic: string
  opponent?: string
  previousVerse?: string
  battleContext?: string
}

export async function generateRapVerse(params: VerseParams): Promise<string> {
  const { character, topic, opponent, previousVerse, battleContext } = params

  const systemPrompt = `You are an AI rap battle generator specializing in creating authentic, creative verses.

Character Profile:
- Name: ${character.name}
- Style: ${character.style.attitude} with ${character.style.complexity} rhyme schemes
- Tempo: ${character.style.tempo}
- Personality: ${character.personality}
- Signature phrases: ${character.signature.join(', ')}

Guidelines:
- Generate exactly 16 bars (lines)
- Use ${character.style.rhymeScheme} rhyme scheme
- Stay in character with appropriate vocabulary and flow
- Be creative with wordplay and metaphors
- Keep content competitive but appropriate
- Reference the topic: ${topic}
${opponent ? `- Reference opponent: ${opponent}` : ''}
${previousVerse ? `- Respond to previous verse themes` : ''}
${battleContext ? `- Battle context: ${battleContext}` : ''}

Output format: Return only the rap verse, one line per bar, numbered 1-16.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a ${character.style.attitude} rap verse about ${topic}` }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.8,
      max_tokens: 1000
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating rap verse:', error)
    throw new Error('Failed to generate rap verse')
  }
}

export async function scoreVerse(verse: string, criteria: string[]): Promise<number> {
  const prompt = `Rate this rap verse on a scale of 1-10 based on: ${criteria.join(', ')}.

Verse:
${verse}

Return only a number between 1-10.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 10
    })

    const score = parseInt(completion.choices[0]?.message?.content || '5')
    return Math.max(1, Math.min(10, score))
  } catch (error) {
    console.error('Error scoring verse:', error)
    return 5
  }
}