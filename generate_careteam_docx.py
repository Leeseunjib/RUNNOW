# -*- coding: utf-8 -*-
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Malgun Gothic'
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A) # Slate 900
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Malgun Gothic'
    run.font.size = Pt(11.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Blue 900
    return p

def add_body_p(doc, text, bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.25

    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Malgun Gothic'
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    r = p.add_run(text)
    r.font.name = 'Malgun Gothic'
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(0x33, 0x41, 0x55) # Slate 700
    return p

def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.2

    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Malgun Gothic'
        r_pre.font.size = Pt(9.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    r = p.add_run(text)
    r.font.name = 'Malgun Gothic'
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def add_callout(doc, text, title="핵심 원칙"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.8)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)

    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:top w:val="none"/>'
        f'  <w:bottom w:val="none"/>'
        f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="0284C7"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(3)
    r_title = p.add_run(f"💡 {title}: ")
    r_title.font.name = 'Malgun Gothic'
    r_title.font.size = Pt(9.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x03, 0x69, 0xA1)

    r_body = p.add_run(text)
    r_body.font.name = 'Malgun Gothic'
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def main():
    doc = docx.Document()

    # 페이지 여백
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # 1. 문서 헤더 / 표지 블록
    tbl_header = doc.add_table(rows=1, cols=1)
    tbl_header.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_h = tbl_header.cell(0, 0)
    cell_h.width = Inches(6.8)
    set_cell_background(cell_h, "0F172A") # Slate 900
    set_cell_margins(cell_h, top=240, bottom=240, left=240, right=240)

    p_tag = cell_h.paragraphs[0]
    p_tag.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tag = p_tag.add_run("BEAUSCREATORS INNOVATION STRATEGY REPORT")
    r_tag.font.name = 'Malgun Gothic'
    r_tag.font.size = Pt(9)
    r_tag.font.bold = True
    r_tag.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8) # Sky 400

    p_t = cell_h.add_paragraph()
    p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t.paragraph_format.space_before = Pt(6)
    p_t.paragraph_format.space_after = Pt(6)
    r_t = p_t.add_run("RunNow 1:1 전담 AI 케어팀 & 공공데이터 기반\n식단 관리 체크리스트 시스템 기획 보고서")
    r_t.font.name = 'Malgun Gothic'
    r_t.font.size = Pt(17)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    p_sub = cell_h.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(4)
    r_sub = p_sub.add_run("월 50만원 PT의 모바일 혁신 | 식약처 공공 API 연동 | 자책감 없는(No-Guilt) 현실 밀착 식단 체크리스트")
    r_sub.font.name = 'Malgun Gothic'
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(8)
    p_meta.paragraph_format.space_after = Pt(12)
    p_meta.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_m = p_meta.add_run("보고 대상: 이건우 대표님 (BeausCreators CEO) | 기획/작성: BSC Core TF & RunNow 개발팀 | 일자: 2026.09.14")
    r_m.font.name = 'Malgun Gothic'
    r_m.font.size = Pt(8.5)
    r_m.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # 1. 기획 배경 및 핵심 마케팅 포지셔닝
    add_heading_1(doc, "1. 기획 배경 및 핵심 마케팅 포지셔닝")
    add_body_p(doc, "현재 피트니스 및 다이어트 앱 시장은 단순 러닝 거리 측정이나 횟수 카운팅에 머물러 있으며, 유저에게 정서적 공감이나 실질적인 1:1 밀착 코칭을 제공하지 못하고 있습니다. 또한 기존 식단 앱들은 엄격한 닭가슴살/샐러드 식단만을 강요하여, 유저가 외식이나 회식을 하는 순간 죄책감으로 앱을 이탈하는 심각한 한계를 보입니다.")
    add_body_p(doc, "이건우 대표님께서 제시하신 혁신 방향성은 이러한 시장의 결핍을 완벽히 해결합니다. 고가의 오프라인 1:1 PT를 합리적인 모바일 케어팀으로 치환하면서, 현직 헬스장 트레이너들과의 공존(B2B2C)까지 도모할 수 있는 독보적인 전략입니다.")

    add_callout(doc, "오프라인 1:1 PT는 회당 6~8만 원(월 40~60만 원)에 달해 비용 장벽이 큽니다. RunNow는 '운동 PT(남/여 선택) + 식단 영양사 + 건강 체크 닥터' 3대 전문 에이전트를 원스톱 제공하여 주머니 속 24시간 전담 피트니스 클리닉으로 포지셔닝합니다.", "핵심 차별화 Moat")

    add_bullet_p(doc, " 2030 직장인 및 홈트족의 가격 저항을 허물고 최상급 퍼스널 코칭 경험 제공", "• 월 50만 원 PT의 모바일 혁신:")
    add_bullet_p(doc, " 현직 헬스장 트레이너가 수업 없는 날 회원들의 식단/자율운동을 관리하는 파트너 툴로 연계", "• 현직 트레이너와의 상생(B2B2C):")
    add_bullet_p(doc, " 추천대로 먹지 못하더라도 솔직히 기록하면 즉시 운동과 다음 식단으로 만회하는 심리적 안전지대 구축", "• 자책감 없는(No-Guilt) 현실 UX:")

    # 2. 3대 전담 에이전트 "RunNow Care Team" 상세 설계
    add_heading_1(doc, "2. 3대 전담 AI 에이전트 'RunNow Care Team' 상세 설계")
    add_body_p(doc, "유저의 상태를 입체적으로 케어하기 위해 3개 전문 영역의 전담 페르소나를 배치하고, 상호 데이터가 실시간으로 교차 동기화되는 멀티 에이전트 파이프라인을 구축합니다.")

    tbl_agents = doc.add_table(rows=4, cols=3)
    tbl_agents.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_agents)
    
    headers = ["에이전트명 및 페르소나", "핵심 역할 및 인터랙션", "데이터 연동 기능"]
    for i, h in enumerate(headers):
        cell = tbl_agents.cell(0, i)
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Malgun Gothic'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    agent_data = [
        ("🏋️ 운동 PT 에이전트\n• 남성 코치 '레오' (파이팅형)\n• 여성 코치 '루나' (섬세형)", 
         "• 남/여 성별 및 코칭 보이스/성향 선택\n• 음성(TTS) 오디오 코칭 지원\n• 대화형 주간 맞춤 운동 스케줄 자동 생성", 
         "• RunNow 카메라 모션인식(자세/횟수)\n• GPS 러닝 실측 데이터 연동\n• 인앱 캘린더 자동 일정 바인딩"),
        ("🥗 식단 조절 에이전트\n• 영양 코치 '엘리'\n(공감형 밸런스 케어)", 
         "• 자연어 대화형 식사 기록 & 즉각 영양 피드백\n• 과식/치팅 발생 시 자책감 완화 및 만회 가이드\n• 일일 식단 미션 체크리스트 관리", 
         "• 식약처 공공데이터 통합영양성분 API\n• 유저 당일 운동 소모 칼로리(METs)\n• 탄수화물/단백질/지방/나트륨 실측"),
        ("🩺 건강 체크 에이전트\n• 메디컬 닥터 '닥터 케이'\n(안전/재활 전문)", 
         "• 운동 전/후 컨디션 스캔 (수면, 통증, 피로도)\n• 관절/근육 통증 감지 시 부상 방지 알림\n• 고강도 스케줄을 가벼운 스트레칭으로 치환", 
         "• 질병관리청 한국인 건강 지표\n• 유저 컨디션/피로도 트래커\n• 세이프티 가드 알고리즘")
    ]

    for row_idx, data in enumerate(agent_data, start=1):
        for col_idx, text in enumerate(data):
            cell = tbl_agents.cell(row_idx, col_idx)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Malgun Gothic'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_body_p(doc, "", space_after=6)

    # 3. 공공기관 공인 오픈 API 및 표준 데이터셋 연동 체계
    add_heading_1(doc, "3. 공공기관 공인 오픈 API 및 표준 데이터셋 연동 체계")
    add_body_p(doc, "주먹구구식 계산이나 비정형 데이터가 아닌, 대한민국 공공기관의 공인된 데이터베이스를 연동함으로써 앱의 신뢰성과 의학적·영양학적 공신력을 국가 공인 수준으로 격상합니다.")

    tbl_api = doc.add_table(rows=5, cols=3)
    tbl_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_api)

    api_headers = ["공공기관 및 데이터명", "제공 데이터 스펙", "RunNow 실무 적용 방안"]
    for i, h in enumerate(api_headers):
        cell = tbl_api.cell(0, i)
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Malgun Gothic'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    api_rows = [
        ("식품의약품안전처\n(공공데이터포털 data.go.kr)\n'통합식품영양성분정보 API'",
         "• 외식/가공식품/조리식품 5만+ 건\n• 열량(kcal), 탄/단/지(g), 당류, 나트륨(mg), 콜레스테롤, 포화지방 등 40종",
         "유저가 '김치찌개', '편의점 닭가슴살' 입력 시 1인분당 정확한 칼로리와 영양성분을 0.1초 만에 자동 계산"),
        ("농촌진흥청 국립농업과학원\n'국가표준식품성분 DB'",
         "• 원물 농축수산물(사과, 소고기 부위별, 고구마, 현미 등) 표준 영양성분표",
         "자연식/클린 다이어트 식단의 정밀 탄단지 및 미량 영양소 계산"),
        ("국민체육진흥공단 (KSPO)\n'국민체력100 운동처방 API'",
         "• 성별/연령별 체력 기준 및 부하 강도\n• 종목별 표준 칼로리 소모량 (METs 공식)",
         "유저의 체력에 맞는 무리 없는 단계별 운동 루틴 및 러닝/맨몸운동의 소모 열량 과학적 정밀 산출"),
        ("보건복지부 / 질병관리청\n'한국인 영양소 섭취기준 (KDRIs)'",
         "• 연령/성별 기초대사량(BMR)\n• 에너지 필요추정량 및 3대 영양소 적정 비율",
         "운동량에 맞춘 최적 단백질 권장량(체중 1kg당 1.2~1.8g) 및 일일 칼로리 수지 동적 가이드")
    ]

    for row_idx, data in enumerate(api_rows, start=1):
        for col_idx, text in enumerate(data):
            cell = tbl_api.cell(row_idx, col_idx)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Malgun Gothic'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_body_p(doc, "", space_after=6)
    add_callout(doc, "모바일 환경의 통신 지연을 방지하기 위해 한국인이 가장 자주 찾는 다이어트/외식 Top 1,000개 식품 영양 데이터를 인앱 로컬 캐시(JSON)로 탑재하여 오프라인 0초 조회를 보장하며, 상세 품목은 식약처 API를 실시간 호출합니다.", "온디바이스 최적화 전략")

    # 4. 현실 밀착형 식단 조절 체크리스트 & 다이내믹 보정(Rescue) 시스템
    add_heading_1(doc, "4. 현실 밀착형 식단 체크리스트 & 다이내믹 보정(Rescue) 시스템")
    add_body_p(doc, "대표님께서 지적하신 바와 같이, 유저는 결코 완벽하게 추천 식단을 따르지 못합니다. 본 시스템은 유저의 '불완전한 현실'을 전제로 하여 설계되었습니다.")

    add_heading_2(doc, "4.1 행동 기반 일일 식단 체크리스트 (Habit-driven Checklist)")
    add_body_p(doc, "칼로리 저울을 들고 다니지 않아도 일상에서 바로 실천할 수 있는 미션형 체크리스트를 제공합니다:")
    add_bullet_p(doc, " 기상 직후 미온수 300ml + 삶은 계란 2개 or 프로틴 쉐이크 (단백질 20g 확보)", "[✓] 아침 미션:")
    add_bullet_p(doc, " 일반식 섭취 시 밥 2/3 공기 덜어내기 & 찌개 국물 남기기 (나트륨/탄수화물 컷)", "[✓] 점심 미션:")
    add_bullet_p(doc, " 가공당 음료(바닐라라떼/탄산음료) 대신 아이스 아메리카노나 탄산수 선택", "[✓] 간식 방어:")
    add_bullet_p(doc, " 취침 4시간 전 식사 마치기 & 채소/두부 위주의 가벼운 식사", "[✓] 저녁 미션:")
    add_bullet_p(doc, " 밤 10시 이후 배달앱 유혹 방어 성공 시 취침 도장 탭", "[✓] 야식 방어 도장:")

    add_heading_2(doc, "4.2 치팅/과식 솔직 고백 UX 및 자동 만회(Rescue) 알고리즘")
    add_body_p(doc, "유저가 회식이나 치팅을 했을 때 죄책감 없이 터치할 수 있는 [솔직히 고백하기: 오늘 치팅/과식했어요] 버튼을 배치합니다.")
    add_bullet_p(doc, " '점심 삼겹살에 볶음밥 정말 맛있게 드셨나요? 괜찮습니다! 맛있게 먹은 한 끼는 내일의 활력이 됩니다.'", "1. 즉각적인 심리 안도감 제공:")
    add_bullet_p(doc, " 점심의 과잉 칼로리와 나트륨을 감안하여, 저녁 체크리스트를 자동으로 '칼륨 풍부 채소 샐러드 + 가벼운 단백질'로 실시간 다운사이징", "2. 저녁 식단 자동 다운사이징:")
    add_bullet_p(doc, " PT 에이전트(레오/루나)가 오늘 저녁 러닝에 15분 파워 조깅을 추가하는 보정 루틴을 캘린더에 자동 업데이트", "3. 운동 스케줄 자동 보정:")

    add_heading_2(doc, "4.3 다마고치 펫 및 게이미피케이션 연동")
    add_body_p(doc, "RunNow의 tamagotchi.js와 결합하여 식단 관리를 하나의 육성 게임처럼 즐길 수 있도록 유도합니다. 야식 방어 성공 시 펫에게 '숙면 버프'와 젬이 지급되며, 솔직하게 치팅을 기록하면 거짓말 방지 보너스인 '정직 배지'를 부여하여 사용자가 앱을 계속 켜두도록 만듭니다.")

    # 5. 기술 아키텍처 및 대화형 캘린더 스케줄러
    add_heading_1(doc, "5. 기술 아키텍처 및 대화형 캘린더 스케줄러")
    add_body_p(doc, "유저와 PT 에이전트 간의 자연어 대화를 통해 캘린더에 운동 루틴이 즉각 생성·동기화되는 흐름입니다.")
    add_bullet_p(doc, " '다음 주 월, 수, 금 퇴근하고 30분씩 뱃살 빼는 루틴 짜줘.'", "유저 발화:")
    add_bullet_p(doc, " 의도(Intent) 분석 → 요일(월/수/금), 시간대(19:00), 운동 종류(인터벌 러닝 20분 + 코어 운동 10분) JSON 구조화", "AI 파싱:")
    add_bullet_p(doc, " LocalStorage 및 Firebase Firestore의 user_schedules에 즉각 등록되어 대시보드 캘린더에 카드 형태로 표시", "일정 등록:")
    add_bullet_p(doc, " 당일 시작 30분 전 푸시 알림 및 PT쌤의 음성(TTS) 격려 메시지 전송", "리마인더:")

    # 6. 단계별 구현 및 배포 로드맵
    add_heading_1(doc, "6. 단계별 구현 및 배포 로드맵")
    
    tbl_road = doc.add_table(rows=5, cols=3)
    tbl_road.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_road)

    road_headers = ["단계 (Phase)", "주요 개발 및 구현 과제", "기대 산출물"]
    for i, h in enumerate(road_headers):
        cell = tbl_road.cell(0, i)
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Malgun Gothic'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    road_rows = [
        ("Phase 1\n(UI 프로토타입)", 
         "• 1:1 코치실 대시보드 UI (남/여 PT, 영양사, 닥터 선택)\n• 일일 식단 체크리스트 & 원클릭 로깅 컴포넌트", 
         "RunNow 인앱 [1:1 코치실] 탭 화면 및 체크리스트 동작 프로토타입"),
        ("Phase 2\n(공공데이터 연동)", 
         "• 식약처 통합영양성분 Top 1,000 로컬 캐시 구축\n• 공공데이터포털 REST API 연동 및 칼로리/영양치 실시간 파싱", 
         "식품 검색 시 식약처 공인 열량/탄단지 즉시 연동 엔진"),
        ("Phase 3\n(멀티 에이전트 & 스케줄러)", 
         "• 3대 에이전트 대화 엔진 및 음성 TTS 탑재\n• 대화 기반 캘린더 일정 자동 생성 및 보정(Rescue) 로직", 
         "대화 한마디로 캘린더에 운동이 등록되고 치팅 시 자동 보정되는 완성형 파이프라인"),
        ("Phase 4\n(마케팅 & B2B 런칭)", 
         "• '월 50만원 PT 모바일 혁신' 캠페인 개시\n• 헬스장 트레이너 제휴(B2B2C 파트너십) 프로모션", 
         "구독 전환율 극대화 및 오프라인 피트니스 연계 생태계 완성")
    ]

    for row_idx, data in enumerate(road_rows, start=1):
        for col_idx, text in enumerate(data):
            cell = tbl_road.cell(row_idx, col_idx)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Malgun Gothic'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_body_p(doc, "", space_after=8)
    add_callout(doc, "이건우 대표님께서 주신 방향성에 맞추어 본 기획 문서를 정본으로 보존하고, 승인해 주시는 즉시 Phase 1 프로토타입 화면 설계 및 식약처 DB 캐시 작업에 착수하겠습니다.", "총평 및 향후 실행 계획")

    output_filename = "2026-09-14_RUNNOW_AI_PT_CareTeam_and_Diet_System_Plan.docx"
    doc.save(output_filename)
    print(f"[SUCCESS] Created {output_filename}")

if __name__ == "__main__":
    main()
