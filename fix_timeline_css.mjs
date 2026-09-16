import { readFileSync, writeFileSync } from 'node:fs';

const paths = [
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\styles.css',
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\styles.css'
];

const cssRule = `
/* 10단계 진화 타임라인 라이트/다크 완벽 가독성 */
.pet-evolution-timeline {
  background: var(--surface-elevated, #F8FAFC) !important;
  border: 1.5px solid var(--border-card, #E2E8F0) !important;
  border-radius: 14px !important;
  padding: 12px 14px !important;
  margin-bottom: 16px !important;
  box-sizing: border-box !important;
  width: 100% !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
}
.pet-progress-track {
  width: 100% !important;
  height: 8px !important;
  background: #E2E8F0 !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  margin-bottom: 10px !important;
}
.pet-stages-dots {
  display: flex !important;
  justify-content: space-between !important;
  gap: 2px !important;
  width: 100% !important;
}
.pet-stage-dot {
  width: 22px !important;
  height: 22px !important;
  border-radius: 50% !important;
  background: #F1F5F9 !important;
  border: 1.5px solid #CBD5E1 !important;
  color: #475569 !important;
  font-size: 10px !important;
  font-weight: 900 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: default !important;
  transition: all 0.2s ease !important;
}
.pet-stage-dot.completed {
  background: #00C73C !important;
  border-color: #00C73C !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(0, 199, 60, 0.35) !important;
}
.pet-stage-dot.current {
  background: #00F0FF !important;
  border-color: #00C73C !important;
  color: #0F172A !important;
  transform: scale(1.15) !important;
  box-shadow: 0 2px 10px rgba(0, 240, 255, 0.5) !important;
}
`;

paths.forEach(p => {
  let content = readFileSync(p, 'utf8');
  content += '\n' + cssRule;
  writeFileSync(p, content, 'utf8');
  console.log('Appended timeline contrast css to', p);
});
