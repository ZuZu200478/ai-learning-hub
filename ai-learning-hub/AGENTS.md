# AGENTS.md — AI Learning Hub 開發規範

> 本文件提供給 Codex、Claude Code 或其他 AI 程式助手閱讀。開始修改前，先閱讀整份文件，並遵守下列規則。**本專案的重點是可重複使用的開發流程，而不是一次性的單頁設計。**

## 1. 專案定位

- 名稱：AI Learning Hub（AI 學習筆記庫）。
- 用途：用繁體中文整理人工智慧、電腦視覺與機器學習的基礎知識，適合學生複習。
- 核心目標：未來新增筆記時，只需新增 JSON 資料，首頁列表、搜尋、分類與文章頁就可直接使用既有元件顯示。
- 發布環境：GitHub Pages 的**純靜態網站**，不得依賴後端服務、資料庫、付費 API 或建置工具。

## 2. 專案目錄

```text
ai-learning-hub/
├── AGENTS.md                 # 本文件：AI 開發規則
├── README.md                 # 給人的專案簡介與部署教學
├── index.html                # 首頁：搜尋、分類、筆記卡片
├── article.html              # 共用文章頁：?slug=文章代碼
├── guide.html                # 新增內容的流程說明
├── data/
│   └── notes.json            # 唯一的文章內容資料來源
├── assets/
│   ├── css/style.css         # 所有頁面使用同一份樣式
│   └── js/app.js             # 資料載入、搜尋、文章渲染
├── scripts/
│   └── validate_notes.py     # 無第三方套件的資料驗證
└── .nojekyll                 # 讓 GitHub Pages 直接提供靜態檔案
```

## 3. 視覺與介面規則

1. 採用深海軍藍背景、青綠色重點、紫色與琥珀色輔助的科技風格；配色集中在 `assets/css/style.css` 的 CSS 變數。
2. 使用共用 `.site-header`、`.site-footer`、`.container`、`.btn` 等樣式；不可為一篇筆記另建一套完全不同的排版。
3. 使用繁體中文（台灣用語）；英文專有名詞可保留並在首次使用時解釋。
4. 響應式設計至少要兼容手機約 375px 與桌面約 1280px 寬度，不得造成水平捲動。
5. 保留語意 HTML（`header`、`nav`、`main`、`article`、`section`）、清楚的標題階層與鍵盤操作。互動項目需有可見 focus 樣式。
6. 文章必須容易閱讀：有簡介、章節標題、適當段落、重點列表。避免為視覺效果加入干擾閱讀的大型動畫。

## 4. 資料格式：`data/notes.json`

此檔為**最外層 JSON 陣列**，每篇文章使用一個物件。必填欄位：

| 欄位 | 型別與規則 |
| --- | --- |
| `slug` | 小寫英文字母、數字及連字號，例如 `self-rag-basics`；**必須唯一** |
| `title` | 繁體中文可讀標題，非空字串 |
| `category` | 僅能為 `生成式 AI`、`電腦視覺`、`機器學習` 三者之一 |
| `summary` | 1～2 句的內容摘要，非空字串 |
| `tags` | 至少 1 個不重複的文字標籤，例如 `["RAG", "檢索"]` |
| `level` | 僅能為 `入門`、`基礎`、`進階` |
| `readMinutes` | 整數，1～30 |
| `updated` | `YYYY-MM-DD` 格式，真實日期 |
| `sections` | 至少 2 個章節物件，每個章節必須有 `heading`，並提供 `paragraphs` 或 `bullets` 中至少一項非空內容 |

章節物件欄位：
- `heading`（必填）：章節標題文字。
- `paragraphs`（選填）：文字段落陣列。
- `bullets`（選填）：條列重點陣列。
- `tip`（選填）：補充提醒文字。

**範本（新增時放在 JSON 陣列最後，注意逗號）：**

```json
{
  "slug": "self-rag-basics",
  "title": "Self-RAG 入門",
  "category": "生成式 AI",
  "summary": "認識 Self-RAG 的核心概念與使用情境。",
  "tags": ["Self-RAG", "檢索"],
  "level": "基礎",
  "readMinutes": 5,
  "updated": "2026-11-09",
  "sections": [
    {
      "heading": "概念介紹",
      "paragraphs": ["解釋問題背景與主要設計。"]
    },
    {
      "heading": "使用情境",
      "paragraphs": ["描述適合使用的例子。"],
      "bullets": ["延伸重點一", "延伸重點二"],
      "tip": "提醒使用者注意限制或假設。"
    }
  ]
}
```

## 5. AI 新增文章的標準流程（必須照做）

1. **先閱讀規則**：閱讀本文件，以及 `data/notes.json` 至少一篇同類別文章。
2. **確認主題與分類**：選現有三類之一；不要自行建立新分類，除非使用者明確要求，且同步修改 `assets/js/app.js` 的類別裝飾、`index.html` 的分類按鈕、驗證程式和本文件。
3. **規劃大綱**：撰寫簡介，至少兩個有實質資訊的章節；盡可能包含概念、步驟、例子或常見限制。
4. **新增資料**：只修改 `data/notes.json` 追加一個物件；不得複製 `article.html` 建立一個新 HTML 檔，也不得改動既有文章內容（除非使用者要求）。
5. **避免虛構資訊**：不編造論文數字、研究結果或引用來源。遇到不確定的技術敘述，應先查證或明示不確定。
6. **驗證資料**：執行 `python scripts/validate_notes.py`，沒有錯誤才可以交付。
7. **測試網站**：使用 `python -m http.server 8000` 啟動本機伺服器；確認首頁出現新卡片、搜尋能找到它、分類正確、連結可打開 `article.html?slug=新slug`。
8. **簡述修改**：交付時說明新增的主題、修改的檔案、驗證結果，以及若未完成測試的限制。

## 6. AI 修改介面／功能時的規則

- 優先沿用 `assets/css/style.css` 既有 class 與 CSS 變數；必要時才新增 class，且要兼顧手機版。
- JavaScript 使用原生瀏覽器 API，不引入 React/Vue 或外部套件。
- 筆記渲染必須使用 `textContent` 或等效安全方法，不得將資料欄位直接插入 `innerHTML`。
- 維持相對路徑（例如 `assets/css/style.css`），不要硬編碼 GitHub 網域或 repository 名稱，確保 GitHub Pages 子路徑可用。
- 不加入追蹤碼、密鑰、私人資料或外部 API 呼叫。
- 既有文章網址 `article.html?slug=...` 一旦發布，不要隨意更改 slug，避免連結失效。
- 每次功能調整都要重新測試搜尋、分類、文章、無結果畫面，以及手機版導覽。

## 7. 完成標準（Definition of Done）

- [ ] 文件內容符合本文件資料格式與命名規則。
- [ ] `python scripts/validate_notes.py` 顯示驗證成功。
- [ ] GitHub Pages 可正常開啟首頁、文章頁、指南頁。
- [ ] 使用者能搜尋文章、切換類別、點開文章、返回首頁。
- [ ] 手機與桌面版沒有明顯排版破損。
- [ ] 未破壞既有筆記，沒有把內容硬編碼到 HTML。

## 8. 常用指令

```bash
# 專案根目錄內
python scripts/validate_notes.py
python -m http.server 8000
# 然後開啟 http://localhost:8000
```

這份規範應使新加入專案的 AI 開發助手，在不重新設計網站的情況下，能可靠地新增下一篇文章。
