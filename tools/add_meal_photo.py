#!/usr/bin/env python3
"""Interactively attach a local photo to a catalog meal in src/data.ts.

Copies the chosen image into src/assets/meals/, rewrites the matching
CATALOG entry in src/data.ts to import and use it instead of its current
photo URL, then commits the change (and optionally pushes it).

Usage:
    python3 tools/add_meal_photo.py
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_TS = REPO_ROOT / "src" / "data.ts"
ASSETS_DIR = REPO_ROOT / "src" / "assets" / "meals"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

ENTRY_RE_TEMPLATE = r'\{{\s*name:\s*"{name}".*?\}}'
IMPORT_RE = re.compile(r'^import .*\n', re.MULTILINE)


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def to_camel_case(slug: str) -> str:
    parts = slug.split("-")
    return "img" + "".join(p.capitalize() for p in parts)


def prompt_path(message: str) -> Path:
    raw = input(message).strip().strip('"').strip("'")
    if not raw:
        sys.exit("No file given.")
    return Path(raw).expanduser()


def main() -> None:
    if not DATA_TS.is_file():
        sys.exit(f"Can't find {DATA_TS} — run this from inside the app repo.")

    image_path = prompt_path("Path to the image file: ")
    if not image_path.is_file():
        sys.exit(f"No such file: {image_path}")
    ext = image_path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        sys.exit(f"Unsupported image type '{ext}'. Use one of: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")

    meal_name = input("Meal name, exactly as it appears in the app (e.g. 'Sausage & Chips'): ").strip()
    if not meal_name:
        sys.exit("No meal name given.")

    text = DATA_TS.read_text()
    pattern = re.compile(ENTRY_RE_TEMPLATE.format(name=re.escape(meal_name)))
    match = pattern.search(text)
    if not match:
        sys.exit(
            f"Couldn't find a catalog entry named {meal_name!r} in {DATA_TS.relative_to(REPO_ROOT)}.\n"
            "Check the spelling matches an entry in the CATALOG list exactly."
        )

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
        # re-match the entry against the text with the import inserted
        match = pattern.search(text)

    old_entry = match.group(0)
    new_entry, count = re.subn(r'photo:\s*(?:"[^"]*"|[A-Za-z_$][\w$]*)', f"photo: {import_name}", old_entry, count=1)
    if count == 0:
        sys.exit(f"Couldn't find a `photo:` field to replace in the entry for {meal_name!r}.")
    text = text.replace(old_entry, new_entry, 1)

    DATA_TS.write_text(text)
    print(f"Updated {DATA_TS.relative_to(REPO_ROOT)} — {meal_name!r} now uses {dest.relative_to(REPO_ROOT)}")

    subprocess.run(["git", "add", str(dest), str(DATA_TS)], cwd=REPO_ROOT, check=True)

    diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=REPO_ROOT)
    if diff.returncode == 0:
        print("Nothing changed — that photo is already wired up for this meal. Skipping commit.")
        return

    commit = subprocess.run(
        ["git", "commit", "-m", f"Add custom photo for {meal_name}"],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    if commit.returncode != 0:
        sys.exit(f"git commit failed:\n{commit.stdout}{commit.stderr}")
    print("Committed.")

    if input("Push to origin now? [y/N]: ").strip().lower() == "y":
        push = subprocess.run(["git", "push"], cwd=REPO_ROOT, capture_output=True, text=True)
        if push.returncode != 0:
            sys.exit(f"git push failed:\n{push.stdout}{push.stderr}")
        print("Pushed.")
    else:
        print("Not pushed — run `git push` from the repo when you're ready.")


if __name__ == "__main__":
    main()
