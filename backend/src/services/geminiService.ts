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
    const model = ai.getGenerativeModel({ model: 'gemini-3.5-flash' });
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
 * Gemini Multimodal Live API WebSocket 세션 초기화 및 터널링 생성
 * @param clientWs 클라이언트(React Native)와 백엔드 간의 WebSocket 연결 인스턴스
 * @param userId 오디오 스트림 송신 사용자 고유 ID (스캠 스코어 트래킹용)
 * @param roomId 통화가 이뤄지고 있는 룸 ID
 * @param onForceDisconnect 강제 차단 발생 시 백엔드 소켓을 닫아버리기 위한 콜백
 */
export function createGeminiLiveSession(
  clientWs: WebSocket, 
  userId: string, 
  roomId: string,
  onForceDisconnect: (reason: string) => void
): WebSocket | null {
  if (!apiKey) {
    console.error('❌ Live API 연결 불가: GEMINI_API_KEY가 없습니다.');
    return null;
  }

  const geminiLiveUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
  
  const geminiWs = new WebSocket(geminiLiveUrl);

  geminiWs.on('open', () => {
    console.log(`🟢 Gemini Live API WebSocket 연결이 개설되었습니다. (유저: ${userId})`);
    
    const setupMessage = {
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['text'],
        },
        systemInstruction: {
          parts: [
            {
              text: `당신은 한류 데이팅 앱 'korea aimasu'의 보이스톡 실시간 AI 보안관입니다.
              사용자 간의 음성 통화를 실시간으로 청취하며, 금융 사기(송금 유도, 비트코인 거래, 통장 대여 요구 등)나 
              언어폭력, 심각한 유해 대화가 감지되면 즉시 반응하십시오.
              유해한 정황 감지 시 반드시 JSON 포맷으로 다음 메시지를 텍스트 응답으로 내놓아야 합니다:
              {"alert": "WARN_SCAM", "reason": "스캠 의심 단어 감지"} 또는 {"alert": "TERMINATE_CALL", "reason": "심각한 욕설 및 유해 발언 감지"}
              그 외의 일상적이고 안전한 대화는 일체 응답하지 말고 침묵하십시오.`
            }
          ]
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
          if (part.text) {
            console.log(`🤖 Gemini Live 분석 [User: ${userId}]: ${part.text}`);
            
            const alertMatch = part.text.match(/\{[\s\S]*\}/);
            if (alertMatch) {
              const alertObj = JSON.parse(alertMatch[0]);
              
              if (alertObj.alert === 'WARN_SCAM') {
                // 1. 가벼운 경고 시 스캠 점수 +30점
                const status = await DbService.incrementScamScore(userId, 30, alertObj.reason || '스캠 키워드 언급');
                
                // 클라이언트에 실시간 경고 통지 전송
                clientWs.send(JSON.stringify({
                  event: 'ai_guard_alert',
                  alert: 'WARN_SCAM',
                  reason: `${alertObj.reason} (누적 위험도: ${status.scamScore}점)`
                }));

                // 만약 누적 점수가 임계치인 80점을 초과하여 차단 상태로 바뀌었다면 강제 통화 종료로 격상
                if (status.isBanned) {
                  onForceDisconnect(`누적 스캠 스코어 임계값 초과 (${status.scamScore}점)`);
                }

              } else if (alertObj.alert === 'TERMINATE_CALL') {
                // 2. 심각한 폭언/유해 단어 감지 시 즉시 스캠 점수 +80점 주입하여 즉각 BAN
                await DbService.incrementScamScore(userId, 80, alertObj.reason || '심각한 정책 위반 발언');
                onForceDisconnect(alertObj.reason || '심각한 유해 및 스캠 대화 감지');
              }
            }
          }
        }
      }
    } catch (e) {
      // 바이트 처리 스킵
    }
  });

  geminiWs.on('error', (err: Error) => {
    console.error(`❌ Gemini Live API WebSocket 에러 (${userId}):`, err);
    clientWs.send(JSON.stringify({ event: 'system_error', message: 'AI 실시간 가드 모듈 연결 오류' }));
  });

  geminiWs.on('close', (code: number, reason: Buffer) => {
    console.log(`🔴 Gemini Live API WebSocket 연결 종료 (User: ${userId}, Code: ${code}, Reason: ${reason.toString()})`);
  });

  return geminiWs;
}
