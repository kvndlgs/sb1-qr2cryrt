export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style: number
  use_speaker_boost: boolean
}

export interface CharacterVoice {
  voice_id: string
  settings: VoiceSettings
}

export async function synthesizeVoice(text: string, voiceId: string, settings: VoiceSettings): Promise<Blob> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: settings
    })
  })

  if (!response.ok) {
    throw new Error('Failed to synthesize voice')
  }

  return await response.blob()
}

export const defaultCharacterVoices: Record<string, CharacterVoice> = {
  'street-rapper': {
    voice_id: '21m00Tcm4TlvDq8ikWAM', // Default voice ID
    settings: {
      stability: 0.75,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true
    }
  },
  'conscious-rapper': {
    voice_id: 'AZnzlk1XvdvUeBnXmlld',
    settings: {
      stability: 0.85,
      similarity_boost: 0.9,
      style: 0.2,
      use_speaker_boost: false
    }
  },
  'comedy-rapper': {
    voice_id: 'ErXwobaYiN019PkySvjV',
    settings: {
      stability: 0.6,
      similarity_boost: 0.7,
      style: 0.8,
      use_speaker_boost: true
    }
  },
  'battle-veteran': {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    settings: {
      stability: 0.9,
      similarity_boost: 0.95,
      style: 0.1,
      use_speaker_boost: false
    }
  }
}