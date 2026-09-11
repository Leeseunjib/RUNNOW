// Hub & Spoke 무인 자동 동기화 엔진 (Auto-Sync to BSC HQ)
// 지점(Spoke)의 작업일지와 보고서가 생성/수정될 때마다 중앙 본사(HQ)로 100% 자동 복제·보존합니다.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPOKE_ROOT = path.resolve(__dirname, '..');
const SPOKE_DOCS = path.join(SPOKE_ROOT, 'docs');

const HQ_ROOT = 'C:\\BeausCreators\\01.BSC_HQ';
const HQ_WORKLOGS = path.join(HQ_ROOT, '1.Documents', '02.작업일지');
const HQ_REPORTS = path.join(HQ_ROOT, '1.Documents', '01.보고서');
const HQ_STATUS_FILE = path.join(HQ_ROOT, '2.Agents', '에이전트', '00.시스템', '05.System_Data_and_Docs', 'agent_status.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function syncToHq() {
  console.log('🔄 [Auto-Sync] 지점(Spoke) ➔ 중앙 본사(HQ) 자동 동기화 시작...');

  if (!fs.existsSync(HQ_ROOT)) {
    console.warn('⚠️ [Auto-Sync] 중앙 본사(HQ) 경로를 찾을 수 없습니다:', HQ_ROOT);
    return false;
  }

  ensureDir(HQ_WORKLOGS);
  ensureDir(HQ_REPORTS);

  let worklogsSynced = 0;
  let reportsSynced = 0;

  if (fs.existsSync(SPOKE_DOCS)) {
    const files = fs.readdirSync(SPOKE_DOCS);

    for (const file of files) {
      const srcPath = path.join(SPOKE_DOCS, file);
      if (!fs.statSync(srcPath).isFile()) continue;

      // 1. 작업일지 동기화 (*_WorkLog.md)
      if (file.endsWith('_WorkLog.md')) {
        const destPath = path.join(HQ_WORKLOGS, file);
        fs.copyFileSync(srcPath, destPath);
        worklogsSynced++;
      }

      // 2. 정식 보고서 동기화 (*보고서.md)
      if (file.includes('보고서.md') || file.includes('Report.md')) {
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const targetDate = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);
        const reportDateDir = path.join(HQ_REPORTS, targetDate);
        ensureDir(reportDateDir);

        const destPath = path.join(reportDateDir, file);
        fs.copyFileSync(srcPath, destPath);
        reportsSynced++;
      }
    }
  }

  // 3. 에이전트 실시간 상태 갱신
  try {
    if (fs.existsSync(HQ_STATUS_FILE)) {
      const raw = fs.readFileSync(HQ_STATUS_FILE, 'utf8');
      const data = JSON.parse(raw);
      const geonu = data.agents?.find(a => a.id === 'geonu');
      if (geonu) {
        geonu.status = 'branch_active';
        geonu.statusLabel = '🛠️ Branch_Active';
        geonu.location = 'proj_01';
        geonu.lastActive = new Date().toISOString();
        fs.writeFileSync(HQ_STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.warn('⚠️ [Auto-Sync] 에이전트 상태 업데이트 실패:', e.message);
  }

  console.log(`✅ [Auto-Sync 완료] 작업일지: ${worklogsSynced}건, 보고서: ${reportsSynced}건 HQ 동기화 성공!`);
  return true;
}

// 직접 실행 시 구동
if (process.argv[1] === __filename) {
  syncToHq();
}
