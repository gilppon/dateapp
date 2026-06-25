import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Alert, Animated, Image, Modal, TouchableOpacity } from 'react-native';
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
  Chip
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AudioStreamer } from './src/utils/AudioStreamer';
import ProfileEdit from './src/components/ProfileEdit';

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
      }
    } catch (err) {
      console.warn('프로필 배지 조회 실패:', err);
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


  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <View style={styles.outerWrapper}>
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="headlineMedium" style={styles.titleText}>Hana-Il Marriage Match 🇯🇵🇰🇷</Text>
            <IconButton
              icon="account-question-outline"
              iconColor={theme.colors.accent}
              size={26}
              onPress={() => setIsConciergeOpen(true)}
            />
          </View>
          <Text variant="bodySmall" style={styles.subtitleText}>한일 특화 가치관 매칭 & 실시간 AI 컨시어지 서비스</Text>
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
              <Image 
                source={require('./assets/main_visual.png')} 
                style={styles.heroImage} 
                resizeMode="cover"
              />
              <Card.Title 
                title="Hana-Il Marriage Match 🇯🇵🇰🇷" 
                subtitle="실사 매칭 기반 한일 결혼 특화 매칭 시스템" 
                titleStyle={styles.cardTitle}
                subtitleStyle={styles.cardSubtitle}
              />
              <Card.Content style={{ marginTop: 8 }}>
                <TextInput
                  label="메이트 닉네임"
                  value={userName}
                  onChangeText={setUserName}
                  mode="outlined"
                  textColor="#FFF"
                  activeOutlineColor={theme.colors.accent}
                  outlineColor="#2D2B3B"
                  theme={{ colors: { background: '#181524' } }}
                  style={styles.input}
                />
                
                <Text style={styles.label}>지구 반대편 메이트에게 나를 소개하세요:</Text>
                <View style={styles.roleContainer}>
                  <Button 
                    mode={userRole === 'korean' ? 'contained' : 'outlined'} 
                    onPress={() => setUserRole('korean')}
                    style={styles.roleButton}
                    buttonColor={userRole === 'korean' ? theme.colors.primary : undefined}
                    textColor={userRole === 'korean' ? '#0D0B14' : theme.colors.primary}
                  >
                    한국인 메이트 🇰🇷
                  </Button>
                  <Button 
                    mode={userRole === 'fan' ? 'contained' : 'outlined'} 
                    onPress={() => setUserRole('fan')}
                    style={styles.roleButton}
                    buttonColor={userRole === 'fan' ? theme.colors.secondary : undefined}
                    textColor={userRole === 'fan' ? '#FFF' : theme.colors.primary}
                  >
                    일인/해외 메이트 🇯🇵🌍
                  </Button>
                </View>
              </Card.Content>
              <Card.Actions style={{ marginTop: 20 }}>
                <Button 
                  mode="contained" 
                  buttonColor={theme.colors.primary} 
                  textColor="#0D0B14"
                  onPress={handleRegister}
                  style={{ width: '100%', paddingVertical: 4, borderRadius: 8 }}
                >
                  프로필 등록 및 대기실 가기 🚀
                </Button>
              </Card.Actions>
            </Card>
          ) : (!profileCompleted || isEditMode) ? (
            <ProfileEdit
              initialData={{ userName, userRole, verificationBadges: userBadges }}
              onSave={saveDetailedProfile}
              onCancel={isEditMode ? () => setIsEditMode(false) : undefined}
              isSubmitting={isSavingProfile}
            />
          ) : (
            <View>
              {/* 내 신뢰 인증 배지 현황 대시보드 카드 */}
              <Card style={styles.card} mode="contained">
                <Card.Content style={styles.userInfoContent}>
                  <Avatar.Icon 
                    size={48} 
                    icon={userRole === 'korean' ? 'heart-pulse' : 'earth'} 
                    style={{ backgroundColor: userRole === 'korean' ? theme.colors.primary : theme.colors.secondary }} 
                  />
                  <View style={styles.userInfoText}>
                    <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: 'bold' }}>{userName} 님</Text>
                    <Text variant="bodyMedium" style={{ color: '#AAA' }}>
                      {userRole === 'korean' ? 'Seoul, South Korea 🇰🇷' : 'Tokyo, Japan 🇯🇵'}
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
                <Divider style={{ backgroundColor: '#2D2B3B' }} />
                <Card.Content style={{ paddingVertical: 12 }}>
                  <Text variant="bodySmall" style={{ color: '#8A869F', fontWeight: 'bold', marginBottom: 6 }}>🛡️ 활성화된 내 신뢰 배지 (유효기간)</Text>
                  <View style={styles.ownBadgeContainer}>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>🆔</Text>
                      <Text style={styles.ownBadgeLabel}>신원 (1년)</Text>
                    </View>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>💼</Text>
                      <Text style={styles.ownBadgeLabel}>직장 (6개월)</Text>
                    </View>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>💍</Text>
                      <Text style={styles.ownBadgeLabel}>미혼 (3개월)</Text>
                    </View>
                    <View style={styles.ownBadgeItem}>
                      <Text style={{ fontSize: 16 }}>🎓</Text>
                      <Text style={styles.ownBadgeLabel}>학력 (무제한)</Text>
                    </View>
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
                        <View style={{ marginLeft: 16, flex: 1 }}>
                          <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: 'bold' }}>상대 메이트: {peerId}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.accent }}>초저지연 PCM 터널링 연결 수립 완료</Text>
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
                              <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: 'bold' }}>{peerId} 님</Text>
                              <Text variant="bodyMedium" style={{ color: '#8A869F', marginLeft: 6 }}>28세</Text>
                            </View>
                            <Text variant="bodySmall" style={{ color: '#00E5FF', marginTop: 2 }}>📍 Tokyo, Japan 🇯🇵</Text>
                          </View>
                          
                          {/* 92% Compatibility Score 배지 (탭 시 Match Breakdown 모달 노출) */}
                          <TouchableOpacity onPress={() => setIsBreakdownOpen(true)}>
                            <Surface style={styles.compatBadge} elevation={3}>
                              <Text style={styles.compatBadgeText}>호합도 92% 🔍</Text>
                            </Surface>
                          </TouchableOpacity>
                        </View>

                        {/* 신뢰 마이크로 배지 */}
                        <View style={styles.peerBadgeRow}>
                          <TouchableOpacity 
                            style={styles.microBadgeChip} 
                            onPress={() => Alert.alert('ID Verified', '여권 정보 및 본인 확인 검증 완료')}
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

                        <Divider style={{ marginVertical: 12, backgroundColor: '#2D2B3B' }} />

                        {/* 4분면 가치관 레이더 인디케이터 */}
                        <Text variant="bodySmall" style={{ color: '#8A869F', fontWeight: 'bold', marginBottom: 8 }}>📊 4분면 가치관 적합도 분석</Text>
                        <View style={styles.radarGrid}>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>자녀 계획</Text>
                            <ProgressBar progress={0.9} color="#FF8A80" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>일치 💚</Text>
                          </View>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>거주지 선호</Text>
                            <ProgressBar progress={0.7} color="#3F51B5" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>협의필요 ⚠️</Text>
                          </View>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>종교적 호환</Text>
                            <ProgressBar progress={0.95} color="#FF8A80" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>일치 💚</Text>
                          </View>
                          <View style={styles.radarItem}>
                            <Text style={styles.radarLabel}>재정/경제관</Text>
                            <ProgressBar progress={0.85} color="#FF8A80" style={{ height: 4, borderRadius: 2, width: 80 }} />
                            <Text style={styles.radarStatus}>일치 💚</Text>
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
                            💡 AI 가치관 조율 조언:
                          </Text>
                          <Text variant="bodySmall" style={{ color: '#E0E0E0', marginTop: 4, lineHeight: 15 }}>
                            "거주지(일본 이주)에 대해 약간의 조율이 필요하나, 자녀 계획과 종교관이 극도로 일치합니다. 상대방에게 다정하게 대화를 열어보세요."
                          </Text>
                        </Surface>

                        {/* 액션 버튼 */}
                        <View style={styles.actionRow}>
                          <Button 
                            mode="outlined" 
                            textColor="#FF8A80"
                            onPress={() => Alert.alert('관심 보내기', `${peerId} 님에게 관심 핑(Contextual Ping)을 발송했습니다.`)}
                            style={styles.actionButton}
                          >
                            관심 보내기
                          </Button>
                          <Button 
                            mode="contained" 
                            buttonColor="#FF8A80"
                            textColor="#0D0B14"
                            onPress={() => Alert.alert('소개 요청', '담당 커플 매니저에게 주선 인터뷰를 접수했습니다.')}
                            style={[styles.actionButton, { marginLeft: 8 }]}
                          >
                            소개 요청하기
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

        {/* 1. 컨시어지 상담 채팅 모달 */}
        <Modal
          visible={isConciergeOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsConciergeOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🌸 1:1 컨시어지 매니저 상담</Text>
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
                  placeholder="매니저에게 조언을 구해보세요 (예: 가치관 조정)"
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
                  전송
                </Button>
              </View>
            </View>
          </View>
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
              <Text style={styles.reqTitle}>🔒 상호주의 배지 공개 요청</Text>
              
              <Text style={styles.reqDesc}>
                상대방에게 배지 잠금 해제 동의 요청을 발송합니다.{"\n"}
                "상호주의 원칙"에 따라 대표님께서도 해당 정보(인증 배지)가 활성화되어 있어야 상호 열람이 가능합니다.
              </Text>

              <Text style={{ color: '#8A869F', fontSize: 11, marginBottom: 8 }}>발송 언어 선택 (전송 문구 확인):</Text>
              <View style={styles.langRow}>
                <Button
                  mode={requestLanguage === 'ko' ? 'contained' : 'outlined'}
                  onPress={() => setRequestLanguage('ko')}
                  style={styles.langButton}
                  buttonColor={requestLanguage === 'ko' ? theme.colors.secondary : undefined}
                >
                  한국어 🇰🇷
                </Button>
                <Button
                  mode={requestLanguage === 'ja' ? 'contained' : 'outlined'}
                  onPress={() => setRequestLanguage('ja')}
                  style={styles.langButton}
                  buttonColor={requestLanguage === 'ja' ? theme.colors.secondary : undefined}
                >
                  일본어 🇯🇵
                </Button>
              </View>

              <View style={styles.reqActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIsRequestModalOpen(false)}
                  style={styles.reqBtn}
                  textColor="#8A869F"
                >
                  취소
                </Button>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  textColor="#0D0B14"
                  onPress={() => sendBadgePermissionRequest(requestTargetBadge, requestLanguage)}
                  style={styles.reqBtn}
                >
                  요청 발송 🚀
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
                    <Text style={styles.circularProgressLabel}>AI 매칭률</Text>
                  </View>
                  <Text style={styles.breakdownSubtitle}>
                    한일 매칭 인공지능이 대표님과 상대방의 가치관 성향을 심층 분석했습니다.
                  </Text>
                </View>

                {/* 2. Trend Alignment (듀얼 프로그레스 바 대조) */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>📈 Trend Alignment (부부 성향 부합도)</Text>
                  <Text style={styles.breakdownSectionDesc}>
                    성공적인 한일 부부들의 맞벌이 및 커리어 지향 패턴과의 일치도 분석
                  </Text>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>우리 부합도</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.92} color="#FF8A80" style={{ height: 6, borderRadius: 3 }} />
                    </View>
                    <Text style={styles.trendValue}>92%</Text>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>성공부부 평균</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.85} color="#3F51B5" style={{ height: 6, borderRadius: 3 }} />
                    </View>
                    <Text style={styles.trendValue}>85%</Text>
                  </View>
                </View>

                {/* 3. Deep Values (핵심 속성 비교) */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>🔑 Deep Values (핵심 성향 호합)</Text>
                  
                  <View style={styles.deepValueBarRow}>
                    <Text style={styles.deepValueLabel}>의사소통 성향</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.95} color="#FF8A80" style={{ height: 4, borderRadius: 2 }} />
                    </View>
                    <Text style={styles.deepValuePercent}>95%</Text>
                  </View>

                  <View style={styles.deepValueBarRow}>
                    <Text style={styles.deepValueLabel}>거주지 협의 유연성</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.70} color="#FF8A80" style={{ height: 4, borderRadius: 2 }} />
                    </View>
                    <Text style={styles.deepValuePercent}>70%</Text>
                  </View>

                  <View style={styles.deepValueBarRow}>
                    <Text style={styles.deepValueLabel}>종교적 상호 수용도</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <ProgressBar progress={0.90} color="#FF8A80" style={{ height: 4, borderRadius: 2 }} />
                    </View>
                    <Text style={styles.deepValuePercent}>90%</Text>
                  </View>
                </View>

                {/* 4. Hidden Affinities (2열 취향 칩 그리드) */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>✨ Hidden Affinities (숨겨진 취향 발견)</Text>
                  <Text style={styles.breakdownSectionDesc}>AI가 두 분의 프로필 데이터 이면에서 매칭해 낸 숨은 호감 포인트</Text>
                  
                  <View style={styles.gridContainer}>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>☕ 조용한 weekend 카페</Text>
                    </View>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>📺 J-Pop/K-Drama 공유</Text>
                    </View>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>⛰️ 한적한 자연 산책 선호</Text>
                    </View>
                    <View style={styles.gridChip}>
                      <Text style={styles.gridChipText}>🍳 홈쿠킹 & 일어/한글 교환</Text>
                    </View>
                  </View>
                </View>

                {/* AI 안심 보증 CTA 안내 및 닫기 버튼 */}
                <Surface style={styles.aiGuaranteeBox} elevation={2}>
                  <Text style={styles.aiGuaranteeText}>
                    💡 AI has analyzed over 10,000 successful match patterns to recommend this partner.
                  </Text>
                  <Text style={styles.aiGuaranteeTextSub}>
                    (AI가 10,000건 이상의 한일 매칭 성공 빅데이터 패턴을 비교 분석하여 최적의 동반자로 추천했습니다.)
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
                Start Safe Chat (안전 대화 시작)
              </Button>
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
    backgroundColor: '#3F51B5',
    alignSelf: 'flex-end',
  },
  conciergeMsgBubble: {
    backgroundColor: '#252331',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3F51B5',
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
  }
});
