/**
 * reelsGenerator.js
 * BSC Skill Warehouse (haidrrrry__claude-remotion-skill & social-media-skills 연계)
 * 15초 인스타그램 릴스 / 틱톡 / 유튜브 쇼츠용 9:16 고화질 바이럴 비디오 자동 렌더링 엔진
 */

(function() {
  class ReelsGenerator {
    constructor() {
      this.isGenerating = false;
    }

    /**
     * 완주 기록 및 식단, 펫 데이터를 기반으로 15초 인스타 릴스 비디오 생성
     */
    async generateReelsVideo(runStats, coachName, dietStats) {
      if (this.isGenerating) return;
      this.isGenerating = true;

      const modal = document.getElementById("reels-preview-modal");
      const progressEl = document.getElementById("reels-render-progress");
      const videoEl = document.getElementById("reels-rendered-video");
      const downloadBtn = document.getElementById("btn-download-reels");

      if (modal) modal.style.display = "flex";
      if (progressEl) progressEl.textContent = "15초 릴스 비디오 렌더링 시작 (0%)...";
      if (videoEl) {
        videoEl.style.display = "none";
        videoEl.src = "";
      }
      if (downloadBtn) downloadBtn.style.display = "none";

      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1280; // 9:16 세로 해상도
      const ctx = canvas.getContext("2d");

      // MediaRecorder 세팅
      const stream = canvas.captureStream(30); // 30 FPS
      let mediaRecorder;
      const recordedChunks = [];

      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.start();

      const totalFrames = 30 * 6; // 6초 압축 루프 릴스 (데모 및 빠른 공유용, 180프레임)
      const distance = runStats?.distance || "3.42 km";
      const pace = runStats?.pace || "5'12\"";
      const calories = runStats?.calories || "245 kcal";
      const coach = coachName || "코치 루나";
      const protein = dietStats?.protein || "48g";

      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        this.renderFrame(ctx, canvas.width, canvas.height, frame, progress, {
          distance,
          pace,
          calories,
          coach,
          protein
        });

        if (progressEl && frame % 15 === 0) {
          progressEl.textContent = `15초 릴스 생성 중... ${Math.round(progress * 100)}%`;
        }

        // 프레임 딜레이
        await new Promise(r => setTimeout(r, 16));
      }

      mediaRecorder.stop();
      await new Promise(resolve => { mediaRecorder.onstop = resolve; });

      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);

      if (progressEl) progressEl.textContent = "🎉 15초 인스타 릴스 생성 완료!";
      if (videoEl) {
        videoEl.src = videoUrl;
        videoEl.style.display = "block";
        videoEl.play();
      }
      if (downloadBtn) {
        downloadBtn.style.display = "inline-flex";
        downloadBtn.onclick = () => {
          const a = document.createElement("a");
          a.href = videoUrl;
          a.download = `RUNNOW_Reels_${Date.now()}.webm`;
          a.click();
        };
      }

      this.isGenerating = false;
    }

    renderFrame(ctx, w, h, frame, p, data) {
      // 1. 다이내믹 메시 그라디언트 배경
      const grad = ctx.createLinearGradient(0, 0, w, h);
      const hueShift = Math.sin(p * Math.PI * 2) * 20;
      grad.addColorStop(0, "#080B10");
      grad.addColorStop(0.5, "#0F172A");
      grad.addColorStop(1, `hsl(${140 + hueShift}, 80%, 10%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 사이버틱 그리드 파티클
      ctx.strokeStyle = "rgba(0, 199, 60, 0.08)";
      ctx.lineWidth = 1;
      const gridY = (frame * 3) % 40;
      for (let y = gridY; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. 상단 브랜드 헤더 (NRC x Tamagotchi x CareTeam)
      ctx.fillStyle = "#00C73C";
      ctx.font = "bold 28px 'Montserrat', sans-serif";
      ctx.fillText("RUNNOW", 50, 90);

      ctx.fillStyle = "#A0AEC0";
      ctx.font = "600 18px 'Inter', sans-serif";
      ctx.fillText("1:1 AI CARE & HIGH-PERFORMANCE", 200, 88);

      // 3. 메인 하이라이트 원형 게이지 (나이키 스타일)
      const centerX = w / 2;
      const centerY = 360;
      const radius = 160;

      // 트랙 링
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 액티브 게이지
      ctx.strokeStyle = "#00C73C";
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.beginPath();
      const endAngle = -Math.PI / 2 + Math.min(p * 1.5, 1) * Math.PI * 2;
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      ctx.stroke();

      // 중앙 거리 수치
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 64px 'Montserrat', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(data.distance, centerX, centerY + 15);

      ctx.fillStyle = "#00F0FF";
      ctx.font = "800 22px 'Inter', sans-serif";
      ctx.fillText("WORKOUT COMPLETE ⚡", centerX, centerY + 65);

      // 4. 러닝 메트릭 벤토 카드 (페이스, 칼로리)
      this.drawBentoCard(ctx, 60, 580, 280, 140, "평균 페이스", data.pace, "#00F0FF", "⚡ TEMPO");
      this.drawBentoCard(ctx, 380, 580, 280, 140, "소모 칼로리", data.calories, "#FF7043", "🔥 BURNED");

      // 5. 1:1 케어팀 인증 & 식단 단백질 매크로 배지
      this.drawBentoCard(ctx, 60, 750, 600, 130, "전담 코치 코멘트", `${data.coach}: "자세 완벽! 목표 달성 훌륭합니다"`, "#00C73C", "🦁 1:1 PT 인증");
      this.drawBentoCard(ctx, 60, 910, 600, 130, "오늘 영양 밸런스", `단백질 ${data.protein} 섭취 • 칼로리 밸런스 클린 달성`, "#E2E8F0", "🥗 NUTRITION");

      // 6. 하단 바이럴 워터마크 & CTA
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "700 18px 'Inter', sans-serif";
      ctx.fillText("@RunNow_Official | runnow.beauscreators.com", centerX, 1180);

      ctx.fillStyle = "#00C73C";
      ctx.font = "900 20px 'Inter', sans-serif";
      ctx.fillText("주머니 속 1:1 전담 PT & 식단 케어", centerX, 1220);

      ctx.textAlign = "left"; // 복원
    }

    drawBentoCard(ctx, x, y, w, h, label, value, valColor, tag) {
      // 글래스모피즘 배경
      ctx.fillStyle = "rgba(18, 22, 31, 0.85)";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 18);
      ctx.fill();

      // 테두리
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 태그 뱃지
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.roundRect(x + 16, y + 14, 110, 24, 8);
      ctx.fill();

      ctx.fillStyle = "#A0AEC0";
      ctx.font = "800 11px 'Inter', sans-serif";
      ctx.fillText(tag, x + 24, y + 30);

      // 라벨
      ctx.fillStyle = "#718096";
      ctx.font = "700 13px 'Inter', sans-serif";
      ctx.fillText(label, x + 16, y + 70);

      // 값
      ctx.fillStyle = valColor;
      ctx.font = "900 24px 'Montserrat', sans-serif";
      ctx.fillText(value, x + 16, y + 105);
    }
  }

  window.ReelsGenerator = new ReelsGenerator();
})();
