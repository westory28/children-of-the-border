const CHARACTERS = {
    mediator: {
        name: "중재자 (도덕 교사)",
        description: "당위와 현실 사이에서 갈등하며 제3의 대안을 찾는 가이드.",
        ability: "조정 (갈등 상황에서 타협점을 찾을 확률 증가)",
        items: ["호루라기", "교과서"],
        stats: { hp: 150, logic: 5, empathy: 8 }
    },
    realist: {
        name: "현실주의자 (중3 학생)",
        description: "통일 비용과 군 복무를 걱정하며 실질적 이익을 우선시함.",
        ability: "실리 파악 (선택지의 경제적 득실을 미리 간파)",
        items: ["스마트폰", "체크카드"],
        stats: { hp: 150, logic: 8, empathy: 3 }
    },
    architect: {
        name: "설계자 (통일부 장관)",
        description: "국제 정세의 압박과 국내 여론 분열 사이에서 정책을 조율.",
        ability: "정보 열람 (숨겨진 국제 관계 정보를 획득)",
        items: ["기밀 문서", "위성 전화"],
        stats: { hp: 150, logic: 9, empathy: 4 }
    },
    witness: {
        name: "목격자 (GP 사병)",
        description: "평화라는 구호와 생명 위협의 괴리 속에서 생존을 갈망.",
        ability: "위기 감지 (돌발적인 무력 충돌 위험을 사전에 감지)",
        items: ["야간투시경", "군번줄"],
        stats: { hp: 140, logic: 6, empathy: 6 }
    }
};

const SCENARIOS = [
    {
        id: 1,
        title: "장벽의 붕괴",
        description: "DMZ의 철조망이 걷히기 시작했습니다. 사람들은 환호하지만, 어딘가 불안해 보입니다. 당신의 곁으로 낯선 행색의 아이들이 걸어옵니다. 그들은 배가 고파 보입니다.",
        imageType: "conflict", // Placeholder for image logic
        choices: [
            { text: "가진 음식을 나누어 준다.", type: "empathy", difficulty: 0, reward: "신뢰 획득", penalty: "식량 감소" },
            { text: "경계하며 상황을 지켜본다.", type: "logic", difficulty: 0, reward: "안전 확보", penalty: "기회 상실" },
            { text: "통제 구역으로 신고한다.", type: "logic", difficulty: 7, reward: "질서 유지 보상", penalty: "비난 받음" }
        ]
    },
    {
        id: 2,
        title: "화폐 통합의 혼란",
        description: "시장에 두 가지 화폐가 뒤섞여 사용되고 있습니다. 환율 차이로 인해 상인과 손님 사이에 고성이 오갑니다. 누군가 당신에게 도움을 요청합니다.",
        imageType: "market",
        choices: [
            { text: "공정 환율을 계산해 중재한다.", type: "logic", difficulty: 8, reward: "추가 자금", penalty: "말려듦 (HP -10)" },
            { text: "자리를 피한다.", type: "survival", difficulty: 0, reward: "안전", penalty: "없음" },
            { text: "억울해 보이는 쪽을 편든다.", type: "empathy", difficulty: 5, reward: "정보 획득", penalty: "사기 당함 (아이템 손실)" }
        ]
    },
    // ... Additional scenarios can be added here following the pattern
    {
        id: 3,
        title: "오래된 지뢰",
        description: "민간인 통제 구역 해제 작업 중, 경고 표지판이 떨어진 숲길을 지나가야 합니다. 흙이 파헤쳐진 흔적이 보입니다.",
        imageType: "danger",
        choices: [
            { text: "우회 도로를 찾는다.", type: "logic", difficulty: 6, reward: "안전하게 통과", penalty: "시간 지체 (HP -5)" },
            { text: "그냥 조심해서 건너간다.", type: "luck", difficulty: 9, reward: "빠른 통과", penalty: "지뢰 폭발 (HP -30)" },
            { text: "능력을 사용하여 탐지한다.", type: "ability", difficulty: 0, reward: "숨겨진 보급품 발견", penalty: "기력 소모 (HP -5)" }
        ]
    },
    {
        id: 4,
        title: "문화적 차이",
        description: "학교/직장에서 언어와 문화 차이로 인한 따돌림 현장이 목격됩니다. 분위기가 매우 험악합니다.",
        imageType: "conflict",
        choices: [
            { text: "적극적으로 개입하여 말린다.", type: "empathy", difficulty: 8, reward: "동료 획득", penalty: "폭행 당함 (HP -15)" },
            { text: "선생님/상사에게 알린다.", type: "logic", difficulty: 5, reward: "문제 해결", penalty: "보복 당함 (HP -5)" },
            { text: "모른 척 지나간다.", type: "survival", difficulty: 0, reward: "무사함", penalty: "죄책감 (HP -5)" }
        ]
    },
    {
        id: 5,
        title: "전염병의 공포",
        description: "북쪽에서 내려온 가축들에게서 원인 불명의 병이 돌고 있다는 소문이 돕니다. 당신은 검문소를 통과해야 합니다.",
        imageType: "danger",
        choices: [
            { text: "뇌물을 주고 통과한다.", type: "logic", difficulty: 7, reward: "빠른 통과", penalty: "아이템 소실" },
            { text: "철저한 검역에 협조한다.", type: "logic", difficulty: 0, reward: "건강 확인", penalty: "격리 대기 (HP -10)" },
            { text: "샛길로 몰래 빠져나간다.", type: "luck", difficulty: 9, reward: "비밀 루트 발견", penalty: "체포 (게임 오버 위기)" }
        ]
    },
    {
        id: 6,
        title: "부동산 투기 열풍",
        description: "개발 예정지라는 소문에 땅값이 요동칩니다. 사기꾼들이 당신에게 솔깃한 제안을 합니다.",
        imageType: "market",
        choices: [
            { text: "투자한다.", type: "luck", difficulty: 10, reward: "대박 (모든 아이템 획득)", penalty: "파산 (모든 아이템 소실)" },
            { text: "무시한다.", type: "logic", difficulty: 0, reward: "현상 유지", penalty: "없음" },
            { text: "사기꾼을 신고한다.", type: "logic", difficulty: 7, reward: "포상금", penalty: "보복 위협" }
        ]
    },
    {
        id: 7,
        title: "과거의 유산",
        description: "공사장 터에서 전쟁 시절의 유물이 발견되었습니다. 훼손될 위기에 처했습니다.",
        imageType: "conflict",
        choices: [
            { text: "몸으로 막아 보호한다.", type: "empathy", difficulty: 8, reward: "명예 획득", penalty: "부상 (HP -20)" },
            { text: "언론에 제보한다.", type: "logic", difficulty: 6, reward: "사회적 관심", penalty: "무시 당함" },
            { text: "기념품으로 챙긴다.", type: "luck", difficulty: 5, reward: "희귀 아이템 획득", penalty: "처벌 받음" }
        ]
    },
    {
        id: 8,
        title: "대규모 시위",
        description: "통일 반/찬성 시위대가 충돌하고 있습니다. 당신은 이 한복판에 갇혔습니다.",
        imageType: "conflict",
        choices: [
            { text: "한쪽 편에 서서 목소리를 낸다.", type: "empathy", difficulty: 7, reward: "동지 획득", penalty: "최루탄 (HP -10)" },
            { text: "조용히 빠져나길 시도한다.", type: "survival", difficulty: 5, reward: "탈출 성공", penalty: "소지품 분실" },
            { text: "부상자를 돕는다.", type: "empathy", difficulty: 6, reward: "감사 인사", penalty: "피로 누적 (HP -5)" }
        ]
    },
    {
        id: 9,
        title: "가짜 뉴스",
        description: "SNS에 당신이 간첩이라는 헛소문이 퍼지고 있습니다. 사람들이 당신을 의심스러운 눈초리로 봅니다.",
        imageType: "conflict",
        choices: [
            { text: "적극적으로 해명한다.", type: "logic", difficulty: 8, reward: "오해 풀림", penalty: "스트레스 (HP -10)" },
            { text: "계정을 삭제하고 잠적한다.", type: "survival", difficulty: 0, reward: "잠잠해짐", penalty: "고립감 (HP -5)" },
            { text: "유포자를 찾아낸다.", type: "logic", difficulty: 9, reward: "명예 회복", penalty: "허탕" }
        ]
    },
    {
        id: 10,
        title: "최후의 결정",
        description: "통일 정부의 수립 투표일입니다. 급진파 테러 예고가 있습니다. 투표소로 가시겠습니까?",
        imageType: "danger",
        choices: [
            { text: "위험을 무릅쓰고 투표한다.", type: "empathy", difficulty: 7, reward: "민주 시민 엔딩 포인트", penalty: "테러 휘말림 (HP -20)" },
            { text: "집에서 안전하게 지켜본다.", type: "survival", difficulty: 0, reward: "생존 엔딩 포인트", penalty: "후회" },
            { text: "치안 유지를 돕는다.", type: "logic", difficulty: 8, reward: "영웅 엔딩 포인트", penalty: "중상 (HP -30)" }
        ]
    }
];
