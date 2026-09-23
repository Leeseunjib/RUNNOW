# 공공데이터 엣지 캐시 Cron Scheduler 가이드

본 문서는 거누(CTO)가 구축한 `update_public_cache.mjs` 파이프라인을 매일 새벽 무중단으로 자동 실행하기 위한 서버/Actions 세팅 가이드입니다.

## 1. GitHub Actions 기반 서버리스 스케줄링 (권장)
GitHub 레포지토리에 연결된 경우 가장 비용 효율적인 방법입니다.

`.github/workflows/update_cache.yml`에 다음을 추가하세요.
```yaml
name: 🔄 Update Public Data Edge Cache

on:
  schedule:
    - cron: '0 18 * * *' # KST 기준 매일 새벽 3시 (UTC 18시)
  workflow_dispatch: # 수동 트리거 지원

jobs:
  update-cache:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      - name: Run Cache Updater
        run: node scripts/update_public_cache.mjs
      - name: Commit and Push if changed
        run: |
          git config --global user.name "BSC Auto-Updater"
          git config --global user.email "bot@beauscreators.com"
          git add legacy_web/data_cache/
          git commit -m "chore: 공공데이터 엣지 캐시 자동 무중단 갱신" || echo "No changes to commit"
          git push
```

## 2. Linux Crontab 기반 (단독 서버 구동 시)
```bash
# 매일 새벽 3시에 스크립트 실행 후 로그 기록
0 3 * * * /usr/bin/node /path/to/project/scripts/update_public_cache.mjs >> /path/to/project/logs/cron.log 2>&1
```

> **주의사항**: 캐시 갱신 중 API Limit 또는 서버 다운 시 기존 JSON 파일을 보호하는 Fallback 로직이 `update_public_cache.mjs` 내부에 구현되어 있습니다. 기존 파일은 안전하게 유지됩니다.
