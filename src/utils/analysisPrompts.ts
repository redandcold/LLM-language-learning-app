interface LanguageSettings {
  mainLanguage: string
  learningLanguage: string
}

interface PromptParams {
  assistantMessage: string
  languageSettings: LanguageSettings
}

export function generateGrammarPrompt({ assistantMessage, languageSettings }: PromptParams): string {
  return `방금 전 답변에서 사용된 ${languageSettings.learningLanguage} 문법을 분석해서 설명해주세요.

분석 요청:
1. 방금 전 답변에서 사용된 주요 ${languageSettings.learningLanguage} 문법 구조들을 식별하고 다양한 ${languageSettings.learningLanguage} 예문과 함께 보여주세요
2. 모든 ${languageSettings.learningLanguage} 단어, 표현, 예문에는 반드시 발음기호를 (괄호) 안에 포함해주세요
3. 문법 구조와 예문은 ${languageSettings.learningLanguage}로 표현하고, 설명과 해설은 ${languageSettings.mainLanguage}로 해주세요
4. ${languageSettings.learningLanguage} 표현을 최대한 많이 노출시키되, 초보자도 이해할 수 있도록 ${languageSettings.mainLanguage}로 쉽게 설명해주세요

응답 방식:
- 문법 구조, 단어, 예문: ${languageSettings.learningLanguage}로 작성 + (발음기호) 필수 포함
- 의미 설명, 문법 해설, 학습 팁: ${languageSettings.mainLanguage}로 작성
대상 언어: ${languageSettings.learningLanguage}

다음과 같은 형식으로 답변해주세요:

## 📚 문법 분석

### 1. [문법 구조 이름 (발음기호)]
**${languageSettings.mainLanguage} 설명:** [문법 규칙을 ${languageSettings.mainLanguage}로 설명]
**${languageSettings.learningLanguage} 예문:**
- [${languageSettings.learningLanguage} 예문 1] (발음기호)
- [${languageSettings.learningLanguage} 예문 2] (발음기호)
- [${languageSettings.learningLanguage} 예문 3] (발음기호)

### 2. [문법 구조 이름 (발음기호)]
**${languageSettings.mainLanguage} 설명:** [문법 규칙을 ${languageSettings.mainLanguage}로 설명]
**${languageSettings.learningLanguage} 예문:**
- [${languageSettings.learningLanguage} 예문 1] (발음기호)
- [${languageSettings.learningLanguage} 예문 2] (발음기호)
- [${languageSettings.learningLanguage} 예문 3] (발음기호)

## 💡 학습 팁
[${languageSettings.mainLanguage}로 문법 학습에 도움이 되는 추가 팁]`
}

export function generateVocabularyPrompt({ assistantMessage, languageSettings }: PromptParams): string {
  return `방금 전 답변에서 사용된 ${languageSettings.learningLanguage} 단어와 표현들을 분석해서 알려주세요.

분석 요청:
1. 방금 전 답변에 포함된 중요한 ${languageSettings.learningLanguage} 단어들과 다양한 ${languageSettings.learningLanguage} 예문들을 최대한 많이 보여주세요
2. 모든 ${languageSettings.learningLanguage} 단어, 숙어, 속담, 예문에는 반드시 발음기호를 (괄호) 안에 포함해주세요
3. 숙어나 관용표현은 ${languageSettings.learningLanguage}로 표현하고 의미는 ${languageSettings.mainLanguage}로 설명해주세요
4. 속담이나 격언은 ${languageSettings.learningLanguage}로 제시하고 뜻과 유래는 ${languageSettings.mainLanguage}로 설명해주세요
5. 각 단어/표현마다 ${languageSettings.learningLanguage} 예문을 4-5개씩 풍부하게 제공해주세요

응답 방식:
- 단어, 표현, 예문: ${languageSettings.learningLanguage}로 작성 + (발음기호) 필수 포함
- 의미 설명, 유래, 해설: ${languageSettings.mainLanguage}로 작성
대상 언어: ${languageSettings.learningLanguage}

다음과 같은 형식으로 답변해주세요:

## 📖 단어 및 표현 분석

### 🔤 단어
**[${languageSettings.learningLanguage} 단어] (발음기호)** - 품사
- ${languageSettings.mainLanguage} 의미: [단어의 뜻을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.learningLanguage} 예문:
  - [${languageSettings.learningLanguage} 예문 1] (발음기호)
  - [${languageSettings.learningLanguage} 예문 2] (발음기호)
  - [${languageSettings.learningLanguage} 예문 3] (발음기호)
  - [${languageSettings.learningLanguage} 예문 4] (발음기호)

### 🎭 숙어/관용표현
**[${languageSettings.learningLanguage} 숙어] (발음기호)**
- ${languageSettings.mainLanguage} 의미: [숙어의 뜻을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.learningLanguage} 예문:
  - [${languageSettings.learningLanguage} 예문 1] (발음기호)
  - [${languageSettings.learningLanguage} 예문 2] (발음기호)
  - [${languageSettings.learningLanguage} 예문 3] (발음기호)
  - [${languageSettings.learningLanguage} 예문 4] (발음기호)

### 📜 속담/격언
**[${languageSettings.learningLanguage} 속담] (발음기호)**
- ${languageSettings.mainLanguage} 의미: [속담의 뜻을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.mainLanguage} 유래: [속담의 유래나 배경을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.learningLanguage} 예문:
  - [${languageSettings.learningLanguage} 예문 1] (발음기호)
  - [${languageSettings.learningLanguage} 예문 2] (발음기호)

## 💡 어휘 학습 팁
[${languageSettings.mainLanguage}로 어휘 학습에 도움이 되는 추가 팁]`
}

export function generateBothPrompt({ assistantMessage, languageSettings }: PromptParams): string {
  return `방금 전 답변에서 사용된 ${languageSettings.learningLanguage}의 문법과 단어를 종합적으로 분석해서 알려주세요.

분석 요청:
1. ${languageSettings.learningLanguage} 문법 구조들과 다양한 ${languageSettings.learningLanguage} 예문들을 풍부하게 제공하고 ${languageSettings.mainLanguage}로 설명해주세요
2. 중요한 ${languageSettings.learningLanguage} 단어, 숙어, 속담들을 최대한 많이 보여주고 의미는 ${languageSettings.mainLanguage}로 설명해주세요
3. 모든 ${languageSettings.learningLanguage} 표현에는 반드시 발음기호를 (괄호) 안에 포함해주세요
4. 문법과 어휘가 어떻게 연결되어 전체 의미를 만드는지 ${languageSettings.mainLanguage}로 설명해주세요
5. ${languageSettings.learningLanguage} 표현과 예문을 최대한 많이 제공해주세요

응답 방식:
- 문법 구조, 단어, 표현, 예문: ${languageSettings.learningLanguage}로 작성 + (발음기호) 필수 포함
- 설명, 의미 해설, 분석, 학습 팁: ${languageSettings.mainLanguage}로 작성
대상 언어: ${languageSettings.learningLanguage}

다음과 같은 형식으로 답변해주세요:

## 📚 문법 분석

### 1. [${languageSettings.learningLanguage} 문법 구조 이름] (발음기호)
**${languageSettings.mainLanguage} 설명:** [문법 규칙을 ${languageSettings.mainLanguage}로 설명]
**${languageSettings.learningLanguage} 예문:**
- [${languageSettings.learningLanguage} 예문 1] (발음기호)
- [${languageSettings.learningLanguage} 예문 2] (발음기호)
- [${languageSettings.learningLanguage} 예문 3] (발음기호)

## 📖 단어 및 표현 분석

### 🔤 주요 단어
**[${languageSettings.learningLanguage} 단어] (발음기호)** - 품사
- ${languageSettings.mainLanguage} 의미: [단어의 뜻을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.learningLanguage} 예문:
  - [${languageSettings.learningLanguage} 예문 1] (발음기호)
  - [${languageSettings.learningLanguage} 예문 2] (발음기호)
  - [${languageSettings.learningLanguage} 예문 3] (발음기호)
  - [${languageSettings.learningLanguage} 예문 4] (발음기호)

### 🎭 숙어/관용표현
**[${languageSettings.learningLanguage} 숙어] (발음기호)**
- ${languageSettings.mainLanguage} 의미: [숙어의 뜻을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.learningLanguage} 예문:
  - [${languageSettings.learningLanguage} 예문 1] (발음기호)
  - [${languageSettings.learningLanguage} 예문 2] (발음기호)
  - [${languageSettings.learningLanguage} 예문 3] (발음기호)

### 📜 속담/격언
**[${languageSettings.learningLanguage} 속담] (발음기호)**
- ${languageSettings.mainLanguage} 의미: [속담의 뜻을 ${languageSettings.mainLanguage}로 설명]
- ${languageSettings.mainLanguage} 유래: [속담의 유래나 배경을 ${languageSettings.mainLanguage}로 설명]

## 🔗 문법과 어휘의 연결
[${languageSettings.mainLanguage}로 문법 구조와 어휘가 어떻게 결합되어 전체 의미를 형성하는지 설명]

## 💡 종합 학습 팁
[${languageSettings.mainLanguage}로 문법과 어휘를 함께 학습할 때 도움이 되는 팁]`
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