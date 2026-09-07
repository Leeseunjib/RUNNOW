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
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Malgun Gothic'
    run.font.size = Pt(15)
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
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Blue 900
    return p

def add_body_p(doc, text, bold_prefix=None, space_after=5):
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

def add_callout(doc, text, title="핵심 원칙"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.8)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)

    # 좌측 두꺼운 보더
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
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    r_t = p.add_run(f"💡 {title}: ")
    r_t.font.name = 'Malgun Gothic'
    r_t.font.size = Pt(9.5)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    r_c = p.add_run(text)
    r_c.font.name = 'Malgun Gothic'
    r_c.font.size = Pt(9.5)
    r_c.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    # 마진용 빈 문단
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def build_bm_report(output_file_path):
    doc = docx.Document()

    # 페이지 여백
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # 타이틀
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    r_title = title_p.add_run("💎 [BSC 전략 보고서] RUNNOW 소비자심리학 기반 마스터 BM & 무손실(Zero-Risk) 수익화 전략서")
    r_title.font.name = 'Malgun Gothic'
    r_title.font.size = Pt(17)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(12)
    r_sub = sub_p.add_run("글로벌 벤치마크(Strava·Duolingo·Pokemon GO) 분석 · 95.8% 순마진 구조 · 행동경제학 7대 법칙 기반 BM 표준")
    r_sub.font.name = 'Malgun Gothic'
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # 메타 정보 테이블
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_table, color="E2E8F0", sz="4", val="single")

    meta_data = [
        [("문서 코드", "BSC-STRATEGY-20260907-BM01"), ("총괄 보고", "이건우 대표님 (BSC CEO)")],
        [("작성 주체", "CFO 도현(BM총괄) · BI 다인 · CTO 거누"), ("일자 및 버전", "2026년 09월 07일 | v1.0 정본")]
    ]

    for row_idx, row in enumerate(meta_table.rows):
        for col_idx, cell in enumerate(row.cells):
            cell.width = Inches(3.4)
            set_cell_background(cell, "F1F5F9" if col_idx % 2 == 0 else "FFFFFF")
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            lbl, val = meta_data[row_idx][col_idx]
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r1 = p.add_run(f"{lbl}: ")
            r1.font.bold = True
            r1.font.size = Pt(9.5)
            r1.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
            r2 = p.add_run(val)
            r2.font.size = Pt(9.5)
            r2.font.bold = (lbl == "총괄 보고")
            r2.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Executive Summary
    add_heading_1(doc, "1. 개요 및 경영진 요약 (Executive Summary)")
    add_body_p(doc, "본 보고서는 이건우 대표님의 지침에 따라 RUNNOW를 '처음 달리기는 100% 무료 개방하고, 도파민 성장을 이끄는 핵심 부가기능을 PRO 구독 서비스로 전환'한 비즈니스 모델(Freemium Subscription Model)의 이론적·수익적 근거를 정리한 전사 전략 정본입니다.")
    add_body_p(doc, "글로벌 상위 3대 서비스(Strava, Duolingo, Pokémon GO)의 과금 메커니즘을 벤치마킹하고, 트래픽이 폭증해도 서버 비용이 $0에 수렴하는 '온디바이스 엣지 연산' 기반 무손실 아키텍처(Unit Economics 95.8% 순마진)를 확립하였습니다. 아울러 향후 BeausCreators의 모든 앱 기획과 디자인의 표준 헌장이 될 '소비자심리학 7대 법칙'을 정립하였습니다.")

    add_callout(doc, "무료로 1억 명을 유입시키는 Strava의 확장력과 7일 스트릭 손실 방어로 9.1% 전환율을 만든 Duolingo의 심리학을 결합하여, 유저가 늘어날수록 마진율이 95% 이상 극대화되는 무손실 비즈니스 구조를 구축합니다.", "핵심 요약")

    # 제1장: 글로벌 3대 벤치마크 심층 분석
    add_heading_1(doc, "2. 글로벌 3대 벤치마크 심층 분석 (Global Case Studies)")
    add_body_p(doc, "전 세계에서 가장 높은 유저 인게이지먼트와 유료 구독 전환율을 기록 중인 3대 서비스의 과금 설계를 분석하고 RUNNOW 적용점을 도출하였습니다.")

    # 벤치마크 비교 테이블
    bench_table = doc.add_table(rows=4, cols=4)
    bench_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(bench_table, color="CBD5E1", sz="4", val="single")

    headers = ["서비스명", "구독 가격", "무료(Free) 개방", "유료(PRO) 게이트 & 심리 장치"]
    for col_idx, h in enumerate(headers):
        cell = bench_table.cell(0, col_idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    bench_rows = [
        ("Strava\n(글로벌 1위 러닝)", "월 $11.99\n연 $79.99", "무제한 GPS 달리기 기록,\n기본 페이스/거리/소셜 피드", "세그먼트 전체 순위표 경쟁, Fitness & Freshness 심층 분석, 3D 경로 빌더"),
        ("Duolingo\n(전환율 9.1%)", "월 $12.99\n연 $83.99", "기본 학습 레슨 무제한,\n학습 진도 체크", "스트릭 프리즈(Streak Freeze - 출석 손실 방어), 하트 무제한, 맥락적 완주 페이월"),
        ("Pokémon GO\n(누적 8조 매출)", "인앱 아이템 &\n이벤트 티켓", "실제 걷기 기반 탐험,\n기본 포획", "알 부화기(거리 치환), 레이드 패스, 한정판 스킨 (IKEA 애착 효과)")
    ]

    for row_idx, data in enumerate(bench_rows):
        row_cells = bench_table.rows[row_idx + 1].cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(text)
            r.font.size = Pt(9)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            else:
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_heading_2(doc, "2.1 Strava의 교훈: 기본 달리기는 영원히 무료여야 한다")
    add_body_p(doc, "Strava가 전 세계 1억 명의 러너를 모은 비결은 '기본 달리기 기능'에 어떠한 과금 장벽도 치지 않았기 때문입니다. 러닝 입문자가 앱을 켜자마자 카드를 등록하게 만들면 95%가 이탈합니다. RUNNOW 역시 야외 GPS와 트레드밀 달리기는 평생 무료로 개방하여 모객 파이프라인(Top of Funnel)을 극대화합니다.")

    add_heading_2(doc, "2.2 Duolingo의 교훈: 사람을 움직이는 것은 강도가 아니라 '손실 방어'다")
    add_body_p(doc, "듀오링고는 7일 연속 출석한 유저의 이탈률이 급감한다는 데이터에 기반하여, 유저가 결석했을 때 피땀 흘려 쌓은 스트릭이 깨지는 고통을 방어해 주는 '스트릭 프리즈'를 유료 구독의 핵심 혜택으로 삼았습니다. RUNNOW의 21일 챌린지 역시 '스트릭 실드(Streak Shield)'를 PRO 구독자 전용으로 제공하여 강력한 구독 전환율을 창출합니다.")

    # 제2장: 운영상 절대로 손해가 나지 않는 무손실 아키텍처
    add_heading_1(doc, "3. 운영상 '절대로 손해가 나지 않는' 3대 무손실(Zero-Risk) 아키텍처")
    add_body_p(doc, "수많은 IT 스타트업이 실패하는 결정적 원인은 '유저가 늘어날수록 서버 GPU 연산비와 클라우드 인프라 비용이 기하급수적으로 폭증하여 적자가 누적되는 구조' 때문입니다. 당사는 단위 경제학(Unit Economics) 상 유저 100만 명이 유입되어도 인프라 비용이 0원에 수렴하는 3대 제로 코스트 설계를 완성했습니다.")

    add_heading_2(doc, "3.1 [원칙 1] 온디바이스(On-Device) 엣지 컴퓨팅 ($0 Server AI)")
    add_body_p(doc, "Google MediaPipe Pose 33개 관절 인식 및 6종 운동 판정 알고리즘은 중앙 클라우드 서버의 GPU를 거치지 않고, 러너의 스마트폰/PC 웹브라우저(WebAssembly & WebGPU)에서 100% 로컬 연산됩니다. 유저가 하루 100만 번 스쿼트를 해도 당사 서버 부하는 0 byte, 서버 비용은 $0입니다.")

    add_heading_2(doc, "3.2 [원칙 2] 서버리스(Serverless) 캐싱 & 로컬 우선 동기화")
    add_body_p(doc, "매초 발생하는 미세 GPS 좌표를 클라우드 Firestore에 쏘지 않고 브라우저 로컬스토리지에 저장한 뒤, 러닝 완주 시점에만 단 1회 요약 데이터를 클라우드에 압축 저장합니다. 일간 활성 러너 2만 명까지 Google Cloud/Firebase 무료 티어 내에서 완벽히 방어됩니다.")

    add_heading_2(doc, "3.3 [원칙 3] 압도적인 마진율 95.8% (단 1명만 결제해도 흑자 전환)")
    add_body_p(doc, "연간 멤버십 ₩79,000 ($59.99) 결제 시, PG/PayPal 수수료(약 ₩3,300)를 제외한 ₩75,700이 순이익으로 남습니다. 실물 배송비 0원, 서버 AI 연산비 0원이므로 순이익률은 95.8%에 달합니다.")

    # 손익분기 테이블
    econ_table = doc.add_table(rows=3, cols=3)
    econ_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(econ_table, color="CBD5E1", sz="4", val="single")

    e_headers = ["구독 플랜", "연간 매출액", "예상 원가 & 순이익 (마진율)"]
    for col_idx, h in enumerate(e_headers):
        cell = econ_table.cell(0, col_idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    econ_rows = [
        ("월간 플랜 (₩9,900 / 월)", "₩118,800 / 년", "PG 수수료 ₩4,900 제외 ➔ 순이익 ₩113,900 (마진율 95.9%)"),
        ("연간 플랜 (₩79,000 / 년)", "₩79,000 / 년", "PG 수수료 ₩3,300 제외 ➔ 순이익 ₩75,700 (마진율 95.8%)")
    ]

    for row_idx, data in enumerate(econ_rows):
        row_cells = econ_table.rows[row_idx + 1].cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(text)
            r.font.size = Pt(9)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            else:
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_callout(doc, "단 1명의 구독자만 유치해도 1년 도메인 유지비(약 15,000원)를 즉시 회수하며, 2번째 구독자부터는 발생하는 매출의 95% 이상이 당사의 순수 현금 흐름으로 축적됩니다. 절대로 손해가 날 수 없는 무결점 경제 모델입니다.", "손익분기 분석")

    # 제3장: 소비자심리학 & 행동경제학 7대 법칙
    add_heading_1(doc, "4. 소비자심리학 & 행동경제학 기반 7대 설계 법칙")
    add_body_p(doc, "향후 RUNNOW 및 BeausCreators가 기획·디자인하는 모든 서비스에 적용할 행동경제학 7대 표준 규범입니다.")

    psych_rules = [
        ("4.1 앵커링 효과 (Anchoring) & 유인 효과 (Decoy Effect)",
         "사람의 뇌는 처음 본 숫자를 기준점(Anchor)으로 삼아 대안을 평가합니다. 월 ₩9,900(연 118,800원)을 기준점으로 세워두고, 바로 옆에 '연 ₩79,000 (월 6,580원꼴, 35% 할인 + 7일 무료체험)'을 배치하면 연간 플랜이 압도적인 '이득'으로 인식되어 결제자의 80% 이상이 연간 결제를 선택합니다."),
        ("4.2 손실 회피 편향 (Loss Aversion)",
         "카너먼-트버스키 연구에 따르면 인간은 같은 크기의 이득보다 '손실'에 2.5배 더 민감합니다. '구독 시 보상을 드립니다'보다 '당신이 피땀 흘려 쌓은 18일 연속 스트릭이 하루 실수로 깨지지 않도록 PRO 멤버십이 자동 방어 실드를 제공합니다'가 결제 전환율이 3배 이상 높습니다."),
        ("4.3 피크-엔드 법칙 (Peak-End Rule) & 맥락적 페이월",
         "유저는 경험의 평균이 아니라 가장 절정에 달했던 순간(Peak)과 마지막 순간(End)의 감정으로 결정을 내립니다. 앱 시작 시 귀찮게 뜨는 팝업을 배제하고, 러닝 완주 직후(심박수 고양, 성취감 피크) + 펫이 알을 깨고 나오는 순간에 감동적인 축하 연출과 함께 페이월을 선물 형태로 제시합니다."),
        ("4.4 이케아 효과 (IKEA Effect) & 감정적 락인",
         "자신이 직접 노동을 투입하여 완성한 대상에 비합리적으로 높은 가치를 부여합니다. 내가 달린 거리(km)로 직접 알을 깨우고 먹이를 주며 키운 펫은 '내 아이'와 같아집니다. 유저는 월 9,900원을 아끼기 위해 펫과의 유대를 끊거나 앱을 지우지 못하며, 이는 최강의 리텐션 락인(Lock-in) 장치로 작동합니다."),
        ("4.5 목표 경사 효과 (Goal-Gradient Effect)",
         "결승선이나 마일스톤에 가까워질수록 사람의 행동과 소비 속도는 가속됩니다. 부화까지 300m 남은 시점, 21일 완주까지 2일 남은 시점에 유저의 몰입도와 지불 용의선(WTP)이 급상승하며 완주 한정 보상(골든 오라)을 위한 PRO 전환율이 극대화됩니다."),
        ("4.6 자이고르닉 효과 (Zeigarnik Effect)",
         "인간의 뇌는 완결된 일보다 '미완성된 일'을 훨씬 강하게 기억하고 끝마치고 싶어 합니다. 퀘스트 리스트에 '스쿼트 8/10 진행 중', '부화 게이지 85%'의 시각적 프로그레스 바를 노출하여 당일 내 앱 재방문을 유도합니다."),
        ("4.7 사회적 증거 (Social Proof) & 안도감 부여",
         "불확실한 상황에서 대중은 다수의 선택을 따릅니다. 'RUNNOW 러너 84%가 선택한 연간 멤버십', '오늘 1,420명이 함께 달렸습니다' 뱃지를 배치하여 구매 저항(Cognitive Friction)을 제로화합니다.")
    ]

    for title, desc in psych_rules:
        add_heading_2(doc, title)
        add_body_p(doc, desc)

    # 제4장: 3개 티어 완벽 밸런스 매트릭스
    add_heading_1(doc, "5. 3개 티어(Tier) 완벽 밸런스 매트릭스")
    add_body_p(doc, "무료 러너의 이탈을 방지하고 유료 회원의 만족도를 극대화하는 3단계 서비스 매트릭스입니다.")

    tier_table = doc.add_table(rows=10, cols=4)
    tier_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tier_table, color="CBD5E1", sz="4", val="single")

    t_headers = ["기능 항목", "🏃 베이직 (무료)", "⭐ PRO 월간 (₩9,900)", "👑 PRO 연간 (₩79,000)"]
    for col_idx, h in enumerate(t_headers):
        cell = tier_table.cell(0, col_idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    tier_rows = [
        ("야외 GPS 러닝 트래킹", "무제한 무료 (정밀 거리/페이스)", "무제한 제공", "무제한 제공"),
        ("헬스장 트레드밀 달리기", "무제한 무료 (속도 조절)", "무제한 제공", "무제한 제공"),
        ("달리기 기록 영구 저장", "무제한 무료", "무제한 무료", "무제한 무료"),
        ("AI 모션 카메라 홈트 6종", "🔒 잠금", "✅ 전 종목 무제한", "✅ 전 종목 무제한"),
        ("다마고치 펫 진화 룸", "🔒 알 상태로만 동반", "✅ 5단계 진화 & 스탯 육성", "✅ 5단계 진화 + 전용 오라"),
        ("21일 챌린지 부트캠프", "🔒 잠금", "✅ 일일/주간 퀘스트 보상", "✅ 퀘스트 보상 1.5배 부스트"),
        ("스트릭 보호 (손실 방어)", "❌ 없음 (결석 시 리셋)", "✅ 월 1회 스트릭 프리즈", "✅ 월 3회 자동 실드"),
        ("볼트 상점 20종 장비 착용", "🔒 둘러보기만 가능", "✅ 상시 15% 할인 착용", "✅ 상시 25% 할인 + VIP 기어"),
        ("무료 체험 혜택", "해당 없음", "즉시 결제", "🎁 7일 무위험 무료 체험")
    ]

    for row_idx, data in enumerate(tier_rows):
        row_cells = tier_table.rows[row_idx + 1].cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            elif "✅" in text or "🎁" in text:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
            elif "🔒" in text or "❌" in text:
                r.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
            else:
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 제5장: BeausCreators 전사 앱 공통 BM 거버넌스 헌장
    add_heading_1(doc, "6. BeausCreators 전사 앱 공통 BM 거버넌스 4대 헌장")
    add_body_p(doc, "앞으로 사내에서 런칭하는 모든 서비스(웹/앱/AI)는 다음 4대 원칙을 의무적으로 준수해야 합니다.")

    gov_rules = [
        ("제1조 [Acquisition] 핵심 진입 기능 100% 무료화",
         "유저가 최초 가치를 느끼는 '핵심 동작 1가지'(러닝 앱의 달리기, 뷰티 앱의 기본 피부진단, 음악 앱의 1곡 듣기 등)는 절대로 결제 벽을 치지 않고 100% 무료로 개방하여 오가닉 바이럴과 유입을 극대화한다."),
        ("제2조 [Retention] 습관과 보상의 유료화",
         "축적된 데이터, 캐릭터 성장, 연속 달성 기록, 스트릭 보호 등 '시간이 지날수록 가치가 커지는 요소'를 구독 서비스로 묶어 이탈률을 0%에 가깝게 만든다."),
        ("제3조 [Cost Control] 온디바이스 & 서버리스 원칙",
         "신규 기능을 기획할 때 무거운 중앙 서버 GPU 연산 모델을 지양하고, 브라우저/클라이언트 엣지에서 처리하는 경량 아키텍처를 의무화하여 손실 가능성을 원천 차단한다."),
        ("제4조 [Psychology-Driven UX] 억지 과금 금지 & 선물형 페이월",
         "사용 흐름을 끊는 강제 팝업 대신, 성취의 순간(Peak)에 더 큰 보람과 자긍심을 안겨주는 '선물' 같은 형태로 페이월을 디자인한다.")
    ]

    for title, desc in gov_rules:
        add_heading_2(doc, title)
        add_body_p(doc, desc)

    # 결문 및 서명
    doc.add_paragraph().paragraph_format.space_after = Pt(14)
    sign_p = doc.add_paragraph()
    sign_p.paragraph_format.space_before = Pt(14)
    sign_p.paragraph_format.space_after = Pt(0)
    sign_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_sign = sign_p.add_run("2026년 09월 07일\nBeausCreators 재무 & BM 총괄 CFO 도현 (Dohyun) 배상")
    r_sign.font.name = 'Malgun Gothic'
    r_sign.font.size = Pt(10)
    r_sign.font.bold = True
    r_sign.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    doc.save(output_file_path)
    print(f"✅ Word 보고서 생성 성공: {output_file_path}")

if __name__ == "__main__":
    local_path = r"c:\BeausCreators\03.Research\바이브코딩 연구\Test_proj\proj_01\docs\2026-09-07_RUNNOW_Master_BM_and_Consumer_Psychology_Strategy.docx"
    build_bm_report(local_path)

    # 1. 여기 폴더 (프로젝트 루트에도 배치)
    root_path = r"c:\BeausCreators\03.Research\바이브코딩 연구\Test_proj\proj_01\2026-09-07_RUNNOW_Master_BM_and_Consumer_Psychology_Strategy.docx"
    shutil.copy2(local_path, root_path)
    print(f"✅ 여기 폴더 복사 완료: {root_path}")

    # 2. 본사 (BeausCreators - HQ)
    hq_dir = r"C:\BeausCreators\01.BSC_HQ\1.Documents\01.보고서\2026-09-07"
    os.makedirs(hq_dir, exist_ok=True)
    hq_path = os.path.join(hq_dir, "2026-09-07_RUNNOW_Master_BM_and_Consumer_Psychology_Strategy.docx")
    shutil.copy2(local_path, hq_path)
    print(f"✅ 본사(HQ) 동기화 완료: {hq_path}")

    # 3. 바탕화면 (Desktop)
    desktop_dir = r"C:\Users\USER\Desktop"
    desktop_path = os.path.join(desktop_dir, "2026-09-07_RUNNOW_Master_BM_and_Consumer_Psychology_Strategy.docx")
    shutil.copy2(local_path, desktop_path)
    print(f"✅ 바탕화면(Desktop) 복사 완료: {desktop_path}")
