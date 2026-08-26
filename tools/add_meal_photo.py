#!/usr/bin/env python3
"""Interactively attach a local photo to a meal in src/data.ts.

Copies the chosen image into src/assets/meals/, then either rewrites an
existing CATALOG entry to use it, or (if the meal name doesn't match one
already there) offers to add it as a brand new catalog entry. Commits the
change (and optionally pushes it).

Usage:
    python3 tools/add_meal_photo.py
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

ENCODING = "utf-8"

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_TS = REPO_ROOT / "src" / "data.ts"
ASSETS_DIR = REPO_ROOT / "src" / "assets" / "meals"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
DEFAULT_EMOJI = "🍽️"

ENTRY_RE_TEMPLATE = r'\{{\s*name:\s*"{name}".*?\}}'
IMPORT_RE = re.compile(r'^import .*\n', re.MULTILINE)
ARRAY_RE = re.compile(r'(const RAW_CATALOG:[^\[]*\[)(.*?)(\n\];)', re.DOTALL)


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def to_camel_case(slug: str) -> str:
    parts = slug.split("-")
    return "img" + "".join(p.capitalize() for p in parts)


def clean_input(prompt: str) -> str:
    return input(prompt).strip().strip('"').strip("'")


def run_git(*args: str, capture: bool = True):
    return subprocess.run(
        ["git", *args], cwd=REPO_ROOT,
        capture_output=capture, text=True, encoding=ENCODING, errors="replace",
    )


def main() -> None:
    if not DATA_TS.is_file():
        sys.exit(f"Can't find {DATA_TS} — run this from inside the app repo.")

    image_path = Path(clean_input("Path to the image file: ")).expanduser()
    if not image_path.is_file():
        sys.exit(f"No such file: {image_path}")
    ext = image_path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        sys.exit(f"Unsupported image type '{ext}'. Use one of: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")

    meal_name = clean_input("Meal name, exactly as it appears in the app (e.g. Sausage & Chips): ")
    if not meal_name:
        sys.exit("No meal name given.")

    text = DATA_TS.read_text(encoding=ENCODING)
    pattern = re.compile(ENTRY_RE_TEMPLATE.format(name=re.escape(meal_name)))
    match = pattern.search(text)

    adding_new = False
    emoji = None
    if not match:
        answer = clean_input(
            f"No existing meal named {meal_name!r}. Add it as a new catalog entry? [Y/n]: "
        ).lower()
        if answer == "n":
            sys.exit("Nothing changed.")
        adding_new = True
        emoji = clean_input(f"Emoji for it (blank for {DEFAULT_EMOJI}): ") or DEFAULT_EMOJI

    slug = slugify(meal_name)
    dest = ASSETS_DIR / f"{slug}{ext}"
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy(image_path, dest)

    import_name = to_camel_case(slug)
    import_line = f'import {import_name} from "./assets/meals/{dest.name}";\n'
    if import_line not in text:
        imports = list(IMPORT_RE.finditer(text))
        insert_at = imports[-1].end() if imports else 0
        text = text[:insert_at] + import_line + text[insert_at:]

    if adding_new:
        array_match = ARRAY_RE.search(text)
        if not array_match:
            sys.exit(f"Couldn't find the RAW_CATALOG array in {DATA_TS.relative_to(REPO_ROOT)}.")
        ts_name = meal_name.replace('"', '\\"')
        new_line = f'  {{ name: "{ts_name}", emoji: "{emoji}", photo: {import_name}, def: 5 }},'
        body = array_match.group(2)
        text = text[: array_match.start(2)] + body + "\n" + new_line + text[array_match.end(2) : ]
        print(f"Added {meal_name!r} to the catalog, using {dest.relative_to(REPO_ROOT)}")
    else:
        # re-match against the text now that the import may have shifted offsets
        match = pattern.search(text)
        old_entry = match.group(0)
        new_entry, count = re.subn(r'photo:\s*(?:"[^"]*"|[A-Za-z_$][\w$]*)', f"photo: {import_name}", old_entry, count=1)
        if count == 0:
            sys.exit(f"Couldn't find a `photo:` field to replace in the entry for {meal_name!r}.")
        text = text.replace(old_entry, new_entry, 1)
        print(f"Updated {DATA_TS.relative_to(REPO_ROOT)} — {meal_name!r} now uses {dest.relative_to(REPO_ROOT)}")

    DATA_TS.write_text(text, encoding=ENCODING)

    run_git("add", str(dest), str(DATA_TS), capture=False)

    if run_git("diff", "--cached", "--quiet").returncode == 0:
        print("Nothing changed — that photo is already wired up for this meal. Skipping commit.")
        return

    verb = "Add" if adding_new else "Update"
    commit = run_git("commit", "-m", f"{verb} custom photo for {meal_name}")
    if commit.returncode != 0:
        sys.exit(f"git commit failed:\n{commit.stdout}{commit.stderr}")
    print("Committed.")

    if clean_input("Push to origin now? [y/N]: ").lower() == "y":
        push = run_git("push")
        if push.returncode != 0:
            sys.exit(f"git push failed:\n{push.stdout}{push.stderr}")
        print("Pushed.")
    else:
        print("Not pushed — run `git push` from the repo when you're ready.")


if __name__ == "__main__":
    main()
