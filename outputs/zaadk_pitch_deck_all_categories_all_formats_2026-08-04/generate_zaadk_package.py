#!/usr/bin/env python3
from __future__ import annotations

import json
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parent
DATE = "2026-08-04"

CATEGORIES = [
    {
        "slug": "00_master_index",
        "title_ar": "زادك - الدليل الرئيسي لكل الفئات وكل الصيغ",
        "title_en": "Zaadk - Master Index For All Categories And Formats",
        "audience_ar": "كل الفئات",
        "audience_en": "All audiences",
        "objective_ar": "فتح الحزمة من ملف واحد واختيار الفئة أو نموذج العرض المناسب.",
        "objective_en": "Open the package from one file and choose the right audience-specific pitch model.",
        "psychology": "Start with the user's world, then the cost of fragmented health decisions, then Zaadk as the bridge from report to routine.",
        "slides": [
            ["الخريطة العامة", "Master map", "يعرض كل الفئات والصيغ داخل مجلد واحد.", "Shows every audience and format in one folder."],
            ["كيف تستخدم الحزمة", "How to use the package", "ابدأ بالعرض الرئيسي ثم اختر نسخة الفئة.", "Start with the master pitch, then choose the audience variant."],
            ["حالة الجاهزية", "Readiness status", "مسودة عمل تحتاج أرقام ومصادر قبل التداول الخارجي.", "Working draft requiring metrics and sources before external use."],
        ],
        "proof_needed": ["لقطات شاشة", "KPIs", "financial model", "market sizing", "clinical/legal claim review"],
    },
    {
        "slug": "01_consumer_app_pitch",
        "title_ar": "عرض المستخدم النهائي",
        "title_en": "Consumer App Pitch",
        "audience_ar": "المستخدمون",
        "audience_en": "Users",
        "objective_ar": "إقناع المستخدم أن زادك يجعل التغذية الصحية أسهل وأقرب لعاداته اليومية.",
        "objective_en": "Convince users that Zaadk makes health nutrition easier and closer to daily habits.",
        "psychology": "Consumer awareness is problem-aware: lead with daily food anxiety, desire for a calmer routine, then show Zaadk as practical help.",
        "slides": [
            ["الطعام يومي والقرار صعب", "Food is daily and the decision is hard", "المستخدم لا يحتاج نصيحة أكثر، بل قرار وجبة مناسب اليوم.", "Users do not need more advice; they need a safer meal decision today."],
            ["الخطة ليست مثالية، بل عملية", "The plan is practical, not perfect", "زادك يوازن السعرات والبروتين والصوديوم والتفضيلات.", "Zaadk balances calories, protein, sodium, and preferences."],
            ["من التحليل إلى الوجبة", "From lab report to meal", "التحاليل والقياسات تصبح ملاحظات غذائية مفهومة.", "Reports and measures become understandable nutrition cues."],
            ["دعوة للاستخدام", "Call to action", "ابدأ بملفك الصحي وابن أول خطة آمنة.", "Start with your health profile and build the first safe plan."],
        ],
        "proof_needed": ["app screenshots", "onboarding completion", "activation rate", "retention", "user testimonials"],
    },
    {
        "slug": "02_family_caregiver_pitch",
        "title_ar": "عرض العائلة ومقدمي الرعاية",
        "title_en": "Family And Caregiver Pitch",
        "audience_ar": "العائلة ومقدمو الرعاية",
        "audience_en": "Family and caregivers",
        "objective_ar": "توضيح كيف يساعد زادك من يطبخ أو يرعى المستخدم بدون كشف كامل ملفه الصحي.",
        "objective_en": "Show how Zaadk helps the person cooking or caring without exposing the full health file.",
        "psychology": "Family audiences need trust and clarity: lead with care burden, then shared routine, then privacy controls.",
        "slides": [
            ["من يطبخ يحتاج سياقا", "The person cooking needs context", "ملاحظات الوجبة أهم من كشف الملف الصحي الكامل.", "Meal context matters more than exposing the full health record."],
            ["مشاركة بسيطة", "Simple sharing", "خطة اليوم والممنوعات وملاحظات الملح والسوائل.", "Today's meals, restrictions, salt, and hydration notes."],
            ["خصوصية أولا", "Privacy first", "مشاركة محدودة ومفهومة حسب الدور.", "Limited role-based sharing."],
            ["التزام منزلي", "Household adherence", "الخطة تنجح عندما يفهمها من يشارك في الطعام.", "Plans work better when the household understands them."],
        ],
        "proof_needed": ["sharing permissions", "caregiver roles", "privacy copy", "family usage examples"],
    },
    {
        "slug": "03_healthcare_collaborator_deck",
        "title_ar": "عرض الشركاء الصحيين",
        "title_en": "Healthcare Collaborator Deck",
        "audience_ar": "الأخصائيون والعيادات",
        "audience_en": "Dietitians and clinics",
        "objective_ar": "إثبات أن زادك طبقة متابعة بين النصيحة الصحية والالتزام الغذائي اليومي.",
        "objective_en": "Position Zaadk as a follow-up layer between health advice and daily nutrition adherence.",
        "psychology": "Healthcare collaborators are skeptical/technical: lead with evidence posture, limits, workflow, then product.",
        "slides": [
            ["ليس بديلا للمختص", "Not a clinician replacement", "زادك ينظم الغذاء والمؤشرات ولا يشخص أو يعالج.", "Zaadk organizes nutrition and markers; it does not diagnose or treat."],
            ["سير العمل", "Workflow fit", "ملف صحي، تحاليل، خطة وجبات، متابعة، استشارة.", "Profile, reports, meal plan, tracking, consultation."],
            ["حدود الادعاءات", "Claim boundaries", "كل ادعاء صحي يحتاج مراجعة ومصدر.", "Every health claim needs review and source support."],
            ["Pilot صحي", "Healthcare pilot", "قياس الالتزام، رضا المستخدم، وحالات التحويل للمختص.", "Measure adherence, satisfaction, and referral triggers."],
        ],
        "proof_needed": ["clinical review", "workflow map", "data quality", "pilot protocol", "privacy policy"],
    },
    {
        "slug": "04_strategic_partner_pitch",
        "title_ar": "عرض الشركاء التجاريين",
        "title_en": "Strategic Partner Pitch",
        "audience_ar": "الشركاء التجاريون",
        "audience_en": "Strategic partners",
        "objective_ar": "عرض زادك كقناة سياقية لسلوك غذائي متكرر داخل الصحة والعافية والطعام.",
        "objective_en": "Present Zaadk as a contextual channel for repeat food-health behavior.",
        "psychology": "Partners are outcome-aware: lead with shared user problem, partner upside, pilot path, then commercial model.",
        "slides": [
            ["الشريك يحتاج سياقا", "Partners need context", "العرض العشوائي أقل قيمة من توصية غذائية مرتبطة بالملف الصحي.", "Random placement is less valuable than health-contextual relevance."],
            ["فئات الشراكة", "Partner categories", "عيادات، مختبرات، أغذية صحية، أصحاب عمل، برامج عافية.", "Clinics, labs, healthy food, employers, wellness programs."],
            ["Pilot قابل للقياس", "Measurable pilot", "تحديد cohort، عرض، conversion، retention.", "Define cohort, offer, conversion, and retention."],
            ["النموذج التجاري", "Commercial model", "اشتراك، إحالة، برنامج مؤسسي، أو توزيع شريك.", "Subscription, referral, enterprise program, or partner distribution."],
        ],
        "proof_needed": ["partner pipeline", "pilot metrics", "commercial terms", "conversion funnel"],
    },
    {
        "slug": "05_investor_pitch",
        "title_ar": "عرض المستثمرين",
        "title_en": "Investor Pitch",
        "audience_ar": "المستثمرون",
        "audience_en": "Investors",
        "objective_ar": "بناء قصة استثمارية حول منتج تغذية علاجية عربي قابل للاستخدام المتكرر والتوسع.",
        "objective_en": "Build an investment story around Arabic-first therapeutic nutrition with repeat-use and scale potential.",
        "psychology": "Investors are skeptical/executive: lead with risk and opportunity, then retention proof, business model, and ask.",
        "slides": [
            ["المشكلة والسوق", "Problem and market", "الصحة الغذائية اليومية في المنطقة العربية تحتاج منتجا محليا موثوقا.", "Daily health nutrition in Arabic markets needs trusted local product."],
            ["المنتج المتكامل", "Integrated product", "ملف صحي، وجبات، وصفات، تحاليل، تتبع، عائلة، استشارة.", "Profile, meals, recipes, reports, tracking, family, consultation."],
            ["إثبات التفاعل", "Engagement proof", "MAU وretention والالتزام بالخطة هي بوابة الاستثمار.", "MAU, retention, and adherence are the investment gate."],
            ["النموذج المالي", "Financial model", "الإيراد يجب أن يتبع الثقة: اشتراك، استشارة، شراكات.", "Revenue should follow trust: subscription, consultation, partnerships."],
            ["الطلب", "Ask", "مبلغ التمويل واستخدامه ومحطات الإثبات التالية.", "Funding ask, use of proceeds, and next proof milestones."],
        ],
        "proof_needed": ["MAU", "retention cohorts", "revenue", "CAC", "gross margin", "runway", "funding ask"],
    },
    {
        "slug": "06_internal_strategy_deck",
        "title_ar": "عرض الاستراتيجية الداخلية",
        "title_en": "Internal Strategy Deck",
        "audience_ar": "الفريق الداخلي",
        "audience_en": "Internal team",
        "objective_ar": "توحيد القصة والأولويات وخارطة الإثبات خلال 90 يوما.",
        "objective_en": "Align narrative, priorities, and the 90-day proof roadmap.",
        "psychology": "Internal teams need clarity: lead with decision, constraints, owner map, and next proof artifacts.",
        "slides": [
            ["ما القرار؟", "What decision?", "اختيار الفئة الأولى والنموذج التجاري الأول.", "Choose the first audience and first business model."],
            ["ما يجب إثباته", "What must be proven", "استخدام، احتفاظ، دقة التحاليل، الخصوصية، الشراكات.", "Usage, retention, report quality, privacy, partnerships."],
            ["خارطة 90 يوم", "90-day roadmap", "مصادر، لقطات، KPIs، نموذج مالي، مراجعة ادعاءات.", "Sources, screenshots, KPIs, model, claim review."],
            ["مسؤوليات", "Owners", "تحديد مالك لكل مصدر ودليل وقرار.", "Assign an owner for each source, proof point, and decision."],
        ],
        "proof_needed": ["owner list", "timeline", "product priority", "risk register", "KPI baseline"],
    },
    {
        "slug": "07_market_map",
        "title_ar": "خريطة السوق",
        "title_en": "Market Map",
        "audience_ar": "المستثمرون والشركاء والفريق",
        "audience_en": "Investors, partners, and team",
        "objective_ar": "تعريف السوق والمنافسين وموقع زادك في التغذية الصحية العربية.",
        "objective_en": "Define the market, competitors, and Zaadk's position in Arabic health nutrition.",
        "psychology": "Market-map readers need structure: lead with segments, then competitive gaps, then Zaadk wedge.",
        "slides": [
            ["تعريف السوق", "Market definition", "تغذية علاجية، وجبات صحية، تتبع صحي، تحاليل، عافية.", "Therapeutic nutrition, healthy meals, health tracking, reports, wellness."],
            ["شرائح المستخدمين", "User segments", "سكري، ضغط، كوليسترول، وزن، عائلة، أخصائي.", "Diabetes, pressure, cholesterol, weight, family, specialist."],
            ["المنافسون", "Competitors", "تحتاج أسماء ومصادر حسب السعودية والخليج.", "Requires named sources for Saudi/GCC competitors."],
            ["فرصة زادك", "Zaadk wedge", "عربي أولا، وجبات محلية، تحاليل، عائلة، خصوصية.", "Arabic-first, local meals, reports, family, privacy."],
        ],
        "proof_needed": ["competitor list", "market sizing", "Saudi/GCC data", "pricing", "user research"],
    },
    {
        "slug": "08_company_profile",
        "title_ar": "ملف الشركة",
        "title_en": "Company Profile",
        "audience_ar": "أي جهة تحتاج مقدمة مختصرة",
        "audience_en": "Any audience needing a concise introduction",
        "objective_ar": "تقديم زادك بسرعة وبوضوح قبل الدخول في نسخة مخصصة.",
        "objective_en": "Introduce Zaadk quickly before moving into a tailored pitch.",
        "psychology": "Profile readers are lightly aware: lead with what Zaadk is, who it serves, and why it is different.",
        "slides": [
            ["ما هو زادك؟", "What is Zaadk?", "رفيق تغذية علاجية عربي للوجبات والتحاليل والمتابعة.", "Arabic therapeutic nutrition companion for meals, reports, and tracking."],
            ["من يخدم؟", "Who it serves", "مستخدمون، عائلات، أخصائيون، عيادات، شركاء.", "Users, families, dietitians, clinics, partners."],
            ["لماذا مختلف؟", "Why different", "يجمع الغذاء المحلي، البيانات الصحية، الأسرة، والخصوصية.", "Combines local food, health data, family support, and privacy."],
            ["ماذا بعد؟", "What next", "اختيار نسخة الجمهور وإضافة الأدلة.", "Choose audience version and add evidence."],
        ],
        "proof_needed": ["product screenshots", "feature status", "team", "launch status", "brand spelling"],
    },
    {
        "slug": "09_public_equity_screen",
        "title_ar": "فحص الأسهم العامة",
        "title_en": "Public Equity Screen",
        "audience_ar": "مدراء محافظ الأسهم العامة",
        "audience_en": "Public equity PMs",
        "objective_ar": "توضيح أن زادك ليس فكرة تداول قابلة للتنفيذ إلا إذا ارتبط بورقة مالية مدرجة.",
        "objective_en": "Clarify that Zaadk is not an actionable trade unless mapped to a listed security.",
        "psychology": "PMs need actionability first: verdict, missing gate, what would change the stance.",
        "slides": [
            ["الحكم", "Verdict", "Screen-grade only; watchlist; no actionable public-equity trade.", "Screen-grade only; watchlist; no actionable public-equity trade."],
            ["بوابة التنفيذ", "Implementation gate", "Ticker، سعر، سيولة، تقييم، محفز، مخاطر.", "Ticker, price, liquidity, valuation, catalyst, risk."],
            ["ما الذي يغير الموقف؟", "What changes the stance?", "توفير issuer مدرج أو أداة تداول واضحة.", "Provide a listed issuer or clear trade expression."],
            ["قواعد المتابعة", "Monitoring rules", "راقب الشراكات، التفاعل، الإيراد، وربطها بشركة عامة إن وجدت.", "Monitor partnerships, engagement, revenue, and any listed-company linkage."],
        ],
        "proof_needed": ["ticker", "market data", "valuation anchor", "catalyst", "liquidity", "risk budget"],
    },
    {
        "slug": "10_talk_track_demo_script",
        "title_ar": "نص العرض والـ Demo",
        "title_en": "Talk Track And Demo Script",
        "audience_ar": "المتحدثون والمبيعات والمؤسسون",
        "audience_en": "Speakers, sales, and founders",
        "objective_ar": "توفير نص شفهي يستخدم تسلسل الرغبة قبل الحل.",
        "objective_en": "Provide a speaking script using the desire-before-solution arc.",
        "psychology": "Build narrative transportation: user's world, better future, contrast, Zaadk bridge, remembered close.",
        "slides": [
            ["افتتاح", "Opening", "كل يوم يسأل المستخدم: ماذا آكل اليوم مع حالتي؟", "Every day the user asks: what can I eat today with my condition?"],
            ["الرغبة", "Desire", "نريد خطة هادئة، مفهومة، وتحترم الطعام المحلي.", "We want a calm plan that respects local food habits."],
            ["الجسر", "Bridge", "زادك يحول الملف والتحليل إلى وجبة ومتابعة.", "Zaadk turns the profile and report into meals and follow-up."],
            ["النهاية", "Close", "الخطوة التالية: اختر الفئة، أضف الأدلة، وابن النسخة الرسمية.", "Next step: choose audience, add proof, build the official deck."],
        ],
        "proof_needed": ["demo flow", "screenshots", "time limit", "speaker notes", "audience variant"],
    },
]

STYLE = """
:root{--ink:#17231d;--muted:#5b6962;--paper:#f5f1e8;--white:#fffdf8;--green:#0b6e4f;--deep:#13362a;--gold:#b88735;--line:#d9ded5;--mint:#e0f0e7;--rose:#bf6656}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.65 Arial,Tahoma,sans-serif}header{padding:44px clamp(20px,6vw,76px);background:linear-gradient(115deg,var(--green),var(--deep));color:#fff}.eyebrow{color:#f2d08b;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}h1{margin:14px 0;max-width:980px;font:800 clamp(34px,5vw,62px)/1.08 Georgia,'Times New Roman',serif}.subtitle{max-width:940px;color:#e8f3ed;font-size:18px}main{max-width:1180px;margin:0 auto;padding:34px clamp(18px,4vw,42px) 70px}section{margin-top:32px}h2{margin:0 0 14px;color:var(--deep);font:800 30px/1.2 Georgia,'Times New Roman',serif}h3{margin:0 0 8px;color:var(--deep);font-size:19px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.card,.callout{background:var(--white);border:1px solid var(--line);padding:20px}.callout{border-right:5px solid var(--gold)}.tag{display:inline-block;margin-bottom:10px;color:var(--green);font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}table{width:100%;border-collapse:collapse;background:var(--white);border:1px solid var(--line);direction:rtl}th{background:#e4ded2;color:#3a4d42;font-size:12px;letter-spacing:.04em;text-transform:uppercase;text-align:right}td,th{padding:12px 13px;border-bottom:1px solid var(--line);vertical-align:top}a{color:var(--green);font-weight:800;text-decoration:none}a:hover{text-decoration:underline}.status{color:#845d1f;font-weight:800;white-space:nowrap}ul{margin:8px 18px 0 0;padding:0}li{margin:6px 0}.en{direction:ltr;text-align:left;font-family:Arial,'Helvetica Neue',sans-serif}.warning{background:#fff6e5;border-color:#ead6aa}.ok{background:var(--mint);border-color:#c5dfcf}@media(max-width:860px){.grid,.three{grid-template-columns:1fr}.status{white-space:normal}td,th{font-size:13px}}
"""


def html_doc(item: dict, is_index: bool = False) -> str:
    cards = "\n".join(
        f"<div class='card'><span class='tag'>{idx:02d}</span><h3>{escape(ar)}<br><span class='en'>{escape(en)}</span></h3><p>{escape(body_ar)}</p><p class='en'>{escape(body_en)}</p></div>"
        for idx, (ar, en, body_ar, body_en) in enumerate(item["slides"], start=1)
    )
    proof = "".join(f"<li>{escape(x)}</li>" for x in item["proof_needed"])
    links = ""
    if is_index:
        rows = "\n".join(
            f"<tr><td>{escape(c['audience_ar'])}</td><td>{escape(c['title_ar'])}<br><span class='en'>{escape(c['title_en'])}</span></td><td><a href='{c['slug']}.html'>HTML</a> | <a href='{c['slug']}.pdf'>PDF</a> | <a href='{c['slug']}.docx'>DOCX</a> | <a href='{c['slug']}.pptx'>PPTX</a> | <a href='{c['slug']}.md'>MD</a> | <a href='{c['slug']}.txt'>TXT</a></td></tr>"
            for c in CATEGORIES
        )
        links = f"""
        <section>
          <h2>روابط كل الفئات والصيغ</h2>
          <table><thead><tr><th>الفئة</th><th>النموذج</th><th>الصيغ</th></tr></thead><tbody>{rows}</tbody></table>
        </section>
        """
    return f"""<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(item['title_en'])}</title>
  <style>{STYLE}</style>
</head>
<body>
  <header>
    <div class="eyebrow">Zaadk Pitch Deck | Arabic + English | Working Draft</div>
    <h1>{escape(item['title_ar'])}</h1>
    <p class="subtitle">{escape(item['objective_ar'])}</p>
    <p class="subtitle en">{escape(item['objective_en'])}</p>
  </header>
  <main>
    <section class="callout">
      <h2>ملخص النموذج | <span class="en">Model Summary</span></h2>
      <div class="grid">
        <div><strong>الفئة:</strong> {escape(item['audience_ar'])}<br><strong>الهدف:</strong> {escape(item['objective_ar'])}</div>
        <div class="en"><strong>Audience:</strong> {escape(item['audience_en'])}<br><strong>Objective:</strong> {escape(item['objective_en'])}</div>
      </div>
    </section>
    <section>
      <h2>تسلسل الإقناع | <span class="en">Persuasion Sequence</span></h2>
      <div class="card ok"><p>{escape(item['psychology'])}</p></div>
    </section>
    {links}
    <section>
      <h2>هيكل الشرائح | <span class="en">Slide Structure</span></h2>
      <div class="grid">{cards}</div>
    </section>
    <section>
      <h2>الأدلة المطلوبة قبل الاستخدام الخارجي | <span class="en">Evidence Needed Before External Use</span></h2>
      <div class="card warning"><ul>{proof}</ul></div>
    </section>
    <section>
      <h2>حالة الجاهزية | <span class="en">Readiness</span></h2>
      <table>
        <thead><tr><th>البند</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr><td>Zaadk only</td><td><span class="status">نعم، هذه الحزمة لا تشمل Funfamily</span></td></tr>
          <tr><td>Source posture</td><td><span class="status">Product-grounded, metrics need source</span></td></tr>
          <tr><td>External readiness</td><td><span class="status">Working draft only</span></td></tr>
          <tr><td>Public equity actionability</td><td><span class="status">Not actionable without ticker</span></td></tr>
        </tbody>
      </table>
    </section>
  </main>
</body>
</html>
"""


def markdown_doc(item: dict, is_index: bool = False) -> str:
    lines = [
        f"# {item['title_ar']} / {item['title_en']}",
        "",
        f"Prepared: {DATE}",
        f"Audience: {item['audience_ar']} / {item['audience_en']}",
        "",
        f"Arabic objective: {item['objective_ar']}",
        f"English objective: {item['objective_en']}",
        "",
        "## Persuasion Sequence",
        item["psychology"],
        "",
    ]
    if is_index:
        lines += ["## All Categories And Formats", ""]
        for c in CATEGORIES:
            lines.append(f"- {c['audience_ar']} / {c['audience_en']}: {c['slug']}.html, .pdf, .docx, .pptx, .md, .txt")
        lines.append("")
    lines += ["## Slide Structure", ""]
    for idx, (ar, en, body_ar, body_en) in enumerate(item["slides"], start=1):
        lines += [f"### {idx}. {ar} / {en}", body_ar, body_en, ""]
    lines += ["## Evidence Needed Before External Use", ""]
    lines += [f"- {x}" for x in item["proof_needed"]]
    lines += [
        "",
        "## Readiness",
        "- Zaadk only: yes.",
        "- Source posture: product-grounded, metrics need source.",
        "- External readiness: working draft only.",
        "- Public equity actionability: not actionable without ticker.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    artifacts = []
    for item in CATEGORIES:
        is_index = item["slug"] == "00_master_index"
        html_path = OUT / f"{item['slug']}.html"
        md_path = OUT / f"{item['slug']}.md"
        txt_path = OUT / f"{item['slug']}.txt"
        html_path.write_text(html_doc(item, is_index), encoding="utf-8")
        md = markdown_doc(item, is_index)
        md_path.write_text(md, encoding="utf-8")
        txt_path.write_text(md.replace("#", "").replace("*", ""), encoding="utf-8")
        artifacts.extend([html_path.name, md_path.name, txt_path.name])
    manifest = {
        "manifest_version": "1.0",
        "skill": "investment-banking:pitch-deck-builder + pitch-psychologist + public-equity-investing:long-short-pitch boundary",
        "artifact_mode": "generated_package",
        "output_dir": str(OUT),
        "first_read": {
            "path": str(OUT / "00_master_index.html"),
            "role": "primary human deliverable",
            "why": "Open this first because it links every Zaadk category and format in one folder."
        },
        "primary_human_deliverable": str(OUT / "00_master_index.html"),
        "human_deliverables": artifacts,
        "companion_deliverables": [],
        "support_artifacts": ["manifest.json", "source_register.json"],
        "agent_artifacts": ["generate_zaadk_package.py"],
        "support_artifacts_user_visible_default": False,
        "blocked_or_partial_status": {
            "status": "partial",
            "reason": "Working drafts only; market, KPI, financial, clinical/legal, and public-equity source support remain incomplete.",
            "missing_inputs": ["KPIs", "financials", "market sizing", "screenshots", "clinical/legal review", "ticker if public-equity pitch is required"]
        },
        "final_response_guidance": {
            "lead_with": "primary_human_deliverable",
            "mention_support_artifacts": "only_briefly_unless_requested"
        },
        "discipline_note": "All generated files are Zaadk-only and stored in one folder."
    }
    source_register = {
        "prepared_date": DATE,
        "sources": [
            {"source_id": "S1", "name": "app.json", "supports": ["Zaad app identity", "Expo configuration", "permissions"], "confidence": "high"},
            {"source_id": "S2", "name": "docs/UX-FLOWS-AR.md", "supports": ["Arabic UX flows", "meal plans", "reports", "family", "consultation"], "confidence": "high"},
            {"source_id": "S3", "name": "src/constants/zaadContent.ts", "supports": ["product positioning"], "confidence": "high"},
            {"source_id": "S4", "name": "src/types/index.ts and src/constants/data.ts", "supports": ["health profile", "lab values", "meal plans", "recipes"], "confidence": "high"},
            {"source_id": "A1", "name": "Working assumptions", "supports": ["investor, partner, market, public-equity screen framing"], "confidence": "low"}
        ]
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "source_register.json").write_text(json.dumps(source_register, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
