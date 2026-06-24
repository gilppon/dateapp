import { db } from '../config/firebase';
import { PrivacySettings, DEFAULT_PRIVACY_SETTINGS } from '../types/privacyTypes';

// 가상 인메모리 DB (Firebase 비활성화 시 Fallback)
const mockPrivacySettings = new Map<string, PrivacySettings>();

export const PrivacyService = {
  /**
   * 사용자의 프라이버시 설정을 저장합니다. (GCP 인증 실패 대응)
   */
  updatePrivacySettings: async (userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings> => {
    const updated = {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...settings
    };

    try {
      if (!db) throw new Error('NO_DB');
      await db.collection('users').doc(userId).set({
        privacySettings: updated
      }, { merge: true });
      return updated;
    } catch (error: any) {
      if (
        error.message === 'NO_DB' ||
        error.message.includes('Project Id') ||
        error.message.includes('credential') ||
        error.message.includes('auth')
      ) {
        console.warn(`⚠️ [GCP MOCK FALLBACK] Firebase DB 실사 연결 불가로 인해 메모리에 프라이버시 설정을 저장합니다.`);
        mockPrivacySettings.set(userId, updated);
        return updated;
      }
      console.error('❌ Firestore 프라이버시 설정 저장 실패:', error);
      throw error;
    }
  },

  /**
   * 사용자의 프라이버시 설정을 조회합니다.
   */
  getPrivacySettings: async (userId: string): Promise<PrivacySettings> => {
    try {
      if (!db) throw new Error('NO_DB');
      const snap = await db.collection('users').doc(userId).get();
      if (snap.exists) {
        const data = snap.data();
        if (data?.privacySettings) {
          return data.privacySettings as PrivacySettings;
        }
      }
      return DEFAULT_PRIVACY_SETTINGS;
    } catch (error: any) {
      if (
        error.message === 'NO_DB' ||
        error.message.includes('Project Id') ||
        error.message.includes('credential') ||
        error.message.includes('auth')
      ) {
        return mockPrivacySettings.get(userId) || DEFAULT_PRIVACY_SETTINGS;
      }
      console.error('❌ Firestore 프라이버시 설정 조회 실패:', error);
      return DEFAULT_PRIVACY_SETTINGS;
    }
  },

  /**
   * 뷰어와 타겟의 매칭 여부를 확인합니다.
   */
  checkMatchStatus: async (userId1: string, userId2: string): Promise<boolean> => {
    try {
      if (!db) throw new Error('NO_DB');
      const matchId1 = `${userId1}_${userId2}`;
      const matchId2 = `${userId2}_${userId1}`;
      
      const snap1 = await db.collection('matches').doc(matchId1).get();
      if (snap1.exists && snap1.data()?.status === 'MATCHED') return true;

      const snap2 = await db.collection('matches').doc(matchId2).get();
      if (snap2.exists && snap2.data()?.status === 'MATCHED') return true;

      return false;
    } catch (error: any) {
      if (
        error.message === 'NO_DB' ||
        error.message.includes('Project Id') ||
        error.message.includes('credential') ||
        error.message.includes('auth')
      ) {
        return false;
      }
      console.error('❌ 매칭 상태 조회 실패:', error);
      return false;
    }
  },

  /**
   * 뷰어의 자격 정보에 맞춰 대상 유저의 프로필을 안전하게 가공(마스킹)하여 반환합니다.
   */
  getMaskedProfile: async (profileUserId: string, viewerUserId: string, mockDataOverride?: { profileUser?: any, viewerUser?: any, isMatched?: boolean }): Promise<any> => {
    if (profileUserId === viewerUserId) {
      try {
        if (!db) throw new Error('NO_DB');
        const snap = await db.collection('users').doc(profileUserId).get();
        return snap.exists ? snap.data() : null;
      } catch (error: any) {
        if (
          error.message === 'NO_DB' ||
          error.message.includes('Project Id') ||
          error.message.includes('credential') ||
          error.message.includes('auth')
        ) {
          return mockDataOverride?.profileUser || {
            id: profileUserId,
            nickname: '본인프로필',
            realName: '홍길동',
            age: 28,
            job: '삼성전자 엔지니어',
            company: '삼성전자',
            industry: 'IT/인터넷',
            income: '8,000만원',
            country: 'KR',
            verificationBadges: { identityVerified: true, employmentVerified: true, maritalStatusVerified: false }
          };
        }
        throw error;
      }
    }

    let profileUser: any = null;
    let viewerUser: any = null;
    let isMatched = false;

    try {
      if (!db) throw new Error('NO_DB');
      const profileSnap = await db.collection('users').doc(profileUserId).get();
      if (!profileSnap.exists) return null;
      profileUser = profileSnap.data();

      const viewerSnap = await db.collection('users').doc(viewerUserId).get();
      viewerUser = viewerSnap.exists ? viewerSnap.data() : { verificationBadges: { identityVerified: false } };

      isMatched = await PrivacyService.checkMatchStatus(profileUserId, viewerUserId);
    } catch (error: any) {
      if (
        error.message === 'NO_DB' ||
        error.message.includes('Project Id') ||
        error.message.includes('credential') ||
        error.message.includes('auth')
      ) {
        // Mock Fallback
        profileUser = mockDataOverride?.profileUser || {
          id: profileUserId,
          nickname: '스시조아',
          realName: '사토 유키',
          age: 28,
          job: '라인 야후 프론트엔드 개발자',
          company: '라인 야후',
          industry: 'IT/인터넷',
          income: '600만엔',
          country: 'JP',
          verificationBadges: { identityVerified: true, employmentVerified: true, maritalStatusVerified: false },
          privacySettings: mockPrivacySettings.get(profileUserId) || DEFAULT_PRIVACY_SETTINGS
        };
        viewerUser = mockDataOverride?.viewerUser || {
          id: viewerUserId,
          nickname: '김치러버',
          realName: '김철수',
          country: 'KR',
          verificationBadges: { identityVerified: false, employmentVerified: false, maritalStatusVerified: false }
        };
        isMatched = mockDataOverride?.isMatched || false;
      } else {
        throw error;
      }
    }

    const settings: PrivacySettings = profileUser.privacySettings || DEFAULT_PRIVACY_SETTINGS;

    // 1. 특정 국가 매칭 차단(blockCountry) 검사
    const viewerCountry = viewerUser.country || 'KR';
    if (settings.blockCountry && settings.blockCountry.includes(viewerCountry)) {
      throw new Error('ACCESS_DENIED_COUNTRY');
    }

    // 2. 전체 프로필 노출 수준(profileVisibility) 검사
    const isViewerVerified = !!viewerUser.verificationBadges?.identityVerified;
    if (settings.profileVisibility === 'NONE') {
      throw new Error('ACCESS_DENIED_PRIVATE');
    }
    if (settings.profileVisibility === 'VERIFIED_ONLY' && !isViewerVerified) {
      throw new Error('ACCESS_DENIED_VERIFIED_ONLY');
    }
    if (settings.profileVisibility === 'MATCHED_ONLY' && !isMatched) {
      throw new Error('ACCESS_DENIED_MATCHED_ONLY');
    }

    // 3. 개별 데이터 필드 마스킹 수행
    const masked: any = { ...profileUser };
    
    // 시스템 보안 필드는 상시 완전 격리
    delete masked.password;
    delete masked.privacySettings;

    // (A) 본명 공개 설정
    if (settings.realNameVisibility === 'PRIVATE' || (settings.realNameVisibility === 'MATCHED_ONLY' && !isMatched)) {
      delete masked.realName;
    }

    // (B) 나이 마스킹 (BLURRED: 20대 후반, 30대 중반 등으로 뭉뚱그림)
    if (profileUser.age) {
      if (settings.ageVisibility === 'PRIVATE') {
        delete masked.age;
      } else if (settings.ageVisibility === 'BLURRED') {
        const ageNum = Number(profileUser.age);
        if (!isNaN(ageNum)) {
          const base = Math.floor(ageNum / 10) * 10;
          const remainder = ageNum % 10;
          let suffix = '대 초반';
          if (remainder >= 4 && remainder <= 6) suffix = '대 중반';
          else if (remainder >= 7) suffix = '대 후반';
          masked.age = `${base}${suffix}`;
        }
      }
    }

    // (C) 직업 및 직장 공개 설정
    if (settings.jobVisibility === 'PRIVATE') {
      delete masked.job;
      delete masked.company;
    } else if (settings.jobVisibility === 'INDUSTRY_ONLY') {
      masked.job = profileUser.industry || '비공개 업종';
      delete masked.company; // 회사명은 마스킹하여 숨김
    }

    // (D) 소득 정보 공개 설정
    if (settings.incomeVisibility === 'PRIVATE' || (settings.incomeVisibility === 'VERIFIED_ONLY' && !isViewerVerified)) {
      delete masked.income;
    }

    return masked;
  }
};
