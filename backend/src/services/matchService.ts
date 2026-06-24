import { db } from '../config/firebase';
import { MarriageValues, MatchResult } from '../types/matchTypes';

const mockMarriageValues = new Map<string, MarriageValues>();

// 가상 유저 가치관 더미 데이터 (추천 목록용)
const mockUsersForRecommendation = [
  {
    id: 'user_rec_01',
    nickname: '도쿄새댁',
    country: 'JP',
    age: 26,
    marriageValues: {
      childPlan: 'WANT_CHILDREN' as const,
      residenceWill: 'FLEXIBLE' as const,
      religion: 'NONE' as const,
      dualIncome: 'YES' as const,
      marriageTiming: 'WITHIN_1_YEAR' as const
    }
  },
  {
    id: 'user_rec_02',
    nickname: '오사카김군',
    country: 'JP',
    age: 31,
    marriageValues: {
      childPlan: 'DISCUSS' as const,
      residenceWill: 'STAY_IN_JP' as const,
      religion: 'CHRISTIAN' as const,
      dualIncome: 'FLEXIBLE' as const,
      marriageTiming: 'WITHIN_2_YEARS' as const
    }
  },
  {
    id: 'user_rec_03',
    nickname: '서울의 봄',
    country: 'KR',
    age: 29,
    marriageValues: {
      childPlan: 'NO_CHILDREN' as const,
      residenceWill: 'STAY_IN_KR' as const,
      religion: 'NONE' as const,
      dualIncome: 'NO' as const,
      marriageTiming: 'DEPENDS' as const
    }
  }
];

export const MatchService = {
  /**
   * 두 사용자의 결혼 가치관을 비교해 100점 만점의 매칭 점수를 계산합니다.
   */
  calculateMatchScore: (u1: MarriageValues, u2: MarriageValues): MatchResult => {
    let score = 0;
    
    // 1. 거주 의지 (35점 만점)
    let residenceMatch = false;
    if (u1.residenceWill === u2.residenceWill) {
      score += 35;
      residenceMatch = true;
    } else if (u1.residenceWill === 'FLEXIBLE' || u2.residenceWill === 'FLEXIBLE') {
      score += 35; 
      residenceMatch = true;
    } else {
      residenceMatch = false;
    }

    // 2. 자녀 계획 (25점 만점)
    let childMatch = false;
    if (u1.childPlan === u2.childPlan) {
      score += 25;
      childMatch = true;
    } else if (u1.childPlan === 'DISCUSS' || u2.childPlan === 'DISCUSS') {
      score += 15; 
      childMatch = true; 
    } else {
      childMatch = false; 
    }

    // 3. 맞벌이 선호 (20점 만점)
    let dualIncomeMatch = false;
    if (u1.dualIncome === u2.dualIncome || u1.dualIncome === 'FLEXIBLE' || u2.dualIncome === 'FLEXIBLE') {
      score += 20;
      dualIncomeMatch = true;
    } else {
      score += 5; 
      dualIncomeMatch = false;
    }

    // 4. 종교 (20점 만점)
    let religionMatch = false;
    if (u1.religion === u2.religion || u1.religion === 'NONE' || u2.religion === 'NONE') {
      score += 20;
      religionMatch = true;
    } else {
      score += 5; 
      religionMatch = false;
    }

    return {
      score,
      isBestMatch: score >= 80,
      matchDetails: {
        residenceMatch,
        childMatch,
        dualIncomeMatch,
        religionMatch
      }
    };
  },

  /**
   * 사용자의 가치관 설정을 저장합니다.
   */
  saveMarriageValues: async (userId: string, values: MarriageValues): Promise<MarriageValues> => {
    try {
      if (!db) throw new Error('NO_DB');
      await db.collection('users').doc(userId).set({
        marriageValues: values
      }, { merge: true });
      return values;
    } catch (error: any) {
      console.warn(`⚠️ [GCP MOCK FALLBACK] DB 연결 불가로 메모리에 가치관을 저장합니다. User: ${userId}`);
      mockMarriageValues.set(userId, values);
      return values;
    }
  },

  /**
   * 사용자의 가치관을 조회합니다.
   */
  getMarriageValues: async (userId: string): Promise<MarriageValues | null> => {
    try {
      if (!db) throw new Error('NO_DB');
      const snap = await db.collection('users').doc(userId).get();
      if (snap.exists && snap.data()?.marriageValues) {
        return snap.data()?.marriageValues as MarriageValues;
      }
      return null;
    } catch (error: any) {
      return mockMarriageValues.get(userId) || null;
    }
  },

  /**
   * 특정 유저에게 가치관 적합도가 높은 순서대로 추천 회원 목록을 반환합니다.
   */
  getRecommendedMatches: async (userId: string): Promise<any[]> => {
    let myValues = await MatchService.getMarriageValues(userId);
    if (!myValues) {
      myValues = {
        childPlan: 'WANT_CHILDREN',
        residenceWill: 'FLEXIBLE',
        religion: 'NONE',
        dualIncome: 'YES',
        marriageTiming: 'WITHIN_2_YEARS'
      };
    }

    let candidates: any[] = [];

    try {
      if (!db) throw new Error('NO_DB');
      const snap = await db.collection('users').get();
      snap.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== userId && data.marriageValues) {
          candidates.push({
            id: doc.id,
            nickname: data.nickname || '익명회원',
            age: data.age,
            country: data.country,
            marriageValues: data.marriageValues
          });
        }
      });
    } catch (error: any) {
      candidates = [...mockUsersForRecommendation];
    }

    const results = candidates.map((c) => {
      const matchResult = MatchService.calculateMatchScore(myValues!, c.marriageValues);
      return {
        userId: c.id,
        nickname: c.nickname,
        age: c.age,
        country: c.country,
        matchResult
      };
    });

    return results.sort((a, b) => b.matchResult.score - a.matchResult.score);
  }
};
