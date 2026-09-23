import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('🛡️ [수호 QA 에이전트] 상용 배포 전 PII(개인정보) 및 더미 데이터 정밀 스캔을 시작합니다...');

// 스캔 타겟 확장자 및 무시 디렉토리
const TARGET_EXTS = ['.js', '.mjs', '.html', '.css', '.json'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'expo_app', 'tests', 'docs', 'scripts'];

// ⚠️ 절대 상용에 포함되면 안 되는 위험 키워드 목록 (정규식)
const FORBIDDEN_PATTERNS = [
  /이건우/g,
  /dnswlq456/gi,
  /테스트 전용/g,
  /VIP 마스터 패스/g,
  /console\.log\(/g, // 디버깅 로그도 원칙적 차단 (필요시 예외 처리)
  /INTERNAL_TESTERS/g
];

let violationCount = 0;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (TARGET_EXTS.includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // 화이트리스트 처리 (본 스크립트 자신은 제외)
        if (file === 'qa_pii_scanner.mjs') continue;
        
        FORBIDDEN_PATTERNS.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            console.error(`🚨 [위반 적발] 파일: ${fullPath} | 패턴: ${pattern}`);
            violationCount++;
          }
        });
      }
    }
  }
}

try {
  scanDirectory(PROJECT_ROOT);
  
  if (violationCount > 0) {
    console.error(`\n❌ [스캔 실패] 총 ${violationCount}건의 PII/위험 문구가 적발되었습니다. 배포(promote:live) 프로세스를 강제 차단(Hard Stop)합니다.`);
    process.exit(1); // 배포 파이프라인 강제 종료
  } else {
    console.log('\n✅ [스캔 통과] PII 및 위험 더미 데이터가 발견되지 않았습니다. 상용 배포가 승인되었습니다.');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ 스캐너 실행 중 치명적 오류 발생:', error);
  process.exit(1);
}
