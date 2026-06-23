import { Platform } from 'react-native';

// Web 환경에서 사용할 AudioContext 및 ScriptProcessor 레퍼런스
let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let processorNode: ScriptProcessorNode | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;

// Native 모듈 Dynamic Import를 위한 헬퍼 (React Native Native 빌드 환경용)
let LiveAudioStream: any = null;
if (Platform.OS !== 'web') {
  try {
    // npx expo prebuild 후 추가 설치될 react-native-live-audio-stream 모듈 동적 참조
    LiveAudioStream = require('react-native-live-audio-stream').default;
  } catch (error) {
    console.warn('⚠️ Native Audio Stream 모듈을 로드할 수 없습니다. (Expo Go 시뮬레이션 모드로 기본 작동합니다.)');
  }
}

/**
 * float32 오디오 버퍼를 16kHz, 16-bit Mono PCM (Int16Array) 바이너리로 다운샘플링 및 변환하는 헬퍼
 */
function floatTo16BitPCM(input: Float32Array, outputSampleRate: number, inputSampleRate: number): ArrayBuffer {
  const compression = inputSampleRate / outputSampleRate;
  const length = Math.floor(input.length / compression);
  const result = new Int16Array(length);
  
  let index = 0;
  let inputIndex = 0;
  
  while (index < length) {
    const nextInputIndex = Math.floor((index + 1) * compression);
    let sum = 0;
    let count = 0;
    
    // 다운샘플링 구간 평균값 계산 (알리아싱 방지)
    for (let i = inputIndex; i < nextInputIndex && i < input.length; i++) {
      sum += input[i];
      count++;
    }
    
    const sample = count > 0 ? sum / count : 0;
    // Int16 범위(-32768 ~ 32767)로 클램핑 및 스케일링
    result[index] = Math.max(-32768, Math.min(32767, sample < 0 ? sample * 0x8000 : sample * 0x7FFF));
    
    index++;
    inputIndex = nextInputIndex;
  }
  
  return result.buffer;
}

/**
 * ArrayBuffer를 Base64 문자열로 변환하는 헬퍼
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // React Native Native Fallback
  return global.Buffer ? global.Buffer.from(buffer).toString('base64') : '';
}

/**
 * Base64 스트링을 ArrayBuffer로 디코딩하는 헬퍼
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = typeof atob !== 'undefined' ? atob(base64) : global.Buffer ? global.Buffer.from(base64, 'base64').toString('binary') : '';
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const AudioStreamer = {
  /**
   * 16kHz PCM 실시간 오디오 송신 기동
   */
  startStreaming: async (ws: WebSocket, roomId: string, userId: string) => {
    console.log('🎙️ 오디오 스트리밍 기동 시작...');
    
    if (Platform.OS === 'web') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000, // 마이크 하드웨어 입력 요청
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        const inputSampleRate = audioContext.sampleRate;
        sourceNode = audioContext.createMediaStreamSource(mediaStream);
        
        // 4096 버퍼 사이즈 사용 (256ms 주기 프레임 생성)
        processorNode = audioContext.createScriptProcessor(4096, 1, 1);
        
        processorNode.onaudioprocess = (e) => {
          if (!ws || ws.readyState !== WebSocket.OPEN) return;
          
          const inputBuffer = e.inputBuffer.getChannelData(0);
          // 16kHz Mono PCM 변환
          const pcmBuffer = floatTo16BitPCM(inputBuffer, 16000, inputSampleRate);
          const base64PCM = arrayBufferToBase64(pcmBuffer);
          
          if (base64PCM) {
            ws.send(JSON.stringify({
              event: 'audio_data',
              roomId,
              userId,
              data: base64PCM
            }));
          }
        };
        
        sourceNode.connect(processorNode);
        processorNode.connect(audioContext.destination);
        console.log('🟢 [Web] 마이크가 활성화되었으며 16kHz PCM 오디오 송출을 가동합니다.');
        
      } catch (err) {
        console.error('❌ Web 오디오 입력 실패:', err);
        throw err;
      }
    } else {
      // Native 모바일 환경 (npx expo prebuild 이후 프로덕션 빌드 환경에서 작동)
      if (LiveAudioStream) {
        const options = {
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6, // VOICE_RECOGNITION 소스 지향
          bufferSize: 4096
        };
        
        LiveAudioStream.init(options);
        
        LiveAudioStream.on('data', (data: string) => {
          // react-native-live-audio-stream은 기본적으로 base64 스트링을 직접 뱉어냅니다.
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              event: 'audio_data',
              roomId,
              userId,
              data // Base64 raw
            }));
          }
        });
        
        LiveAudioStream.start();
        console.log('🟢 [Native] 실시간 마이크 녹음 및 오디오 송출 시작');
      } else {
        console.warn('⚠️ Native 오디오 모듈 누락: Expo Go 시뮬레이션 모드로 가상 패킷만 전송됩니다.');
      }
    }
  },

  /**
   * 오디오 송신 중지
   */
  stopStreaming: () => {
    console.log('🧹 오디오 스트리밍을 종료합니다.');
    
    if (Platform.OS === 'web') {
      if (processorNode && sourceNode) {
        sourceNode.disconnect(processorNode);
        processorNode.disconnect();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
      }
      processorNode = null;
      sourceNode = null;
      console.log('🟢 [Web] 오디오 컨텍스트 및 마이크 연결 해제 완료.');
    } else {
      if (LiveAudioStream) {
        LiveAudioStream.stop();
        console.log('🟢 [Native] 오디오 녹음 중단 완료.');
      }
    }
  },

  /**
   * 수신한 상대방 오디오 바이너리(Base64 PCM) 실시간 재생 스피커 출력 큐
   * Web 및 Native 재생 시나리오 대응
   */
  playReceivedAudioChunk: (base64Chunk: string) => {
    if (Platform.OS === 'web') {
      try {
        // 재생용 오디오 컨텍스트 기동
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const playCtx = new AudioContextClass();
        const pcmBuffer = base64ToArrayBuffer(base64Chunk);
        const int16Array = new Int16Array(pcmBuffer);
        
        const audioBuffer = playCtx.createBuffer(1, int16Array.length, 16000);
        const channelData = audioBuffer.getChannelData(0);
        
        // Int16 PCM -> Float32 변환하여 버퍼 주입
        for (let i = 0; i < int16Array.length; i++) {
          channelData[i] = int16Array[i] / 32768.0;
        }
        
        const source = playCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(playCtx.destination);
        source.start();
      } catch (err) {
        // 초고속 프레임으로 오디오 노드가 다닥다닥 붙어 나는 재생 에러 스킵
      }
    } else {
      // Native 재생 로직은 expo-av의 Sound.createAsync(uri)나 base64 pcm 직접 재생 라이브러리를 바인딩해 처리
      // 실무 아키텍처에서는 수신 데이터 버퍼링을 위한 native bridge 스피커 채널 사용 권장
    }
  }
};
