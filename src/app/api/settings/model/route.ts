import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ModelSettings {
  modelType: 'openai' | 'local'
  modelId?: string
  openaiApiKey?: string
  updatedAt: string
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'model-settings.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(SETTINGS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function loadSettings(): ModelSettings {
  ensureDataDirectory()
  
  if (!fs.existsSync(SETTINGS_FILE)) {
    return {
      modelType: 'openai',
      updatedAt: new Date().toISOString()
    }
  }

  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return {
      modelType: 'openai',
      updatedAt: new Date().toISOString()
    }
  }
}

function saveSettings(settings: ModelSettings) {
  ensureDataDirectory()
  
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  } catch (error) {
    throw new Error('Failed to save settings')
  }
}

export async function GET(request: NextRequest) {
  try {
    const settings = loadSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { modelType, modelId, openaiApiKey } = await request.json()

    if (!modelType || !['openai', 'local'].includes(modelType)) {
      return NextResponse.json(
        { error: 'Invalid model type' },
        { status: 400 }
      )
    }

    const settings: ModelSettings = {
      modelType,
      modelId: modelType === 'local' ? modelId : undefined,
      openaiApiKey: modelType === 'openai' ? openaiApiKey : undefined,
      updatedAt: new Date().toISOString()
    }

    saveSettings(settings)

    return NextResponse.json({ 
      success: true, 
      settings 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}