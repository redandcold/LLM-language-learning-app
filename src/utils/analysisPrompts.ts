interface LanguageSettings {
  mainLanguage: string
  learningLanguage: string
}

interface PromptParams {
  assistantMessage: string
  languageSettings: LanguageSettings
}

export function generateGrammarPrompt({ assistantMessage, languageSettings }: PromptParams): string {
  return `다음 문장에서 사용된 문법을 분석해주세요:

"${assistantMessage}"

분석 요청:
1. 위 문장에서 사용된 주요 문법 구조들을 식별하고 설명해주세요
2. 각 문법에 대해 다른 예문도 2-3개씩 보여주세요
3. 초보자도 이해할 수 있도록 쉽게 설명해주세요

응답 언어: ${languageSettings.mainLanguage}
대상 언어: ${languageSettings.learningLanguage}

다음과 같은 형식으로 답변해주세요:

## 📚 문법 분석

### 1. [문법 구조 이름]
**설명:** [문법 규칙 설명]
**예문:**
- [예문 1]
- [예문 2]
- [예문 3]

### 2. [문법 구조 이름]
**설명:** [문법 규칙 설명]
**예문:**
- [예문 1]
- [예문 2]
- [예문 3]

## 💡 학습 팁
[문법 학습에 도움이 되는 추가 팁]`
}

export function generateVocabularyPrompt({ assistantMessage, languageSettings }: PromptParams): string {
  return `다음 문장에서 사용된 단어, 숙어, 속담을 분석해주세요:

"${assistantMessage}"

분석 요청:
1. 위 문장에 포함된 중요한 단어들의 의미를 설명해주세요
2. 숙어나 관용표현이 있다면 그 의미를 설명해주세요
3. 속담이나 격언이 있다면 그 뜻과 유래를 설명해주세요
4. 각 단어/표현마다 다른 예문을 2-3개씩 제공해주세요

응답 언어: ${languageSettings.mainLanguage}
대상 언어: ${languageSettings.learningLanguage}

다음과 같은 형식으로 답변해주세요:

## 📖 단어 및 표현 분석

### 🔤 단어
**[단어]** - [발음] (품사)
- 의미: [단어의 뜻]
- 예문:
  - [예문 1]
  - [예문 2]
  - [예문 3]

### 🎭 숙어/관용표현
**[숙어]**
- 의미: [숙어의 뜻]
- 예문:
  - [예문 1]
  - [예문 2]
  - [예문 3]

### 📜 속담/격언
**[속담]**
- 의미: [속담의 뜻]
- 유래: [속담의 유래나 배경]
- 예문:
  - [예문 1]
  - [예문 2]

## 💡 어휘 학습 팁
[어휘 학습에 도움이 되는 추가 팁]`
}

export function generateBothPrompt({ assistantMessage, languageSettings }: PromptParams): string {
  return `다음 문장의 문법과 어휘를 종합적으로 분석해주세요:

"${assistantMessage}"

분석 요청:
1. 문법 구조 분석 및 예문 제공
2. 중요한 단어, 숙어, 속담의 의미 설명 및 예문 제공
3. 문법과 어휘가 어떻게 연결되어 전체 의미를 만드는지 설명

응답 언어: ${languageSettings.mainLanguage}
대상 언어: ${languageSettings.learningLanguage}

다음과 같은 형식으로 답변해주세요:

## 📚 문법 분석

### 1. [문법 구조 이름]
**설명:** [문법 규칙 설명]
**예문:**
- [예문 1]
- [예문 2]
- [예문 3]

## 📖 단어 및 표현 분석

### 🔤 주요 단어
**[단어]** - [발음] (품사)
- 의미: [단어의 뜻]
- 예문:
  - [예문 1]
  - [예문 2]
  - [예문 3]

### 🎭 숙어/관용표현
**[숙어]**
- 의미: [숙어의 뜻]
- 예문:
  - [예문 1]
  - [예문 2]

### 📜 속담/격언
**[속담]**
- 의미: [속담의 뜻]
- 유래: [속담의 유래나 배경]

## 🔗 문법과 어휘의 연결
[문법 구조와 어휘가 어떻게 결합되어 전체 의미를 형성하는지에 대한 설명]

## 💡 종합 학습 팁
[문법과 어휘를 함께 학습할 때 도움이 되는 팁]`
}

export function generateAnalysisPrompt(
  type: 'grammar' | 'vocabulary' | 'both',
  assistantMessage: string,
  languageSettings: LanguageSettings
): string {
  const params = { assistantMessage, languageSettings }
  
  switch (type) {
    case 'grammar':
      return generateGrammarPrompt(params)
    case 'vocabulary':
      return generateVocabularyPrompt(params)
    case 'both':
      return generateBothPrompt(params)
    default:
      throw new Error(`Unknown analysis type: ${type}`)
  }
}