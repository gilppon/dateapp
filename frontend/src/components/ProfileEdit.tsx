import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
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
  Switch
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
}

interface ProfileEditProps {
  initialData: {
    userName: string;
    userRole: 'korean' | 'fan';
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

export default function ProfileEdit({ initialData, onSave, onCancel, isSubmitting }: ProfileEditProps) {
  const [religion, setReligion] = useState<'NONE' | 'CHRISTIAN' | 'BUDDHIST' | 'CATHOLIC' | 'OTHER'>('NONE');
  const [residenceType, setResidenceType] = useState('자취');
  const [drinking, setDrinking] = useState<'YES' | 'NO' | 'SOMETIMES'>('SOMETIMES');
  const [smoking, setSmoking] = useState<'YES' | 'NO'>('NO');
  
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'O' | 'AB' | ''>('');
  
  // 취미용 태그(Chip) 입력 상태
  const [hobbyInput, setHobbyInput] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);

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
      lifestyle: {
        residenceType,
        drinking,
        smoking
      },
      bloodType: bloodType === '' ? undefined : bloodType as 'A' | 'B' | 'O' | 'AB',
      hobbies: hobbies.length > 0 ? hobbies : undefined
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.welcomeContainer} elevation={1}>
        <Text style={styles.welcomeTitle}>진지한 인연을 위해 가치관을 공유해 주세요</Text>
        <Text style={styles.welcomeSubtitle}>서로의 다름을 이해하는 첫 걸음입니다. 신뢰 배지와 함께 매칭율이 높아집니다. 🌸</Text>
      </Surface>

      <Surface style={styles.badgeStatusContainer} elevation={1}>
        <Text style={styles.badgeSectionTitle}>🛡️ 나의 신뢰 인증 배지 현황</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.identityVerified ? '🆔' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.identityVerified ? styles.verifiedText : styles.unverifiedText]}>신원인증</Text>
            {initialData.verificationBadges?.identityVerified && initialData.verificationBadges?.identityExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.identityExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.employmentVerified ? '💼' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.employmentVerified ? styles.verifiedText : styles.unverifiedText]}>재직인증</Text>
            {initialData.verificationBadges?.employmentVerified && initialData.verificationBadges?.employmentExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.employmentExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.maritalStatusVerified ? '💍' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.maritalStatusVerified ? styles.verifiedText : styles.unverifiedText]}>미혼인증</Text>
            {initialData.verificationBadges?.maritalStatusVerified && initialData.verificationBadges?.maritalStatusExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.maritalStatusExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
          <View style={styles.badgeCol}>
            <Text style={styles.badgeIcon}>{initialData.verificationBadges?.educationVerified ? '🎓' : '⚪'}</Text>
            <Text style={[styles.badgeLabel, initialData.verificationBadges?.educationVerified ? styles.verifiedText : styles.unverifiedText]}>학력인증</Text>
            {initialData.verificationBadges?.educationVerified && initialData.verificationBadges?.educationExpiredAt && (
              <Text style={styles.expiryLabel}>~{new Date(initialData.verificationBadges.educationExpiredAt).toLocaleDateString()}</Text>
            )}
          </View>
        </View>
        <Text style={styles.badgeInfoText}>※ 공인 서류 기반 심사를 거쳐 발급됩니다. 상호주의(Reciprocity) 가드가 적용되어, 본인이 먼저 인증한 배지만 상대방에게도 공개되고 열람할 수 있습니다.</Text>
      </Surface>

      <Card style={styles.card} mode="elevated">
        <Card.Title 
          title="🔴 필수 입력 정보" 
          subtitle="결혼 매칭을 위해 반드시 입력이 필요합니다." 
          titleStyle={[styles.cardTitle, { color: '#FF8A80' }]}
          subtitleStyle={styles.cardSubtitle}
        />
        <Divider style={styles.divider} />
        
        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.label}>1. 종교 (宗教) <Text style={styles.required}>*필수</Text></Text>
            <SegmentedButtons
              value={religion}
              onValueChange={(val: any) => setReligion(val)}
              buttons={[
                { value: 'NONE', label: '무교' },
                { value: 'CHRISTIAN', label: '개신교' },
                { value: 'BUDDHIST', label: '불교' },
                { value: 'CATHOLIC', label: '천주교' },
                { value: 'OTHER', label: '기타' }
              ]}
              theme={{ colors: { secondaryContainer: '#3F51B5', onSecondaryContainer: '#FFFFFF' } }}
              style={styles.segmented}
            />
            <Text style={styles.guideText}>※ 宗教観が一致していると、将来の生活設計についてスムーズな合意形成이 매우 유리해집니다.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>2. 거주 형태 (居住形態) <Text style={styles.required}>*필수</Text></Text>
            <SegmentedButtons
              value={residenceType}
              onValueChange={setResidenceType}
              buttons={[
                { value: '자취', label: '자취' },
                { value: '본가', label: '본가' },
                { value: '기숙사', label: '기숙사/쉐어' },
                { value: '기타', label: '기타' }
              ]}
              theme={{ colors: { secondaryContainer: '#3F51B5' } }}
              style={styles.segmented}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>3. 음주 여부 (飲酒) <Text style={styles.required}>*필수</Text></Text>
                <Text style={styles.switchDesc}>가끔 마시거나 자주 음주를 하시는 경우 켬</Text>
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
                <Text style={styles.label}>4. 흡연 여부 (喫煙) <Text style={styles.required}>*필수</Text></Text>
                <Text style={styles.switchDesc}>전자담배 혹은 연초를 피우시는 경우 켬</Text>
              </View>
              <Switch
                value={smoking === 'YES'}
                onValueChange={(val) => setSmoking(val ? 'YES' : 'NO')}
                color="#FF8A80"
              />
            </View>
            <Text style={styles.guideText}>※ お酒やタバコ、お住まいの形態は、日々の暮らし의 사소한 갈등을 방지하는 핵심 평화 지표입니다.</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { marginTop: 16 }]} mode="elevated">
        <Card.Title 
          title="🟢 선택 입력 정보" 
          subtitle="취미와 선호 사항을 적어 매칭 카드를 꾸며보세요." 
          titleStyle={[styles.cardTitle, { color: '#00E5FF' }]}
          subtitleStyle={styles.cardSubtitle}
        />
        <Divider style={styles.divider} />

        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.label}>5. 혈액형 (血液型) <Text style={styles.optional}>선택</Text></Text>
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
            <Text style={styles.guideText}>※ 韓日 커플 간의 친밀한 스킨십 및 성격 유형 토크를 부드럽게 이어주는 대화 윤활유입니다.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>6. 나의 취미 (趣味) <Text style={styles.optional}>선택 (최대 10개)</Text></Text>
            <Text style={styles.subLabel}>추천 프리셋 취미 (태그 클릭 시 추가/삭제)</Text>
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
                placeholder="예: 요리, 일본여행, 애니메이션"
                placeholderTextColor="#8A869F"
                mode="outlined"
                textColor="#FFF"
                style={styles.hobbyInput}
                activeOutlineColor="#00E5FF"
                outlineColor="#2D2B3B"
                theme={{ colors: { background: '#181524' } }}
              />
              <Button mode="contained" buttonColor="#00E5FF" textColor="#0D0B14" onPress={handleAddHobby} style={styles.hobbyAddButton}>추가</Button>
            </View>

            <View style={styles.chipContainer}>
              {hobbies.map((hobby, index) => (
                <Chip key={index} onClose={() => handleRemoveHobby(hobby)} style={styles.chip} textStyle={{ color: '#FFF' }}>{hobby}</Chip>
              ))}
            </View>
            <Text style={styles.guideText}>※ 共通の趣味は、最初の会話を盛り上げ、緊張을 완화시키는 훌륭한 계기가 됩니다.</Text>
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
              이전으로
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
            프로필 완성 및 대기실 입장 🚀
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
  }
});
