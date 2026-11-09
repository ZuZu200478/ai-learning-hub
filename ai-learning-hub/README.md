# AI Learning Hub｜AI 學習筆記庫

以原生 HTML、CSS、JavaScript 與 JSON 建立的可擴充靜態知識網站。這個專案示範如何用 **`AGENTS.md` 事先規範 AI 的開發方式**，讓未來新增文章時，能保持相同檔案結構與設計規範。

## 功能

- 首頁展示 AI 學習筆記卡片
- 依關鍵字及標籤搜尋
- 依「生成式 AI／電腦視覺／機器學習」分類
- 使用共用文章模板顯示文章
- `guide.html` 提供擴充指南
- `AGENTS.md` 定義 AI 開發與新增內容的標準流程
- `scripts/validate_notes.py` 驗證 JSON 資料

## 如何在自己的電腦預覽

1. 先安裝 Python（3.9 以上即可）。
2. 在專案資料夾開啟終端機，輸入：

   ```bash
   python scripts/validate_notes.py
   python -m http.server 8000
   ```

3. 用瀏覽器開啟 <http://localhost:8000>。

> 請**不要直接雙擊 `index.html`** 當成正式測試：網站會透過 `fetch()` 讀取 `data/notes.json`，瀏覽器在 `file://` 模式下通常會阻擋此請求。透過本機伺服器或 GitHub Pages 開啟即可。

## 如何新增文章

1. 閱讀 [`AGENTS.md`](AGENTS.md) 的資料規格與新增文章流程。
2. 在 [`data/notes.json`](data/notes.json) 最後新增一個符合規格的 JSON 物件。
3. 執行 `python scripts/validate_notes.py`。
4. 重新整理首頁：新文章會出現在筆記列表中，且搜尋與分類功能可直接使用。

## GitHub Pages 發布方式（不需付費）

1. 登入 GitHub，建立**公開（Public）** repository，例如 `ai-learning-hub`。
2. 將本專案的所有檔案上傳到 repository **根目錄**（包含隱藏的 `.nojekyll`、`AGENTS.md`、`data/` 和 `assets/`）。不要只上傳 ZIP 檔。
3. 在 GitHub repository 中開啟 **Settings → Pages**。
4. 在 **Build and deployment** 下設定：**Source = Deploy from a branch**，**Branch = main**，資料夾 **/(root)**，然後儲存。
5. 等候 GitHub Pages 完成部署，至 Pages 頁面查看公開網址。通常形式為：

   ```text
   https://你的GitHub帳號.github.io/ai-learning-hub/
   ```

6. 實際開啟網址，檢查：首頁、篩選、搜尋、文章與新增指南都可運作。若你的 repository 名稱不同，網址路徑也會不同。

## 建議繳交內容範本

**專案名稱：** AI Learning Hub｜AI 學習筆記庫

**專案簡介：** 本專案以 AI 學習筆記為主題，使用 HTML、CSS、JavaScript 與 JSON 建立知識網站。網站可依關鍵字與分類搜尋文章；新文章統一由 JSON 資料產生，並共用既有頁面設計。

**GitHub Repository：** `https://github.com/你的帳號/ai-learning-hub`（發布後替換）

**公開網站：** `https://你的帳號.github.io/ai-learning-hub/`（發布後替換）

**AGENTS.md：** 專案根目錄的 `AGENTS.md`（繳交時可貼檔案連結）

**規則如何幫助 AI 延伸？** 未來新增文章時，AI 先閱讀 `AGENTS.md`，依照指定欄位、命名方式及內容品質規則，在 `data/notes.json` 增加資料即可。首頁與文章頁會使用既有元件自動顯示新筆記，不必重寫整個網頁；再透過驗證程式確認結構正確，確保網站可重複擴充。

## 專案目錄

```text
AGENTS.md
README.md
index.html
article.html
guide.html
data/notes.json
assets/css/style.css
assets/js/app.js
scripts/validate_notes.py
.nojekyll
```

## 授權與註記

本站提供示範用學習筆記，建議繳交前依你的課堂學習經驗調整內容，並確認所有技術說明。網站並未使用付費模型或 API。
