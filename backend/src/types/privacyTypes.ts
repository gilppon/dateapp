export type ProfileVisibility = 'ALL' | 'VERIFIED_ONLY' | 'MATCHED_ONLY' | 'NONE';
export type AgeVisibility = 'PUBLIC' | 'BLURRED' | 'PRIVATE';
export type JobVisibility = 'PUBLIC' | 'INDUSTRY_ONLY' | 'PRIVATE';
export type IncomeVisibility = 'PUBLIC' | 'VERIFIED_ONLY' | 'PRIVATE';
export type RealNameVisibility = 'MATCHED_ONLY' | 'PRIVATE';

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  ageVisibility: AgeVisibility;
  jobVisibility: JobVisibility;
  incomeVisibility: IncomeVisibility;
  realNameVisibility: RealNameVisibility;
  blockCountry: ('KR' | 'JP')[]; // 특정 국가 회원 대상 매칭/노출 차단 설정
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'ALL',
  ageVisibility: 'PUBLIC',
  jobVisibility: 'PUBLIC',
  incomeVisibility: 'VERIFIED_ONLY',
  realNameVisibility: 'MATCHED_ONLY',
  blockCountry: []
};
