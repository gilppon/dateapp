# 'Hana-Il Marriage Match' MD3 Design System Specifications

본 문서는 'Hana-Il Marriage Match' 웹앱의 구글 머티리얼 디자인 3(Material Design 3) 규격을 정의하는 설계 명세서입니다.

---

## 🎨 Color Palette (MD3 Dark Theme)

| Token Name | Hex Code | Visual Target | Description |
| :--- | :--- | :--- | :--- |
| **Primary** | `#FF8A80` | Sakura Coral Pink | 설렘과 따뜻함을 담은 주조색 |
| **Secondary** | `#3F51B5` | Indigo Navy | 결혼 정보 서비스의 신뢰감을 표현하는 보조색 |
| **Background** | `#0D0B14` | Deep Purple-Black | 눈의 피로를 최소화하는 칠흑의 퍼플블랙 배경 |
| **Surface** | `#181524` | Dark Violet Surface | 카드, 다이얼로그, 시트 등 정보의 입체감을 표현하는 표면색 |
| **Accent** | `#00E5FF` | Fluorescent Cyan | 링크, 활성화 하이라이트, 배지 강조용 색상 |
| **On Primary**| `#FFFFFF` | White Text | Primary 색상 위의 고대비 텍스트 |
| **On Surface**| `#E0E0E0` | Light Grey Text | Surface 색상 위의 본문 텍스트 |

---

## 📐 Shape & Roundness Tokens

머티리얼 3 디자인 시스템의 물리 계층(Elevation & Shape)을 따릅니다.

* **Medium Component Shape** (`8dp` / `8px`):
  - 적용 대상: Outlined Text Fields, Buttons, Chips, Tab Bar
  - 효과: 안정감 있고 구조적인 현대적인 레이아웃 가독성을 극대화함
* **Large Component Shape** (`12dp` / `12px`):
  - 적용 대상: Cards, Dialogs, Bottom Sheets, Concierge Chat Bubble
  - 효과: 컴포넌트 간의 위계를 명확히 하고 부드럽고 프리미엄한 인상을 전달함

---

## ✍️ Typography Hierarchy (MD3 Scale)

* **Display/Title**: `Outfit` 또는 `Inter` 폰트 지향 (한글/일어는 시스템 폰트 고딕 계열 활용)
* **Headline 1**: `24sp` Bold (주요 화면 타이틀)
* **Subhead 1**: `16sp` Medium (세션 헤더, 매칭 점수)
* **Body 1**: `14sp` Regular (상세 정보 텍스트, 채팅 내용)
* **Label/Caption**: `12sp` Medium/Regular (인증 배지 유효기간, 칩 레이블)

---

## 🔒 Interactive Security & Masking Protocol

* **Masked state**: 매칭 성사 또는 상호 배지 인증 교환 전까지 가치관 적합도 및 중요 신원 배지(직장, 미혼, 학력 등)는 `🔒` 아이콘과 함께 블러(Masked) 처리됩니다.
* **Consent Request (Keigo-based)**:
  - 마스킹된 컴포넌트를 탭하면 경어체 팝업이 활성화됩니다.
  - 전송 버튼 클릭 시, 상대방에게 공손한 문체(한국어/일본어)로 공개 요청 메시지가 자동 송신됩니다.
