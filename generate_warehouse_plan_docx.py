# -*- coding: utf-8 -*-
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
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
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
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
    run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
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
    r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
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

def add_callout(doc, text, title="핵심 가치"):
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

    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # 1. 헤더 표지 블록
    tbl_header = doc.add_table(rows=1, cols=1)
    tbl_header.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_h = tbl_header.cell(0, 0)
    cell_h.width = Inches(6.8)
    set_cell_background(cell_h, "0F172A")
    set_cell_margins(cell_h, top=240, bottom=240, left=240, right=240)

    p_tag = cell_h.paragraphs[0]
    p_tag.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tag = p_tag.add_run("BSC SKILL WAREHOUSE INTEGRATION ROADMAP")
    r_tag.font.name = 'Malgun Gothic'
    r_tag.font.size = Pt(9)
    r_tag.font.bold = True
    r_tag.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8)

    p_t = cell_h.add_paragraph()
    p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t.paragraph_format.space_before = Pt(6)
    p_t.paragraph_format.space_after = Pt(6)
    r_t = p_t.add_run("스킬 웨어하우스(Warehouse) 자산 연계\nRunNow 기능 및 디자인 혁신 확장 계획서")
    r_t.font.name = 'Malgun Gothic'
    r_t.font.size = Pt(17)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    p_sub = cell_h.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(4)
    r_sub = p_sub.add_run("MagicUI/Aceternity 디자인 | Three.js 3D 펫 | Voicebox 하이퍼 오디오 | Remotion 바이럴 릴스 | 온디바이스 AI")
    r_sub.font.name = 'Malgun Gothic'
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(8)
    p_meta.paragraph_format.space_after = Pt(12)
    p_meta.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_m = p_meta.add_run("보고 대상: 이건우 대표님 (BeausCreators CEO) | 작성: BSC Core TF & RunNow 개발팀 | 일자: 2026.09.14")
    r_m.font.name = 'Malgun Gothic'
    r_m.font.size = Pt(8.5)
    r_m.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # 1. 개요 및 스킬 창고 자산 가치
    add_heading_1(doc, "1. 추진 배경 및 웨어하우스(Warehouse) 자산 연계 의의")
    add_body_p(doc, "현재 BSC 본사 스킬 창고(C:\\BeausCreators\\05.BSC_Skill_Warehouse)에는 세계 최고 수준의 오픈소스 및 자체 개발 스킬 자산(MagicUI, Aceternity, Three.js Game Skills, Voicebox, Remotion, 온디바이스 AI 등)이 집대성되어 있습니다.")
    add_body_p(doc, "이 자산들을 RunNow에 융합하면, 기존 웹앱의 한계를 뛰어넘어 '나이키 런클럽(NRC)'과 '애플 피트니스 플러스'를 압도하는 차세대 인터랙티브 3D 헬스케어 메타버스로 진화할 수 있습니다.")

    add_callout(doc, "웨어하우스 스킬을 직결함으로써 개발 기간을 80% 단축하고, 억대급 디자인 에셋과 3D/AI 모듈을 0원의 추가 라이선스 비용으로 RunNow에 즉시 이식할 수 있습니다.", "전략적 시너지")

    # 2. 5대 핵심 영역별 기능 & 디자인 혁신 계획
    add_heading_1(doc, "2. 5대 핵심 영역별 혁신 기능 및 디자인 계획")

    tbl_skills = doc.add_table(rows=6, cols=3)
    tbl_skills.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_skills)

    headers = ["혁신 도메인", "연계 웨어하우스 스킬", "구체적 기능 및 디자인 반영안"]
    for i, h in enumerate(headers):
        cell = tbl_skills.cell(0, i)
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Malgun Gothic'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    skill_rows = [
        ("① UI/UX 디자인\n(100M Premium)", 
         "• UIKits (magicui, aceternity)\n• cinematic-scroll-skill\n• 100M_Premium_Web_Design", 
         "• 스프링 탄성 피직스(Spring Physics) 기반 탭 전환 & 햅틱 반응\n• Stripe 스타일 메시 그라디언트(Mesh Gradient) 발광 카드\n• Apple 스타일 시네마틱 스크롤(Scrollytelling) 온보딩"),
        ("② 3D 펫 & 러닝 트랙\n(3D Metaverse)", 
         "• threejs-game-skills\n• godogen-asset-gen\n• asset-gen (Tripo3D)", 
         "• 2D 이미지 펫을 경량 3D GLB 모델로 진화 (달릴 때 함께 뛰는 3D 강아지/고양이)\n• 카메라 모션인식 시 3D 관절 스켈레톤 및 파티클 이펙트\n• 3D 가상 러닝 트랙 렌더링"),
        ("③ 하이퍼 리얼 오디오\n(Voice & BGM)", 
         "• voicebox\n• ondevice-ai-domain-routing\n• motionSound.js 고도화", 
         "• 호흡과 억양이 살아있는 AI 음성 (레오의 심박 버닝 샤우팅, 루나의 부드러운 페이스 가이드)\n• 러너의 케이던스(BPM)에 맞춰 음악 템포가 자동 가속되는 다이내믹 사운드트랙"),
        ("④ 비전 식단 & SNS 릴스\n(Visual & Viral)", 
         "• master-photography-pro\n• claude-remotion-skill\n• social-media-skills", 
         "• 식사 사진 촬영 시 AI가 음식 영역을 자동 인식하여 영양성분 1초 자동 로깅\n• 완주 직후 기록+식단+펫이 합성된 15초 인스타 릴스/스토리 숏폼 영상 자동 생성"),
        ("⑤ 온디바이스 AI & B2B\n(Zero-Cost & Scale)", 
         "• ondevice-ai-domain-routing\n• HKUDS__Vibe-Trading / PayPal\n• composio-skills", 
         "• WebGPU 기반 Gemma2/Whisper 온디바이스 탑재로 서버비 0원($0) 음성 대화\n• 현직 헬스장 트레이너용 B2B 코칭 관제 포털 및 정기구독 정산 시스템")
    ]

    for row_idx, data in enumerate(skill_rows, start=1):
        for col_idx, text in enumerate(data):
            cell = tbl_skills.cell(row_idx, col_idx)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Malgun Gothic'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_body_p(doc, "", space_after=6)

    # 3. 상세 세부 기능 심층 설계
    add_heading_1(doc, "3. 스킬 연계 핵심 신규 기능 상세 설계")

    add_heading_2(doc, "3.1 Magic UI & Aceternity 기반 초프리미엄 비주얼 업그레이드")
    add_body_p(doc, "기존 정적인 웹 UI에 Magic UI의 Bento Grid(벤토 그리드), Shimmer Button(은은한 광택 버튼), Animated Beam(데이터 연동 광선 효과)을 적용합니다. 1:1 케어팀에서 운동을 등록하면 캘린더와 식단 체크리스트로 빛이 흐르듯 데이터가 연결되는 시각적 경이로움(Wow-factor)을 선사합니다.")

    add_heading_2(doc, "3.2 Three.js 3D 펫 렌더링 & 동적 상호작용 (Three.js Game Skills)")
    add_body_p(doc, "유저가 달리는 속도(스마트폰 GPS 페이스)에 따라 3D 강아지/고양이가 걷기(Walk) ➔ 조깅(Jog) ➔ 전력질주(Sprint) 모션으로 실시간 전환됩니다. 탭하여 쓰다듬으면 3D 펫이 애교를 부리고 골골송 사운드를 출력합니다.")

    add_heading_2(doc, "3.3 Remotion 연계: 1초 만에 완성되는 인스타그램 릴스 비디오 생성기")
    add_body_p(doc, "러너들이 운동을 마친 후 가장 원하는 것은 '인스타/SNS 자랑'입니다. claude-remotion-skill을 연동하여, 당일 뛴 코스 지도 애니메이션 + 소모 칼로리 + 오늘 먹은 클린 식단 사진 + 함께 뛴 3D 펫이 어우러진 15초 고화질 세로 비디오를 클라이언트에서 즉시 렌더링하여 다운로드/공유할 수 있도록 지원합니다.")

    add_heading_2(doc, "3.4 Master-Photography-Pro 연계: 사진 한 장으로 식단 자동 로깅")
    add_body_p(doc, "식사 전 음식 사진을 카메라로 찍으면, AI가 식기 안의 음식을 세그멘테이션(분할)하여 '현미밥 1공기 + 닭가슴살 1팩 + 샐러드'를 자동 판별하고 식약처 DB와 1:1 매칭하여 체크리스트에 0.5초 만에 기입합니다.")

    # 4. 단계별 연동 로드맵
    add_heading_1(doc, "4. 웨어하우스 스킬 연동 단계별 로드맵 (Phased Roadmap)")

    tbl_road = doc.add_table(rows=4, cols=3)
    tbl_road.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_road)

    r_headers = ["단계", "도입 스킬 및 과제", "기대 사용자 경험 (UX)"]
    for i, h in enumerate(r_headers):
        cell = tbl_road.cell(0, i)
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Malgun Gothic'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    road_data = [
        ("Phase 1\n(디자인 하이엔드화)", 
         "• Magic UI / Aceternity 비주얼 토큰 이식\n• 벤토 그리드 및 메시 그라디언트 카드 적용", 
         "앱 접속 순간 '1억원대 최고급 앱'이라는 시각적 압도감 선사"),
        ("Phase 2\n(Three.js 3D 펫 & 보이스)", 
         "• Three.js 경량 3D 펫 모델 탑재 (GLB)\n• Voicebox 연동 감정형 리얼 오디오 코칭", 
         "달리는 내내 3D 펫과 교감하고 실제 트레이너가 옆에서 뛰며 외치는 듯한 현장감"),
        ("Phase 3\n(AI 비전 & 바이럴 릴스)", 
         "• AI 카메라 식단 자동 스캔 및 식약처 매핑\n• Remotion 기반 15초 인스타 릴스 자동 생성", 
         "식단 기록의 번거로움 완전 제로화 + 유저 자발적 SNS 바이럴을 통한 폭발적 오가닉 유입")
    ]

    for row_idx, data in enumerate(road_data, start=1):
        for col_idx, text in enumerate(data):
            cell = tbl_road.cell(row_idx, col_idx)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Malgun Gothic'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_body_p(doc, "", space_after=8)
    add_callout(doc, "본 계획서를 바탕으로, 대표님께서 가장 우선시하시는 영역(예: Phase 1 MagicUI 디자인 고도화 or Three.js 3D 펫 or SNS 릴스 생성기)을 선택해 주시면 즉시 착수하겠습니다.", "대표님 선택 및 실행 가이드")

    out_file = "2026-09-14_RUNNOW_Warehouse_Skills_Innovation_Plan.docx"
    doc.save(out_file)
    print(f"[SUCCESS] Created {out_file}")

if __name__ == "__main__":
    main()
