import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Alert, Animated } from 'react-native';
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
  ProgressBar
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AudioStreamer } from './src/utils/AudioStreamer';

// WOW 팩터가 가미된 세련된 K-Wave 하모니어스 핑크 & 네이비 다크 테마
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF2E93',       // 트렌디하고 네온 느낌의 강렬한 핫핑크
    secondary: '#7C4DFF',     // 매혹적인 네온 바이올렛
    background: '#0F0E17',    // 고급스러운 칠흑색 백그라운드
    surface: '#1F1E26',       // 따뜻하고 깊이감 있는 퍼플그레이 표면
    error: '#FF5252',
    accent: '#00F0FF',        // 형광 사이언 하이라이트
  },
};

export default function App() {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'korean' | 'fan'>('fan');
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [roomId, setRoomId] = useState('k-wave-match-room-1');
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('대기 중...');
  const [peerId, setPeerId] = useState<string | null>(null);
  
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  
  // 마이크 음성 파형용 애니메이션 값 (Wow micro-animation 효과)
  const waveAnim = useRef(new Animated.Value(1)).current;
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  // 보이스톡 연결 중 애니메이션 루프 가동
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
          userId
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

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.titleText}>korea aimasu 🇰🇷💖</Text>
          <Text variant="bodySmall" style={styles.subtitleText}>한류 팬과 한국인의 초저지연 프라이빗 보이스 데이트</Text>
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
            <Avatar.Icon size={size} icon="shield-lock" backgroundColor={theme.colors.error} />
          )}
          style={styles.banner}
        >
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </Banner>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!isRegistered ? (
            <Card style={styles.card} mode="elevated">
              <Card.Title 
                title="글로벌 프로필 설정" 
                subtitle="익명으로 매칭되어 안전하고 비밀스럽게 대화하세요" 
                titleStyle={styles.cardTitle}
                subtitleStyle={styles.cardSubtitle}
              />
              <Card.Content>
                <TextInput
                  label="메이트 닉네임"
                  value={userName}
                  onChangeText={setUserName}
                  mode="flat"
                  underlineColor="transparent"
                  textColor="#FFF"
                  activeUnderlineColor={theme.colors.primary}
                  style={styles.input}
                />
                
                <Text style={styles.label}>지구 반대편 메이트에게 나를 소개하세요:</Text>
                <View style={styles.roleContainer}>
                  <Button 
                    mode={userRole === 'korean' ? 'contained' : 'outlined'} 
                    onPress={() => setUserRole('korean')}
                    style={styles.roleButton}
                    buttonColor={userRole === 'korean' ? theme.colors.primary : undefined}
                    textColor={userRole === 'korean' ? '#FFF' : theme.colors.primary}
                  >
                    한국인 메이트 🇰🇷
                  </Button>
                  <Button 
                    mode={userRole === 'fan' ? 'contained' : 'outlined'} 
                    onPress={() => setUserRole('fan')}
                    style={styles.roleButton}
                    buttonColor={userRole === 'fan' ? theme.colors.secondary : undefined}
                    textColor={userRole === 'fan' ? '#FFF' : theme.colors.secondary}
                  >
                    한류 팬 메이트 🌍
                  </Button>
                </View>
              </Card.Content>
              <Card.Actions style={{ marginTop: 20 }}>
                <Button 
                  mode="contained" 
                  buttonColor={theme.colors.primary} 
                  onPress={handleRegister}
                  style={{ width: '100%', paddingVertical: 4 }}
                >
                  프로필 등록 및 대기실 가기 🚀
                </Button>
              </Card.Actions>
            </Card>
          ) : (
            <View>
              <Card style={styles.card} mode="contained">
                <Card.Content style={styles.userInfoContent}>
                  <Avatar.Icon 
                    size={48} 
                    icon={userRole === 'korean' ? 'heart-pulse' : 'earth'} 
                    backgroundColor={userRole === 'korean' ? theme.colors.primary : theme.colors.secondary} 
                  />
                  <View style={styles.userInfoText}>
                    <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: 'bold' }}>{userName}</Text>
                    <Text variant="bodyMedium" style={{ color: '#AAA' }}>
                      {userRole === 'korean' ? 'Seoul, South Korea 🇰🇷' : 'K-Wave Passionate Fan 🌍'}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.card}>
                <Card.Title 
                  title="초저지연 1:1 보이스 룸" 
                  subtitle="실시간 Gemini 3.5 AI 가드가 스캠과 사기로부터 보호합니다." 
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                />
                <Card.Content>
                  <Surface style={styles.statusBox} elevation={2}>
                    <Text variant="bodySmall" style={styles.statusTitle}>현재 게이트웨이 신호 상태</Text>
                    <Text variant="titleLarge" style={styles.statusValue}>{callStatus}</Text>
                    
                    {inCall && (
                      <View style={{ marginTop: 12 }}>
                        <ProgressBar progress={0.5} color={theme.colors.primary} indeterminate style={styles.progressBar} />
                      </View>
                    )}

                    {inCall && peerId && (
                      <View style={styles.peerInfo}>
                        <Animated.View style={[styles.waveCircle, { transform: [{ scale: waveAnim }] }]}>
                          <Avatar.Icon size={40} icon="microphone" backgroundColor={theme.colors.primary} />
                        </Animated.View>
                        <View style={{ marginLeft: 16 }}>
                          <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: 'bold' }}>메이트: {peerId}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.accent }}>초저지연 PCM 터널링 연결 수립 완료</Text>
                        </View>
                      </View>
                    )}
                  </Surface>
                </Card.Content>
                <Card.Actions style={{ marginTop: 8 }}>
                  {!inCall ? (
                    <Button 
                      mode="contained" 
                      buttonColor="#00E676" 
                      textColor="#000"
                      onPress={() => {
                        setInCall(true);
                        connectSocket();
                      }}
                      style={styles.callButton}
                      icon="phone-classic"
                    >
                      실시간 보이스 데이트 매칭 개시
                    </Button>
                  ) : (
                    <Button 
                      mode="contained" 
                      buttonColor={theme.colors.error} 
                      onPress={disconnectSocket}
                      style={styles.callButton}
                      icon="phone-hangup"
                    >
                      전화 종료 및 대기실 복귀
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E17',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#252331',
    backgroundColor: '#161420',
  },
  titleText: {
    color: '#FF2E93',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitleText: {
    color: '#8A869F',
    marginTop: 6,
    fontWeight: '500',
  },
  banner: {
    backgroundColor: '#1F1E26',
    borderBottomWidth: 1,
    borderBottomColor: '#CF6679',
  },
  bannerText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1F1E26',
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2B3B',
  },
  cardTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  cardSubtitle: {
    color: '#8A869F',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2D2B3B',
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
    borderColor: '#FF2E93',
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
    backgroundColor: '#161420',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#252331',
  },
  statusTitle: {
    color: '#8A869F',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusValue: {
    color: '#FF2E93',
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
    backgroundColor: 'rgba(255, 46, 147, 0.15)',
  },
  callButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 6,
  }
});
