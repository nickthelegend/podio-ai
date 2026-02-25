import { POST as generateSlides } from '../app/api/slides/generate/route'
import { POST as updateSlide } from '../app/api/slides/update/route'

jest.mock('@google/generative-ai', () => {
  return {
    SchemaType: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING'
    },
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: async () => ({
          response: {
            text: () => JSON.stringify({
              slides: [
                {
                  title: 'Test Slide',
                  layoutType: 'title',
                  bullets: ['A'],
                  speakerNotes: 'Notes',
                  backgroundColor: '#000000',
                  textColor: '#ffffff',
                  accentColor: '#ff00ff',
                  gradient: 'linear-gradient(135deg, #000 0%, #111 100%)'
                }
              ]
            })
          }
        })
      })
    }))
  }
})

const makeRequest = (body: any) => new Request('http://localhost/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

describe('slides api', () => {
  beforeAll(() => {
    process.env.GOOGLE_GEMINI_API_KEY = 'test'
  })

  it('generates slides', async () => {
    const req = makeRequest({ topic: 'AI', count: 1, style: 'Modern' })
    const res = await generateSlides(req as any)
    const json = await res.json()
    expect(json.slides).toHaveLength(1)
    expect(json.slides[0].title).toBe('Test Slide')
  })

  it('updates slide', async () => {
    const currentSlide = {
      title: 'Old',
      layoutType: 'content',
      bullets: ['A'],
      speakerNotes: 'Notes',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ff00ff'
    }
    const req = makeRequest({ topic: 'AI', instruction: 'Make it stronger', currentSlide, style: 'Modern' })
    const res = await updateSlide(req as any)
    const json = await res.json()
    expect(json.slide).toBeDefined()
    expect(json.slide.title).toBeDefined()
  })
})
