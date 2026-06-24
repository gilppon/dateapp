import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Alert, Animated } from 'react-native';
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
  ProgressBar
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AudioStreamer } from './src/utils/AudioStreamer';
import ProfileEdit from './src/components/ProfileEdit';

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
  
  // 신규 상세 프로필 제어 상태 변수
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [roomId, setRoomId] = useState('k-wave-match-room-1');
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('대기 중...');
  const [peerId, setPeerId] = useState<string | null>(null);
  
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  
  const waveAnim = useRef(new Animated.Value(1)).current;
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

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
      Alert.alert('성공', '상세 프로필 정보가 성공적으로 반영되었습니다!');
    } catch (error: any) {
      Alert.alert('프로필 저장 실패', error.message || '네트워크 상태를 확인해 주세요.');
    } finally {
      setIsSavingProfile(false);
    }
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
            <Avatar.Icon size={size} icon="shield-lock" style={{ backgroundColor: theme.colors.error }} />
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
          ) : (!profileCompleted || isEditMode) ? (
            <ProfileEdit
              initialData={{ userName, userRole }}
              onSave={saveDetailedProfile}
              onCancel={isEditMode ? () => setIsEditMode(false) : undefined}
              isSubmitting={isSavingProfile}
            />
          ) : (
            <View>
              <Card style={styles.card} mode="contained">
                <Card.Content style={styles.userInfoContent}>
                  <Avatar.Icon 
                    size={48} 
                    icon={userRole === 'korean' ? 'heart-pulse' : 'earth'} 
                    style={{ backgroundColor: userRole === 'korean' ? theme.colors.primary : theme.colors.secondary }} 
                  />
                  <View style={styles.userInfoText}>
                    <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: 'bold' }}>{userName}</Text>
                    <Text variant="bodyMedium" style={{ color: '#AAA' }}>
                      {userRole === 'korean' ? 'Seoul, South Korea 🇰🇷' : 'K-Wave Passionate Fan 🌍'}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Button 
                      icon="account-edit" 
                      mode="text" 
                      textColor={theme.colors.accent} 
                      onPress={() => setIsEditMode(true)}
                    >
                      편집
                    </Button>
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

                    {inCall && !peerId && (
                      <View style={styles.sandboxContainer}>
                        <Text variant="bodySmall" style={styles.sandboxTitle}>
                          💡 매칭 대기 중! 소개팅 번아웃 블록을 던지며 스트레스를 풀어보세요
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
  },
  sandboxContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2B3B',
    height: 320,
  },
  sandboxTitle: {
    color: '#00F0FF',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#161420',
    borderRadius: 12,
    overflow: 'hidden',
  }
});
