import fs from 'fs';

const filePath = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\careTeam.js';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace generateResponse with high-intelligence fitness coach engine
const oldGenerateResponse = `    generateResponse(text) {
      // A. 스케줄/일정 생성 요청
      const newSchedules = this.parseSchedulesFromText(text);
      if (newSchedules.length > 0) {
        const summary = newSchedules.map((s) => \`\${s.day} \${s.time}\`).join(", ");
        return {
          reply: \`네, 대표님! 말씀하신 내용을 바탕으로 [\${summary} · \${newSchedules[0].title} (\${newSchedules[0].duration})] \${newSchedules.length}건을 캘린더에 등록했습니다. 당일 전에 리마인드 드릴게요!\`,
          mood: "plan",
          newSchedules
        };
      }

      // B. 식단/과식 관련 대화
      if (text.includes("먹었") || text.includes("식단") || text.includes("폭식") || text.includes("치킨") || text.includes("삼겹살") || text.includes("피자") || text.includes("라면")) {
        if (this.currentCoachId === "ellie") {
          return {
            reply: \`맛있게 드셨으면 절대 살로 안 가요, 대표님! 죄책감 갖지 마세요(No-Guilt). 점심의 에너지를 살려서 저녁엔 나트륨을 배출해 주는 칼륨 샐러드로 가볍게 밸런스만 맞추면 완벽합니다! 제가 식단 체크리스트 조정해 둘게요.\`,
            mood: "comfort"
          };
        } else if (this.currentCoachId === "leo") {
          return {
            reply: \`오, 든든하게 드신 만큼 오늘 에너지 풀 충전되셨네요! 퇴근길에 저랑 15분만 가볍게 땀 빼고 깔끔하게 퉁치시죠! 준비되셨습니까?\`,
            mood: "cheer"
          };
        } else {
          return {
            reply: \`맛있게 드신 음식은 내일의 활력이 됩니다. 무리하게 굶지 마시고 가벼운 파워워킹으로 소화만 편안하게 시켜주세요!\`,
            mood: "comfort"
          };
        }
      }

      // C. 건강/통증/피로 관련 대화
      if (text.includes("아파") || text.includes("통증") || text.includes("무릎") || text.includes("발목") || text.includes("피곤") || text.includes("지쳐") || text.includes("귀찮")) {
        return {
          reply: \`대표님, 컨디션이 좋지 않으시군요. 오늘은 고강도 러닝을 쉬고 가벼운 스트레칭·휴식으로 회복을 우선해 주세요. 통증이 심하거나 며칠 지속되면 전문의 상담을 권합니다. (앱 가이드는 의료 진단이 아닙니다)\`,
          mood: "warning"
        };
      }

      // D. 기본 일상 격려
      if (this.currentCoachId === "leo") {
        return { reply: \`대표님, 좋은 생각입니다! 오늘 하루도 끝까지 파이팅 넘치게 목표 칼로리를 격파해 봅시다. 준비되시면 언제든 [운동 시작]을 눌러주세요!\`, mood: "cheer" };
      } else if (this.currentCoachId === "luna") {
        return { reply: \`대표님 말씀 잘 들었어요. 조급해하지 않고 하루하루 쌓아가는 루틴이 가장 강력하답니다. 오늘도 루나가 함께 호흡 맞출게요.\`, mood: "comfort" };
      } else if (this.currentCoachId === "ellie") {
        return { reply: \`영양 코치 엘리입니다. 대표님의 몸과 컨디션에 딱 맞는 클린 식단을 언제든 찾아드릴 테니 편하게 물어보세요!\`, mood: "cheer" };
      } else {
        return { reply: \`닥터 케이입니다. 무리하지 않고 바른 자세로 운동하시는 것이 장기적인 건강의 열쇠입니다. 참고용 가이드이며 의료 진단은 아닙니다.\`, mood: "warning" };
      }
    }`;

const newGenerateResponse = `    generateResponse(text) {
      const q = text.toLowerCase().trim();

      // 1. [핵심] 7일 분할 근육운동 루틴 질문 ("7일", "일주일", "근육운동", "분할", "루틴")
      if ((q.includes("7일") || q.includes("일주일")) && (q.includes("근육") || q.includes("운동") || q.includes("루틴") || q.includes("분할"))) {
        if (this.currentCoachId === "leo") {
          return {
            reply: \`대표님, 살을 확실하게 빼면서 탄탄한 바디라인을 만드는 [7일 황금 분할 근육 루틴]을 딱 정리해 드립니다!\\n\\n` +
                   `• 월 (하체/둔근): 맨몸 스쿼트 15회 4세트 + 런지 (하체가 타야 기초대사량이 폭발합니다!)\\n` +
                   `• 화 (상체 푸시): 푸시업 12회 3세트 + 숄더프레스 (어깨와 가슴 라인 강화)\\n` +
                   `• 수 (액티브 리커버리): 런나우 20분 가벼운 파워워킹 + 전신 폼롤러 스트레칭\\n` +
                   `• 목 (상체 풀 & 코어): 덤벨 로우 15회 3세트 + 플랭크 1분 3세트 (등과 뱃살 코어 집중)\\n` +
                   `• 금 (전신 버닝 HIIT): 버피 라이트 + 마운틴 클라이머 4세트 (체지방 컷!)\\n` +
                   `• 토 (야외 런데이): 런나우 3km 인터벌 러닝 (칼로리 최종 격파)\\n` +
                   `• 일 (완전 휴식): 숙면과 단백질 보충으로 근육 회복!\\n\\n` +
                   `이 루틴대로 지금 바로 캘린더에 등록해 드릴까요, 대표님?\`,
            mood: "plan"
          };
        } else if (this.currentCoachId === "luna") {
          return {
            reply: \`대표님, 무리하지 않고 체지방을 예쁘게 태우는 7일 밸런스 루틴이에요 🌿\\n\\n` +
                   `월·목은 하체와 코어(스쿼트, 브릿지), 화·금은 상체와 등(푸시업, 슈퍼맨), 수요일은 힐링 러닝(20분 조깅), 주말은 야외 런나우 런과 전신 스트레칭으로 순환을 도와드릴게요. 몸에 부담 없이 지방만 쏙 빠집니다!\`,
            mood: "plan"
          };
        } else {
          return {
            reply: \`7일 루틴의 핵심은 [부위별 48시간 휴식]입니다, 대표님. 하체-상체-유산소-코어를 순환 배치하여 근육 피로를 분산시키고, 운동 전 5분 동적 웜업과 운동 후 수분 보충을 꼭 지켜주세요!\`,
            mood: "plan"
          };
        }
      }

      // 2. [핵심] 다이어트/살빼기/초보자 시작 운동 질의 ("살", "다이어트", "감량", "어떤 운동", "시작")
      if (q.includes("살") || q.includes("다이어트") || q.includes("감량") || q.includes("체지방") || q.includes("어떤 운동") || q.includes("시작")) {
        if (this.currentCoachId === "leo") {
          return {
            reply: \`대표님, 다이어트 시작 운동은 무조건 [인터벌 유산소 20분 + 하체 스쿼트] 조합이 1등입니다!\\n\\n` +
                   `처음부터 무리하게 달리면 무릎이 아프니, 런나우를 켜고 [3분 빠르게 걷기 + 2분 가벼운 조깅]을 4회 반복해 심폐 엔진을 깨우세요. 그리고 맨몸 스쿼트 15회씩 3세트만 더해주시면 평소 숨만 쉬어도 칼로리가 타는 체질로 바뀝니다! 제가 오늘 1일차 캘린더 잡아드릴까요?\`,
            mood: "cheer"
          };
        } else if (this.currentCoachId === "ellie") {
          return {
            reply: \`다이어트의 80%는 식단, 20%는 운동이에요, 대표님! 시작할 때 굶지 마시고 [체중 1kg당 단백질 1.2g] 챙겨 드시면서 저녁 8시 이후 탄수화물만 끊으셔도 첫 주에 1~2kg은 붓기와 함께 쏙 빠집니다. 운동은 런나우 데일리 조깅 20분이면 충분해요!\`,
            mood: "comfort"
          };
        } else {
          return {
            reply: \`처음 시작하실 때는 심박수 Zone 2(옆 사람과 편하게 대화할 수 있는 속도, 페이스 6'30\"~7'00\")로 20~30분 지속하는 유산소 운동이 지방 연소 효율이 가장 높습니다. 서두르지 마시고 주 3회부터 가볍게 시작해 보세요!\`,
            mood: "cheer"
          };
        }
      }

      // 3. 근육통 / 피로 / 알 배김 ("근육통", "알 배", "뭉쳤", "뻐근", "아파")
      if (q.includes("알 배") || q.includes("근육통") || q.includes("뭉쳤") || q.includes("뻐근") || q.includes("결려")) {
        return {
          reply: \`대표님, 근육통은 어제 운동이 제대로 들어가 근육이 성장하고 있다는 최고의 증거입니다! 🔥\\n` +
                 `오늘은 무거운 운동 대신 [미온수 샤워 + 폼롤러 하체 마사지 + 가벼운 15분 산책]으로 혈류를 돌려주시면 젖산이 2배 빨리 배출됩니다. 단백질 든든히 드시고 푹 주무세요!\`,
          mood: "comfort"
        };
      }

      // 4. 러닝 자세 / 페이스 / 무릎 보호 ("페이스", "자세", "무릎", "착지", "속도")
      if (q.includes("페이스") || q.includes("자세") || q.includes("착지") || q.includes("무릎") || q.includes("속도")) {
        return {
          reply: \`대표님, 장거리 러닝의 황금 원칙은 [미드풋(발바닥 중간) 착지]와 [분당 케이던스 170~180보]입니다!\\n` +
                 `발뒤꿈치로 쿵쿵 찍으면 무릎에 체중의 3배 충격이 가니, 몸을 살짝 앞으로 기울이고 보폭을 좁게 종종걸음으로 달려보세요. 충격은 사라지고 속도는 자연스럽게 붙습니다!\`,
          mood: "cheer"
        };
      }

      // 5. 식단 / 단백질 / 야식 / 폭식 관련 대화
      if (q.includes("먹었") || q.includes("식단") || q.includes("폭식") || q.includes("치킨") || q.includes("삼겹살") || q.includes("피자") || q.includes("라면") || q.includes("단백질") || q.includes("야식")) {
        if (this.currentCoachId === "ellie") {
          return {
            reply: \`맛있게 드셨으면 절대 살로 안 가요, 대표님! 죄책감 갖지 마세요(No-Guilt 💖).\\n` +
                   `점심·저녁에 드신 탄수화물과 나트륨은 내일 운동의 파워 연료가 됩니다. 내일 아침 물 500ml 챙겨 드시고 칼륨이 풍부한 바나나나 샐러드로 수분 밸런스만 맞추시면 완벽하게 리셋됩니다!\`,
            mood: "comfort"
          };
        } else if (this.currentCoachId === "leo") {
          return {
            reply: \`오, 든든하게 드신 만큼 오늘 글리코겐 에너지 풀 충전되셨네요! 퇴근길에 저랑 15분만 땀 빼고 칼로리 깔끔하게 격파하시죠! 준비되셨습니까, 대표님? 🔥\`,
            mood: "cheer"
          };
        } else {
          return {
            reply: \`맛있게 드신 음식은 내일의 활력이 됩니다. 무리하게 굶지 마시고 가벼운 파워워킹으로 소화만 편안하게 시켜주세요!\`,
            mood: "comfort"
          };
        }
      }

      // 6. 스케줄/일정 등록 파싱
      const newSchedules = this.parseSchedulesFromText(text);
      if (newSchedules.length > 0) {
        const summary = newSchedules.map((s) => \`\${s.day} \${s.time}\`).join(", ");
        return {
          reply: \`네, 대표님! 말씀하신 내용을 바탕으로 [\${summary} · \${newSchedules[0].title} (\${newSchedules[0].duration})] \${newSchedules.length}건을 캘린더에 등록했습니다. 당일 전에 리마인드 드릴게요!\`,
          mood: "plan",
          newSchedules
        };
      }

      // 7. 건강/통증/부상 경고
      if (q.includes("통증") || q.includes("발목") || q.includes("허리") || q.includes("피곤") || q.includes("지쳐")) {
        return {
          reply: \`대표님, 컨디션이 좋지 않으실 때는 무리한 러닝을 쉬고 가벼운 전신 스트레칭과 수면을 최우선해 주세요. 통증이 3일 이상 지속되면 정형외과 진료를 권장드립니다. (앱 가이드는 의료 진단이 아닙니다)\`,
          mood: "warning"
        };
      }

      // 8. 기본 페르소나별 품격 있는 일상 대화
      if (this.currentCoachId === "leo") {
        return { 
          reply: \`대표님, 목표를 향해 한 걸음씩 나아가는 지금이 가장 멋집니다! 오늘 운동도 끝까지 파이팅 넘치게 서포트할 테니, 궁금한 운동법이나 루틴이 있다면 언제든 편하게 물어보세요! 🔥\`, 
          mood: "cheer" 
        };
      } else if (this.currentCoachId === "luna") {
        return { 
          reply: \`대표님 말씀 잘 들었어요. 조급해하지 않고 하루하루 쌓아가는 습관이 가장 강력한 무기랍니다. 오늘도 루나가 옆에서 차분하게 페이스메이커가 되어드릴게요 🌸\`, 
          mood: "comfort" 
        };
      } else if (this.currentCoachId === "ellie") {
        return { 
          reply: \`영양 코치 엘리입니다! 대표님의 체질과 라이프스타일에 딱 맞는 클린 식단과 단백질 조합을 언제든 추천해 드릴게요. 편하게 말씀해 주세요 🥗\`, 
          mood: "cheer" 
        };
      } else {
        return { 
          reply: \`닥터 케이입니다. 부상 없는 안전한 러닝과 올바른 심폐 강화를 위해 의학적 운동 가이드라인을 제공해 드립니다. 오늘 컨디션은 어떠신가요?\`, 
          mood: "warning" 
        };
      }
    }`;

content = content.replace(oldGenerateResponse, newGenerateResponse);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully upgraded generateResponse with elite fitness intelligence in careTeam.js');
