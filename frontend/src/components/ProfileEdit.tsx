import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Card, 
  Chip, 
  SegmentedButtons, 
  HelperText, 
  Divider,
  Surface,
  Switch,
  IconButton
} from 'react-native-paper';

export interface ProfileData {
  userName: string;
  userRole: 'korean' | 'fan';
  religion: 'NONE' | 'CHRISTIAN' | 'BUDDHIST' | 'CATHOLIC' | 'OTHER';
  lifestyle: {
    residenceType: string;
    drinking: 'YES' | 'NO' | 'SOMETIMES';
    smoking: 'YES' | 'NO';
  };
  bloodType?: 'A' | 'B' | 'O' | 'AB';
  hobbies?: string[];
  gallery?: string[];
  languageSkill?: 'BASIC' | 'INTERMEDIATE' | 'FLUENT';
}

interface ProfileEditProps {
  lang?: 'ko' | 'ja';
  initialData: {
    userName: string;
    userRole: 'korean' | 'fan';
    gallery?: string[];
    languageSkill?: 'BASIC' | 'INTERMEDIATE' | 'FLUENT';
    verificationBadges?: {
      identityVerified: boolean;
      employmentVerified: boolean;
      maritalStatusVerified: boolean;
      educationVerified: boolean;
      identityExpiredAt?: string | Date;
      employmentExpiredAt?: string | Date;
      maritalStatusExpiredAt?: string | Date;
      educationExpiredAt?: string | Date;
    };
  };
  onSave: (data: Omit<ProfileData, 'userName' | 'userRole'> & { userName: string, userRole: 'korean' | 'fan' }) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
}

const GALLERY_IMAGES: { [key: string]: any } = {
  gallery_cafe: require('../../assets/gallery_cafe.png'),
  gallery_walk: require('../../assets/gallery_walk.png'),
  gallery_food: require('../../assets/gallery_food.png'),
};

const EDIT_TRANSLATIONS = {
  ko: {
    mate: '메이트',
    shareValuesTitle: '진지한 인연을 위해 가치관을 공유해 주세요',
    shareValuesSub: '서로의 다름을 이해하는 첫 걸음입니다. 신뢰 배지와 함께 매칭율이 높아집니다. 🌸',
    badgeStatusTitle: '🛡️ 나의 신뢰 인증 배지 현황',
    badgeId: '신원인증',
    badgeJob: '재직인증',
    badgeSingle: '미혼인증',
    badgeEdu: '학력인증',
    badgeNotice: '※ 공인 서류 기반 심사를 거쳐 발급됩니다. 상호주의(Reciprocity) 가드가 적용되어, 본인이 먼저 인증한 배지만 상대방에게도 공개되고 열람할 수 있습니다.',
    requiredSectionTitle: '🔴 필수 입력 정보',
    requiredSectionSub: '결혼 매칭을 위해 반드시 입력이 필요합니다.',
    optionalSectionTitle: '🟢 선택 입력 정보',
    optionalSectionSub: '취미와 선호 사항을 적어 매칭 카드를 꾸며보세요.',
    religionLabel: '1. 종교 (宗教)',
    requiredTag: '*필수',
    religionGuide: '※ 종교관이 일치하면 미래 라이프 설계에 관한 매끄러운 합의가 매우 유리해집니다.',
    residenceLabel: '2. 거주 형태 (居住形態)',
    residenceSelf: '자취',
    residenceHome: '본가',
    residenceDorm: '기숙사/쉐어',
    residenceOther: '기타',
    drinkingLabel: '3. 음주 여부 (飲酒)',
    drinkingDesc: '가끔 마시거나 자주 음주를 하시는 경우 켬',
    smokingLabel: '4. 흡연 여부 (喫煙)',
    smokingDesc: '전자담배 혹은 연초를 피우시는 경우 켬',
    lifestyleGuide: '※ 음주, 흡연, 거주 형태는 일상생활의 갈등을 예방하는 평화 지표입니다.',
    bloodTypeLabel: '5. 혈액형 (血液型)',
    optionalTag: '선택',
    bloodTypeGuide: '※ 한일 커플 간의 성격 유형 토크를 즐겁게 이어주는 대화 윤활유입니다.',
    hobbiesLabel: '6. 나의 취미 (趣味)',
    presetHobbyLabel: '추천 프리셋 취미 (태그 클릭 시 추가/삭제)',
    hobbyPlaceholder: '예: 요리, 일본여행, 애니메이션',
    add: '추가',
    hobbyGuide: '※ 공통의 취미는 첫 대화의 긴장을 해소하고 즐거운 흐름을 만듭니다.',
    galleryLabel: '7. 나의 일상 갤러리 (日常写真)',
    gallerySub: '카메라 아이콘을 탭해 감성 일상 사진을 가상 등록해 보세요.',
    addPhoto: '사진 추가',
    galleryGuide: '※ 갤러리 사진은 라이프스타일을 어필하여 호감도를 상승시키는 핵심 요소입니다.',
    back: '이전으로',
    saveBtn: '프로필 완성 및 대기실 입장 🚀',
    religionNone: '무교',
    religionChristian: '개신교',
    religionBuddhist: '불교',
    religionCatholic: '천주교',
    religionOther: '기타',
    maxPhotoAlert: '갤러리 사진은 최대 6장까지 등록 가능합니다.',
    langSkillLabel: '1-1. 상대방 언어 구사 수준',
    langSkillGuide: '※ 상대방의 모국어(한국어/일본어) 구사 능력을 기재해 주세요. 소통 가능 수준 매칭의 기본이 됩니다.',
    langSkillBasic: '기초 회화 (번역기 필요)',
    langSkillIntermediate: '일상 대화 가능',
    langSkillFluent: '비즈니스 및 원활',
  },
  ja: {
    mate: 'メイト',
    shareValuesTitle: '真剣な出会いのために価値観を共有してください',
    shareValuesSub: 'お互いの違いを理解する第一歩です。信頼バッジと共にマッチング率が高まります。🌸',
    badgeStatusTitle: '🛡️ 私の信頼認証バッジ現況',
    badgeId: '身元認証',
    badgeJob: '在職認証',
    badgeSingle: '独身認証',
    badgeEdu: '学歴認証',
    badgeNotice: '※ 公적書類による審査を経て発行されます。相互主義(Reciprocity)ガードが適用され, ご自身がまず認証したバッジのみが相手にも公開され, 閲覧できるようになります。',
    requiredSectionTitle: '🔴 必須入力情報',
    requiredSectionSub: '結婚マッチングのために必ず入力が必要です。',
    optionalSectionTitle: '🟢 選択入力情報',
    optionalSectionSub: '趣味と好みを記入してマッチングカードを飾りましょう。',
    religionLabel: '1. 宗教 (宗教)',
    requiredTag: '*必須',
    religionGuide: '※ 宗教観が一致していると、将来의生活設計についてスムーズな合意形成が非常に有利になります。',
    residenceLabel: '2. 居住形態 (居住形態)',
    residenceSelf: '一人暮らし',
    residenceHome: '実家',
    residenceDorm: '寮/シェアハウス',
    residenceOther: 'その他',
    drinkingLabel: '3. 飲酒有無 (飲酒)',
    drinkingDesc: 'たまに飲む、または頻繁にお酒を飲まれる場合はオン',
    smokingLabel: '4. 喫煙有無 (喫煙)',
    smokingDesc: '電子タバコや紙巻きタバコを吸われる場合はオン',
    lifestyleGuide: '※ お酒やタバコ、お住まいの形態は、日々の暮らしの些細な葛藤を防止する核心的な平和指標です。',
    bloodTypeLabel: '5. 血液型 (血液型)',
    optionalTag: '選択',
    bloodTypeGuide: '※ 日韓カップル間の親密なスキンシップや性格タイプトークをスムーズにつなぐ会話の潤滑油です。',
    hobbiesLabel: '6. 私의趣味 (趣味)',
    presetHobbyLabel: 'おすすめのプリセット趣味（タグクリックで追加/削除）',
    hobbyPlaceholder: '例: 料理、日本旅行、アニメ',
    add: '追加',
    hobbyGuide: '※ 共通の趣味は、最初の会話を盛り上げ、緊張を和らげる素晴らしいきっかけになります。',
    galleryLabel: '7. 私の日常ギャラリー (日常写真)',
    gallerySub: 'カメラアイコンをタップしてエモーショナルな日常写真を仮想登録してみてください。',
    addPhoto: '写真追加',
    galleryGuide: '※ ギャラリー写真を追加すると、マッチング相手にライフスタイルをアピールし、好感度を急上昇させることができます。',
    back: '戻る',
    saveBtn: 'プロフィール完成＆待機室入場 🚀',
    religionNone: '無宗教',
    religionChristian: 'キリスト教',
    religionBuddhist: '仏教',
    religionCatholic: 'カトリック',
    religionOther: 'その他',
    maxPhotoAlert: 'ギャラリー写真は最大6枚まで登録可能です。',
    langSkillLabel: '1-1. 相手の言語の能力レベル',
    langSkillGuide: '※ 相手の母国語（韓国語/日本語）の会話能力を記載してください。コミュニケーション可能レベルのマッチングの基本となります。',
    langSkillBasic: '基礎会話 (翻訳機必要)',
    langSkillIntermediate: '日常会話可能',
    langSkillFluent: 'ビジネス＆流暢',
  }
};

export default function ProfileEdit({ lang = 'ko', initialData, onSave, onCancel, isSubmitting }: ProfileEditProps) {
  const [religion, setReligion] = useState<'NONE' | 'CHRISTIAN' | 'BUDDHIST' | 'CATHOLIC' | 'OTHER'>('NONE');
  const [languageSkill, setLanguageSkill] = useState<'BASIC' | 'INTERMEDIATE' | 'FLUENT'>(initialData.languageSkill || 'BASIC');
  const [residenceType, setResidenceType] = useState('자취');
  const [drinking, setDrinking] = useState<'YES' | 'NO' | 'SOMETIMES'>('SOMETIMES');
  const [smoking, setSmoking] = useState<'YES' | 'NO'>('NO');
  
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'O' | 'AB' | ''>('');
  
  // 취미용 태그(Chip) 입력 상태
  const [hobbyInput, setHobbyInput] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);

  // 갤러리 이미지 관리 상태
  const [gallery, setGallery] = useState<string[]>(initialData.gallery || []);

  const t = (key: keyof typeof EDIT_TRANSLATIONS.ko) => {
    return EDIT_TRANSLATIONS[lang][key] || EDIT_TRANSLATIONS.ko[key];
  };

  const handleAddMockImage = () => {
    if (gallery.length >= 6) {
      alert(t('maxPhotoAlert'));
      return;
    }
    const keys = ['gallery_cafe', 'gallery_walk', 'gallery_food'];
    const nextIndex = gallery.length % 3;
    const newKey = `${keys[nextIndex]}_${Date.now()}`;
    setGallery([...gallery, newKey]);
  };

  const handleRemoveMockImage = (targetKey: string) => {
    setGallery(gallery.filter(item => item !== targetKey));
  };

  // MD3 프리셋 취미 정의
  const PRESET_HOBBIES = [
    '일본여행 ✈️',
    '애니메이션 🎮',
    '요리 🍳',
    'K-드라마 📺',
    '골프 ⛳'
  ];

  const handleTogglePresetHobby = (hobby: string) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter(h => h !== hobby));
    } else {
      if (hobbies.length >= 10) return;
      setHobbies([...hobbies, hobby]);
    }
  };


  const handleAddHobby = () => {
    const trimmed = hobbyInput.trim();
    if (trimmed && !hobbies.includes(trimmed)) {
      if (hobbies.length >= 10) {
        return; // 최대 10개
      }
      setHobbies([...hobbies, trimmed]);
      setHobbyInput('');
    }
  };

  const handleRemoveHobby = (hobby: string) => {
    setHobbies(hobbies.filter(h => h !== hobby));
  };

  const handleSave = () => {
    onSave({
      userName: initialData.userName,
      userRole: initialData.userRole,
      religion,
      languageSkill,
      lifestyle: {
        residenceType,
        drinking,
        smoking
      },
      bloodType: bloodType === '' ? undefined : bloodType as 'A' | 'B' | 'O' | 'AB',
      hobbies: hobbies.length > 0 ? hobbies : undefined,
      gallery: gallery.length > 0 ? gallery : undefined
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 아바타 영역 및 카메라 플로팅 오버레이 */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={require('../../assets/main_visual.png')} 
            style={styles.avatarImage} 
          />
          <TouchableOpacity style={styles.avatarCameraBtn} activeOpacity={0.8} onPress={handleAddMockImage}>
            <IconButton icon="camera" iconColor="#FFF" size={16} style={{ margin: 0 }} />
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarNameText}>{initialData.userName} ({t('mate')})</Text>
      </View>

      <Surface style={styles.welcomeContainer} elevation={1}>
        <Text style={styles.welcomeTitle}>{t('shareValuesTitle')}</Text>
        <Text style={styles.welcomeSubtitle}>{t('shareValuesSub')}</Text>
      </Surface>

      <Surface style={styles.badgeStatusContainer} elevation={1}>
        <Text style={styles.badgeSectionTitle}>{t('badgeStatusTitle')}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.identityVerified ? '🆔' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.identityVerified ? styles.verifiedText : styles.unverifiedText]}>{t('badgeId')}</Text>
            {initialData.verificationBadges?.identityVerified && initialData.verificationBadges?.identityExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.identityExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.employmentVerified ? '💼' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.employmentVerified ? styles.verifiedText : styles.unverifiedText]}>{t('badgeJob')}</Text>
            {initialData.verificationBadges?.employmentVerified && initialData.verificationBadges?.employmentExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.employmentExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.maritalStatusVerified ? '💍' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.maritalStatusVerified ? styles.verifiedText : styles.unverifiedText]}>{t('badgeSingle')}</Text>
            {initialData.verificationBadges?.maritalStatusVerified && initialData.verificationBadges?.maritalStatusExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.maritalStatusExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.educationVerified ? '🎓' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.educationVerified ? styles.verifiedText : styles.unverifiedText]}>{t('badgeEdu')}</Text>
            {initialData.verificationBadges?.educationVerified && initialData.verificationBadges?.educationExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.educationExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
        </View>
        <Text style={styles.badgeInfoText}>{t('badgeNotice')}</Text>
      </Surface>

      <Card style={styles.card} mode="elevated">
        <Card.Title 
          title={t('requiredSectionTitle')} 
          subtitle={t('requiredSectionSub')} 
          titleStyle={[styles.cardTitle, { color: '#FF8A80' }]}
          subtitleStyle={styles.cardSubtitle}
        />
        <Divider style={styles.divider} />
        
        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.label}>{t('religionLabel')} <Text style={styles.required}>{t('requiredTag')}</Text></Text>
            <SegmentedButtons
              value={religion}
              onValueChange={(val: any) => setReligion(val)}
              buttons={[
                { value: 'NONE', label: t('religionNone') },
                { value: 'CHRISTIAN', label: t('religionChristian') },
                { value: 'BUDDHIST', label: t('religionBuddhist') },
                { value: 'CATHOLIC', label: t('religionCatholic') },
                { value: 'OTHER', label: t('religionOther') }
              ]}
              theme={{ colors: { secondaryContainer: '#3F51B5', onSecondaryContainer: '#FFFFFF' } }}
              style={styles.segmented}
            />
            <Text style={styles.guideText}>{t('religionGuide')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('residenceLabel')} <Text style={styles.required}>{t('requiredTag')}</Text></Text>
            <SegmentedButtons
              value={residenceType}
              onValueChange={setResidenceType}
              buttons={[
                { value: '자취', label: t('residenceSelf') },
                { value: '본가', label: t('residenceHome') },
                { value: '기숙사', label: t('residenceDorm') },
                { value: '기타', label: t('residenceOther') }
              ]}
              theme={{ colors: { secondaryContainer: '#3F51B5' } }}
              style={styles.segmented}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('drinkingLabel')} <Text style={styles.required}>{t('requiredTag')}</Text></Text>
                <Text style={styles.switchDesc}>{t('drinkingDesc')}</Text>
              </View>
              <Switch
                value={drinking !== 'NO'}
                onValueChange={(val) => setDrinking(val ? 'SOMETIMES' : 'NO')}
                color="#FF8A80"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('smokingLabel')} <Text style={styles.required}>{t('requiredTag')}</Text></Text>
                <Text style={styles.switchDesc}>{t('smokingDesc')}</Text>
              </View>
              <Switch
                value={smoking === 'YES'}
                onValueChange={(val) => setSmoking(val ? 'YES' : 'NO')}
                color="#FF8A80"
              />
            </View>
            <Text style={styles.guideText}>{t('lifestyleGuide')}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { marginTop: 16 }]} mode="elevated">
        <Card.Title 
          title={t('optionalSectionTitle')} 
          subtitle={t('optionalSectionSub')} 
          titleStyle={[styles.cardTitle, { color: '#00E5FF' }]}
          subtitleStyle={styles.cardSubtitle}
        />
        <Divider style={styles.divider} />

        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.label}>{t('bloodTypeLabel')} <Text style={styles.optional}>{t('optionalTag')}</Text></Text>
            <View style={styles.bloodGrid}>
              {(['A', 'B', 'O', 'AB'] as const).map((type) => {
                const isSelected = bloodType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setBloodType(isSelected ? '' : type)}
                    style={[styles.bloodCircle, isSelected && styles.bloodCircleSelected]}
                  >
                    <Text style={[styles.bloodCircleText, isSelected && styles.bloodCircleSelectedText]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.guideText}>{t('bloodTypeGuide')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('hobbiesLabel')} <Text style={styles.optional}>{t('optionalTag')} (최대 10개)</Text></Text>
            <Text style={styles.subLabel}>{t('presetHobbyLabel')}</Text>
            <View style={styles.presetChipContainer}>
              {PRESET_HOBBIES.map((presetHobby) => {
                const isSelected = hobbies.includes(presetHobby);
                return (
                  <Chip
                    key={presetHobby}
                    selected={isSelected}
                    onPress={() => handleTogglePresetHobby(presetHobby)}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                    textStyle={[styles.presetChipText, isSelected && styles.presetChipSelectedText]}
                  >
                    {presetHobby}
                  </Chip>
                );
              })}
            </View>

            <View style={styles.hobbyInputContainer}>
              <TextInput
                value={hobbyInput}
                onChangeText={setHobbyInput}
                placeholder={t('hobbyPlaceholder')}
                placeholderTextColor="#8A869F"
                mode="outlined"
                textColor="#FFF"
                style={styles.hobbyInput}
                activeOutlineColor="#00E5FF"
                outlineColor="#2D2B3B"
                theme={{ colors: { background: '#181524' } }}
              />
              <Button mode="contained" buttonColor="#00E5FF" textColor="#0D0B14" onPress={handleAddHobby} style={styles.hobbyAddButton}>{t('add')}</Button>
            </View>

            <View style={styles.chipContainer}>
              {hobbies.map((hobby, index) => (
                <Chip key={index} onClose={() => handleRemoveHobby(hobby)} style={styles.chip} textStyle={{ color: '#FFF' }}>{hobby}</Chip>
              ))}
            </View>
            <Text style={styles.guideText}>{t('hobbyGuide')}</Text>
          </View>

          {/* 7. 나의 일상 갤러리 섹션 신설 */}
          <View style={[styles.section, { marginTop: 16 }]}>
            <Text style={styles.label}>{t('galleryLabel')} <Text style={styles.optional}>{t('optionalTag')} (최대 6장)</Text></Text>
            <Text style={styles.subLabel}>{t('gallerySub')}</Text>
            
            <View style={styles.galleryManageContainer}>
              {/* 추가 버튼 */}
              {gallery.length < 6 && (
                <TouchableOpacity style={styles.galleryAddBtn} onPress={handleAddMockImage}>
                  <IconButton icon="camera" iconColor="#00E5FF" size={20} style={{ margin: 0 }} />
                  <Text style={styles.galleryAddText}>{t('addPhoto')} ({gallery.length}/6)</Text>
                </TouchableOpacity>
              )}
              
              {/* 등록된 사진 그리드 */}
              <View style={styles.galleryGrid}>
                {gallery.map((item) => {
                  const prefix = item.split('_')[0];
                  const imgSource = GALLERY_IMAGES[prefix];
                  return (
                    <View key={item} style={styles.galleryItemContainer}>
                      <Image source={imgSource} style={styles.galleryItemImage} />
                      <TouchableOpacity 
                        style={styles.galleryDeleteBadge} 
                        onPress={() => handleRemoveMockImage(item)}
                      >
                        <IconButton icon="close" iconColor="#FFF" size={10} style={{ margin: 0 }} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
            <Text style={styles.guideText}>{t('galleryGuide')}</Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          {onCancel && (
            <Button 
              mode="outlined" 
              onPress={onCancel} 
              textColor="#8A869F" 
              style={styles.actionBtn}
              disabled={isSubmitting}
            >
              {t('back')}
            </Button>
          )}
          <Button 
            mode="contained" 
            buttonColor="#FF8A80" 
            textColor="#0D0B14"
            onPress={handleSave} 
            style={[styles.actionBtn, { flex: 1 }]}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {t('saveBtn')}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0D0B14',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  welcomeContainer: {
    padding: 18,
    backgroundColor: '#181524',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2B3B',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8A80',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#8A869F',
    textAlign: 'center',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#181524',
    borderRadius: 12,
    borderColor: '#2D2B3B',
    borderWidth: 1,
    paddingBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  cardSubtitle: {
    color: '#8A869F',
    fontSize: 11,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#2D2B3B',
  },
  section: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 11,
    color: '#8A869F',
    marginBottom: 6,
  },
  required: {
    fontSize: 11,
    color: '#FF8A80',
    fontWeight: 'normal',
  },
  optional: {
    fontSize: 11,
    color: '#8A869F',
    fontWeight: 'normal',
  },
  segmented: {
    marginBottom: 4,
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchDesc: {
    fontSize: 11,
    color: '#8A869F',
    marginTop: -4,
  },
  bloodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  bloodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2D2B3B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181524',
  },
  bloodCircleSelected: {
    backgroundColor: '#FF8A80',
    borderColor: '#FF8A80',
  },
  bloodCircleText: {
    color: '#E0E0E0',
    fontWeight: 'bold',
    fontSize: 13,
  },
  bloodCircleSelectedText: {
    color: '#0D0B14',
  },
  guideText: {
    fontSize: 11,
    color: '#8A869F',
    lineHeight: 14,
    marginTop: 4,
  },
  presetChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#181524',
    borderColor: '#2D2B3B',
    borderWidth: 1,
  },
  presetChipSelected: {
    backgroundColor: '#FF8A80',
    borderColor: '#FF8A80',
  },
  presetChipText: {
    color: '#E0E0E0',
    fontSize: 11,
  },
  presetChipSelectedText: {
    color: '#0D0B14',
    fontWeight: '600',
  },
  hobbyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hobbyInput: {
    flex: 1,
    backgroundColor: '#181524',
    height: 48,
    borderRadius: 8,
  },
  hobbyAddButton: {
    marginLeft: 8,
    height: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#3F51B5',
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 8,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
  },
  actionBtn: {
    borderRadius: 8,
  },
  badgeStatusContainer: {
    padding: 14,
    backgroundColor: '#181524',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2B3B',
  },
  badgeSectionTitle: {
    fontSize: 13,
    color: '#00E5FF',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  badgeCol: {
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  expiryLabel: {
    fontSize: 8,
    color: '#8A869F',
    marginTop: 2,
  },
  verifiedText: {
    color: '#00E5FF',
  },
  unverifiedText: {
    color: '#8A869F',
  },
  badgeInfoText: {
    fontSize: 9,
    color: '#8A869F',
    textAlign: 'center',
    lineHeight: 13,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#FF8A80',
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF8A80',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarNameText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  galleryManageContainer: {
    marginTop: 8,
  },
  galleryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181524',
    borderWidth: 1,
    borderColor: '#2D2B3B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 12,
    borderStyle: 'dashed',
  },
  galleryAddText: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  galleryItemContainer: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'visible',
    backgroundColor: '#181524',
    borderWidth: 1,
    borderColor: '#2D2B3B',
  },
  galleryItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  galleryDeleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
