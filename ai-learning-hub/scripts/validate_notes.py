#!/usr/bin/env python3
"""Validate the content contract documented in AGENTS.md. Python standard library only."""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data" / "notes.json"
CATEGORIES = {"生成式 AI", "電腦視覺", "機器學習"}
LEVELS = {"入門", "基礎", "進階"}
REQUIRED = {"slug", "title", "category", "summary", "tags", "level", "readMinutes", "updated", "sections"}
SECTION_FIELDS = {"heading", "paragraphs", "bullets", "tip"}


def nonempty_text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate(notes: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(notes, list) or not notes:
        return ["最外層必須是非空的 JSON 陣列"]
    seen: set[str] = set()
    for pos, note in enumerate(notes, start=1):
        label = f"第 {pos} 篇"
        if not isinstance(note, dict):
            errors.append(f"{label}：必須是物件")
            continue
        missing = REQUIRED - set(note)
        if missing:
            errors.append(f"{label}：缺少欄位 {', '.join(sorted(missing))}")
        extra = set(note) - REQUIRED
        if extra:
            errors.append(f"{label}：不支援欄位 {', '.join(sorted(extra))}")
        slug = note.get("slug")
        if not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            errors.append(f"{label}：slug 只能是小寫英文、數字及中間的連字號")
        elif slug in seen:
            errors.append(f"{label}：slug 重複：{slug}")
        else:
            seen.add(slug)
        for key in ("title", "summary"):
            if not nonempty_text(note.get(key)):
                errors.append(f"{label}：{key} 必須是非空字串")
        if note.get("category") not in CATEGORIES:
            errors.append(f"{label}：category 必須是三種已定義分類之一")
        if note.get("level") not in LEVELS:
            errors.append(f"{label}：level 必須為入門／基礎／進階")
        minutes = note.get("readMinutes")
        if type(minutes) is not int or not 1 <= minutes <= 30:
            errors.append(f"{label}：readMinutes 必須是 1～30 的整數")
        updated = note.get("updated")
        if not isinstance(updated, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", updated):
            errors.append(f"{label}：updated 應使用 YYYY-MM-DD 格式")
        else:
            try:
                dt.date.fromisoformat(updated)
            except ValueError:
                errors.append(f"{label}：updated 不是有效日期")
        tags = note.get("tags")
        if not isinstance(tags, list) or not tags or not all(nonempty_text(tag) for tag in tags):
            errors.append(f"{label}：tags 必須為至少一個非空字串的陣列")
        elif len(tags) != len(set(tags)):
            errors.append(f"{label}：tags 不得重複")
        sections = note.get("sections")
        if not isinstance(sections, list) or len(sections) < 2:
            errors.append(f"{label}：sections 至少要有 2 個章節")
            continue
        for sec_idx, sec in enumerate(sections, start=1):
            suffix = f"{label}／章節 {sec_idx}"
            if not isinstance(sec, dict):
                errors.append(f"{suffix}：必須是物件")
                continue
            if not nonempty_text(sec.get("heading")):
                errors.append(f"{suffix}：heading 必須是非空字串")
            unknown = set(sec) - SECTION_FIELDS
            if unknown:
                errors.append(f"{suffix}：不支援欄位 {', '.join(sorted(unknown))}")
            populated = False
            for field in ("paragraphs", "bullets"):
                if field in sec:
                    values = sec[field]
                    if not isinstance(values, list) or not values or not all(nonempty_text(val) for val in values):
                        errors.append(f"{suffix}：{field} 必須是非空文字陣列")
                    else:
                        populated = True
            if not populated:
                errors.append(f"{suffix}：需提供 paragraphs 或 bullets 內容")
            if "tip" in sec and not nonempty_text(sec["tip"]):
                errors.append(f"{suffix}：tip 必須是非空字串")
    return errors


def main() -> int:
    try:
        notes = json.loads(PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"❌ 無法讀取 JSON：{exc}")
        return 1
    errors = validate(notes)
    if errors:
        print("❌ 驗證失敗：")
        for err in errors:
            print("  -", err)
        return 1
    print(f"✅ 驗證成功：共 {len(notes)} 篇文章、{len(set(n['category'] for n in notes))} 種分類；slug、日期與所有章節格式正確。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
