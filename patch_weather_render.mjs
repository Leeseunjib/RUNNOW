import fs from 'fs';

const targetDirs = [
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web',
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow'
];

targetDirs.forEach(dir => {
  const indexPath = `${dir}\\index.html`;
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf8');

  // Fix renderWeatherUI
  const oldRenderRegex = /function renderWeatherUI\(data\) \{[\s\S]*?if \(elUpdated\) elUpdated\.innerText = data\.updatedAt \|\| "방금 전";\s*\}/;

  const newRenderCode = `function renderWeatherUI(data) {
      if (!data) return;
      
      const elIcon = document.getElementById('weather-icon');
      const elTemp = document.getElementById('weather-temp');
      const elLabel = document.getElementById('weather-label');
      const elApparent = document.getElementById('weather-apparent');
      const elScore = document.getElementById('weather-running-score');
      const elStatus = document.getElementById('weather-running-status');
      const elAirBadge = document.getElementById('weather-air-badge');
      const elAirDetails = document.getElementById('weather-air-details');
      const elCoachAvatar = document.getElementById('weather-coach-avatar');
      const elCoachTitle = document.getElementById('weather-coach-title');
      const elCoachBadge = document.getElementById('weather-coach-badge');
      const elCoachMsg = document.getElementById('weather-coach-msg');
      const elLocation = document.getElementById('weather-location-name');
      const elUpdated = document.getElementById('weather-updated-time');

      if (elIcon) elIcon.innerText = data.weatherIcon || "☀️";
      if (elTemp) {
        elTemp.innerText = data.temp;
        elTemp.style.color = "var(--text-main)";
      }
      if (elLabel) {
        elLabel.innerText = data.weatherLabel || "맑음";
        elLabel.style.color = "var(--text-sub)";
      }
      if (elApparent) {
        elApparent.innerText = \`체감 \${data.apparentTemp}℃ • 습도 \${data.humidity}%\`;
        elApparent.style.color = "var(--primary-accent)";
      }

      if (elScore && data.runningIndex) {
        elScore.innerHTML = \`\${data.runningIndex.score}<span style="font-size:12px; font-weight:700;">점</span>\`;
        elScore.style.color = "var(--primary-accent)";
      }
      if (elStatus && data.runningIndex) {
        elStatus.innerText = data.runningIndex.status;
        elStatus.style.color = "var(--text-main)";
      }

      if (elAirBadge && data.airQuality) {
        elAirBadge.innerText = data.airQuality.label;
        if (data.airQuality.grade === 'good') {
          elAirBadge.style.background = 'var(--primary-accent-subtle, rgba(0,255,136,0.15))';
          elAirBadge.style.borderColor = 'var(--primary-accent, #00FF88)';
          elAirBadge.style.color = 'var(--primary-accent, #00A63E)';
        } else if (data.airQuality.grade === 'normal') {
          elAirBadge.style.background = 'rgba(255,215,0,0.15)';
          elAirBadge.style.borderColor = '#FFD700';
          elAirBadge.style.color = '#B45309';
        } else {
          elAirBadge.style.background = 'rgba(255,112,67,0.15)';
          elAirBadge.style.borderColor = '#FF7043';
          elAirBadge.style.color = '#C2410C';
        }
      }

      if (elAirDetails && data.airQuality) {
        elAirDetails.innerText = \`PM10 \${data.airQuality.pm10} • PM2.5 \${data.airQuality.pm2_5}\`;
        elAirDetails.style.color = "var(--text-muted)";
      }

      if (data.coachingBriefing) {
        const cb = data.coachingBriefing;
        if (elCoachAvatar) elCoachAvatar.innerText = cb.coach === '루나' ? '🧘' : (cb.coach === '닥터케이' ? '🩺' : '🦁');
        if (elCoachTitle) {
          elCoachTitle.innerText = \`\${cb.coach === '루나' ? '🧘' : (cb.coach === '닥터케이' ? '🩺' : '🦁')} \${cb.coach}의 기상 브리핑\`;
          elCoachTitle.style.color = "var(--text-main)";
        }
        if (elCoachBadge) {
          elCoachBadge.innerText = cb.badge || "데일리 가이드";
          elCoachBadge.style.background = "var(--primary-accent-subtle)";
          elCoachBadge.style.color = "var(--primary-accent)";
        }
        if (elCoachMsg) {
          elCoachMsg.innerText = cb.message;
          elCoachMsg.style.color = "var(--text-main)";
        }
      }

      if (elLocation) {
        const loc = data.locationName || "수도권/경기 GPS";
        elLocation.innerText = loc.includes("기상청") ? \`📍 \${loc}\` : \`📍 \${loc} 표준관측소\`;
        elLocation.style.color = "var(--text-muted)";
      }
      if (elUpdated) {
        elUpdated.innerText = data.updatedAt || "방금 전";
      }
    }`;

  if (oldRenderRegex.test(html)) {
    html = html.replace(oldRenderRegex, newRenderCode);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Successfully patched renderWeatherUI in:', indexPath);
  } else {
    console.log('renderWeatherUI regex not matched in:', indexPath);
  }
});
