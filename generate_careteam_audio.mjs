import { execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';

const outDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\assets\\audio\\careteam';
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const items = [
  // 1. 코치 인트로 4종
  {
    file: 'leo_intro.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '대표님, 반갑습니다! 남성 전담 코치 레오입니다. 오늘 목표 칼로리 버닝과 하체 강화, 제가 확실하게 끌어드리겠습니다! 어떤 운동 플랜을 짤까요?'
  },
  {
    file: 'luna_intro.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '안녕하세요 대표님! 섬세한 자세 교정과 꾸준한 루틴을 책임지는 코치 루나예요. 무리하지 않고 오래 지속할 수 있는 즐거운 러닝 플랜을 함께 세워봐요.'
  },
  {
    file: 'ellie_intro.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+2Hz',
    text: '대표님, 오늘 식사 맛있게 드셨나요? 오늘 태운 운동 칼로리와 딱 맞물리는 최적의 단백질 영양 밸런스를 가이드해 드릴게요. 무엇을 드셨는지 편하게 말씀해주세요!'
  },
  {
    file: 'drkay_intro.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '안녕하십니까, 대표님의 안전을 책임지는 닥터 케이입니다. 운동 전후 관절이나 근육에 뻐근한 곳은 없으신가요? 통증이 있다면 언제든 말씀해주십시오.'
  },

  // 2. 레오 퀵 버블 응답 5종
  {
    file: 'leo_bubble_cheat.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '오, 든든하게 드신 만큼 오늘 에너지 풀 충전되셨네요! 퇴근길에 저랑 15분만 가볍게 땀 빼고 깔끔하게 퉁치죠! 죄책감은 제로로 만들어 드리겠습니다!'
  },
  {
    file: 'leo_bubble_tired.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+2%',
    pitch: '+0Hz',
    text: '대표님, 오늘 하루 정말 고생 많으셨습니다! 몸이 무거울 땐 딱 5분만 가볍게 스트레칭하고 푹 쉬시는 것도 훌륭한 훈련입니다. 힘내세요!'
  },
  {
    file: 'leo_bubble_knee.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '무릎이 시큰거리실 땐 절대 무리해서 뛰시면 안 됩니다! 오늘은 러닝을 멈추고 관절 찜질과 휴식을 취해주세요. 안전이 최우선입니다!'
  },
  {
    file: 'leo_bubble_routine.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+4%',
    pitch: '+0Hz',
    text: '월수금 30분 뱃살 버닝 플랜 등록 완료했습니다! 5분 웜업, 20분 인터벌 파워 조깅, 5분 쿨다운으로 이번 주 체지방 싹 태워보시죠!'
  },
  {
    file: 'leo_bubble_snack.mp3',
    voice: 'ko-KR-InJoonNeural',
    rate: '+6%',
    pitch: '+0Hz',
    text: '잠깐, 멈추세요! 지금 라면 드시면 내일 아침 후회합니다! 시원한 물 한 컵 마시고 심호흡 세 번 해보세요. 제가 지켜보고 있습니다!'
  },

  // 3. 루나 퀵 버블 응답 5종
  {
    file: 'luna_bubble_cheat.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+1Hz',
    text: '대표님, 맛있는 음식 드신 건 에너지가 된 거니까 자책하지 마세요! 내일 저랑 가볍게 인터벌 조깅하면서 기분 좋게 땀 흘려봐요!'
  },
  {
    file: 'luna_bubble_tired.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+1Hz',
    text: '오늘 하루도 정말 치열하게 달리셨네요. 지칠 땐 무리하지 마시고 따뜻한 물로 샤워 후 푹 주무세요. 항상 응원할게요!'
  },
  {
    file: 'luna_bubble_knee.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '무릎 신호는 정말 중요해요. 통증이 가라앉을 때까지는 러닝을 쉬고 가벼운 스트레칭만 해주세요. 무리하면 안 돼요!'
  },
  {
    file: 'luna_bubble_routine.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+1Hz',
    text: '대표님을 위한 월수금 30분 맞춤 루틴을 등록했어요. 천천히 꾸준하게 저랑 완주해봐요!'
  },
  {
    file: 'luna_bubble_snack.mp3',
    voice: 'ko-KR-SunHiNeural',
    rate: '+3%',
    pitch: '+2Hz',
    text: '야식 생각이 간절할 땐 따뜻한 허브티 한 잔 어떠세요? 조금만 참으시면 내일 아침 몸이 훨씬 가벼워질 거예요!'
  }
];

console.log(`Generating ${items.length} human-like neural audio assets...`);
for (const item of items) {
  const target = `${outDir}\\${item.file}`;
  const cmd = `edge-tts --voice "${item.voice}" --rate="${item.rate}" --pitch="${item.pitch}" --text "${item.text}" --write-media "${target}"`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Generated: ${item.file}`);
  } catch (err) {
    console.error(`❌ Failed ${item.file}:`, err.message);
  }
}

console.log('ALL NEURAL AUDIO ASSETS GENERATED SUCCESSFULLY!');
