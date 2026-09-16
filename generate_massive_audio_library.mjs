import { execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const baseDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\assets\\audio';
const careDir = join(baseDir, 'careteam');
const runDir = join(baseDir, 'running');

if (!existsSync(careDir)) mkdirSync(careDir, { recursive: true });
if (!existsSync(runDir)) mkdirSync(runDir, { recursive: true });

const clips = [
  // ==========================================
  // [A] 실전 러닝 트래커 상황 (Running / 18종)
  // ==========================================
  // 1. 출발 & 카운트다운
  {
    target: join(runDir, 'run_start_leo.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '3, 2, 1, 출발! 대표님, 오늘도 멋지게 달려보죠! 첫 1킬로미터는 몸을 깨우며 가볍게 시작합니다!'
  },
  {
    target: join(runDir, 'run_start_luna.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '오늘도 함께 달려요! 무리하지 마시고 기분 좋은 리듬으로 천천히 출발해봐요.'
  },
  {
    target: join(runDir, 'run_warmup.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+3%',
    pitch: '+0Hz',
    text: '워밍업 구간입니다. 어깨 힘을 빼고 발목 관절의 탄력을 부드럽게 느껴보세요.'
  },

  // 2. 거리별 마일스톤 돌파
  {
    target: join(runDir, 'run_1km_leo.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+4%',
    pitch: '+0Hz',
    text: '첫 1킬로미터 돌파! 현재 페이스 아주 이상적입니다. 이 리듬 그대로 차분하게 유지하세요!'
  },
  {
    target: join(runDir, 'run_2km_luna.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+1%',
    pitch: '+0Hz',
    text: '2킬로미터 통과! 심박수가 기분 좋게 올라왔네요. 시선은 정면을 바라보며 호흡을 유지하세요.'
  },
  {
    target: join(runDir, 'run_3km_leo.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '3킬로미터 돌파! 몸에 열이 오르며 체지방이 집중 연소되는 골든 타임에 진입했습니다!'
  },
  {
    target: join(runDir, 'run_5km_cheer.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '5킬로미터 달성! 벌써 절반을 넘었습니다, 대표님! 오늘의 한계를 멋지게 넘어서고 계십니다!'
  },
  {
    target: join(runDir, 'run_7km_push.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+4%',
    pitch: '+0Hz',
    text: '7킬로미터 통과! 다리가 무거워질 때입니다. 팔치기 리듬에 집중하며 탄력을 만들어보세요!'
  },
  {
    target: join(runDir, 'run_10km_finish.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+1Hz',
    text: '10킬로미터 완주 성공! 대단하십니다, 대표님! 오늘 유산소 최고 기록을 완벽하게 깼습니다!'
  },

  // 3. 실시간 페이스 피드백
  {
    target: join(runDir, 'pace_slow_down.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+2%',
    pitch: '+0Hz',
    text: '대표님, 초반 속도가 조금 빠릅니다! 후반 완주를 위해 20초만 늦춰 안정 페이스를 유지하세요.'
  },
  {
    target: join(runDir, 'pace_speed_up.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+4%',
    pitch: '+0Hz',
    text: '페이스가 살짝 처지고 있습니다. 발끝을 가볍게 밀어내며 리듬을 조금만 끌어올려 볼까요?'
  },
  {
    target: join(runDir, 'pace_perfect.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+1%',
    pitch: '+1Hz',
    text: '현재 페이스, 정말 완벽한 크루징 리듬입니다. 호흡과 발걸음의 조화가 예술이네요!'
  },

  // 4. 자세 & 호흡 교정
  {
    target: join(runDir, 'posture_shoulder.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '어깨가 움츠러들었어요! 턱을 살짝 당기고, 어깨를 툭 털어내 상체 긴장을 풀어주세요.'
  },
  {
    target: join(runDir, 'posture_breathing.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+2%',
    pitch: '+0Hz',
    text: '호흡 점검! 두 번 들이쉬고 두 번 길게 내쉬는 씁 씁 후 후 리듬을 되찾아보세요.'
  },
  {
    target: join(runDir, 'posture_cadence.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+3%',
    pitch: '+0Hz',
    text: '보폭을 너무 넓히지 말고, 가볍게 발바닥 중앙으로 착지하며 발놀림을 경쾌하게 가져가세요.'
  },

  // 5. 라스트 스퍼트 & 완주
  {
    target: join(runDir, 'run_last_500m.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+6%',
    pitch: '+1Hz',
    text: '골인 지점까지 딱 500미터 남았습니다! 마지막 남은 에너지를 멋지게 쏟아내보죠!'
  },
  {
    target: join(runDir, 'run_finish_cool.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '완주 성공! 절대 바로 주저앉지 마시고, 3분간 가볍게 걸으며 심박수를 안정시켜 주세요.'
  },
  {
    target: join(runDir, 'run_hydration.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+1%',
    pitch: '+1Hz',
    text: '오늘 땀 정말 많이 흘리셨습니다! 미온수를 천천히 세 모금 마셔 수분을 보충하세요.'
  },

  // ==========================================
  // [B] 1:1 케어팀 라이프스타일 상황 (CareTeam / 20종)
  // ==========================================
  // 1. 시간대별 맞춤 인사
  {
    target: join(careDir, 'care_morning_leo.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '상쾌한 아침입니다, 대표님! 아침 공복 조깅 20분으로 오늘 하루의 텐션을 최고로 올려볼까요?'
  },
  {
    target: join(careDir, 'care_night_leo.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+3%',
    pitch: '+0Hz',
    text: '오늘도 하루 종일 고생 많으셨습니다! 오늘 쌓인 업무 스트레스, 야간 조깅으로 싹 날려버리시죠!'
  },
  {
    target: join(careDir, 'care_afternoon_luna.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+1%',
    pitch: '+1Hz',
    text: '점심 식사 후 나른한 시간이죠? 가벼운 10분 산책과 기지개로 뇌를 깨워보세요.'
  },
  {
    target: join(careDir, 'care_midnight_rest.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '자정이 넘은 시간입니다. 지금은 운동보다 깊은 숙면이 최고의 근육 회복제예요. 푹 쉬세요!'
  },

  // 2. 날씨 & 환경 대응
  {
    target: join(careDir, 'weather_rain_indoor.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+3%',
    pitch: '+0Hz',
    text: '밖에 비가 내리네요. 빗길 미끄럼 위험이 있으니 오늘은 실내 무소음 버닝 홈트로 대체하죠!'
  },
  {
    target: join(careDir, 'weather_dust_warning.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+1%',
    pitch: '+0Hz',
    text: '오늘 미세먼지 수치가 높습니다. 야외 러닝 대신 실내 트레드밀이나 맨몸 코어 운동을 추천합니다.'
  },
  {
    target: join(careDir, 'weather_hot_summer.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+1%',
    pitch: '+0Hz',
    text: '기온이 높은 날입니다. 한낮 햇볕을 피해 해 질 무렵 시원한 그늘 코스로 달려보세요.'
  },
  {
    target: join(careDir, 'weather_cold_winter.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+2%',
    pitch: '+0Hz',
    text: '날씨가 꽤 쌀쌀합니다. 부상 방지를 위해 출발 전 고관절과 종아리를 충분히 풀어주세요.'
  },

  // 3. 멘탈 & 동기부여 & 정체기
  {
    target: join(careDir, 'mind_slump_luna.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+1Hz',
    text: '체중계 숫자가 잠깐 멈춘 건 몸이 건강하게 재정비되는 시간이에요. 조급해하지 마세요, 잘하고 계세요!'
  },
  {
    target: join(careDir, 'mind_lazy_leo.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+0Hz',
    text: '운동화 끈 묶고 문밖으로 나가는 게 제일 힘듭니다! 딱 5분만 걷다 오겠다는 마음으로 현관을 나서보죠!'
  },
  {
    target: join(careDir, 'mind_praise_great.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+2Hz',
    text: '대표님의 꾸준함이 정말 자랑스럽습니다. 하루하루 달라지는 실루엣이 증명하고 있습니다!'
  },
  {
    target: join(careDir, 'mind_burnout_rest.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    text: '몸과 마음이 모두 지친 날엔 온전한 휴식이 최고의 트레이닝입니다. 오늘 하루는 푹 충전하세요!'
  },

  // 4. 운동 후 스트레칭 & 부상 예방 (닥터 케이)
  {
    target: join(careDir, 'rehab_knee_ice.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '-2%',
    pitch: '-2Hz',
    text: '무릎 안쪽에 열감이 느껴지신다면 온찜질이 아닌 10분 아이스 팩 찜질이 염증 완화에 필수적입니다.'
  },
  {
    target: join(careDir, 'rehab_plantar_massage.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '-1%',
    pitch: '-2Hz',
    text: '발바닥이 찌릿할 땐 테니스공이나 폼롤러로 발바닥 아치를 부드럽게 굴려 마사지해주십시오.'
  },
  {
    target: join(careDir, 'rehab_calf_stretch.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '-1%',
    pitch: '-1Hz',
    text: '러닝 후 종아리 쥐가 나지 않도록 벽을 짚고 발뒤꿈치를 바닥에 꾹 누르는 스트레칭을 30초씩 해주십시오.'
  },
  {
    target: join(careDir, 'rehab_posture_spine.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '-1%',
    pitch: '-1Hz',
    text: '오래 앉아 근무하신 날엔 장요근이 수축되어 허리가 당길 수 있습니다. 런지 자세로 골반을 앞쪽으로 지그시 늘려주십시오.'
  },

  // 5. 다이어트 & 식단 코칭 (영양사 엘리)
  {
    target: join(careDir, 'diet_protein_timing.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+3%',
    pitch: '+2Hz',
    text: '운동 끝나고 30분 이내가 근육 합성의 골든 타임이에요! 단백질 20그램 섭취 꼭 챙겨주세요!'
  },
  {
    target: join(careDir, 'diet_fasting_tip.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+2Hz',
    text: '공복 러닝 후 첫 끼니는 혈당이 급격히 오르지 않도록 신선한 채소와 달걀부터 천천히 드시는 게 좋아요.'
  },
  {
    target: join(careDir, 'diet_water_electrolyte.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+2Hz',
    text: '목마름을 느낄 땐 이미 탈수가 시작된 상태예요. 이온 음료나 레몬 물을 틈틈이 보충해주세요!'
  },
  {
    target: join(careDir, 'diet_alcohol_recovery.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+1%',
    pitch: '+1Hz',
    text: '어제 술자리가 있으셨군요! 오늘은 무리한 러닝 대신 전해질 수분 충전과 가벼운 산책으로 간 피로를 풀어주세요.'
  },

  // ==========================================
  // [C] 타마고치 러닝 펫 교감 오디오 (Pet / 6종)
  // ==========================================
  {
    target: join(runDir, 'pet_run_start.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+3%',
    pitch: '+2Hz',
    text: '대표님! 펫도 신나서 꼬리를 흔들며 러닝 준비를 마쳤어요! 같이 힘차게 달려볼까요?'
  },
  {
    target: join(runDir, 'pet_run_cheer.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+3%',
    pitch: '+2Hz',
    text: '펫이 대표님 페이스에 맞춰 곁에서 쫑쫑 뛰고 있어요! 정말 행복해하네요!'
  },
  {
    target: join(runDir, 'pet_run_thirsty.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+2%',
    pitch: '+1Hz',
    text: '대표님, 펫이 헥헥거리며 물을 마시고 싶어 해요. 우리도 수분 한 모금 챙기고 갈까요?'
  },
  {
    target: join(runDir, 'pet_run_tired.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+2%',
    pitch: '+0Hz',
    text: '펫도 조금 지쳤나 봐요! 1분만 템포를 늦춰서 펫과 나란히 걸어보죠.'
  },
  {
    target: join(runDir, 'pet_level_up.mp3'),
    voice: 'ko-KR-SunHiNeural',
    rate: '+4%',
    pitch: '+3Hz',
    text: '축하합니다, 대표님! 이번 러닝으로 펫 경험치가 가득 차서 레벨업에 성공했습니다!'
  },
  {
    target: join(runDir, 'pet_evolution.mp3'),
    voice: 'ko-KR-InJoonNeural',
    rate: '+5%',
    pitch: '+1Hz',
    text: '대단해요! 대표님의 꾸준한 달리기 덕분에 펫이 멋진 파트너로 진화했습니다! 만세!'
  }
];

console.log(`Starting massive batch generation of ${clips.length} situational neural audio clips...`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < clips.length; i++) {
  const item = clips[i];
  const filename = item.target.split('\\').pop();
  console.log(`[${i + 1}/${clips.length}] Rendering ${filename}...`);
  const cmd = `edge-tts --voice "${item.voice}" --rate="${item.rate}" --pitch="${item.pitch}" --text "${item.text}" --write-media "${item.target}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    successCount++;
    console.log(`  -> SUCCESS: ${filename}`);
  } catch (err) {
    failCount++;
    console.error(`  -> ERROR ${filename}:`, err.message);
  }
}

console.log('\n=============================================');
console.log(`Batch Audio Generation Complete: ${successCount} succeeded, ${failCount} failed.`);
console.log('=============================================');
