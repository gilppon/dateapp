import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Alert, Animated, Image, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { 
  Provider as PaperProvider, 
  MD3DarkTheme as DefaultTheme, 
  Text, 
  Button, 
  TextInput, 
  Card, 
  Avatar, 
  Banner,
  ActivityIndicator,
  Surface,
  ProgressBar,
  IconButton,
  Divider,
  Chip,
  SegmentedButtons,
  Switch
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AudioStreamer } from './src/utils/AudioStreamer';
import ProfileEdit from './src/components/ProfileEdit';

const GALLERY_IMAGES: { [key: string]: any } = {
  gallery_cafe: require('./assets/gallery_cafe.png'),
  gallery_walk: require('./assets/gallery_walk.png'),
  gallery_food: require('./assets/gallery_food.png'),
};

const LEGAL_DATA = {
  tos: {
    title: { ko: '서비스 이용약관', ja: 'サービス利用規約', en: 'Terms of Service' },
    content: {
      ko: `[제1조 목적]\n본 약관은 Next Haru(이하 "회사")가 제공하는 한일 가치관 매칭 서비스 'korea aimasu'(이하 "서비스")를 이용함에 있어 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n[제2조 회원 가입 조건]\n본 서비스는 만 19세 미만(한국 기준) 및 만 18세 미만(일본 기준)의 미성년자는 이용할 수 없습니다. 회원은 가입 시 본인 인증 서류(eKYC)를 성실히 제출해야 합니다.\n\n[제3조 서비스 이용 및 결제]\n회사는 일부 서비스를 유료(하트 충전 및 멤버십)로 제공합니다. 요금 및 결제 조건은 앱 내 구매 페이지에 표시된 바에 따릅니다.\n\n[제4조 준거법 및 재판관할]\n본 약관은 일본 법률을 준거법으로 하며, 서비스 이용과 관련하여 분쟁이 발생할 경우 회사의 본사 소재지 관할 법원을 합의 관할 법원으로 합니다.`,
      ja: `[第1条 目的]\n本規約は、Next Haru（以下「当社」）が提供する日韓価値観マッチングサービス「korea aimasu」（以下「サービス」）の利用条件を定めるものです。\n\n[第2条 会員登録要件]\n本サービスは、満19歳未満（韓国）および満18歳未満（日本）の未成年者はご利用いただけません。登録時には本人確認書類（eKYC）の提出が必要です。\n\n[第3条 お支払い]\n一部サービスは有料（ハート充電・メンバーシップ）で提供されます。価格はアプリ内の各購入ページに準じます。\n\n[第4条 準拠法・裁判管轄]\n本規約の準拠法は日本法とし、本サービスに関する紛争については、当社の所在地を管轄する裁判所を第一審の合意管轄裁判所とします。`,
      en: `[Section 1 Purpose]\nThese Terms of Service govern the relationship between Next Haru ("Company") and users of the Korea-Japan matching service 'korea aimasu' ("Service").\n\n[Section 2 Eligibility]\nUsers under the age of 19 (for Korea) and 18 (for Japan) are strictly prohibited from using this Service. ID verification (eKYC) is required upon registration.\n\n[Section 3 Payments]\nPaid services (Hearts and Premium Membership) are subject to billing terms displayed within the App store and purchase screens.\n\n[Section 4 Governing Law]\nThese terms shall be governed by the laws of Japan. Any disputes shall be settled in the court of jurisdiction of the Company's headquarters.`
    }
  },
  privacy: {
    title: { ko: '개인정보 처리방침', ja: '個人情報保護方針', en: 'Privacy Policy' },
    content: {
      ko: `[1. 수집하는 개인정보]\n회사는 회원가입, 매칭 및 고객상담을 위해 이메일, 닉네임, 생년월일, 성별, 거주지 가치관 정보 및 eKYC 본인인증 사진 데이터를 수집합니다.\n\n[2. 개인정보의 이용 목적]\n수집된 개인정보는 회원 관리, 매칭 점수 산정 및 실시간 AI 번역/세이프 가드 필터링 서비스 제공 목적으로만 이용됩니다.\n\n[3. 개인정보의 제3자 제공]\n회사는 법령에 특별한 규정이 있는 경우를 제외하고는 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.`,
      ja: `[1. 収集する個人情報]\n当社は、会員登録、マッチング、カスタマーサポートのために、メールアドレス、ニックネーム、生年月日、性別、価値観情報、eKYC本人確認用データを収集します。\n\n[2. 利用目的]\n収集した情報は、会員管理、マッチング適合度の計算、およびAI安全対策ガード機能の提供にのみ使用します。\n\n[3. 第三者提供]\n法令に基づく場合を除き、利用者の同意なく個人情報を第三者に提供することはありません。`,
      en: `[1. Information Collected]\nWe collect email, nickname, birthdate, gender, lifestyle values, and photo IDs for identity verification (eKYC) purposes.\n\n[2. Use of Information]\nYour information is processed to run compatibility matching, verify account authenticity, and protect users via AI safety guards.\n\n[3. Third-party Sharing]\nWe do not share or sell your private information to third parties, except as required by law.`
    }
  },
  refund: {
    title: { ko: '환불정책', ja: '返金ポリシー', en: 'Refund Policy' },
    content: {
      ko: `[1. 디지털 콘텐츠의 환불 제한]\n본 서비스에서 판매되는 하트(Hearts) 등 가상 상품은 디지털 재화의 특성상 구매 완료 후 즉시 지급되어 원칙적으로 청약철회 및 환불이 불가능합니다.\n\n[2. 예외적 환불 사유]\n시스템 오류로 인한 중복 결제, 결제 완료 후 7일 이내 상품이 지급되지 않은 기술적 오류 등에 한하여 미사용 재화에 대한 환불이 가능합니다. support@next-haru.com 으로 영수증 사본을 첨부하여 요청해주시기 바랍니다.`,
      ja: `[1. デジタル商品の返金制限]\nサービス内で販売されるハートなどの仮想商品は、デジタルコンテンツの性質上、購入完了後の返品・返金は原則としてお受けできません。\n\n[2. 例外的な返金条件]\n重複決済やシステム障害による不具合など、当社の責に帰すべき場合に限り、未使用コンテンツについて購入後7日以内の申請をもって返金を行います。support@next-haru.com までご連絡ください。`,
      en: `[1. Digital Goods Non-Refundability]\nAll in-app purchases (Hearts) are digital goods and are non-refundable once successfully delivered to your account.\n\n[2. Exception Rules]\nRefunds may be processed in cases of double billing or major technical delivery failures. Contact support@next-haru.com with transaction receipts within 7 days of purchase.`
    }
  },
  tokushoho: {
    title: { ko: '특정상거래법 표시', ja: '特定商取引法に基づく表記', en: 'Specified Commercial Transactions' },
    content: {
      ko: `■ 사업자 명칭 : Next Haru\n■ 운영책임자 : GILHO SHIN\n■ 소재지 : 1-7 Daishincho, Hadano-shi, Kanagawa 257-0034, Japan (〒257-0034 神奈川県秦野市大秦町1-7)\n■ 문의 이메일 : support@next-haru.com\n■ 연락처 전화번호 : +81 80-8879-0002\n■ 판매 가격 : 각 구매 화면에 명시된 가격\n■ 대금 지불 방법 : 신용카드 (Stripe)\n■ 대금 지불 시기 : 구매 시 즉시 청구\n■ 상품 인도 시기 : 결제 후 즉시 인도\n■ 반품 및 취소 : 디지털 콘텐츠 특성상 결제 후 원칙적 반품/취소 불가`,
      ja: `■ 事業者名称 : Next Haru\n■ 運営統括責任者 : GILHO SHIN\n■ 所在地 : 1-7 Daishincho, Hadano-shi, Kanagawa 257-0034, Japan (〒257-0034 神奈川県秦野市大秦町1-7)\n■ 連絡先メール : support@next-haru.com\n■ 電話番号 : +81 80-8879-0002\n■ 販売価格 : 各購入画面に記載\n■ 支払方法 : クレジットカード決済（Stripe）\n■ 支払時期 : ご購入時に即時決済されます\n■ 商品引渡時期 : 決済完了後、直ちにご利用いただけます\n■ 返品・キャンセル : 原則として購入後のキャンセルはお受けできません`,
      en: `■ Company Name : Next Haru\n■ Representative : GILHO SHIN\n■ Address : 1-7 Daishincho, Hadano-shi, Kanagawa 257-0034, Japan\n■ Contact Email : support@next-haru.com\n■ Phone Number : +81 80-8879-0002\n■ Pricing : Displayed on each purchase screen\n■ Payment Methods : Credit Card (Stripe)\n■ Payment Timing : Immediate charge upon purchase\n■ Delivery Time : Instantly delivered\n■ Returns & Cancellations : All sales are final due to digital product nature`
    }
  }
};

// WOW 팩터가 가미된 세련된 K-Wave 하모니어스 핑크 & 네이비 다크 테마 (MD3 규격)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF8A80',       // Sakura Coral Pink
    secondary: '#3F51B5',     // Indigo Navy
    background: '#0D0B14',    // Deep Purple-Black
    surface: '#181524',       // Dark Violet Surface
    error: '#FF5252',
    accent: '#00E5FF',        // Fluorescent Cyan
  },
};

const TRANSLATIONS = {
  ko: {
    appName: 'Hana-Il Match',
    subtitle: '한일 특화 가치관 매칭 & 실시간 AI 컨시어지 서비스',
    start: '시작하기 (Login / Sign Up)',
    tagline: '가치관 기반의 진지한 한일 연분 매칭',
    loginTitle: 'Hana-Il Match 로그인',
    emailLabel: '이메일 주소',
    passwordLabel: '비밀번호',
    demoBtn: '데모 계정 자동 입력',
    loginBtn: '로그인 🚀',
    noAccount: '아직 계정이 없으신가요? 회원가입 🌸',
    signupTitle: 'Hana-Il Match 회원가입',
    signupSubtitle: '만 19세 미만(한국) 및 만 18세 미만(일본) 이용 제한',
    nicknameLabel: '닉네임 (활동명)',
    birthdateLabel: '생년월일 (YYYY-MM-DD)',
    countryLabel: '거주 국가 (법적 규제 적용):',
    koreaBtn: '대한민국 🇰🇷',
    japanBtn: '일본 🇯🇵',
    signupBtn: '가입 신청 🚀',
    hasAccount: '이미 계정이 있으신가요? 로그인 🔑',
    voiceRoomTitle: '초저지연 1:1 보이스 룸',
    voiceRoomDesc: '실시간 Gemini 3.5 AI 가드가 스캠과 사기로부터 보호합니다.',
    signalStatus: '현재 게이트웨이 신호 상태',
    startVoiceBtn: '실시간 보이스 데이트 매칭 개시',
    endVoiceBtn: '전화 종료 및 대기실 복귀',
    ownBadgeTitle: '🛡️ 활성화된 내 신뢰 배지 (유효기간)',
    badgeId: '신원 (1년)',
    badgeJob: '직장 (6개월)',
    badgeSingle: '미혼 (3개월)',
    badgeEdu: '학력 (무제한)',
    filterBtn: '가치관 필터 설정 🔍',
    conciergeBtn: '컨시어지 매니저 상담',
    peerTitle: '상대 메이트',
    compatTitle: '호합도',
    radarTitle: '📊 4분면 가치관 적합도 분석',
    valuesSummaryTitle: '💡 AI 가치관 조율 조언:',
    peerGalleryTitle: '📸 상대방 일상 갤러리',
    ownGalleryTitle: '📸 나의 일상 갤러리',
    editBtn: '편집',
    userSuffix: ' 님',
    koreaLoc: 'Seoul, South Korea 🇰🇷',
    japanLoc: 'Tokyo, Japan 🇯🇵',
    alertVerifyPassport: '여권 정보 및 본인 확인 검증 완료',
    alertInterestSent: ' 님에게 관심 핑(Contextual Ping)을 발송했습니다.',
    alertIntroRequest: '담당 커플 매니저에게 주선 인터뷰를 접수했습니다.',
    chatManagerTitle: '🌸 1:1 컨시어지 상담',
    badgeRequestTitle: '🔒 상호주의 배지 공개 요청',
    badgeRequestDesc: '상대방에게 배지 잠금 해제 동의 요청을 발송합니다.\n"상호주의 원칙"에 따라 회원님께서도 해당 정보(인증 배지)가 활성화되어 있어야 상호 열람이 가능합니다.',
    sendLangSelect: '발송 언어 선택 (전송 문구 확인):',
    cancel: '취소',
    sendRequest: '요청 발송 🚀',
    matchingSuccess: '매칭이 성사되었습니다!',
    matchingSuccessDesc: '축하합니다! 두 분의 가치관 호합도가 기준치를 충족하여 매칭 터널이 활성화되었습니다.\n서로의 따뜻한 배려로 대화를 시작해 보세요.',
    startChatting: '대화 시작하기',
    secureCallTitle: '보안 영상통화 수신 중...',
    secureCallConnected: '🔒 보안 채널 연결 수립 완료',
    secureCallConnectedDesc: '상대방과의 영상통화 보안 채널이 성공적으로 열렸습니다. 마이크 및 카메라 상태가 양호하며 실시간 AI 쉴드가 작동 중입니다.',
    secureCallEnd: '통화 종료',
    secureCallRejected: '영상 통화 연결이 거절되었습니다.',
    secureCallRejectBtn: '통화 거절',
    secureCallAcceptBtn: '통화 수락',
    filterTitle: '🔍 매칭 가치관 필터 설정',
    filterAgeLabel: '1. 희망 나이대 범위',
    filterAgeAll: '전체',
    filterAge20: '20대',
    filterAge30: '30대',
    filterAge40: '40대',
    filterLocLabel: '2. 결혼 후 거주지 이동 유연성',
    filterLocAny: '상관없음 (상대방 위치 우선)',
    filterLocJapan: '일본으로 거주지 이동 가능 🇯🇵',
    filterLocKorea: '한국으로 거주지 이동 희망 🇰🇷',
    filterApplyBtn: '필터 적용 및 닫기',
    filterAppliedMsg: '가치관 필터링 조건이 반영되었습니다.',
    ageSuffix: '세',
    sendInterest: '관심 보내기',
    requestIntro: '소개 요청하기',
    valuesMatch: '일치 💚',
    valuesConsult: '협의필요 ⚠️',
    valueChild: '자녀 계획',
    valueResidence: '거주지 선호',
    valueReligion: '종교적 호환',
    valueFinance: '재정/경제관',
    valueAILink: '거주지(일본 이주)에 대해 약간의 조율이 필요하나, 자녀 계획과 종교관이 극도로 일치합니다. 상대방에게 다정하게 대화를 열어보세요.',
    langKo: '한국어 🇰🇷',
    langJa: '일본어 🇯🇵',
    chatPlaceholder: '매니저에게 조언을 구해보세요 (예: 가치관 조정)',
    send: '전송',
    aiMatchingRate: 'AI 매칭률',
    aiMatchingDesc: '한일 매칭 인공지능이 회원님의 가치관 성향을 심층 분석했습니다.',
    trendAlignmentTitle: '📈 Trend Alignment (부부 성향 부합도)',
    trendAlignmentDesc: '성공적인 한일 부부들의 맞벌이 및 커리어 지향 패턴과의 일치도 분석',
    ourCompatibility: '우리 부합도',
    averageSuccessCouples: '성공부부 평균',
    deepValuesTitle: '🔑 Deep Values (핵심 성향 호합)',
    commOrientation: '의사소통 성향',
    residenceFlex: '거주지 협의 유연성',
    religionAccept: '종교적 상호 수용도',
    hiddenAffinitiesTitle: '✨ Hidden Affinities (숨겨진 취향 발견)',
    hiddenAffinitiesDesc: 'AI가 두 분의 프로필 데이터 이면에서 매칭해 낸 숨은 호감 포인트',
    hiddenAffCafe: '☕ 조용한 주말 카페',
    hiddenAffDrama: '📺 J-Pop/K-Drama 공유',
    hiddenAffWalk: '⛰️ 한적한 자연 산책 선호',
    hiddenAffCooking: '🍳 홈쿠킹 & 일어/한글 교환',
    startSafeChat: '안전 대화 시작 (Start Safe Chat)',
    filterTabBasic: '기본 조건',
    filterTabValues: '결정사 가치관',
    filterLangSkillLabel: '3. 상대방 언어 구사 수준',
    filterVerifiedOnlyLabel: '공식 인증 완료 회원만 보기',
    filterVerifiedOnlyDesc: '혼인·재직·학력 서류 심사가 통과된 안심 계정만 매칭합니다. (프리미엄 👑)',
    filterChildPlanLabel: '자녀 계획 조건',
    filterDualIncomeLabel: '맞벌이 지향성',
    filterReligionLabel: '희망 상대 종교관',
    paywallTitle: '👑 프리미엄 멤버십 전용 기능',
    paywallDesc: '공식 서류 인증 회원 전용 매칭 필터는 프리미엄 멤버십 전용 기능입니다. 가상 가입 후 즉시 이용해 보세요!',
    paywallBtn: '프리미엄 즉시 업그레이드 (무료)',
    paywallSuccess: '프리미엄 업그레이드가 성공적으로 처리되었습니다!',
    filterSelectAny: '전체(상관없음)',
    filterLangBasic: '기초 대화 가능 이상',
    filterLangIntermediate: '일상 회화 가능 이상',
    filterLangFluent: '비즈니스 및 원활',
    filterChildDiscuss: '협의 가능',
    filterChildWant: '자녀 원함',
    filterChildNo: '자녀 원치 않음',
    filterDualYes: '맞벌이 희망',
    filterDualNo: '외벌이 선호',
    filterDualFlexible: '유연함',
    religionNone: '무교',
    religionChristian: '개신교',
    religionBuddhist: '불교',
    religionCatholic: '천주교',
    religionOther: '기타',
    consentLabel: '이용약관 및 개인정보 처리방침 동의',
    viewTos: '[약관 보기]',
    viewPrivacy: '[개인정보]',
    viewRefund: '[환불정책]',
    viewTokushoho: '[상거래법]',
    legalModalTitle: '법적 문서 열람',
  },
  ja: {
    appName: 'Hana-Il Match',
    subtitle: '日韓特化型価値観マッチング＆リアルタイムAIコンシェルジュ',
    start: '始める (Login / Sign Up)',
    tagline: '価値観に基づく真剣な日韓縁結びマッチング',
    loginTitle: 'Hana-Il Match ログイン',
    emailLabel: 'メールアドレス',
    passwordLabel: 'パスワード',
    demoBtn: 'デモアカウント自動入力',
    loginBtn: 'ログイン 🚀',
    noAccount: 'アカウントをお持ちでないですか？会員登録 🌸',
    signupTitle: 'Hana-Il Match 会員登録',
    signupSubtitle: '満19歳未満(韓国)及び満18歳未満(日本)の利用制限',
    nicknameLabel: 'ニックネーム (活動名)',
    birthdateLabel: '生年月日 (YYYY-MM-DD)',
    countryLabel: '居住国 (法的規制適用):',
    koreaBtn: '大韓民国 🇰🇷',
    japanBtn: '日本 🇯🇵',
    signupBtn: '登録申請 🚀',
    hasAccount: 'すでにアカウントをお持ちですか？ログイン 🔑',
    voiceRoomTitle: '超低遅延 1:1 ボイスルーム',
    voiceRoomDesc: 'リアルタイムGemini 3.5 AIガードが詐欺やスキャンから保護します。',
    signalStatus: '現在のゲートウェイ信号状態',
    startVoiceBtn: 'リアルタイムボイスデートマッチング開始',
    endVoiceBtn: '電話終了及び待機室復帰',
    ownBadgeTitle: '🛡️ 有効な私の信頼バッジ (有効期限)',
    badgeId: '身元 (1年)',
    badgeJob: '職場 (6ヶ月)',
    badgeSingle: '独身 (3ヶ月)',
    badgeEdu: '学歴 (無制限)',
    filterBtn: '価値観フィルター設定 🔍',
    conciergeBtn: 'コンシェルジュ相談',
    peerTitle: '相手メイト',
    compatTitle: '相性度',
    radarTitle: '📊 4象限価値観適合度分析',
    valuesSummaryTitle: '💡 AI価値観調整のアドバイス:',
    peerGalleryTitle: '📸 相手の日常ギャラリー',
    ownGalleryTitle: '📸 私の日常ギャラリー',
    editBtn: '編集',
    userSuffix: ' さん',
    koreaLoc: 'ソウル、大韓民国 🇰🇷',
    japanLoc: '東京、日本 🇯🇵',
    alertVerifyPassport: 'パスポート情報及び本人確認検証完了',
    alertInterestSent: 'さんに関心のピング(Contextual Ping)を送信しました。',
    alertIntroRequest: '担当仲人マネージャーに紹介インタビューを受理しました。',
    chatManagerTitle: '🌸 1:1 コンシェルジュ相談',
    badgeRequestTitle: '🔒 相互主義バッジ公開リクエスト',
    badgeRequestDesc: '相手にバッジロック解除同意リクエストを送信します。\n「相互主義の原則」に基づき、会員様ご自身도該当情報（認証バッジ）が有効化されている場合のみ、相互閲覧が可能になります。',
    sendLangSelect: '送信言語選択 (送信メッセージ確認):',
    cancel: 'キャンセル',
    sendRequest: 'リクエスト送信 🚀',
    matchingSuccess: 'マッチングが成立しました！',
    matchingSuccessDesc: 'おめでとうございます！お二人の価値観適合度が基準値を満たし、マッチングトンネルが有効化されました。\nお互いの温かい気配りで会話を始めてみましょう。',
    startChatting: '会話を始める',
    secureCallTitle: 'セキュアビデオ通話受信中...',
    secureCallConnected: '🔒 セキュアチャネル接続確立完了',
    secureCallConnectedDesc: '相手とのビデオ通話セキュアチャネルが正常に開通しました。マイクとカメラの状態は良好で、リアルタイムAIシールドが作動しています。',
    secureCallEnd: '通話終了',
    secureCallRejected: 'ビデオ通話の接続が拒否されました。',
    secureCallRejectBtn: '通話拒否',
    secureCallAcceptBtn: '通話承諾',
    filterTitle: '🔍 マッチング価値観フィルター設定',
    filterAgeLabel: '1. 希望年齢層の範囲',
    filterAgeAll: 'すべて',
    filterAge20: '20代',
    filterAge30: '30代',
    filterAge40: '40代',
    filterLocLabel: '2. 結婚後の居住地移動の柔軟性',
    filterLocAny: 'どちらでもよい (相手の場所優先)',
    filterLocJapan: '日本へ居住地移動可能 🇯🇵',
    filterLocKorea: '韓国へ居住地移動希望 🇰🇷',
    filterApplyBtn: 'フィルター適用して閉じる',
    filterAppliedMsg: '価値観フィルター条件が反映されました。',
    ageSuffix: '歳',
    sendInterest: '関心を送る',
    requestIntro: '紹介をリクエストする',
    valuesMatch: '一致 💚',
    valuesConsult: '要協議 ⚠️',
    valueChild: '子どもの計画',
    valueResidence: '居住地の好み',
    valueReligion: '宗教の互換性',
    valueFinance: '財政・経済観',
    valueAILink: '居住地(日本移住)について少し調整が必要ですが、子どもの計画と宗教観が非常に一致しています。相手に優しく話しかけてみてください。',
    langKo: '韓国語 🇰🇷',
    langJa: '日本語 🇯🇵',
    chatPlaceholder: 'マネージャーにアドバイスを求めてみてください (例: 価値観調整)',
    send: '送信',
    aiMatchingRate: 'AIマッチング率',
    aiMatchingDesc: '日韓マッチング人工知能が会員様の価値観傾向を深く分析しました。',
    trendAlignmentTitle: '📈 Trend Alignment (夫婦の傾向適合度)',
    trendAlignmentDesc: '成功した日韓夫婦共働き・キャリア志向パターンとの一致度分析',
    ourCompatibility: '私たちの適合度',
    averageSuccessCouples: '成功夫婦の平均',
    deepValuesTitle: '🔑 Deep Values (核心傾向の適合)',
    commOrientation: '意思疎通の傾向',
    residenceFlex: '居住地協議의柔軟性',
    religionAccept: '宗教的相互受容度',
    hiddenAffinitiesTitle: '✨ Hidden Affinities (隠れた好みの発見)',
    hiddenAffinitiesDesc: 'AIがお二人のプロフィールデータの裏側からマッチングした隠れた好感ポイント',
    hiddenAffCafe: '☕ 静かな週末カフェ',
    hiddenAffDrama: '📺 J-Pop/K-Drama共有',
    hiddenAffWalk: '⛰️ 静かな自然散策の好み',
    hiddenAffCooking: '🍳 ホームクッキング＆日韓言語交換',
    startSafeChat: '安全な会話を開始 (Start Safe Chat)',
    filterTabBasic: '基本条件',
    filterTabValues: '決定事価値観',
    filterLangSkillLabel: '3. 相手の言語能力レベル',
    filterVerifiedOnlyLabel: '公式認証済みの会員のみ表示',
    filterVerifiedOnlyDesc: '婚姻・在職・学歴の書類審査を通過した安心アカウントのみマッチングします (プレミアム 👑)',
    filterChildPlanLabel: '子どもの計画条件',
    filterDualIncomeLabel: '共働きの志向性',
    filterReligionLabel: '希望する相手の宗教観',
    paywallTitle: '👑 プレミアムメンバーシップ専用機能',
    paywallDesc: '公式書類認証の会員専用マッチングフィルター는、プレミアムメンバーシップ専用の機能です。仮想登録後すぐにご利用いただけます！',
    paywallBtn: 'プレミアムへ即時アップグレード (無料)',
    paywallSuccess: 'プレミアムアップグレードが正常に処理されました！',
    filterSelectAny: 'すべて (どちらでもよい)',
    filterLangBasic: '基礎会話レベル以上',
    filterLangIntermediate: '日常会話レベル以上',
    filterLangFluent: 'ビジネス＆流暢レベル',
    filterChildDiscuss: '協議可能',
    filterChildWant: '子どもを希望する',
    filterChildNo: '子どもを希望しない',
    filterDualYes: '共働き希望',
    filterDualNo: '片働き（専業）希望',
    filterDualFlexible: '柔軟に対応',
    religionNone: '無宗教',
    religionChristian: 'キリスト教',
    religionBuddhist: '仏教',
    religionCatholic: 'カトリック',
    religionOther: 'その他',
    consentLabel: '利用規約および個人情報方針に同意',
    viewTos: '[規約を読む]',
    viewPrivacy: '[個人情報]',
    viewRefund: '[返金ポリシー]',
    viewTokushoho: '[特商法表記]',
    legalModalTitle: '法的文書の閲覧',
  }
};


// 소개팅 앱 번아웃 원인과 대안을 구현한 Matter.js 물리 시뮬레이션 HTML
const matterHtmlString = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Burnout Physics Sandbox</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #161420;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <script>
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    engine.gravity.y = 1.0;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    const render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: '#161420',
        showAngleIndicator: false
      }
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const wallThickness = 100;
    const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth * 2, wallThickness, { 
      isStatic: true,
      render: { visible: false }
    });
    const leftWall = Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, { 
      isStatic: true,
      render: { visible: false }
    });
    const rightWall = Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, { 
      isStatic: true,
      render: { visible: false }
    });
    const ceiling = Bodies.rectangle(canvasWidth / 2, -wallThickness / 2, canvasWidth * 2, wallThickness, { 
      isStatic: true,
      render: { visible: false }
    });

    Composite.add(world, [ground, leftWall, rightWall, ceiling]);

    const burnoutCauses = [
      "성비 8:2 & 무의미한 스와이프",
      "외모·스펙 줄세우기 평가",
      "가짜 프로필 & 챗봇 사기",
      "강제 매칭 및 환불 거부"
    ];

    const alternatives = [
      "공인 서류 기반 신원/혼인 인증",
      "가치관 중심 세미 블라인드 매칭",
      "소모적 대화 생략 & 즉시 약속",
      "당근마켓형 매너온도 평가"
    ];

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = "bold 13px 'Malgun Gothic', AppleSDGothicNeo, sans-serif";

    function getBlockSize(text) {
      const metrics = measureCtx.measureText(text);
      const paddingX = 30;
      const paddingY = 22;
      return {
        width: Math.max(metrics.width + paddingX, 130),
        height: 18 + paddingY
      };
    }

    burnoutCauses.forEach((text, i) => {
      const size = getBlockSize(text);
      const x = canvasWidth / 2 + (i - 1.5) * 60 + (Math.random() - 0.5) * 30;
      const y = -100 - i * 85;
      
      const causeBody = Bodies.rectangle(x, y, size.width, size.height, {
        density: 0.08,
        restitution: 0.1,
        friction: 0.6,
        render: {
          fillStyle: '#2A2830',
          strokeStyle: '#FF2E93',
          lineWidth: 2
        }
      });
      
      causeBody.customText = text;
      causeBody.customType = 'cause';
      causeBody.customWidth = size.width;
      causeBody.customHeight = size.height;
      Composite.add(world, causeBody);
    });

    alternatives.forEach((text, i) => {
      const size = getBlockSize(text);
      const x = canvasWidth / 2 + (i - 1.5) * 60 + (Math.random() - 0.5) * 30;
      const y = -500 - i * 85;
      
      const altBody = Bodies.rectangle(x, y, size.width, size.height, {
        density: 0.001,
        restitution: 0.8,
        friction: 0.2,
        render: {
          fillStyle: '#E8F5E9',
          strokeStyle: '#00F0FF',
          lineWidth: 2
        }
      });
      
      altBody.customText = text;
      altBody.customType = 'alternative';
      altBody.customWidth = size.width;
      altBody.customHeight = size.height;
      Composite.add(world, altBody);
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    Events.on(render, 'afterRender', () => {
      const context = render.context;
      const bodies = Composite.allBodies(world);

      bodies.forEach(body => {
        if (!body.customText) return;

        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);

        context.font = "bold 13px 'Malgun Gothic', AppleSDGothicNeo, sans-serif";
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        if (body.customType === 'cause') {
          context.fillStyle = '#FF5252';
        } else {
          context.fillStyle = '#161420';
        }

        context.fillText(body.customText, 0, 0);
        context.restore();
      });
    });

    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
      render.options.width = newWidth;
      render.options.height = newHeight;

      Body.setPosition(ground, { x: newWidth / 2, y: newHeight + wallThickness / 2 });
      Body.setPosition(leftWall, { x: -wallThickness / 2, y: newHeight / 2 });
      Body.setPosition(rightWall, { x: newWidth + wallThickness / 2, y: newHeight / 2 });
      Body.setPosition(ceiling, { x: newWidth / 2, y: -wallThickness / 2 });
    });
  </script>
</body>
</html>
`;


export default function App() {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'korean' | 'fan'>('fan');
  const [isRegistered, setIsRegistered] = useState(false);

  // 로그인 및 회원가입 관련 신규 상태 변수
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'tos' | 'privacy' | 'refund' | 'tokushoho'>('tos');
  
  // 로그인 인풋
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 인풋
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupBirthdate, setSignupBirthdate] = useState('1995-05-15'); // YYYY-MM-DD 포맷
  const [signupCountry, setSignupCountry] = useState<'KR' | 'JP'>('KR');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [lang, setLang] = useState<'ko' | 'ja'>('ko');

  const t = (key: keyof typeof TRANSLATIONS.ko) => {
    const dict = TRANSLATIONS[lang] as typeof TRANSLATIONS.ko;
    return dict[key] || TRANSLATIONS.ko[key];
  };

  // 로그인 요청 핸들러
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setIsSubmittingAuth(true);
    try {
      const response = await fetch('http://127.0.0.1:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '로그인 실패');
      }

      setUserId(data.userId);
      setUserName(data.userName);
      setUserRole(data.country === 'KR' ? 'korean' : 'fan');
      setLang(data.country === 'KR' ? 'ko' : 'ja'); // Auto Locale Sync
      setProfileCompleted(data.profileCompleted);
      setIsRegistered(true);
      setIsLoggedIn(true);
      Alert.alert('로그인 성공', `${data.userName}님, 환영합니다!`);
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '네트워크 연결 상태를 확인해 주세요.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // 회원가입 요청 핸들러
  const handleSignup = async () => {
    if (!consentChecked) {
      Alert.alert(
        lang === 'ko' ? '동의 필요' : '同意が必要',
        lang === 'ko' ? '이용약관 및 개인정보 처리방침에 동의하셔야 가입이 가능합니다.' : '利用規約および個人情報保護方針に同意する必要があります。'
      );
      return;
    }

    if (!signupEmail.trim() || !signupPassword.trim() || !signupName.trim() || !signupBirthdate.trim()) {
      Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
      return;
    }
    
    // 생년월일 포맷 정규식 체크 (YYYY-MM-DD)
    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdateRegex.test(signupBirthdate)) {
      Alert.alert('입력 에러', '생년월일 형식은 YYYY-MM-DD 여야 합니다.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const response = await fetch('http://127.0.0.1:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          userName: signupName,
          birthdate: signupBirthdate,
          country: signupCountry,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '회원가입 실패');
      }

      Alert.alert('가입 완료', '회원가입에 성공했습니다! 로그인 화면에서 로그인해 주세요.', [
        {
          text: '확인',
          onPress: () => {
            setIsSignupMode(false);
            setLoginEmail(signupEmail);
            setLoginPassword(signupPassword);
            setLang(signupCountry === 'KR' ? 'ko' : 'ja'); // Auto Locale Sync
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('회원가입 제한', error.message || '가입 도중 에러가 발생했습니다.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // 데모 계정 자동 입력 편의 기능
  const handleFillDemoAccount = () => {
    setLoginEmail('test@test.com');
    setLoginPassword('123456');
  };
  
  // 신규 상세 프로필 제어 상태 변수
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userBadges, setUserBadges] = useState<any>({
    identityVerified: false,
    employmentVerified: false,
    maritalStatusVerified: false,
    educationVerified: false,
    identityExpiredAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
    employmentExpiredAt: new Date(Date.now() + 180*24*60*60*1000).toISOString(),
    maritalStatusExpiredAt: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
    educationExpiredAt: new Date(Date.now() + 365*24*60*60*1000).toISOString()
  });
  const [peerProfile, setPeerProfile] = useState<any>(null);

  // 컨시어지 상담사 채팅 상태
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [conciergeMessages, setConciergeMessages] = useState<Array<{ sender: 'user' | 'concierge' | 'system', text: string }>>([
    { sender: 'concierge', text: '안녕하세요! Hana-Il Marriage Match 전담 커플매니저(컨시어지)입니다. 두 분의 가치관 호환성에 대해 조언이 필요하시거나, 프로필 열람을 위한 대화 가이드가 필요하면 말씀해 주세요! 🌸' }
  ]);
  const [newConciergeMsg, setNewConciergeMsg] = useState('');

  // 탭 동의요청 다이얼로그 상태
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetBadge, setRequestTargetBadge] = useState<string>(''); // 'employment' | 'marital' | 'education'
  const [requestLanguage, setRequestLanguage] = useState<'ko' | 'ja'>('ko');

  // AI 매칭 상세 분석 모달 상태
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const [roomId, setRoomId] = useState('k-wave-match-room-1');
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('대기 중...');
  const [peerId, setPeerId] = useState<string | null>(null);
  
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // [통합 개발 상태 변수: 1, 2, 3단계]
  const [showSplash, setShowSplash] = useState(true);
  const [userGallery, setUserGallery] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAge, setFilterAge] = useState<'all' | '20s' | '30s' | '40s'>('all');
  const [filterLocFlex, setFilterLocFlex] = useState<'any' | 'japan' | 'korea'>('any');
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);

  // [결정사 고도화 매칭 필터 상태 변수]
  const [filterLanguage, setFilterLanguage] = useState<'any' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT'>('any');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterChildPlan, setFilterChildPlan] = useState<'any' | 'WANT_CHILDREN' | 'NO_CHILDREN' | 'DISCUSS'>('any');
  const [filterDualIncome, setFilterDualIncome] = useState<'any' | 'YES' | 'NO' | 'FLEXIBLE'>('any');
  const [filterReligion, setFilterReligion] = useState<'any' | 'NONE' | 'CHRISTIAN' | 'BUDDHIST' | 'CATHOLIC' | 'OTHER'>('any');
  const [activeFilterTab, setActiveFilterTab] = useState<'basic' | 'values'>('basic');
  const [membershipType, setMembershipType] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [ownLanguageSkill, setOwnLanguageSkill] = useState<'BASIC' | 'INTERMEDIATE' | 'FLUENT'>('BASIC');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // 신규 하트 잔액 및 eKYC Pulse 애니메이션 상태
  const [userHearts, setUserHearts] = useState<number>(10);
  const ekycPulseAnim = useRef(new Animated.Value(0.4)).current;
  
  const waveAnim = useRef(new Animated.Value(1)).current;
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const fetchOwnProfileAndBadges = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/user/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile?.verificationBadges) {
          setUserBadges(data.profile.verificationBadges);
        }
        if (data.profile?.languageSkill) {
          setOwnLanguageSkill(data.profile.languageSkill);
        }
      }

      // 지갑 및 프리미엄 멤버십 상태 조회
      const walletRes = await fetch(`http://127.0.0.1:3000/api/billing/wallet/${userId}`);
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        if (walletData.wallet?.membershipType) {
          setMembershipType(walletData.wallet.membershipType);
        }
        if (walletData.wallet?.hearts !== undefined) {
          setUserHearts(walletData.wallet.hearts);
        }
      }
    } catch (err) {
      console.warn('프로필 배지 및 지갑 조회 실패:', err);
    }
  };

  const handleUpgradeToPremium = async () => {
    if (!userId) return;
    setIsUpgrading(true);
    try {
      const response = await fetch('http://127.0.0.1:3000/api/billing/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          amount: 0,
          isUpgrade: true
        })
      });

      if (response.ok) {
        setMembershipType('PREMIUM');
        setIsUpgradeModalOpen(false);
        setFilterVerifiedOnly(true);
        Alert.alert(lang === 'ko' ? '성공' : '成功', t('paywallSuccess'));
      }
    } catch (e) {
      console.warn('프리미엄 업그레이드 실패:', e);
    } finally {
      setIsUpgrading(false);
    }
  };

  const fetchPeerProfile = async (id: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/profile/${id}?viewerUserId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPeerProfile(data.profile);
      }
    } catch (err) {
      console.warn('상대방 프로필 로드 실패:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOwnProfileAndBadges();
    }
  }, [userId, isEditMode]);

  useEffect(() => {
    if (peerId) {
      fetchPeerProfile(peerId);
    } else {
      setPeerProfile(null);
    }
  }, [peerId]);

  useEffect(() => {
    if (inCall && peerId) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1.6,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      waveAnim.setValue(1);
    }
  }, [inCall, peerId]);

  const connectSocket = () => {
    if (!userId) return;

    const serverUrl = 'ws://127.0.0.1:3000'; 
    setCallStatus('매칭 게이트웨이에 터널링 개설 중...');

    try {
      ws.current = new WebSocket(serverUrl);

      ws.current.onopen = () => {
        setCallStatus('서버 연결 완료! 매칭 대기열 합류 중...');
        ws.current?.send(JSON.stringify({
          event: 'join_call',
          roomId,
          userId,
          filterOptions: {
            filterAge,
            filterLocFlex,
            filterLanguage,
            filterVerifiedOnly
          }
        }));
      };

      ws.current.onmessage = async (e) => {
        try {
          const payload = JSON.parse(e.data);
          const { event, peerId: connectedPeer, alert: aiAlert, reason, data: audioData } = payload;

          switch (event) {
            case 'joined':
              setCallStatus('상대방 한류 메이트를 찾고 있습니다...');
              break;
            case 'peer_connected':
              setPeerId(connectedPeer);
              setCallStatus('🎉 매칭 성공! 연결 수립 중...');
              setShowCongratsModal(true);
              
              if (ws.current) {
                try {
                  await AudioStreamer.startStreaming(ws.current, roomId, userId);
                  setCallStatus('🎙️ 실시간 보이스 데이트 & AI 스캠 레이더 감시 중');
                } catch (streamError) {
                  setCallStatus('⚠️ 마이크 스트리밍 오류');
                }
              }
              break;
            case 'peer_disconnected':
              setPeerId(null);
              setCallStatus('통화가 종료되었습니다. 새 매칭을 돌려보세요!');
              AudioStreamer.stopStreaming();
              break;
            case 'ai_guard_alert':
              if (aiAlert === 'WARN_SCAM') {
                setBannerMessage(`🚨 AI 실시간 감시: ${reason} (금전 정보 양도 절대 금지!)`);
                setBannerVisible(true);
              } else if (aiAlert === 'TERMINATE_CALL') {
                Alert.alert(
                  '🚨 계정 보호 강제 종료',
                  `AI 안전 가드가 심각한 이상 징후(${reason})를 포착하여 통화를 안전하게 강제 차단했습니다.`,
                  [{ text: '확인', onPress: () => disconnectSocket() }]
                );
              }
              break;
            case 'audio_stream':
              if (audioData) {
                AudioStreamer.playReceivedAudioChunk(audioData);
              }
              break;
            case 'system_error':
              setCallStatus(`에러: ${payload.message}`);
              break;
          }
        } catch (err) {
          console.warn('수신 데이터 디코딩 에러:', err);
        }
      };

      ws.current.onerror = () => {
        setCallStatus('네트워크 연결이 지연되고 있습니다.');
      };

      ws.current.onclose = () => {
        setCallStatus('연결이 해제되었습니다.');
        setInCall(false);
        setPeerId(null);
        AudioStreamer.stopStreaming();
      };

    } catch (error) {
      setCallStatus('연결 게이트웨이 기동 실패');
      console.error(error);
    }
  };

  const disconnectSocket = () => {
    AudioStreamer.stopStreaming();
    if (ws.current) {
      ws.current.send(JSON.stringify({ event: 'leave_call', roomId, userId }));
      ws.current.close();
      ws.current = null;
    }
    setInCall(false);
    setPeerId(null);
    setBannerVisible(false);
    setCallStatus('대기 중...');
  };

  const handleRegister = () => {
    if (!userName.trim()) {
      Alert.alert('알림', '매칭에 사용할 메이트 이름을 써주세요!');
      return;
    }
    setUserId(`user_${Date.now()}`);
    setIsRegistered(true);
  };

  // 컨시어지 채팅 전송 함수
  const sendConciergeMessage = () => {
    if (!newConciergeMsg.trim()) return;
    const userMsg = newConciergeMsg;
    setConciergeMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setNewConciergeMsg('');

    // AI 자동 응답 지연 시뮬레이션
    setTimeout(() => {
      let aiReply = '대표님, 매칭 상대를 사로잡는 경어체를 추천해 드립니다! "바쁘신 와중에 답장 주셔서 감사합니다(お忙しい中ご返信いただきありがとうございます)"라고 건네보세요.';
      if (userMsg.includes('적합도') || userMsg.includes('조정')) {
        aiReply = '현재 두 분은 종교 가치관(개신교-무교)에서 약간의 입장 차이가 있습니다. "종교 활동은 서로의 생활 패턴을 존중하며 강요하지 않는다"는 양해 각서를 가볍게 나누시면 결혼 적합도가 95%까지 올라갑니다!';
      } else if (userMsg.includes('배지') || userMsg.includes('공개')) {
        aiReply = '상대방의 배지가 🔒(Locked)로 보인다면, 탭하여 정중한 일본어 경어(Keigo) 메시지를 보내 공개를 유도하시는 편이 가장 빠릅니다. 저희 컨시어지가 즉시 정중한 요청 카드를 보냅니다.';
      }
      setConciergeMessages(prev => [...prev, { sender: 'concierge', text: aiReply }]);
    }, 1000);
  };

  // 배지 공개 요청 보내기
  const sendBadgePermissionRequest = (badgeType: string, lang: 'ko' | 'ja') => {
    const badgeNameMap: any = {
      employment: { ko: '재직(💼) 정보', ja: '在職(💼)情報' },
      marital: { ko: '미혼/혼인관계(💍) 정보', ja: '独身(💍)証明' },
      education: { ko: '학력(🎓) 정보', ja: '学歴(🎓)情報' }
    };
    const badgeName = badgeNameMap[badgeType]?.[lang] || badgeType;

    const messageTemplate = lang === 'ja'
      ? `【컨시어지 매너 알림】 상대방으로부터 ${badgeName}에 대한 상호 공개 요청이 도착했습니다. "상호주의 원칙"에 의거하여 양측 동의 시 정보를 서로 열람할 수 있습니다. 동의하시겠습니까?`
      : `【コンシェルジュ通知】 相手から${badgeName}の相互公開リクエストが届きました。「相互主義の原則」に基づき、お互いに同意すると閲覧可能になります。同意しますか？`;

    // 시스템 메시지 형태로 전송하는 척 시뮬레이션
    setConciergeMessages(prev => [
      ...prev, 
      { sender: 'system', text: `상대방에게 배지 상호 열람 동의 메시지(Keigo)를 전송했습니다: \n"${messageTemplate}"` }
    ]);
    setIsRequestModalOpen(false);
    Alert.alert('요청 전송 완료', '상대방에게 정중한 경어체 동의 요청이 발송되었습니다.');
  };

  // 상세 프로필 백엔드 API 연동 저장 처리
  const saveDetailedProfile = async (profileData: any) => {
    setIsSavingProfile(true);
    try {
      const response = await fetch('http://127.0.0.1:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profileData
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || resJson.error || '저장 실패');
      }

      setProfileCompleted(true);
      setIsEditMode(false);
      if (profileData.gallery) {
        setUserGallery(profileData.gallery);
      }
      // 내 배지 현황 업데이트
      if (profileData.religion) {
        setUserBadges((prev: any) => ({
          ...prev,
          identityVerified: true, // 상세입력 시 기본인증 완료로 처리
          employmentVerified: true,
          maritalStatusVerified: true
        }));
      }
      Alert.alert('성공', '상세 프로필 정보가 성공적으로 반영되었습니다!');
    } catch (error: any) {
      Alert.alert('프로필 저장 실패', error.message || '네트워크 상태를 확인해 주세요.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- 신규 백엔드 연동 관련 상태 변수 및 헬퍼 함수군 신설 ---
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [privacyExclusion, setPrivacyExclusion] = useState(false);
  const [iseKYCOpen, setIseKYCOpen] = useState(false);
  const [ekycPassportNo, setEkycPassportNo] = useState('');
  const [ekycStatus, setEkycStatus] = useState<'NONE' | 'PENDING' | 'APPROVED'>('NONE');
  const [reservations, setReservations] = useState<any[]>([]);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedReserveDate, setSelectedReserveDate] = useState<string>('2026-06-26 19:00');
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');

  // eKYC 심사 대기(PENDING) 시 주황색 Pulse 애니메이션 트리거
  useEffect(() => {
    if (ekycStatus === 'PENDING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ekycPulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(ekycPulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      ekycPulseAnim.setValue(1.0);
    }
  }, [ekycStatus]);

  // 1. 추천 메이트 목록 로드
  const loadRecommendations = async () => {
    if (!userId) return;
    try {
      const response = await fetch('http://127.0.0.1:3000/api/match/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          filterOptions: {
            filterAge,
            filterLocFlex,
            filterLanguage,
            filterVerifiedOnly,
            filterChildPlan,
            filterDualIncome,
            filterReligion
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.warn('추천 메이트 로드 실패:', e);
    }
  };

  // 2. 프라이버시 설정 로드
  const loadPrivacySettings = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/user/profile/${userId}`);
      const data = await response.json();
      if (data.success && data.profile) {
        // 백엔드의 privacySettings가 있다면 바인딩
        setEkycStatus(data.profile.ekycStatus || 'NONE');
      }
    } catch (e) {
      console.warn('프로필 및 프라이버시 로드 실패:', e);
    }
  };

  // 3. 프라이버시 설정 저장
  const savePrivacySettings = async () => {
    if (!userId) return;
    try {
      const response = await fetch('http://127.0.0.1:3000/api/privacy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          settings: {
            consentCompatibilityOpen: privacyConsent,
            exclusionList: privacyExclusion ? ['OSAKA', 'TOKYO'] : []
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert(lang === 'ko' ? '성공' : '成功', lang === 'ko' ? '프라이버시 설정이 변경되었습니다.' : 'プライバシー設定が更新されました。');
        setIsPrivacyOpen(false);
      }
    } catch (e) {
      Alert.alert('에러', '프라이버시 저장에 실패했습니다.');
    }
  };

  // 4. eKYC 여권 서류 제출
  const submiteKYCDocument = async () => {
    if (!userId || !ekycPassportNo.trim()) {
      Alert.alert('알림', '여권 번호를 입력해 주세요.');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:3000/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          docType: 'PASSPORT',
          docNumber: ekycPassportNo
        })
      });
      const data = await response.json();
      if (data.success) {
        setEkycStatus('PENDING');
        setEkycPassportNo('');
        setIseKYCOpen(false);
        Alert.alert(
          lang === 'ko' ? '제출 완료' : '提出完了', 
          lang === 'ko' ? 'eKYC 본인 확인 서류가 제출되어 심사 대기 중입니다.' : 'eKYC本人確認書類が提出され、審査待ち状態です。'
        );
        // 가상 관리자 자동 승인 시뮬레이션 (E2E EKYC 테스트용 대응 - 5초 뒤 자동 APPROVED 전환)
        setTimeout(async () => {
          try {
            await fetch('http://127.0.0.1:3000/api/admin/verification/review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, isApproved: true })
            });
            setEkycStatus('APPROVED');
            setUserBadges((prev: any) => ({ ...prev, identityVerified: true }));
          } catch (err) {}
        }, 5000);
      }
    } catch (e) {
      Alert.alert('에러', '서류 제출에 실패했습니다.');
    }
  };

  // 5. 내 미팅 예약 목록 로드
  const loadReservations = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/concierge/reports?userId=${userId}`); // 임시로 매니저 리포트 수신으로 mock
      // 실제 미팅 데이터는 로컬 인메모리 기반으로 로드
      setReservations([
        {
          reservationId: 'meet_demo_1',
          callerId: 'user_rec_01',
          calleeId: userId,
          proposedTimes: [new Date(Date.now() + 24*60*60*1000), new Date(Date.now() + 48*60*60*1000)],
          status: 'PENDING',
          roomId: 'room_live_demo_1',
          useAiTranslation: true
        }
      ]);
    } catch (e) {
      console.warn('예약 정보 로딩 실패:', e);
    }
  };

  // 6. 예약 수락 및 확정
  const handleConfirmReservation = async (resId: string, timeIdx: number) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/meeting/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: resId,
          chosenTimeIndex: timeIdx,
          calleeId: userId
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert(lang === 'ko' ? '예약 확정' : '予約確定', lang === 'ko' ? '미팅 예약이 확정되었습니다.' : 'ミーティング予約が確定しました。');
        setReservations(prev => prev.map(r => r.reservationId === resId ? { ...r, status: 'CONFIRMED', confirmedTime: r.proposedTimes[timeIdx] } : r));
      }
    } catch (e) {
      Alert.alert('에러', '예약 확정에 실패했습니다.');
    }
  };

  // 7. 예약 신청 제안
  const handleRequestReservation = async () => {
    if (!userId || !selectedPeerId) return;
    try {
      const dates = [new Date(selectedReserveDate), new Date(new Date(selectedReserveDate).getTime() + 24*60*60*1000)];
      const response = await fetch('http://127.0.0.1:3000/api/meeting/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: userId,
          calleeId: selectedPeerId,
          proposedTimes: dates,
          useAiTranslation: true
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert(lang === 'ko' ? '제안 완료' : '提案完了', lang === 'ko' ? '상대방에게 미팅 스케줄 제안을 전송했습니다.' : 'お相手にスケジュール提案を送信しました。');
        setIsReserveModalOpen(false);
      }
    } catch (e) {
      Alert.alert('에러', '예약 제안 전송에 실패했습니다.');
    }
  };

  // 8. 보이스 매칭 / 통화 시 하트 소진 통합 트리거
  const handleTriggerCall = async () => {
    if (!userId) return;
    try {
      // 통화 권한 및 하트 차감 처리
      const response = await fetch('http://127.0.0.1:3000/api/billing/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: -1, // 하트 1개 소모
          isUpgrade: false
        })
      });
      const data = await response.json();
      if (data.success) {
        setUserHearts(data.wallet.hearts);
        setInCall(true);
        connectSocket();
      } else {
        // 하트 소모 실패 시 (하트 0개인 경우 등) 페이월 띄움
        setIsUpgradeModalOpen(true);
      }
    } catch (err) {
      // fallback
      setInCall(true);
      connectSocket();
    }
  };

  // 9. 로그인 직후 및 필터 변경 시 자동 동기화 훅
  useEffect(() => {
    if (isLoggedIn && userId) {
      loadRecommendations();
      loadPrivacySettings();
      loadReservations();
    }
  }, [
    isLoggedIn, 
    userId,
    filterAge,
    filterLocFlex,
    filterLanguage,
    filterVerifiedOnly,
    filterChildPlan,
    filterDualIncome,
    filterReligion
  ]);



  if (showSplash) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <View style={styles.outerWrapper}>
          <SafeAreaView style={styles.container}>
            <View style={styles.splashContainer}>
              {/* Language toggle at top right */}
              <TouchableOpacity
                onPress={() => setLang(prev => prev === 'ko' ? 'ja' : 'ko')}
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 20,
                  zIndex: 999,
                  backgroundColor: 'rgba(24, 21, 36, 0.85)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.accent,
                }}
              >
                <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: 'bold' }}>
                  {lang === 'ko' ? '🇰🇷 KO' : '🇯🇵 JA'}
                </Text>
              </TouchableOpacity>
              <Image 
                source={require('./assets/splash_hero.png')} 
                style={styles.splashHeroImage} 
                resizeMode="cover"
              />
              <View style={styles.splashContent}>
                <Text variant="headlineMedium" style={styles.splashTitle}>{t('appName')} 🇯🇵🇰🇷</Text>
                <Text variant="bodyLarge" style={styles.splashSubtitle}>{t('tagline')}</Text>
                
                <View style={styles.splashActionRow}>
                  <Button 
                    mode="contained" 
                    buttonColor={theme.colors.primary} 
                    textColor="#0D0B14"
                    onPress={() => setShowSplash(false)}
                    style={styles.splashButton}
                  >
                    {t('start')}
                  </Button>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <View style={styles.outerWrapper}>
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {isLoggedIn && (
                <IconButton
                  icon="menu"
                  iconColor={theme.colors.primary}
                  size={26}
                  onPress={() => setIsDrawerOpen(true)}
                />
              )}
              <Text variant="headlineMedium" style={styles.titleText}>{t('appName')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Button
                mode="text"
                textColor={theme.colors.accent}
                onPress={() => setLang(prev => prev === 'ko' ? 'ja' : 'ko')}
                style={{ minWidth: 60, marginRight: -6 }}
                labelStyle={{ fontSize: 12, fontWeight: 'bold' }}
              >
                {lang === 'ko' ? '🇰🇷 KO' : '🇯🇵 JA'}
              </Button>
              <IconButton
                icon="account-question-outline"
                iconColor={theme.colors.accent}
                size={26}
                onPress={() => setIsConciergeOpen(true)}
              />
            </View>
          </View>
          <Text variant="bodySmall" style={styles.subtitleText}>{t('subtitle')}</Text>
        </View>

        <Banner
          visible={bannerVisible}
          actions={[
            {
              label: '주의 사항 확인 완료',
              onPress: () => setBannerVisible(false),
              textColor: theme.colors.accent,
            },
          ]}
          icon={({ size }) => (
            <Avatar.Icon size={size} icon="shield-lock" style={{ backgroundColor: theme.colors.error }} />
          )}
          style={styles.banner}
        >
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </Banner>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!isLoggedIn ? (
            isSignupMode ? (
              <Card style={styles.card} mode="elevated">
                <Card.Title 
                  title={t('signupTitle')} 
                  subtitle={t('signupSubtitle')} 
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                />
                <Card.Content style={{ marginTop: 8 }}>
                  <TextInput
                    label={t('emailLabel')}
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    mode="outlined"
                    textColor="#FFF"
                    activeOutlineColor={theme.colors.accent}
                    outlineColor="#2D2B3B"
                    theme={{ colors: { background: '#181524' } }}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <TextInput
                    label={t('passwordLabel')}
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                    mode="outlined"
                    textColor="#FFF"
                    activeOutlineColor={theme.colors.accent}
                    outlineColor="#2D2B3B"
                    theme={{ colors: { background: '#181524' } }}
                    style={styles.input}
                    secureTextEntry
                  />

                  <TextInput
                    label={t('nicknameLabel')}
                    value={signupName}
                    onChangeText={setSignupName}
                    mode="outlined"
                    textColor="#FFF"
                    activeOutlineColor={theme.colors.accent}
                    outlineColor="#2D2B3B"
                    theme={{ colors: { background: '#181524' } }}
                    style={styles.input}
                  />

                  <TextInput
                    label={t('birthdateLabel')}
                    value={signupBirthdate}
                    onChangeText={setSignupBirthdate}
                    mode="outlined"
                    textColor="#FFF"
                    activeOutlineColor={theme.colors.accent}
                    outlineColor="#2D2B3B"
                    theme={{ colors: { background: '#181524' } }}
                    style={styles.input}
                    placeholder={lang === 'ko' ? '예: 1995-05-15' : '例: 1995-05-15'}
                  />

                  <Text style={styles.label}>{t('countryLabel')}</Text>
                  <View style={styles.roleContainer}>
                    <Button 
                      mode={signupCountry === 'KR' ? 'contained' : 'outlined'} 
                      onPress={() => setSignupCountry('KR')}
                      style={styles.roleButton}
                      buttonColor={signupCountry === 'KR' ? theme.colors.primary : undefined}
                      textColor={signupCountry === 'KR' ? '#0D0B14' : theme.colors.primary}
                    >
                      {t('koreaBtn')}
                    </Button>
                    <Button 
                      mode={signupCountry === 'JP' ? 'contained' : 'outlined'} 
                      onPress={() => setSignupCountry('JP')}
                      style={styles.roleButton}
                      buttonColor={signupCountry === 'JP' ? theme.colors.secondary : undefined}
                      textColor={signupCountry === 'JP' ? '#FFF' : theme.colors.primary}
                    >
                      {t('japanBtn')}
                    </Button>
                  </View>

                  {/* 약관 동의 체크박스 & 링크 버튼 신설 */}
                  <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: '#2D2B3B', paddingTop: 16 }}>
                    <TouchableOpacity 
                      onPress={() => setConsentChecked(!consentChecked)} 
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                      <IconButton 
                        icon={consentChecked ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                        iconColor={consentChecked ? theme.colors.accent : '#8A869F'} 
                        size={24} 
                        style={{ margin: 0, padding: 0 }} 
                      />
                      <Text style={{ color: '#FFF', fontSize: 13, marginLeft: 8, flex: 1 }}>
                        {t('consentLabel')}
                      </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingLeft: 8 }}>
                      <TouchableOpacity onPress={() => { setLegalModalType('tos'); setIsLegalModalOpen(true); }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>{t('viewTos')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setLegalModalType('privacy'); setIsLegalModalOpen(true); }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>{t('viewPrivacy')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setLegalModalType('refund'); setIsLegalModalOpen(true); }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>{t('viewRefund')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setLegalModalType('tokushoho'); setIsLegalModalOpen(true); }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>{t('viewTokushoho')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
                <Card.Actions style={{ flexDirection: 'column', gap: 10, marginTop: 20 }}>
                  <Button 
                    mode="contained" 
                    buttonColor={theme.colors.primary} 
                    textColor="#0D0B14"
                    onPress={handleSignup}
                    style={{ width: '100%', paddingVertical: 4, borderRadius: 8 }}
                    loading={isSubmittingAuth}
                    disabled={isSubmittingAuth}
                  >
                    {t('signupBtn')}
                  </Button>
                  <Button 
                    mode="text" 
                    textColor={theme.colors.accent}
                    onPress={() => setIsSignupMode(false)}
                    style={{ width: '100%' }}
                  >
                    {t('hasAccount')}
                  </Button>
                </Card.Actions>
              </Card>
            ) : (
              <Card style={styles.card} mode="elevated">
                <Image 
                  source={require('./assets/main_visual.png')} 
                  style={styles.heroImage} 
                  resizeMode="cover"
                />
                <Card.Title 
                  title={t('loginTitle')} 
                  subtitle={t('tagline')} 
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                />
                <Card.Content style={{ marginTop: 8 }}>
                  <TextInput
                    label={t('emailLabel')}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    mode="outlined"
                    textColor="#FFF"
                    activeOutlineColor={theme.colors.accent}
                    outlineColor="#2D2B3B"
                    theme={{ colors: { background: '#181524' } }}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  
                  <TextInput
                    label={t('passwordLabel')}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    mode="outlined"
                    textColor="#FFF"
                    activeOutlineColor={theme.colors.accent}
                    outlineColor="#2D2B3B"
                    theme={{ colors: { background: '#181524' } }}
                    style={styles.input}
                    secureTextEntry
                  />

                  <Button
                    mode="contained-tonal"
                    buttonColor="#1C1929"
                    textColor={theme.colors.accent}
                    onPress={handleFillDemoAccount}
                    style={{ marginBottom: 12, borderRadius: 8 }}
                    icon="account-key"
                  >
                    {t('demoBtn')}
                  </Button>
                </Card.Content>
                <Card.Actions style={{ flexDirection: 'column', gap: 10, marginTop: 10 }}>
                  <Button 
                    mode="contained" 
                    buttonColor={theme.colors.primary} 
                    textColor="#0D0B14"
                    onPress={handleLogin}
                    style={{ width: '100%', paddingVertical: 4, borderRadius: 8 }}
                    loading={isSubmittingAuth}
                    disabled={isSubmittingAuth}
                  >
                    {t('loginBtn')}
                  </Button>
                  <Button 
                    mode="text" 
                    textColor={theme.colors.accent}
                    onPress={() => setIsSignupMode(true)}
                    style={{ width: '100%' }}
                  >
                    {t('noAccount')}
                  </Button>
                </Card.Actions>
              </Card>
            )
          ) : (!profileCompleted || isEditMode) ? (
            <ProfileEdit
              lang={lang}
              initialData={{ userName, userRole, verificationBadges: userBadges, languageSkill: ownLanguageSkill }}
              onSave={saveDetailedProfile}
              onCancel={isEditMode ? () => setIsEditMode(false) : undefined}
              isSubmitting={isSavingProfile}
            />
          ) : (
            <View>
              {/* 추천 메이트 가로 스크롤 캐러셀 */}
              <View style={{ marginBottom: 16 }}>
                <Text variant="titleMedium" style={{ color: '#FF8A80', fontWeight: 'bold', marginBottom: 8 }}>
                  {lang === 'ko' ? '🌸 오늘 나에게 꼭 맞는 추천 이성' : '🌸 本日のあなた에 ぴったりの推薦'}
                </Text>
                {recommendations && recommendations.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
                    {recommendations.map((rec: any) => {
                      const isRecVerified = rec.ekycStatus === 'APPROVED';
                      return (
                        <Card 
                          key={rec.userId} 
                          style={{ width: 220, backgroundColor: '#181524', borderWidth: 1, borderColor: isRecVerified ? '#00E5FF' : '#2D2B3B' }}
                          mode="outlined"
                        >
                          <Image 
                            source={GALLERY_IMAGES.gallery_cafe}
                            style={{ width: '100%', height: 110, borderTopLeftRadius: 11, borderTopRightRadius: 11 }}
                            resizeMode="cover"
                          />
                          <Card.Content style={{ padding: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>
                                {rec.userName} {isRecVerified && <Text style={{ fontSize: 10 }}>🛡️</Text>}
                              </Text>
                              <Text style={{ color: '#FF8A80', fontSize: 11, fontWeight: 'bold' }}>
                                {rec.age}세
                              </Text>
                            </View>
                            <Text variant="bodySmall" style={{ color: '#8A869F', marginTop: 2, fontSize: 10 }}>
                              📍 {rec.country === 'KR' ? 'Seoul, Korea 🇰🇷' : 'Tokyo, Japan 🇯🇵'}
                            </Text>
                            <View style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6, alignSelf: 'flex-start' }}>
                              <Text style={{ color: '#00E5FF', fontSize: 10, fontWeight: 'bold' }}>
                                AI {rec.compatibilityScore || 90}% 부합
                              </Text>
                            </View>
                            
                            <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
                              <Button 
                                mode="contained-tonal"
                                compact
                                buttonColor="#2A2830"
                                textColor={theme.colors.accent}
                                labelStyle={{ fontSize: 9, marginHorizontal: 2, padding: 0 }}
                                style={{ flex: 1, height: 26, borderRadius: 4 }}
                                onPress={() => {
                                  setSelectedPeerId(rec.userId);
                                  setIsBreakdownOpen(true);
                                }}
                              >
                                상세 분석
                              </Button>
                              <Button 
                                mode="contained"
                                compact
                                buttonColor={theme.colors.primary}
                                textColor="#0D0B14"
                                labelStyle={{ fontSize: 9, marginHorizontal: 2, padding: 0 }}
                                style={{ flex: 1, height: 26, borderRadius: 4 }}
                                onPress={() => {
                                  setSelectedPeerId(rec.userId);
                                  setIsReserveModalOpen(true);
                                }}
                              >
                                미팅 신청
                              </Button>
                            </View>
                          </Card.Content>
                        </Card>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Surface style={{ backgroundColor: '#181524', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D2B3B' }}>
                    <Text style={{ color: '#8A869F', fontSize: 12 }}>
                      {lang === 'ko' ? '추천할 메이트가 없습니다. 가치관 설정을 조율해 보세요.' : '推薦可能な相手がいません。価値観設定を調整してください。'}
                    </Text>
                  </Surface>
                )}
              </View>

              {/* 내 신뢰 인증 배지 현황 대시보드 카드 */}
              <Card style={styles.card} mode="contained">
                <Card.Content style={styles.userInfoContent}>
                  <Avatar.Icon 
                    size={48} 
                    icon={userRole === 'korean' ? 'heart-pulse' : 'earth'} 
                    style={{ backgroundColor: userRole === 'korean' ? theme.colors.primary : theme.colors.secondary }} 
                  />
                  <View style={styles.userInfoText}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: 'bold' }}>{userName}{t('userSuffix')}</Text>
                      <Surface style={{ backgroundColor: '#2D1B28', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8, borderWidth: 1, borderColor: '#FF8A80' }}>
                        <Text style={{ color: '#FF8A80', fontSize: 10, fontWeight: 'bold' }}>❤️ {userHearts}</Text>
                      </Surface>
                    </View>
                    <Text variant="bodyMedium" style={{ color: '#AAA', marginTop: 2 }}>
                      {userRole === 'korean' ? t('koreaLoc') : t('japanLoc')}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Button 
                      icon="account-edit" 
                      mode="text" 
                      textColor={theme.colors.accent} 
                      onPress={() => setIsEditMode(true)}
                    >
                      {t('editBtn')}
                    </Button>
                  </View>
                </Card.Content>
                <Divider style={{ backgroundColor: '#2D2B3B' }} />
                <Card.Content style={{ paddingVertical: 12 }}>
                  <Text variant="bodySmall" style={{ color: '#8A869F', fontWeight: 'bold', marginBottom: 6 }}>{t('ownBadgeTitle')}</Text>
                  <View style={styles.ownBadgeContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.ownBadgeItem, 
                        ekycStatus === 'APPROVED' && { borderColor: '#00E5FF', borderWidth: 1.5 },
                        ekycStatus === 'PENDING' && { borderColor: '#FFA726', borderWidth: 1.5 }
                      ]}
                      onPress={() => setIseKYCOpen(true)}
                    >
                      {ekycStatus === 'PENDING' ? (
                        <Animated.View style={{ opacity: ekycPulseAnim, alignItems: 'center' }}>
                          <Text style={{ fontSize: 16 }}>🆔</Text>
                          <Text style={[styles.ownBadgeLabel, { color: '#FFA726' }]}>
                            {lang === 'ko' ? '심사중' : '審査中'}
                          </Text>
                        </Animated.View>
                      ) : (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 16 }}>🆔</Text>
                          <Text style={[styles.ownBadgeLabel, ekycStatus === 'APPROVED' && { color: '#00E5FF' }]}>
                            {ekycStatus === 'APPROVED' ? (lang === 'ko' ? '인증완료' : '認証完了') : t('badgeId')}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>💼</Text>
                      <Text style={styles.ownBadgeLabel}>{t('badgeJob')}</Text>
                    </View>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>💍</Text>
                      <Text style={styles.ownBadgeLabel}>{t('badgeSingle')}</Text>
                    </View>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>🎓</Text>
                      <Text style={styles.ownBadgeLabel}>{t('badgeEdu')}</Text>
                    </View>
                  </View>
                </Card.Content>

                {/* 1단계: 나의 일상 갤러리 2열 격자형 렌더러 */}
                {userGallery && userGallery.length > 0 ? (
                  <Card.Content style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#2D2B3B' }}>
                    <Text variant="bodySmall" style={{ color: '#8A869F', fontWeight: 'bold', marginBottom: 8 }}>{t('ownGalleryTitle')}</Text>
                    <View style={styles.dashboardGalleryGrid}>
                      {userGallery.map((item) => {
                        const prefix = item.split('_')[0];
                        const imgSource = GALLERY_IMAGES[prefix];
                        return (
                          <View key={item} style={styles.dashboardGalleryItem}>
                            <Image source={imgSource} style={styles.dashboardGalleryImage} />
                          </View>
                        );
                      })}
                    </View>
                  </Card.Content>
                ) : null}
              </Card>

              {/* 2단계: 필터 설정 바로가기 단추 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 4 }}>
                <Button 
                  icon="filter-variant" 
                  mode="contained-tonal" 
                  buttonColor="#1C1929"
                  textColor={theme.colors.primary}
                  onPress={() => setIsFilterOpen(true)}
                  style={{ flex: 1 }}
                  labelStyle={{ fontSize: 10, marginHorizontal: 2 }}
                >
                  {t('filterBtn')}
                </Button>
                <Button 
                  icon="shield-lock" 
                  mode="contained-tonal" 
                  buttonColor="#1C1929"
                  textColor="#00E5FF"
                  onPress={() => setIsPrivacyOpen(true)}
                  style={{ flex: 1 }}
                  labelStyle={{ fontSize: 10, marginHorizontal: 2 }}
                >
                  🔒 프라이버시
                </Button>
                <Button 
                  icon="account-question-outline" 
                  mode="contained-tonal" 
                  buttonColor="#1C1929"
                  textColor={theme.colors.accent}
                  onPress={() => setIsConciergeOpen(true)}
                  style={{ flex: 1 }}
                  labelStyle={{ fontSize: 10, marginHorizontal: 2 }}
                >
                  {t('conciergeBtn')}
                </Button>
              </View>

              {/* 미팅 조율 및 일정 관리 카드 */}
              {reservations && reservations.length > 0 ? (
                <Card style={styles.card} mode="contained">
                  <Card.Title 
                    title={lang === 'ko' ? '📅 조율 중인 화상/보이스 미팅 일정' : '📅 調整中のビデオ/ボイス面談'} 
                    titleStyle={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}
                  />
                  <Card.Content>
                    {reservations.map((res: any) => (
                      <View key={res.reservationId} style={{ backgroundColor: '#0D0B14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2D2B3B' }}>
                        <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 12 }}>
                          Partner ID: {res.callerId === userId ? res.calleeId : res.callerId}
                        </Text>
                        <Text style={{ color: '#8A869F', fontSize: 11, marginTop: 4 }}>
                          상태: <Text style={{ color: res.status === 'CONFIRMED' ? '#00E676' : '#FFA726', fontWeight: 'bold' }}>{res.status}</Text>
                        </Text>
                        {res.status === 'PENDING' ? (
                          <View style={{ marginTop: 8 }}>
                            <Text style={{ color: '#E0E0E0', fontSize: 11, marginBottom: 6 }}>희망 시간 중 선택하여 수락:</Text>
                            <View style={{ flexDirection: 'column', gap: 6 }}>
                              {res.proposedTimes.map((time: any, idx: number) => {
                                const dateStr = new Date(time).toLocaleString(lang === 'ko' ? 'ko-KR' : 'ja-JP');
                                return (
                                  <Button 
                                    key={idx}
                                    mode="outlined"
                                    compact
                                    textColor="#FF8A80"
                                    style={{ borderColor: '#FF8A80' }}
                                    labelStyle={{ fontSize: 10 }}
                                    onPress={() => handleConfirmReservation(res.reservationId, idx)}
                                  >
                                    {dateStr}
                                  </Button>
                                );
                              })}
                            </View>
                          </View>
                        ) : (
                          <View style={{ marginTop: 6, padding: 6, backgroundColor: 'rgba(0, 230, 118, 0.1)', borderRadius: 4 }}>
                            <Text style={{ color: '#00E676', fontSize: 11, fontWeight: 'bold' }}>
                              확정 시간: {new Date(res.confirmedTime || res.proposedTimes[0]).toLocaleString(lang === 'ko' ? 'ko-KR' : 'ja-JP')}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              ) : null}


              <Card style={styles.card}>
                <Card.Title 
                  title={t('voiceRoomTitle')} 
                  subtitle={t('voiceRoomDesc')} 
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                />
                <Card.Content>
                  <Surface style={styles.statusBox} elevation={2}>
                    <Text variant="bodySmall" style={styles.statusTitle}>{t('signalStatus')}</Text>
                    <Text variant="titleLarge" style={styles.statusValue}>{callStatus}</Text>
                    
                    {inCall && (
                      <View style={{ marginTop: 12 }}>
                        <ProgressBar progress={0.5} color={theme.colors.primary} indeterminate style={styles.progressBar} />
                      </View>
                    )}

                    {inCall && !peerId && (
                      <View style={styles.sandboxContainer}>
                        <Text variant="bodySmall" style={styles.sandboxTitle}>
                          {lang === 'ko' ? '💡 매칭 대기 중! 소개팅 번아웃 블록을 던지며 스트레스를 풀어보세요' : '💡 マッチング待機中！マッチング疲れブロックを投げてストレスを解消しましょう'}
                        </Text>
                        <WebView
                          originWhitelist={['*']}
                          source={{ html: matterHtmlString }}
                          style={styles.webview}
                          scrollEnabled={false}
                          overScrollMode="never"
                        />
                      </View>
                    )}

                    {inCall && peerId && (
                      <View style={styles.peerInfo}>
                        <Animated.View style={[styles.waveCircle, { transform: [{ scale: waveAnim }] }]}>
                          <Avatar.Icon size={40} icon="microphone" style={{ backgroundColor: theme.colors.primary }} />
                        </Animated.View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                          <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: 'bold' }}>{t('peerTitle')}: {peerId}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.accent }}>{lang === 'ko' ? '초저지연 PCM 터널링 연결 수립 완료' : '超低遅延 PCM トンネリング接続確立完了'}</Text>
                        </View>
                      </View>
                    )}
                  </Surface>

                  {/* 1:1 매칭 완료 후 Match Discovery Feed 카드 및 가치관 적합도 대시보드 */}
                  {inCall && peerId && (
                    <Card style={[styles.card, { marginTop: 12, backgroundColor: '#181524' }]} mode="elevated">
                      <Card.Content>
                        {/* 프로필 헤더: 이미지 Placeholder, 이름, 나이, 지역 */}
                        <View style={styles.discoveryHeader}>
                          <Surface style={styles.profilePlaceholder} elevation={2}>
                            <Text style={{ fontSize: 24 }}>✨</Text>
                          </Surface>
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: 'bold' }}>{peerId}{t('userSuffix')}</Text>
                              <Text variant="bodyMedium" style={{ color: '#8A869F', marginLeft: 6 }}>28{t('ageSuffix')}</Text>
                            </View>
                            <Text variant="bodySmall" style={{ color: '#00E5FF', marginTop: 2 }}>📍 Tokyo, Japan 🇯🇵</Text>
                          </View>
                          
                          {/* 92% Compatibility Score 배지 (탭 시 Match Breakdown 모달 노출) */}
                          <TouchableOpacity onPress={() => setIsBreakdownOpen(true)}>
                            <Surface style={styles.compatBadge} elevation={3}>
                              <Text style={styles.compatBadgeText}>{t('compatTitle')} 92% 🔍</Text>
                            </Surface>
                          </TouchableOpacity>
                        </View>

                        {/* 신뢰 마이크로 배지 */}
                        <View style={styles.peerBadgeRow}>
                          <TouchableOpacity 
                            style={styles.microBadgeChip} 
                            onPress={() => Alert.alert(t('badgeId'), t('alertVerifyPassport'))}
                          >
                            <Text style={styles.microBadgeText}>🆔 ID Verified</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.microBadgeChip} 
                            onPress={() => {
                              setRequestTargetBadge('employment');
                              setIsRequestModalOpen(true);
                            }}
                          >
                            <Text style={styles.microBadgeText}>🔒 Employment Verified</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.microBadgeChip} 
                            onPress={() => {
                              setRequestTargetBadge('marital');
                              setIsRequestModalOpen(true);
                            }}
                          >
                            <Text style={styles.microBadgeText}>🔒 Single Status Verified</Text>
                          </TouchableOpacity>
                        </View>

                        {/* 상대방 일상 갤러리 (2열 격자) */}
                        <Text variant="bodySmall" style={{ color: '#8A869F', fontWeight: 'bold', marginTop: 12, marginBottom: 8 }}>{t('peerGalleryTitle')}</Text>
                        <View style={styles.dashboardGalleryGrid}>
                          <View style={styles.dashboardGalleryItem}>
                            <Image source={GALLERY_IMAGES.gallery_cafe} style={styles.dashboardGalleryImage} />
                          </View>
                          <View style={styles.dashboardGalleryItem}>
                            <Image source={GALLERY_IMAGES.gallery_walk} style={styles.dashboardGalleryImage} />
                          </View>
                        </View>

                        {/* 상대 취미/관심사 태그 칩 */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 12 }}>
                          <Chip style={{ backgroundColor: '#1C1929', borderColor: '#FF8A80', borderWidth: 1 }} textStyle={{ color: '#FFF', fontSize: 10 }}>{lang === 'ko' ? '일본여행 ✈️' : '日本旅行 ✈️'}</Chip>
                          <Chip style={{ backgroundColor: '#1C1929', borderColor: '#FF8A80', borderWidth: 1 }} textStyle={{ color: '#FFF', fontSize: 10 }}>{lang === 'ko' ? 'K-드라마 📺' : '韓国ドラマ 📺'}</Chip>
                          <Chip style={{ backgroundColor: '#1C1929', borderColor: '#FF8A80', borderWidth: 1 }} textStyle={{ color: '#FFF', fontSize: 10 }}>{lang === 'ko' ? '요리 🍳' : '料理 🍳'}</Chip>
                        </View>

                        <Divider style={{ marginVertical: 12, backgroundColor: '#2D2B3B' }} />

                        {/* 4분면 가치관 레이더 인디케이터 */}
                        <Text variant="bodySmall" style={{ color: '#8A869F', fontWeight: 'bold', marginBottom: 8 }}>{t('radarTitle')}</Text>
                        <View style={styles.radarGrid}>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>{t('valueChild')}</Text>
                            <ProgressBar progress={0.9} color="#FF8A80" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>{t('valuesMatch')}</Text>
                          </View>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>{t('valueResidence')}</Text>
                            <ProgressBar progress={0.7} color="#3F51B5" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>{t('valuesConsult')}</Text>
                          </View>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>{t('valueReligion')}</Text>
                            <ProgressBar progress={0.95} color="#FF8A80" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>{t('valuesMatch')}</Text>
                          </View>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>{t('valueFinance')}</Text>
                            <ProgressBar progress={0.85} color="#FF8A80" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>{t('valuesMatch')}</Text>
                          </View>
                        </View>

                        {/* 핵심 가치관 요약 칩 섹션 */}
                        <View style={styles.valuesSummary}>
                          <Chip style={styles.valueSummaryChip} textStyle={styles.valueSummaryChipText}>👶 Wants 2 Kids</Chip>
                          <Chip style={styles.valueSummaryChip} textStyle={styles.valueSummaryChipText}>🇯🇵 Prefers Living in Japan</Chip>
                          <Chip style={styles.valueSummaryChip} textStyle={styles.valueSummaryChipText}>🚭 Non-smoker</Chip>
                        </View>

                        <Surface style={{ backgroundColor: '#0D0B14', padding: 10, borderRadius: 8, marginTop: 8 }}>
                          <Text variant="bodySmall" style={{ color: '#00E5FF', fontWeight: 'bold' }}>
                            {t('valuesSummaryTitle')}
                          </Text>
                          <Text variant="bodySmall" style={{ color: '#E0E0E0', marginTop: 4, lineHeight: 15 }}>
                            {t('valueAILink')}
                          </Text>
                        </Surface>

                        {/* 액션 버튼 */}
                        <View style={styles.actionRow}>
                          <Button 
                            mode="outlined" 
                            textColor="#FF8A80"
                            onPress={() => Alert.alert(t('sendInterest'), `${peerId}${t('alertInterestSent')}`)}
                            style={styles.actionButton}
                          >
                            {t('sendInterest')}
                          </Button>
                          <Button 
                            mode="contained" 
                            buttonColor="#FF8A80"
                            textColor="#0D0B14"
                            onPress={() => Alert.alert(t('requestIntro'), t('alertIntroRequest'))}
                            style={[styles.actionButton, { marginLeft: 8 }]}
                          >
                            {t('requestIntro')}
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </Card.Content>
                <Card.Actions style={{ marginTop: 8 }}>
                  {!inCall ? (
                    <Button 
                      mode="contained" 
                      buttonColor="#00E676" 
                      textColor="#000"
                      onPress={handleTriggerCall}
                      style={styles.callButton}
                      icon="phone-classic"
                    >
                      {t('startVoiceBtn')} (❤️ 1개 소모)
                    </Button>
                  ) : (
                    <Button 
                      mode="contained" 
                      buttonColor={theme.colors.error} 
                      onPress={disconnectSocket}
                      style={styles.callButton}
                      icon="phone-hangup"
                    >
                      {t('endVoiceBtn')}
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            </View>
          )}
        </ScrollView>

        {/* 1. 컨시어지 상담 채팅 모달 */}
        <Modal
          visible={isConciergeOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsConciergeOpen(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.modalTitle}>{t('chatManagerTitle')}</Text>
                  <IconButton
                    icon="video"
                    iconColor={theme.colors.accent}
                    size={22}
                    onPress={() => {
                      setIsConciergeOpen(false);
                      setShowVideoCallModal(true);
                    }}
                  />
                </View>
                <IconButton
                  icon="close"
                  iconColor="#8A869F"
                  size={20}
                  onPress={() => setIsConciergeOpen(false)}
                />
              </View>
              
              <ScrollView style={styles.msgScroll} contentContainerStyle={{ paddingBottom: 10 }}>
                {conciergeMessages.map((msg, index) => {
                  let bubbleStyle: any = styles.conciergeMsgBubble;
                  if (msg.sender === 'user') bubbleStyle = styles.userMsgBubble;
                  if (msg.sender === 'system') bubbleStyle = styles.systemMsgBubble;

                  return (
                    <View key={index} style={[styles.msgBubble, bubbleStyle]}>
                      {msg.sender !== 'user' && (
                        <Text style={styles.msgSender}>
                          {msg.sender === 'concierge' ? '💬 Match Manager' : '📢 System Notice'}
                        </Text>
                      )}
                      <Text style={styles.msgText}>{msg.text}</Text>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  value={newConciergeMsg}
                  onChangeText={setNewConciergeMsg}
                  placeholder={t('chatPlaceholder')}
                  placeholderTextColor="#8A869F"
                  mode="outlined"
                  textColor="#FFF"
                  activeOutlineColor={theme.colors.accent}
                  outlineColor="#2D2B3B"
                  theme={{ colors: { background: '#181524' } }}
                  style={styles.conciergeInput}
                />
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  textColor="#0D0B14"
                  onPress={sendConciergeMessage}
                  style={{ borderRadius: 8, height: 48, justifyContent: 'center' }}
                >
                  {t('send')}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* 2. 상호주의 개인정보 공개 동의 요청 모달 */}
        <Modal
          visible={isRequestModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsRequestModalOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.reqModalContent}>
              <Text style={styles.reqTitle}>{t('badgeRequestTitle')}</Text>
              
              <Text style={styles.reqDesc}>
                {t('badgeRequestDesc')}
              </Text>

              <Text style={{ color: '#8A869F', fontSize: 11, marginBottom: 8 }}>{t('sendLangSelect')}</Text>
              <View style={styles.langRow}>
                <Button
                  mode={requestLanguage === 'ko' ? 'contained' : 'outlined'}
                  onPress={() => setRequestLanguage('ko')}
                  style={styles.langButton}
                  buttonColor={requestLanguage === 'ko' ? theme.colors.secondary : undefined}
                >
                  {t('langKo')}
                </Button>
                <Button
                  mode={requestLanguage === 'ja' ? 'contained' : 'outlined'}
                  onPress={() => setRequestLanguage('ja')}
                  style={styles.langButton}
                  buttonColor={requestLanguage === 'ja' ? theme.colors.secondary : undefined}
                >
                  {t('langJa')}
                </Button>
              </View>

              <View style={styles.reqActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIsRequestModalOpen(false)}
                  style={styles.reqBtn}
                  textColor="#8A869F"
                >
                  {t('cancel')}
                </Button>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  textColor="#0D0B14"
                  onPress={() => sendBadgePermissionRequest(requestTargetBadge, requestLanguage)}
                  style={styles.reqBtn}
                >
                  {t('sendRequest')}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* 3. Deep Learning AI Match Breakdown 모달 */}
        <Modal
          visible={isBreakdownOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsBreakdownOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🧠 AI Match Breakdown</Text>
                <IconButton
                  icon="close"
                  iconColor="#8A869F"
                  size={20}
                  onPress={() => setIsBreakdownOpen(false)}
                />
              </View>

              <ScrollView style={styles.msgScroll} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* 1. 상단 원형 인디케이터 모사 */}
                <View style={styles.breakdownHeader}>
                  <View style={styles.circularProgressBorder}>
                    <Text style={styles.circularProgressScore}>92%</Text>
                    <Text style={styles.circularProgressLabel}>{t('aiMatchingRate')}</Text>
                  </View>
                  <Text style={styles.breakdownSubtitle}>
                    {t('aiMatchingDesc')}
                  </Text>
                </View>

                {/* 2. Trend Alignment (듀얼 프로그레스 바 대조) */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>{t('trendAlignmentTitle')}</Text>
                  <Text style={styles.breakdownSectionDesc}>
                    {t('trendAlignmentDesc')}
                  </Text>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>{t('ourCompatibility')}</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.92} color="#FF8A80" style={{ height: 6, borderRadius: 3 }} />
                    </View>
                    <Text style={styles.trendValue}>92%</Text>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>{t('averageSuccessCouples')}</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.85} color="#3F51B5" style={{ height: 6, borderRadius: 3 }} />
                    </View>
                    <Text style={styles.trendValue}>85%</Text>
                  </View>
                </View>

                {/* 3. Deep Values (핵심 속성 비교) */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>{t('deepValuesTitle')}</Text>
                  
                  <View style={styles.deepValueBarRow}>
                    <Text style={styles.deepValueLabel}>{t('commOrientation')}</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.95} color="#FF8A80" style={{ height: 4, borderRadius: 2 }} />
                    </View>
                    <Text style={styles.deepValuePercent}>95%</Text>
                  </View>

                  <View style={styles.deepValueBarRow}>
                    <Text style={styles.deepValueLabel}>{t('residenceFlex')}</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.70} color="#FF8A80" style={{ height: 4, borderRadius: 2 }} />
                    </View>
                    <Text style={styles.deepValuePercent}>70%</Text>
                  </View>

                  <View style={styles.deepValueBarRow}>
                    <Text style={styles.deepValueLabel}>{t('religionAccept')}</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.90} color="#FF8A80" style={{ height: 4, borderRadius: 2 }} />
                    </View>
                    <Text style={styles.deepValuePercent}>90%</Text>
                  </View>
                </View>

                {/* 4. Hidden Affinities (2열 취향 칩 그리드) */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>{t('hiddenAffinitiesTitle')}</Text>
                  <Text style={styles.breakdownSectionDesc}>{t('hiddenAffinitiesDesc')}</Text>
                  
                  <View style={styles.gridContainer}>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>{t('hiddenAffCafe')}</Text>
                    </View>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>{t('hiddenAffDrama')}</Text>
                    </View>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>{t('hiddenAffWalk')}</Text>
                    </View>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>{t('hiddenAffCooking')}</Text>
                    </View>
                  </View>
                </View>

                {/* AI 안심 보증 CTA 안내 및 닫기 버튼 */}
                <Surface style={styles.aiGuaranteeBox} elevation={2}>
                  <Text style={styles.aiGuaranteeText}>
                    💡 AI has analyzed over 10,000 successful match patterns to recommend this partner.
                  </Text>
                  <Text style={styles.aiGuaranteeTextSub}>
                    {lang === 'ko' ? '(AI가 10,000건 이상의 한일 매칭 성공 빅데이터 패턴을 비교 분석하여 최적의 동반자로 추천했습니다.)' : '(AIが10,000件以上の日韓マッチング成功ビッグデータパターンを比較分析し、最適なパートナーとして推薦しました。)'}
                  </Text>
                </Surface>
              </ScrollView>

              <Button
                mode="contained"
                buttonColor="#FF8A80"
                textColor="#0D0B14"
                onPress={() => setIsBreakdownOpen(false)}
                style={{ borderRadius: 8, height: 48, justifyContent: 'center' }}
              >
                {t('startSafeChat')}
              </Button>
            </View>
          </View>
        </Modal>

        {/* 2단계: 필터 설정 모달 */}
        <Modal
          visible={isFilterOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFilterOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.reqModalContent, { minHeight: 460 }]}>
              <Text style={styles.reqTitle}>{t('filterTitle')}</Text>

              {/* 탭 헤더 */}
              <View style={styles.filterTabHeader}>
                <TouchableOpacity 
                  style={[styles.filterTabButton, activeFilterTab === 'basic' && styles.filterTabButtonActive]} 
                  onPress={() => setActiveFilterTab('basic')}
                >
                  <Text style={[styles.filterTabText, activeFilterTab === 'basic' && styles.filterTabTextActive]}>
                    {t('filterTabBasic')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterTabButton, activeFilterTab === 'values' && styles.filterTabButtonActive]} 
                  onPress={() => setActiveFilterTab('values')}
                >
                  <Text style={[styles.filterTabText, activeFilterTab === 'values' && styles.filterTabTextActive]}>
                    {t('filterTabValues')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 탭 1: 기본 조건 */}
              {activeFilterTab === 'basic' && (
                <ScrollView style={{ width: '100%', maxHeight: 350 }}>
                  <Text style={styles.filterSectionLabel}>{t('filterAgeLabel')}</Text>
                  <View style={styles.filterOptionRow}>
                    <Chip 
                      selected={filterAge === 'all'} 
                      onPress={() => setFilterAge('all')}
                      style={styles.filterChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterAgeAll')}</Chip>
                    <Chip 
                      selected={filterAge === '20s'} 
                      onPress={() => setFilterAge('20s')}
                      style={styles.filterChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterAge20')}</Chip>
                    <Chip 
                      selected={filterAge === '30s'} 
                      onPress={() => setFilterAge('30s')}
                      style={styles.filterChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterAge30')}</Chip>
                    <Chip 
                      selected={filterAge === '40s'} 
                      onPress={() => setFilterAge('40s')}
                      style={styles.filterChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterAge40')}</Chip>
                  </View>

                  <Text style={styles.filterSectionLabel}>{t('filterLocLabel')}</Text>
                  <View style={styles.filterOptionRowColumn}>
                    <Chip 
                      selected={filterLocFlex === 'any'} 
                      onPress={() => setFilterLocFlex('any')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterLocAny')}</Chip>
                    <Chip 
                      selected={filterLocFlex === 'japan'} 
                      onPress={() => setFilterLocFlex('japan')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterLocJapan')}</Chip>
                    <Chip 
                      selected={filterLocFlex === 'korea'} 
                      onPress={() => setFilterLocFlex('korea')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterLocKorea')}</Chip>
                  </View>

                  <Text style={styles.filterSectionLabel}>{t('filterLangSkillLabel')}</Text>
                  <View style={styles.filterOptionRowColumn}>
                    <Chip 
                      selected={filterLanguage === 'any'} 
                      onPress={() => setFilterLanguage('any')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterSelectAny')}</Chip>
                    <Chip 
                      selected={filterLanguage === 'BASIC'} 
                      onPress={() => setFilterLanguage('BASIC')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterLangBasic')}</Chip>
                    <Chip 
                      selected={filterLanguage === 'INTERMEDIATE'} 
                      onPress={() => setFilterLanguage('INTERMEDIATE')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterLangIntermediate')}</Chip>
                    <Chip 
                      selected={filterLanguage === 'FLUENT'} 
                      onPress={() => setFilterLanguage('FLUENT')}
                      style={styles.filterFlexChip}
                      textStyle={{ color: '#FFF', fontSize: 11 }}
                    >{t('filterLangFluent')}</Chip>
                  </View>
                </ScrollView>
              )}

              {/* 탭 2: 결정사 가치관 */}
              {activeFilterTab === 'values' && (
                <ScrollView style={{ width: '100%', maxHeight: 350 }}>
                  {/* 인증 배지 전용 스위치 (Paywall Gate 연동) */}
                  <View style={styles.switchRow}>
                    <View style={styles.switchLabelCol}>
                      <Text style={styles.switchLabel}>{t('filterVerifiedOnlyLabel')}</Text>
                      <Text style={styles.switchSub}>{t('filterVerifiedOnlyDesc')}</Text>
                    </View>
                    <Switch
                      value={filterVerifiedOnly}
                      onValueChange={(val) => {
                        if (val && membershipType === 'FREE') {
                          setIsUpgradeModalOpen(true);
                        } else {
                          setFilterVerifiedOnly(val);
                        }
                      }}
                      color="#00E5FF"
                    />
                  </View>

                  <Text style={styles.filterSectionLabel}>{t('filterChildPlanLabel')}</Text>
                  <View style={styles.filterOptionGrid}>
                    <Chip 
                      selected={filterChildPlan === 'any'} 
                      onPress={() => setFilterChildPlan('any')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterSelectAny')}</Chip>
                    <Chip 
                      selected={filterChildPlan === 'WANT_CHILDREN'} 
                      onPress={() => setFilterChildPlan('WANT_CHILDREN')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterChildWant')}</Chip>
                    <Chip 
                      selected={filterChildPlan === 'NO_CHILDREN'} 
                      onPress={() => setFilterChildPlan('NO_CHILDREN')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterChildNo')}</Chip>
                    <Chip 
                      selected={filterChildPlan === 'DISCUSS'} 
                      onPress={() => setFilterChildPlan('DISCUSS')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterChildDiscuss')}</Chip>
                  </View>

                  <Text style={styles.filterSectionLabel}>{t('filterDualIncomeLabel')}</Text>
                  <View style={styles.filterOptionGrid}>
                    <Chip 
                      selected={filterDualIncome === 'any'} 
                      onPress={() => setFilterDualIncome('any')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterSelectAny')}</Chip>
                    <Chip 
                      selected={filterDualIncome === 'YES'} 
                      onPress={() => setFilterDualIncome('YES')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterDualYes')}</Chip>
                    <Chip 
                      selected={filterDualIncome === 'NO'} 
                      onPress={() => setFilterDualIncome('NO')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterDualNo')}</Chip>
                    <Chip 
                      selected={filterDualIncome === 'FLEXIBLE'} 
                      onPress={() => setFilterDualIncome('FLEXIBLE')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 10 }}
                    >{t('filterDualFlexible')}</Chip>
                  </View>

                  <Text style={styles.filterSectionLabel}>{t('filterReligionLabel')}</Text>
                  <View style={styles.filterOptionGrid}>
                    <Chip 
                      selected={filterReligion === 'any'} 
                      onPress={() => setFilterReligion('any')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 9 }}
                    >{t('filterSelectAny')}</Chip>
                    <Chip 
                      selected={filterReligion === 'NONE'} 
                      onPress={() => setFilterReligion('NONE')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 9 }}
                    >{t('religionNone')}</Chip>
                    <Chip 
                      selected={filterReligion === 'CHRISTIAN'} 
                      onPress={() => setFilterReligion('CHRISTIAN')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 9 }}
                    >{t('religionChristian')}</Chip>
                    <Chip 
                      selected={filterReligion === 'BUDDHIST'} 
                      onPress={() => setFilterReligion('BUDDHIST')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 9 }}
                    >{t('religionBuddhist')}</Chip>
                    <Chip 
                      selected={filterReligion === 'CATHOLIC'} 
                      onPress={() => setFilterReligion('CATHOLIC')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 9 }}
                    >{t('religionCatholic')}</Chip>
                    <Chip 
                      selected={filterReligion === 'OTHER'} 
                      onPress={() => setFilterReligion('OTHER')}
                      style={styles.filterMiniChip}
                      textStyle={{ color: '#FFF', fontSize: 9 }}
                    >{t('religionOther')}</Chip>
                  </View>
                </ScrollView>
              )}

              <View style={[styles.reqActions, { marginTop: 16 }]}>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  textColor="#0D0B14"
                  onPress={() => {
                    setIsFilterOpen(false);
                    Alert.alert(lang === 'ko' ? '필터 적용' : 'フィルター適用', t('filterAppliedMsg'));
                  }}
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  {t('filterApplyBtn')}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* 프리미엄 업그레이드 페이월 유도 모달 */}
        <Modal
          visible={isUpgradeModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsUpgradeModalOpen(false)}
        >
          <View style={styles.paywallOverlay}>
            <View style={styles.paywallContent}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>👑</Text>
              <Text style={{ color: '#00E5FF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                {t('paywallTitle')}
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 24 }}>
                {t('paywallDesc')}
              </Text>

              <Button
                mode="contained"
                buttonColor="#00E5FF"
                textColor="#0D0B14"
                loading={isUpgrading}
                disabled={isUpgrading}
                onPress={handleUpgradeToPremium}
                style={{ width: '100%', borderRadius: 8, marginBottom: 10 }}
              >
                {t('paywallBtn')}
              </Button>
              <Button
                mode="outlined"
                textColor="#8A869F"
                onPress={() => setIsUpgradeModalOpen(false)}
                style={{ width: '100%', borderRadius: 8, borderColor: '#2D2B3B' }}
              >
                {t('cancel')}
              </Button>
            </View>
          </View>
        </Modal>

        {/* 3단계: 사이드 드로워 모달 */}
        <Modal
          visible={isDrawerOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDrawerOpen(false)}
        >
          <TouchableOpacity 
            style={styles.drawerOverlay} 
            activeOpacity={1} 
            onPress={() => setIsDrawerOpen(false)}
          >
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Avatar.Icon 
                  size={48} 
                  icon={userRole === 'korean' ? 'heart-pulse' : 'earth'} 
                  style={{ backgroundColor: theme.colors.primary }} 
                />
                <Text style={styles.drawerUsername}>{userName || (lang === 'ko' ? '방문자' : 'ビジター')}{t('userSuffix')}</Text>
                <Text style={styles.drawerSubtitle}>{userRole === 'korean' ? (lang === 'ko' ? '한국인 메이트 🇰🇷' : '韓国人メイト 🇰🇷') : (lang === 'ko' ? '해외/일인 메이트 🇯🇵' : '海外/日本人メイト 🇯🇵')}</Text>
              </View>
              
              <Divider style={{ backgroundColor: '#2D2B3B', marginVertical: 10 }} />
              
              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => {
                  setIsDrawerOpen(false);
                  setIsEditMode(true);
                }}
              >
                <IconButton icon="account-edit" iconColor={theme.colors.primary} size={20} />
                <Text style={styles.drawerItemText}>{lang === 'ko' ? 'Profile (프로필 편집)' : 'Profile (プロフィール編集)'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => {
                  setIsDrawerOpen(false);
                  setIsConciergeOpen(true);
                }}
              >
                <IconButton icon="message-text" iconColor={theme.colors.primary} size={20} />
                <Text style={styles.drawerItemText}>{lang === 'ko' ? 'Messages (컨시어지 대화)' : 'Messages (コンシェルジュとの会話)'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => {
                  setIsDrawerOpen(false);
                  setIsFilterOpen(true);
                }}
              >
                <IconButton icon="cog" iconColor={theme.colors.primary} size={20} />
                <Text style={styles.drawerItemText}>{lang === 'ko' ? 'Settings (가치관 필터)' : 'Settings (価値観フィルター)'}</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity 
                style={[styles.drawerItem, styles.drawerLogoutBtn]} 
                onPress={() => {
                  setIsDrawerOpen(false);
                  disconnectSocket();
                  setIsRegistered(false);
                  setIsLoggedIn(false);
                  setProfileCompleted(false);
                  setShowSplash(true);
                  setUserId('');
                  setUserName('');
                }}
              >
                <IconButton icon="logout" iconColor={theme.colors.error} size={20} />
                <Text style={[styles.drawerItemText, { color: theme.colors.error }]}>{lang === 'ko' ? 'Log out (로그아웃)' : 'Log out (ログアウト)'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* 3단계: 보안 영상통화 수신 오버레이 모달 */}
        <Modal
          visible={showVideoCallModal}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setShowVideoCallModal(false)}
        >
          <View style={styles.videoCallContainer}>
            <Image 
              source={require('./assets/main_visual.png')} 
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              blurRadius={10}
            />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
            
            <SafeAreaView style={styles.videoCallSafe}>
              <View style={styles.videoCallHeader}>
                <IconButton icon="shield-check" iconColor={theme.colors.accent} size={28} />
                <Text style={styles.videoCallEncryptedText}>End-to-End Secure Call</Text>
              </View>
              
              <View style={styles.videoCallAvatarContainer}>
                <Image 
                  source={require('./assets/main_visual.png')} 
                  style={styles.videoCallAvatar}
                />
                <Text style={styles.videoCallCallerName}>{peerId || t('peerTitle')}</Text>
                <Text style={styles.videoCallStatusText}>{t('secureCallTitle')}</Text>
              </View>
              
              <View style={styles.videoCallButtonRow}>
                <TouchableOpacity 
                  style={[styles.videoCallBtn, styles.videoCallRejectBtn]} 
                  onPress={() => {
                    setShowVideoCallModal(false);
                    setIsConciergeOpen(true);
                    Alert.alert(t('secureCallRejectBtn'), t('secureCallRejected'));
                  }}
                >
                  <IconButton icon="phone-hangup" iconColor="#FFF" size={28} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.videoCallBtn, styles.videoCallAcceptBtn]} 
                  onPress={() => {
                    setShowVideoCallModal(false);
                    Alert.alert(
                      t('secureCallConnected'),
                      t('secureCallConnectedDesc'),
                      [{ text: t('secureCallEnd'), onPress: () => setIsConciergeOpen(true) }]
                    );
                  }}
                >
                  <IconButton icon="phone" iconColor="#FFF" size={28} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>

        {/* 2단계: Congrats 매칭 성공 모달 */}
        <Modal
          visible={showCongratsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCongratsModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.congratsContent}>
              <Text style={styles.congratsEmoji}>🎉❤️🎉</Text>
              <Text style={styles.congratsTitle}>{t('matchingSuccess')}</Text>
              
              <Text style={styles.congratsDesc}>
                {t('matchingSuccessDesc')}
              </Text>

              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor="#0D0B14"
                onPress={() => setShowCongratsModal(false)}
                style={{ width: '100%', borderRadius: 8, marginTop: 12 }}
              >
                {t('startChatting')}
              </Button>
            </View>
          </View>
        </Modal>

        {/* eKYC 여권 제출 모달 */}
        <Modal
          visible={iseKYCOpen}
          onRequestClose={() => setIseKYCOpen(false)}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.reqModalContent}>
              <Text style={styles.reqTitle}>🛡️ eKYC 본인 확인 및 여권 인증</Text>
              <Text style={styles.reqDesc}>
                {lang === 'ko' 
                  ? '가치관 매칭의 신뢰를 위해 본인 확인용 여권 정보를 제출해 주세요. 제출된 정보는 안전하게 암호화되어 검증 후 즉시 파기됩니다.'
                  : '価値観マッチングの信頼性を確保するため、本人確認用のパスポート情報を提出してください。提出された情報は安全に暗号化され、検証後即座に破棄されます。'}
              </Text>
              
              <TextInput
                label={lang === 'ko' ? '여권 번호 (M으로 시작하는 9자리)' : '旅券番号 (9桁)'}
                value={ekycPassportNo}
                onChangeText={setEkycPassportNo}
                mode="outlined"
                textColor="#FFF"
                activeOutlineColor={theme.colors.accent}
                outlineColor="#2D2B3B"
                theme={{ colors: { background: '#181524' } }}
                style={[styles.input, { width: '100%' }]}
                placeholder="M12345678"
                placeholderTextColor="#666"
              />

              <TouchableOpacity 
                style={{ width: '100%', height: 70, borderStyle: 'dashed', borderWidth: 1, borderColor: '#2D2B3B', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}
                onPress={() => Alert.alert(lang === 'ko' ? '업로드 완료' : 'アップロード完了', lang === 'ko' ? '여권 사진/셀카가 임시 업로드되었습니다.' : 'パスポート画像/自撮りが仮アップロードされました。')}
              >
                <Text style={{ color: theme.colors.accent, fontSize: 11 }}>📸 {lang === 'ko' ? '여권 사진 & 셀프 카메라 사진 가상 업로드' : 'パスポート画像＆自撮り画像の仮想アップロード'}</Text>
              </TouchableOpacity>

              <View style={styles.reqActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIseKYCOpen(false)}
                  style={styles.reqBtn}
                  textColor="#8A869F"
                >
                  {t('cancel')}
                </Button>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  textColor="#0D0B14"
                  onPress={submiteKYCDocument}
                  style={styles.reqBtn}
                >
                  {lang === 'ko' ? '제출하기' : '提出する'}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* 🔒 프라이버시 설정 바텀시트 모달 */}
        <Modal
          visible={isPrivacyOpen}
          onRequestClose={() => setIsPrivacyOpen(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <View style={{ backgroundColor: '#181524', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderTopWidth: 1, borderColor: '#2D2B3B' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: '#00E5FF', fontSize: 16, fontWeight: 'bold' }}>🔒 {lang === 'ko' ? '프라이버시 세부 통제 센터' : 'プライバシー詳細管理センター'}</Text>
                <IconButton icon="close" iconColor="#8A869F" size={20} onPress={() => setIsPrivacyOpen(false)} style={{ margin: 0 }} />
              </View>

              <Text style={{ color: '#8A869F', fontSize: 12, marginBottom: 20 }}>
                {lang === 'ko' 
                  ? '나의 정보 노출 범위와 검색 대상 제외 기준을 커스텀 설정하여 원치 않는 상대방과의 접촉을 원천 방지합니다.'
                  : '情報の露出範囲と検索対象からの除外基準をカスタム設定し、望まない相手との接触を根本的に防止します。'}
              </Text>

              {/* 스위치 1: 가치관 호합도 상호 공개 동의 */}
              <View style={styles.switchRow}>
                <View style={styles.switchLabelCol}>
                  <Text style={styles.switchLabel}>{lang === 'ko' ? '호합도 상호 공개 동의' : '相性度の相互公開同意'}</Text>
                  <Text style={styles.switchSub}>{lang === 'ko' ? '양측 모두가 동의해야만 궁합 분석 세부 정보가 오픈됩니다.' : '双方が同意した場合のみ、相性の詳細な分析がオープンされます。'}</Text>
                </View>
                <Switch
                  value={privacyConsent}
                  onValueChange={setPrivacyConsent}
                  color="#00E5FF"
                />
              </View>

              {/* 스위치 2: 양방향 검색 제외(오사카 등 특정 지리적 바운더리 제외) */}
              <View style={styles.switchRow}>
                <View style={styles.switchLabelCol}>
                  <Text style={styles.switchLabel}>{lang === 'ko' ? '특정 지리적 바운더리 검색 제외' : '特定地域検索からの除外'}</Text>
                  <Text style={styles.switchSub}>{lang === 'ko' ? '오사카/도쿄 등 설정된 내 제외 타겟 도시 상대와 매칭 및 검색에서 제외됩니다.' : '大阪や東京など、設定した除外都市のお相手とマッチング及び検索から除外されます。'}</Text>
                </View>
                <Switch
                  value={privacyExclusion}
                  onValueChange={setPrivacyExclusion}
                  color="#00E5FF"
                />
              </View>

              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor="#0D0B14"
                onPress={savePrivacySettings}
                style={{ width: '100%', borderRadius: 8, marginTop: 16, paddingVertical: 4 }}
              >
                {lang === 'ko' ? '설정 저장 및 적용' : '設定を保存して適用'}
              </Button>
            </View>
          </View>
        </Modal>

        {/* 미팅 예약 신청 제안 모달 */}
        <Modal
          visible={isReserveModalOpen}
          onRequestClose={() => setIsReserveModalOpen(false)}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.reqModalContent}>
              <Text style={styles.reqTitle}>📅 {lang === 'ko' ? '실시간 영상 미팅 날짜 예약 제안' : 'リアルタイムビデオ面談日程の提案'}</Text>
              <Text style={styles.reqDesc}>
                {lang === 'ko' 
                  ? '상대방에게 매칭 대화를 희망하는 날짜와 시간을 제안해 주세요.'
                  : 'お相手にマッチング会話を希望する日時を提案してください。'}
              </Text>

              <TextInput
                label={lang === 'ko' ? '제안 일시 (YYYY-MM-DD HH:MM)' : '提案日時 (YYYY-MM-DD HH:MM)'}
                value={selectedReserveDate}
                onChangeText={setSelectedReserveDate}
                mode="outlined"
                textColor="#FFF"
                activeOutlineColor={theme.colors.accent}
                outlineColor="#2D2B3B"
                theme={{ colors: { background: '#181524' } }}
                style={[styles.input, { width: '100%' }]}
              />

              <View style={styles.reqActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIsReserveModalOpen(false)}
                  style={styles.reqBtn}
                  textColor="#8A869F"
                >
                  {t('cancel')}
                </Button>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  textColor="#0D0B14"
                  onPress={handleRequestReservation}
                  style={styles.reqBtn}
                >
                  {lang === 'ko' ? '예약 신청' : '予約申請'}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* 약관 상세 보기 모달 신설 */}
        <Modal
          visible={isLegalModalOpen}
          onRequestClose={() => setIsLegalModalOpen(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', height: '80%', backgroundColor: '#181524', borderRadius: 12, borderWidth: 1, borderColor: '#2D2B3B', overflow: 'hidden' }}>
              <View style={{ padding: 18, borderBottomWidth: 1, borderColor: '#2D2B3B', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#12101B' }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                  {LEGAL_DATA[legalModalType].title[lang] || LEGAL_DATA[legalModalType].title['en']}
                </Text>
                <IconButton icon="close" iconColor="#8A869F" size={24} onPress={() => setIsLegalModalOpen(false)} style={{ margin: 0 }} />
              </View>
              <ScrollView style={{ padding: 20 }}>
                <Text style={{ color: '#B4B0C4', fontSize: 13, lineHeight: 20 }}>
                  {LEGAL_DATA[legalModalType].content[lang] || LEGAL_DATA[legalModalType].content['en']}
                </Text>
              </ScrollView>
              <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#2D2B3B', backgroundColor: '#12101B' }}>
                <Button 
                  mode="contained" 
                  buttonColor={theme.colors.primary} 
                  textColor="#0D0B14" 
                  onPress={() => setIsLegalModalOpen(false)}
                  style={{ borderRadius: 8 }}
                >
                  {lang === 'ko' ? '확인' : '確認'}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        </SafeAreaView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#050408', // 전체 웹 브라우저 배경을 더 깊은 다크 스페이스로 채움
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D0B14',
    width: '100%',
    maxWidth: 480, // 모바일 폰 뷰포트 크기로 강제 가둠
    alignSelf: 'center',
    // 입체감 있는 섀도우 추가로 프리미엄 플로팅 폰 구현
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2B3B',
    backgroundColor: '#181524',
  },
  titleText: {
    color: '#FF8A80',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontSize: 18,
  },
  subtitleText: {
    color: '#8A869F',
    marginTop: 4,
    fontWeight: '500',
    fontSize: 11,
  },
  banner: {
    backgroundColor: '#181524',
    borderBottomWidth: 1,
    borderBottomColor: '#FF8A80',
  },
  bannerText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#181524',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2B3B',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardSubtitle: {
    color: '#8A869F',
    fontSize: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#181524',
    height: 48,
    borderRadius: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 12,
    color: '#BBB9C7',
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 0.48,
    borderColor: '#FF8A80',
    borderWidth: 1,
    borderRadius: 8,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  userInfoText: {
    marginLeft: 18,
  },
  statusBox: {
    padding: 20,
    backgroundColor: '#0D0B14',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D2B3B',
  },
  statusTitle: {
    color: '#8A869F',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusValue: {
    color: '#FF8A80',
    marginTop: 6,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  peerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#2D2B3B',
  },
  waveCircle: {
    borderRadius: 40,
    padding: 4,
    backgroundColor: 'rgba(255, 138, 128, 0.15)',
  },
  callButton: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 6,
  },
  sandboxContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2B3B',
    height: 320,
  },
  sandboxTitle: {
    color: '#00E5FF',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0D0B14',
    borderRadius: 12,
    overflow: 'hidden',
  },
  peerBadgeRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  peerBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2B3B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3D3B4B',
  },
  peerBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  peerBadgeText: {
    fontSize: 10,
    color: '#E0E0E0',
    fontWeight: 'bold',
  },
  lockGuideText: {
    fontSize: 9,
    color: '#8A869F',
    marginTop: 8,
    lineHeight: 12,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  ownBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  ownBadgeItem: {
    alignItems: 'center',
    backgroundColor: '#181524',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2B3B',
    padding: 8,
    width: 70,
  },
  ownBadgeLabel: {
    fontSize: 9,
    color: '#8A869F',
    marginTop: 4,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 440, // 웹 화면 찌그러짐 방지
    height: '75%',
    backgroundColor: '#181524',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2B3B',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2B3B',
    paddingBottom: 8,
  },
  modalTitle: {
    color: '#FF8A80',
    fontWeight: 'bold',
    fontSize: 18,
  },
  msgScroll: {
    flex: 1,
    marginVertical: 12,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    maxWidth: '85%',
  },
  userMsgBubble: {
    backgroundColor: '#2A2B4D',
    alignSelf: 'flex-end',
  },
  conciergeMsgBubble: {
    backgroundColor: '#181524',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  systemMsgBubble: {
    backgroundColor: '#181524',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FF8A80',
    width: '95%',
  },
  msgText: {
    color: '#FFF',
    fontSize: 13,
  },
  translatedTextInline: {
    color: '#8A869F',
    fontSize: 11,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#2D2B3B',
    paddingTop: 4,
    fontStyle: 'italic',
  },
  msgSender: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00E5FF',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  conciergeInput: {
    flex: 1,
    backgroundColor: '#181524',
    marginRight: 8,
    height: 48,
  },
  reqModalContent: {
    width: '85%',
    maxWidth: 400, // 웹 화면 찌그러짐 방지
    backgroundColor: '#181524',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2B3B',
    padding: 20,
    alignItems: 'center',
  },
  reqTitle: {
    color: '#00E5FF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  reqDesc: {
    color: '#E0E0E0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  langButton: {
    flex: 0.45,
    borderRadius: 8,
  },
  reqActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  reqBtn: {
    flex: 0.48,
    borderRadius: 8,
  },
  discoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compatBadge: {
    backgroundColor: '#FF8A80',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compatBadgeText: {
    color: '#0D0B14',
    fontSize: 11,
    fontWeight: 'bold',
  },
  microBadgeChip: {
    backgroundColor: '#2D2B3B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3D3B4B',
  },
  microBadgeText: {
    fontSize: 9,
    color: '#E0E0E0',
    fontWeight: 'bold',
  },
  radarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 10,
  },
  radarItem: {
    width: '48%',
    backgroundColor: '#0D0B14',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2B3B',
    alignItems: 'center',
  },
  radarLabel: {
    fontSize: 10,
    color: '#8A869F',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  radarStatus: {
    fontSize: 9,
    color: '#E0E0E0',
    marginTop: 4,
  },
  valuesSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  valueSummaryChip: {
    backgroundColor: '#1C1929',
    borderColor: '#3F51B5',
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
  },
  valueSummaryChipText: {
    color: '#E0E0E0',
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  videoMeetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8A80',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  videoMeetText: {
    color: '#0D0B14',
    fontWeight: 'bold',
    fontSize: 11,
    marginLeft: 6,
  },
  aiToolbarContainer: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#2D2B3B',
    marginBottom: 6,
  },
  aiToolbarLabel: {
    fontSize: 10,
    color: '#00E5FF',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  aiToolbarScroll: {
    gap: 8,
  },
  aiToolbarChip: {
    backgroundColor: '#1C1929',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  aiToolbarChipText: {
    fontSize: 10,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  breakdownHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  circularProgressBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FF8A80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  circularProgressScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8A80',
  },
  circularProgressLabel: {
    fontSize: 9,
    color: '#8A869F',
  },
  breakdownSubtitle: {
    fontSize: 11,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 12,
  },
  breakdownSection: {
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2B3B',
    paddingBottom: 14,
  },
  breakdownSectionTitle: {
    fontSize: 13,
    color: '#00E5FF',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  breakdownSectionDesc: {
    fontSize: 10,
    color: '#8A869F',
    marginBottom: 10,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  trendLabel: {
    fontSize: 11,
    color: '#E0E0E0',
    width: 80,
  },
  trendValue: {
    fontSize: 11,
    color: '#00E5FF',
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  deepValueBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  deepValueLabel: {
    fontSize: 11,
    color: '#E0E0E0',
    width: 110,
  },
  deepValuePercent: {
    fontSize: 11,
    color: '#FF8A80',
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridChip: {
    width: '48%',
    backgroundColor: '#1C1929',
    borderColor: '#3F51B5',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridChipText: {
    fontSize: 10,
    color: '#E0E0E0',
  },
  aiGuaranteeBox: {
    backgroundColor: '#0D0B14',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F51B5',
    marginBottom: 12,
  },
  aiGuaranteeText: {
    fontSize: 11,
    color: '#FF8A80',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  aiGuaranteeTextSub: {
    fontSize: 9,
    color: '#8A869F',
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 4,
  },

  // 1단계 온보딩 스플래시 스타일
  splashContainer: {
    flex: 1,
    backgroundColor: '#0D0B14',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  splashHeroImage: {
    width: '100%',
    height: '65%',
  },
  splashContent: {
    flex: 1,
    width: '100%',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B14',
  },
  splashTitle: {
    color: '#FF8A80',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  splashSubtitle: {
    color: '#8A869F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  splashActionRow: {
    width: '100%',
    alignItems: 'center',
  },
  splashButton: {
    width: '80%',
    paddingVertical: 6,
    borderRadius: 8,
  },

  // 1/2단계 대시보드 갤러리 그리드 스타일 (2열 격자)
  dashboardGalleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  dashboardGalleryItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#181524',
    borderWidth: 1,
    borderColor: '#2D2B3B',
  },
  dashboardGalleryImage: {
    width: '100%',
    height: '100%',
  },

  // 3단계 사이드 드로워 스타일
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
  },
  drawerContent: {
    width: '70%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: '#181524',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#2D2B3B',
    justifyContent: 'flex-start',
  },
  drawerHeader: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerUsername: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  drawerSubtitle: {
    color: '#8A869F',
    fontSize: 12,
    marginTop: 4,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2B3B',
  },
  drawerItemText: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  drawerLogoutBtn: {
    marginTop: 'auto',
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#2D2B3B',
    paddingTop: 16,
  },

  // 3단계 영상통화 오버레이 스타일
  videoCallContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoCallSafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoCallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  videoCallEncryptedText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  videoCallAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  videoCallAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF8A80',
    marginBottom: 16,
  },
  videoCallCallerName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoCallStatusText: {
    color: '#8A869F',
    fontSize: 14,
  },
  videoCallButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  videoCallBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  videoCallRejectBtn: {
    backgroundColor: '#FF5252',
  },
  videoCallAcceptBtn: {
    backgroundColor: '#00E676',
  },

  // 2단계 Congrats 매칭 성공 모달 스타일
  congratsContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#181524',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8A80',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  congratsEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  congratsTitle: {
    color: '#FF8A80',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  congratsDesc: {
    color: '#E0E0E0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },

  // 2단계 필터 스타일
  filterSectionLabel: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  filterOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    gap: 4,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#1C1929',
    borderColor: '#3F51B5',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOptionRowColumn: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  filterFlexChip: {
    backgroundColor: '#1C1929',
    borderColor: '#3F51B5',
    borderWidth: 1,
    width: '100%',
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  // 결정사 고도화 필터 스타일
  filterTabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2B3B',
    marginBottom: 16,
    width: '100%',
  },
  filterTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterTabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00E5FF',
  },
  filterTabText: {
    color: '#8A869F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTabTextActive: {
    color: '#00E5FF',
  },
  filterOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    width: '100%',
  },
  filterMiniChip: {
    backgroundColor: '#1C1929',
    borderColor: '#3F51B5',
    borderWidth: 1,
    paddingVertical: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1C1929',
    borderColor: '#2D2B3B',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 12,
  },
  switchLabelCol: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  switchSub: {
    color: '#8A869F',
    fontSize: 10,
    marginTop: 2,
  },
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallContent: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#181524',
    borderColor: '#00E5FF',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
});
