import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // 운영체제 확인
    const platform = process.platform
    
    if (platform === 'win32') {
      // Windows: winget을 사용해서 설치 시도
      try {
        await execAsync('winget install ollama.ollama')
        return NextResponse.json({ 
          success: true, 
          message: 'Ollama installed successfully on Windows' 
        })
      } catch (error) {
        // winget 실패 시 수동 설치 안내
        return NextResponse.json({ 
          success: false, 
          error: 'Automatic installation failed. Please install manually.',
          downloadUrl: 'https://ollama.ai/download/windows'
        })
      }
    } else if (platform === 'darwin') {
      // macOS: Homebrew 사용
      try {
        await execAsync('brew install ollama')
        return NextResponse.json({ 
          success: true, 
          message: 'Ollama installed successfully on macOS' 
        })
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: 'Automatic installation failed. Please install manually.',
          downloadUrl: 'https://ollama.ai/download/mac'
        })
      }
    } else if (platform === 'linux') {
      // Linux: curl 스크립트 사용
      try {
        await execAsync('curl -fsSL https://ollama.ai/install.sh | sh')
        return NextResponse.json({ 
          success: true, 
          message: 'Ollama installed successfully on Linux' 
        })
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: 'Automatic installation failed. Please install manually.',
          downloadUrl: 'https://ollama.ai/download/linux'
        })
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Unsupported platform. Please install manually.',
        downloadUrl: 'https://ollama.ai/download'
      })
    }

  } catch (error) {
    console.error('Ollama installation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Installation failed. Please install manually.',
      downloadUrl: 'https://ollama.ai/download'
    })
  }
}