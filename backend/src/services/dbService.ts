import { db } from '../config/firebase';

export interface UserStatus {
  isBanned: boolean;
  bannedUntil?: Date;
  banReason?: string;
  scamScore: number;
}

/**
 * Firestore를 이용한 사용자 스캠 점수 및 차단(Ban) 상태 관리 서비스
 */
export const DbService = {
  /**
   * 사용자의 누적 스캠 스코어 증가 및 임계값 초과 시 즉각 Ban 처리
   * @param userId 유저 고유 ID
   * @param score 추가할 위험 점수
   * @returns 현재 유저의 상태 및 즉각 차단 여부
   */
  incrementScamScore: async (userId: string, score: number, reason: string): Promise<UserStatus> => {
    console.log(`🛡️ AI 가드 스캠 탐지: 유저 [${userId}]의 위험 점수 +${score} (사유: ${reason})`);
    
    const defaultStatus: UserStatus = { isBanned: false, scamScore: score };

    if (!db) {
      // Firebase가 로컬 가상 Mock 모드일 때의 Fallback 처리
      console.warn('⚠️ Firebase DB가 비활성화 상태입니다. 메모리 모드로 처리합니다.');
      return defaultStatus;
    }

    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();
      
      let currentScore = score;
      let isBanned = false;
      let bannedUntil: Date | undefined;

      if (doc.exists) {
        const data = doc.data();
        currentScore = (data?.scamScore || 0) + score;
        isBanned = data?.isBanned || false;
      }

      // 스캠 점수 80점 이상일 경우 자동 임시 24시간 차단(Circuit Breaker 패턴)
      if (currentScore >= 80 && !isBanned) {
        isBanned = true;
        const banPeriod = 24 * 60 * 60 * 1000; // 24시간
        bannedUntil = new Date(Date.now() + banPeriod);
        
        await userRef.set({
          scamScore: currentScore,
          isBanned: true,
          bannedUntil,
          banReason: `AI 실시간 안전 감시 자동 차단: ${reason} (누적 스캠 스코어 ${currentScore}점 초과)`
        }, { merge: true });
        
        console.log(`🚨 [AUTO BAN] 유저 [${userId}]가 누적 점수 ${currentScore}점으로 인해 24시간 임시 차단되었습니다.`);
      } else {
        await userRef.set({
          scamScore: currentScore
        }, { merge: true });
      }

      return {
        isBanned,
        bannedUntil,
        banReason: isBanned ? `누적 위험 스코어 초과` : undefined,
        scamScore: currentScore
      };

    } catch (error) {
      console.error('❌ Firestore 사용자 점수 갱신 실패:', error);
      return defaultStatus;
    }
  },

  /**
   * 유저가 현재 차단(Ban)된 상태인지 Firestore 조회
   */
  checkUserStatus: async (userId: string): Promise<UserStatus> => {
    const defaultStatus: UserStatus = { isBanned: false, scamScore: 0 };
    
    if (!db) return defaultStatus;

    try {
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) return defaultStatus;

      const data = doc.data();
      const isBanned = data?.isBanned || false;
      const bannedUntilVal = data?.bannedUntil;
      
      let bannedUntil: Date | undefined;
      if (bannedUntilVal) {
        // Firestore Timestamp 처리
        bannedUntil = typeof bannedUntilVal.toDate === 'function' ? bannedUntilVal.toDate() : new Date(bannedUntilVal);
      }

      // 차단 기한 만료 검사
      if (isBanned && bannedUntil && bannedUntil.getTime() < Date.now()) {
        console.log(`🔓 유저 [${userId}]의 차단 기한이 만료되어 자동으로 차단 해제 처리합니다.`);
        await db.collection('users').doc(userId).set({
          isBanned: false,
          bannedUntil: null,
          banReason: null
        }, { merge: true });
        
        return { isBanned: false, scamScore: data?.scamScore || 0 };
      }

      return {
        isBanned,
        bannedUntil,
        banReason: data?.banReason,
        scamScore: data?.scamScore || 0
      };
    } catch (error) {
      console.error('❌ Firestore 사용자 상태 확인 실패:', error);
      return defaultStatus;
    }
  }
};
