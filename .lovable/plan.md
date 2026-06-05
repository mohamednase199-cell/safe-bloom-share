## Bloom v2 — 10 New Features

دي حزمة كبيرة (10 مميزات)، فهنرتبها في 3 مراحل علشان نضمن الجودة والترتيب. كل مرحلة هتبقى Pull مستقل ومترابط مع اللي قبله.

---

### 🌱 Phase 1 — Core Intelligence (الأساس الذكي)
الهدف: نخلي Bloom "يفتكر" و"يلاحظ"، وده اللي هيغذي باقي المميزات.

1. **AI Life Companion + Memory** 🧠
   - Memory store في `localStorage` (`bloom.memory`): مشاعر، مواضيع متكررة، أحداث (امتحانات، نوم…).
   - كل رسالة في `/chat` بتتلخص بـ AI وتتحفظ كـ "memory note" قصيرة.
   - الـ system prompt بيستقبل آخر 10 ذكريات → الردود تبقى شخصية ("لاحظت إنك بتتوتري قبل الامتحانات").

2. **AI Pattern Detection** 📈
   - Server function `detectPatterns` بيحلل `bloom.moodLog` + memory + habits.
   - بيرجّع جمل بالعربي زي: "كل يوم أحد مزاجك بيقل" — تتعرض في Mood page و Home.

3. **Mood + Habits Connection** 🌙
   - Habits tracker بسيط (نوم، مذاكرة، رياضة) في صفحة جديدة `/habits`.
   - الـ AI بيربط: "لما بتنامي 7 ساعات مزاجك أحسن بـ 40%".

---

### 🌿 Phase 2 — Personal Growth (النمو الشخصي)
الهدف: المستخدم يحس بتقدم حقيقي.

4. **Bloom Journey** 🌸
   - 4 مراحل: Seed 🌱 → Growing 🌿 → Blooming 🌸 → Thriving ⭐
   - تتحسب من: عدد أيام الـ check-in، journaling، habits.
   - صفحة `/journey` فيها progress bar جميل وanimation للنمو.

5. **Personal Growth Goals** 🎯
   - المستخدم يختار 1–3 أهداف (تقليل توتر، تحسين تركيز، تنظيم وقت).
   - الـ AI يقترح خطوات أسبوعية ويتابع التقدم.
   - يدخل في `/journey`.

6. **Achievement System** 🏅
   - أوسمة هادية: "أول أسبوع journaling 🌱", "7 أيام mood tracking 🌿", "شهر التزام 🌸".
   - تتحسب من البيانات الموجودة، تظهر كـ grid في `/journey`.

---

### 🌍 Phase 3 — Context & Community (السياق والمجتمع)
الهدف: Bloom يفهم بيئة المستخدم.

7. **Academic Stress Mode** 📚
   - صفحة `/exams`: يضيف المواد + التواريخ.
   - AI يولّد خطة مذاكرة + reminders + رسايل دعم قبل كل امتحان.

8. **Parent Learning Center** 👨‍👩‍👧
   - تبويب جديد جوه `/bridge`: مكتبة مقالات قصيرة بالعربي:
     - "إزاي تكلم ابنك المراهق"
     - "ازاي تدعم ولدك المتوتر"
     - "التعامل مع ADHD"
   - محتوى ثابت + 1 AI assistant للأسئلة.

9. **Cultural Intelligence** 🌐
   - Setting: Language/Culture (Arabic / English).
   - يأثر على: لهجة الـ AI، الأمثلة، المحتوى في Parent Center، تنسيق RTL/LTR.
   - يتحفظ في `bloom.user.culture`.

10. **School Wellness Program** 🏫
    - صفحة تعريفية `/schools` (Landing فقط — Coming Soon).
    - فورم اهتمام للمدارس (يتحفظ localStorage). توسعة مستقبلية.

---

### 🧩 Technical Notes

- **AI Calls:** كله TanStack server functions في `src/lib/*.functions.ts` باستخدام Lovable AI Gateway (`google/gemini-2.5-flash`).
- **Storage:** كله `localStorage` (نفس النمط الحالي — مفيش DB جديدة).
- **Routes الجديدة:** `/journey`, `/habits`, `/exams`, `/schools`, plus `/bridge/learning` tab.
- **Navigation:** هنضيف Quick Actions في Home + entries في `BottomNav` للأهم (Journey).
- **Design:** نفس design tokens (`--bloom-sage`, `--bloom-lavender`, `--gradient-bloom`), `rounded-3xl`, soft shadows.
- **i18n:** Cultural Intelligence هتعمل helper بسيط `t(key)` بدل i18n library كاملة (سرعة + بساطة).

---

### 📦 Deliverables per Phase

| Phase | Files | Routes |
|---|---|---|
| 1 | `memory.functions.ts`, `patterns.functions.ts`, `habits.tsx` + edits to `chat.tsx`, `mood.tsx`, `home.tsx` | `/habits` |
| 2 | `journey.tsx`, `goals.functions.ts`, achievements helper | `/journey` |
| 3 | `exams.tsx`, `exams.functions.ts`, `bridge.learning.tsx`, `schools.tsx`, culture helper | `/exams`, `/schools`, bridge tab |

ابدأ بـ Phase 1؟ ولا تحب نمشي 3 مراحل ورا بعض في نفس الـ session (هياخد وقت أطول بس كله في مرة)؟