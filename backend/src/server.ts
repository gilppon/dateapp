import express, { Request, Response } from 'express';
import * as http from 'http';
import WebSocket from 'ws';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { createGeminiLiveSession, checkTextSafety } from './services/geminiService';
import { DbService } from './services/dbService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// HTTP 상태 체크
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'korea aimasu 백엔드 게이트웨이가 작동 중입니다.' });
});

// REST API: 일반 채팅 텍스트 가드
app.post('/api/sanitize-chat', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: '텍스트 본문이 누락되었습니다.' });
  }

  const checkResult = await checkTextSafety(text);
  return res.json(checkResult);
});

const server = http.createServer(app);

// WebSocket 서버 설정 (1:1 보이스톡 릴레이 전용)
const wss = new WebSocket.Server({ server });

interface CallSession {
  roomId: string;
  clients: Map<string, WebSocket>; // userId -> WebSocket
  geminiSessions: Map<string, WebSocket>; // userId -> Gemini Live API WebSocket
}

// 활성 통화 세션 메모리 맵
const activeCalls = new Map<string, CallSession>();

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 새로운 클라이언트가 WebSocket으로 접속했습니다.');

  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', async (message: WebSocket.Data) => {
    try {
      const payload = JSON.parse(message.toString());
      const { event, roomId, userId, data } = payload;

      switch (event) {
        case 'join_call': {
          if (!roomId || !userId) {
            ws.send(JSON.stringify({ event: 'error', message: 'roomId 또는 userId가 누락되었습니다.' }));
            return;
          }

          // 1. 유저 차단(Ban) 상태 검증 (보안 Hard Boundary 작동)
          const userStatus = await DbService.checkUserStatus(userId);
          if (userStatus.isBanned) {
            console.log(`🛡️ [ACCESS DENIED] 차단된 유저 [${userId}]의 통화방 진입을 즉시 차단합니다.`);
            ws.send(JSON.stringify({
              event: 'ai_guard_alert',
              alert: 'TERMINATE_CALL',
              reason: `이 계정은 스캠 및 유해 행위로 인해 임시 차단된 상태입니다. (누적 점수: ${userStatus.scamScore}점)`
            }));
            ws.close();
            return;
          }

          currentRoomId = roomId;
          currentUserId = userId;

          console.log(`📞 유저 [${userId}]가 통화 방 [${roomId}]에 참여를 요청했습니다.`);

          let session = activeCalls.get(roomId);
          if (!session) {
            session = {
              roomId,
              clients: new Map(),
              geminiSessions: new Map()
            };
            activeCalls.set(roomId, session);
          }

          // 소켓 맵핑
          session.clients.set(userId, ws);

          // Gemini 3.5 Live API WebSocket 세션 기동 및 강제 끊기 콜백 주입
          const geminiWs = createGeminiLiveSession(ws, userId, roomId, (terminateReason: string) => {
            console.log(`🚨 [AI FORCE TERMINATE] 방 [${roomId}] 유저 [${userId}]의 유해 발언 감지로 인한 통화 강제 파괴 시작.`);
            
            // 방 안에 있는 모든 클라이언트에게 종료 이벤트를 알림
            const liveSession = activeCalls.get(roomId);
            if (liveSession) {
              liveSession.clients.forEach((clientSocket) => {
                if (clientSocket.readyState === WebSocket.OPEN) {
                  clientSocket.send(JSON.stringify({
                    event: 'ai_guard_alert',
                    alert: 'TERMINATE_CALL',
                    reason: terminateReason
                  }));
                }
              });
              
              // 두 클라이언트의 소켓 연결을 즉각 폭파 및 클린업
              setTimeout(() => {
                const keys = Array.from(liveSession.clients.keys());
                keys.forEach(k => cleanUpSession(roomId, k));
              }, 500); // 클라이언트에 차단 팝업 패킷이 안전하게 도착할 수 있도록 500ms 지연 후 파괴
            }
          });

          if (geminiWs) {
            session.geminiSessions.set(userId, geminiWs);
          }

          ws.send(JSON.stringify({ event: 'joined', userId, roomId }));

          // 상대방이 이미 방에 들어와 있다면 연결 통보
          if (session.clients.size > 1) {
            session.clients.forEach((clientSocket, clientId) => {
              if (clientId !== userId) {
                clientSocket.send(JSON.stringify({ event: 'peer_connected', peerId: userId }));
                ws.send(JSON.stringify({ event: 'peer_connected', peerId: clientId }));
              }
            });
          }
          break;
        }

        case 'audio_data': {
          if (!currentRoomId || !currentUserId || !data) return;

          const session = activeCalls.get(currentRoomId);
          if (!session) return;

          // 1. 상대방 클라이언트로 오디오 데이터 릴레이 (16kHz PCM Base64)
          session.clients.forEach((clientSocket, clientId) => {
            if (clientId !== currentUserId && clientSocket.readyState === WebSocket.OPEN) {
              clientSocket.send(JSON.stringify({
                event: 'audio_stream',
                senderId: currentUserId,
                data // Base64 오디오 데이터
              }));
            }
          });

          // 2. 이 유저에 매핑된 Gemini Live API WebSocket 세션으로 실시간 음성 파이핑
          const geminiWs = session.geminiSessions.get(currentUserId);
          if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
            const mediaPayload = {
              realtimeInput: {
                mediaChunks: [
                  {
                    mimeType: 'audio/pcm;rate=16000',
                    data // Base64 PCM 16kHz Chunk
                  }
                ]
              }
            };
            geminiWs.send(JSON.stringify(mediaPayload));
          }
          break;
        }

        case 'leave_call': {
          cleanUpSession(currentRoomId, currentUserId);
          break;
        }

        default:
          console.warn(`⚠️ 알 수 없는 WebSocket 이벤트: ${event}`);
      }
    } catch (error) {
      console.error('❌ WebSocket 메시지 처리 중 오류:', error);
    }
  });

  ws.on('close', () => {
    console.log(`🔌 클라이언트 연결 해제 (User: ${currentUserId}, Room: ${currentRoomId})`);
    cleanUpSession(currentRoomId, currentUserId);
  });

  ws.on('error', (err: Error) => {
    console.error(`❌ Client Socket 에러 (${currentUserId}):`, err);
    cleanUpSession(currentRoomId, currentUserId);
  });
});

/**
 * 리소스 누수 방지를 위한 커넥션 클린업 헬퍼
 */
function cleanUpSession(roomId: string | null, userId: string | null) {
  if (!roomId || !userId) return;

  const session = activeCalls.get(roomId);
  if (!session) return;

  // 1. 해당 사용자의 Gemini Live Session 해제
  const geminiWs = session.geminiSessions.get(userId);
  if (geminiWs) {
    if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
      geminiWs.close();
    }
    session.geminiSessions.delete(userId);
    console.log(`🧹 Gemini API 세션 해제 완료 (User: ${userId})`);
  }

  // 2. 사용자의 소켓 맵에서 제외 및 클라이언트 소켓 안전 닫기
  const clientSocket = session.clients.get(userId);
  if (clientSocket) {
    if (clientSocket.readyState === WebSocket.OPEN || clientSocket.readyState === WebSocket.CONNECTING) {
      clientSocket.close();
    }
    session.clients.delete(userId);
  }

  // 3. 상대 유저에게 방 나감 알림 전송
  session.clients.forEach((cSocket) => {
    if (cSocket.readyState === WebSocket.OPEN) {
      cSocket.send(JSON.stringify({ event: 'peer_disconnected', peerId: userId }));
    }
  });

  // 4. 통화방에 아무도 없으면 메모리 맵에서 완전 해제
  if (session.clients.size === 0) {
    activeCalls.delete(roomId);
    console.log(`🧹 활성 통화방 [${roomId}]의 모든 세션이 비어 메모리에서 삭제되었습니다.`);
  }
}

server.listen(PORT, () => {
  console.log(`🚀 korea aimasu 백엔드 게이트웨이가 포트 ${PORT}에서 활성화되었습니다!`);
});
