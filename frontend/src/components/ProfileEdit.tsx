import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Card, 
  Chip, 
  SegmentedButtons, 
  HelperText, 
  Divider,
  Surface
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
      bloodType: bloodType === '' ? undefined : bloodType,
      hobbies: hobbies.length > 0 ? hobbies : undefined
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card} mode="elevated">
        <Card.Title 
          title="상세 프로필 등록" 
          subtitle="가치관 정보를 채워 최적의 인연을 만나보세요" 
          titleStyle={styles.cardTitle}
          subtitleStyle={styles.cardSubtitle}
        />
        <Divider style={styles.divider} />
        
        <Card.Content>
          {/* 1. 종교 설정 (필수) */}
          <View style={styles.section}>
            <Text style={styles.label}>
              1. 종교 (宗教) <Text style={styles.required}>*필수</Text>
            </Text>
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
              theme={{ colors: { secondaryContainer: '#7C4DFF' } }}
              style={styles.segmented}
            />
            <Text style={styles.guideText}>
              ※ 宗教観が一致していると、将来の生活設計についてスムーズな合意形成がしやすくなります。
            </Text>
          </View>

          {/* 2. 라이프스타일 - 거주형태 (필수) */}
          <View style={styles.section}>
            <Text style={styles.label}>
              2. 거주 형태 (居住形態) <Text style={styles.required}>*필수</Text>
            </Text>
            <SegmentedButtons
              value={residenceType}
              onValueChange={setResidenceType}
              buttons={[
                { value: '자취', label: '자취' },
                { value: '본가', label: '본가' },
                { value: '기숙사', label: '기숙사/쉐어' },
                { value: '기타', label: '기타' }
              ]}
              theme={{ colors: { secondaryContainer: '#7C4DFF' } }}
              style={styles.segmented}
            />
          </View>

          {/* 3. 라이프스타일 - 음주 (필수) */}
          <View style={styles.section}>
            <Text style={styles.label}>
              3. 음주 여부 (飲酒) <Text style={styles.required}>*필수</Text>
            </Text>
            <SegmentedButtons
              value={drinking}
              onValueChange={(val: any) => setDrinking(val)}
              buttons={[
                { value: 'NO', label: '금주' },
                { value: 'SOMETIMES', label: '가끔' },
                { value: 'YES', label: '자주' }
              ]}
              theme={{ colors: { secondaryContainer: '#7C4DFF' } }}
              style={styles.segmented}
            />
          </View>

          {/* 4. 라이프스타일 - 흡연 (필수) */}
          <View style={styles.section}>
            <Text style={styles.label}>
              4. 흡연 여부 (喫煙) <Text style={styles.required}>*필수</Text>
            </Text>
            <SegmentedButtons
              value={smoking}
              onValueChange={(val: any) => setSmoking(val)}
              buttons={[
                { value: 'NO', label: '비흡연' },
                { value: 'YES', label: '흡연' }
              ]}
              theme={{ colors: { secondaryContainer: '#7C4DFF' } }}
              style={styles.segmented}
            />
            <Text style={styles.guideText}>
              ※ お酒やタバコ、お住まいの形態は、日々の暮らしのすれ違いを防ぐための最も重要な価値観です。
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* 5. 혈액형 (선택) */}
          <View style={styles.section}>
            <Text style={styles.label}>
              5. 혈액형 (血液型) <Text style={styles.optional}>선택</Text>
            </Text>
            <SegmentedButtons
              value={bloodType}
              onValueChange={(val: any) => setBloodType(val)}
              buttons={[
                { value: 'A', label: 'A형' },
                { value: 'B', label: 'B형' },
                { value: 'O', label: 'O형' },
                { value: 'AB', label: 'AB형' },
                { value: '', label: '선택안함' }
              ]}
              theme={{ colors: { secondaryContainer: '#FF2E93' } }}
              style={styles.segmented}
            />
            <Text style={styles.guideText}>
              ※ 韓国では血液型と性格の関連性について話すことが多く、会話の楽しいトピックとして役立ちます。
            </Text>
          </View>

          {/* 6. 취미 태그 Chip Input (선택) */}
          <View style={styles.section}>
            <Text style={styles.label}>
              6. 나의 취미 (趣味) <Text style={styles.optional}>선택 (최대 10개)</Text>
            </Text>
            <View style={styles.hobbyInputContainer}>
              <TextInput
                value={hobbyInput}
                onChangeText={setHobbyInput}
                placeholder="예: 요리, 일본여행, 애니메이션"
                placeholderTextColor="#666"
                mode="outlined"
                textColor="#FFF"
                style={styles.hobbyInput}
                activeOutlineColor="#00F0FF"
              />
              <Button 
                mode="contained" 
                buttonColor="#00F0FF" 
                textColor="#000"
                onPress={handleAddHobby}
                style={styles.hobbyAddButton}
              >
                추가
              </Button>
            </View>

            <View style={styles.chipContainer}>
              {hobbies.map((hobby, index) => (
                <Chip 
                  key={index} 
                  onClose={() => handleRemoveHobby(hobby)} 
                  style={styles.chip}
                  textStyle={{ color: '#FFF' }}
                >
                  {hobby}
                </Chip>
              ))}
            </View>
            <Text style={styles.guideText}>
              ※ 共通の趣味は、最初の会話を盛り上げ、緊張を和らげるきっかけになります。
            </Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          {onCancel && (
            <Button 
              mode="outlined" 
              onPress={onCancel} 
              textColor="#AAA" 
              style={styles.actionBtn}
              disabled={isSubmitting}
            >
              이전으로
            </Button>
          )}
          <Button 
            mode="contained" 
            buttonColor="#FF2E93" 
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
    backgroundColor: '#0F0E17',
  },
  card: {
    backgroundColor: '#1F1E26',
    borderRadius: 16,
    borderColor: '#2D2B3B',
    borderWidth: 1,
    paddingBottom: 8,
  },
  cardTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 8,
  },
  cardSubtitle: {
    color: '#8A869F',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#2D2B3B',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  required: {
    fontSize: 12,
    color: '#FF5252',
    fontWeight: 'normal',
  },
  optional: {
    fontSize: 12,
    color: '#8A869F',
    fontWeight: 'normal',
  },
  segmented: {
    marginBottom: 6,
  },
  guideText: {
    fontSize: 11,
    color: '#8A869F',
    lineHeight: 15,
    marginTop: 4,
  },
  hobbyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hobbyInput: {
    flex: 1,
    backgroundColor: '#161420',
    height: 48,
  },
  hobbyAddButton: {
    marginLeft: 8,
    height: 48,
    justifyContent: 'center',
    borderRadius: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#2D2B3B',
    marginRight: 6,
    marginBottom: 6,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
  },
  actionBtn: {
    borderRadius: 8,
  }
});
