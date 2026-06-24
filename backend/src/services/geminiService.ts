import { GoogleGenerativeAI } from '@google/generative-ai';
import WebSocket from 'ws';
import * as dotenv from 'dotenv';
import { DbService } from './dbService';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenerativeAI | null = null;
try {
  if (apiKey) {
    ai = new GoogleGenerativeAI(apiKey);
    console.log('🟢 Gemini SDK가 API Key를 기반으로 활성화되었습니다.');
  } else {
    console.warn('⚠️ GEMINI_API_KEY 환경변수가 존재하지 않습니다. AI 기능이 비활성화되거나 오류가 발생할 수 있습니다.');
  }
} catch (error) {
  console.error('❌ Gemini SDK 초기화 실패:', error);
}

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  scamScore: number;
}

/**
 * 텍스트 메시지 및 프로필 소개글 유해성 실시간 가드 (Gemini Flash 기반)
 */
export async function checkTextSafety(text: string): Promise<SafetyCheckResult> {
  if (!ai) {
    const dangerKeywords = ['송금', '비트코인', '계좌', '외부메신저', '카톡아이디'];
    const matched = dangerKeywords.filter(keyword => text.includes(keyword));
    if (matched.length > 0) {
      return { isSafe: false, reason: `로컬 정규식 차단: 의심 키워드 (${matched.join(', ')}) 감지`, scamScore: 50 };
    }
    return { isSafe: true, scamScore: 0 };
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); // 최신 모델 동기화
    const prompt = `
    당신은 데이팅 앱 'korea aimasu'의 보안 필터링 AI입니다. 
    다음 대화 혹은 자기소개 텍스트를 보고, 스캠 사기(환전 유도, 투자 권유, 외부 연락처 강요), 언어 폭력, 음란 대화 여부를 엄격히 판단하십시오.
    결과는 반드시 JSON 형식으로만 출력하십시오:
    {
      "isSafe": boolean,
      "reason": string (유해하다고 판단한 사유, 안전하다면 빈 문자열),
      "scamScore": number (0~100 사이의 위험도 점수)
    }

    검사할 텍스트:
    "${text}"
    `;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text().trim();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]) as SafetyCheckResult;
      return result;
    }
    
    return { isSafe: true, scamScore: 0 };
  } catch (error) {
    console.error('⚠️ Gemini 텍스트 유해성 검증 중 오류 발생:', error);
    return { isSafe: true, scamScore: 0 };
  }
}

/**
 * Gemini Multimodal Live API WebSocket 세션 초기화 및 양방향 AI 통역 파이프라인 생성
 * @param clientWs 클라이언트(React Native)와 백엔드 간의 WebSocket 연결 인스턴스
 * @param userId 오디오 스트림 송신 사용자 고유 ID
 * @param roomId 통화가 이뤄지고 있는 룸 ID
 * @param translationDirection AI 통역 방향 ('KR_TO_JP' | 'JP_TO_KR' | 'NONE')
 * @param onAudioData 통역된 번역 오디오(Base64 PCM)가 생성되었을 때 호출되는 콜백
 * @param onForceDisconnect 유해 감지로 인한 통화 강제 파괴 콜백
 */
export function createGeminiLiveSession(
  clientWs: WebSocket, 
  userId: string, 
  roomId: string,
  translationDirection: 'KR_TO_JP' | 'JP_TO_KR' | 'NONE',
  onAudioData: (base64Audio: string) => void,
  onForceDisconnect: (reason: string) => void
): WebSocket | null {
  if (!apiKey) {
    console.error('❌ Live API 연결 불가: GEMINI_API_KEY가 없습니다.');
    return null;
  }

  const geminiLiveUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
  
  const geminiWs = new WebSocket(geminiLiveUrl);

  geminiWs.on('open', () => {
    console.log(`🟢 Gemini Live API WebSocket 연결이 개설되었습니다. (유저: ${userId}, 통역방향: ${translationDirection})`);
    
    let systemText = '';
    let responseModalities: string[] = ['text'];

    if (translationDirection === 'KR_TO_JP') {
      responseModalities = ['audio', 'text'];
      systemText = `당신은 한일 매칭 앱의 전문 동시통역사입니다. 입력되는 한국어 음성을 듣고 즉시 자연스럽고 친근한 일본어 음성으로 번역하여 말하십시오.
      번역 목적 이외의 어떠한 사담이나 설명도 대답하지 말고 즉각 통역 음성만 출력하십시오.
      단, 대화 중 심각한 금융 사기(송금 유도, 비트코인 거래 유도)나 폭언이 감지되면 즉시 통역을 중단하고 다음 JSON 메시지를 텍스트로 출력하십시오:
      {"alert": "WARN_SCAM", "reason": "스캠 의심 단어 감지"} 또는 {"alert": "TERMINATE_CALL", "reason": "심각한 욕설 및 유해 발언 감지"}`;
    } else if (translationDirection === 'JP_TO_KR') {
      responseModalities = ['audio', 'text'];
      systemText = `당신은 일한 매칭 앱의 전문 동시통역사입니다. 입력되는 일본어 음성을 듣고 즉시 자연스럽고 친근한 한국어 음성으로 번역하여 말하십시오.
      번역 목적 이외의 어떠한 사담이나 설명도 대답하지 말고 즉각 통역 음성만 출력하십시오.
      단, 대화 중 심각한 금융 사기(송금 유도, 비트코인 거래 유도)나 폭언이 감지되면 즉시 통역을 중단하고 다음 JSON 메시지를 텍스트로 출력하십시오:
      {"alert": "WARN_SCAM", "reason": "스캠 의심 단어 감지"} 또는 {"alert": "TERMINATE_CALL", "reason": "심각한 욕설 및 유해 발언 감지"}`;
    } else {
      // 통역 비활성화 시: 순수 보안 감시 모드로 작동 (침묵 지침)
      responseModalities = ['text'];
      systemText = `당신은 실시간 AI 보안관입니다. 통화를 청취하다가 유해 행위나 스캠이 감지되면 JSON 메시지만 텍스트로 대답하고, 평소에는 절대 말하지 마십시오.`;
    }

    const setupMessage = {
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: responseModalities,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: translationDirection === 'KR_TO_JP' ? 'Aoede' : 'Puck' // 남/여 목소리 다변화
              }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: systemText }]
        }
      }
    };

    geminiWs.send(JSON.stringify(setupMessage));
  });

  geminiWs.on('message', async (data: WebSocket.Data) => {
    try {
      const response = JSON.parse(data.toString());
      
      if (response.serverContent?.modelTurn?.parts) {
        for (const part of response.serverContent.modelTurn.parts) {
          
          // 1. 번역 오디오 스트림 수신 시 콜백 전달 (오디오-투-오디오)
          if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
            onAudioData(part.inlineData.data);
          }

          // 2. 보안 가드 텍스트 수신 시 실시간 차단 처리
          if (part.text) {
            console.log(`🤖 Gemini Live 분석 [User: ${userId}]: ${part.text}`);
            
            const alertMatch = part.text.match(/\{[\s\S]*\}/);
            if (alertMatch) {
              const alertObj = JSON.parse(alertMatch[0]);
              
              if (alertObj.alert === 'WARN_SCAM') {
                const status = await DbService.incrementScamScore(userId, 30, alertObj.reason || '스캠 키워드 언급');
                
                clientWs.send(JSON.stringify({
                  event: 'ai_guard_alert',
                  alert: 'WARN_SCAM',
                  reason: `${alertObj.reason} (누적 위험도: ${status.scamScore}점)`
                }));

                if (status.isBanned) {
                  onForceDisconnect(`누적 스캠 스코어 임계값 초과 (${status.scamScore}점)`);
                }

              } else if (alertObj.alert === 'TERMINATE_CALL') {
                await DbService.incrementScamScore(userId, 80, alertObj.reason || '심각한 정책 위반 발언');
                onForceDisconnect(alertObj.reason || '심각한 유해 및 스캠 대화 감지');
              }
            }
          }
        }
      }
    } catch (e) {
      // 바이너리 데이터 변환 오류 무시
    }
  });

  geminiWs.on('error', (err: Error) => {
    console.error(`❌ Gemini Live API WebSocket 에러 (${userId}):`, err);
    clientWs.send(JSON.stringify({ event: 'system_error', message: 'AI 실시간 가드/통역 모듈 연결 오류' }));
  });

  geminiWs.on('close', (code: number, reason: Buffer) => {
    console.log(`🔴 Gemini Live API WebSocket 연결 종료 (User: ${userId}, Code: ${code})`);
  });

  return geminiWs;
}
