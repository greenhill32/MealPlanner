from pathlib import Path

script = r'''#!/usr/bin/env python3
"""Bulk import meal photos into the MealPlanner catalogue.

Drop images into a folder with friendly filenames, for example:

    Ham_Egg_&_Chips.jpeg
    Chicken_Curry.webp
    BLT.jpg

The filename stem becomes the meal name with underscores replaced by spaces.

The script:
- copies images into src/assets/meals/
- updates an existing RAW_CATALOG entry if the meal already exists
- otherwise adds a new RAW_CATALOG entry
- adds required imports to src/data.ts
- creates ONE git commit for the whole batch
- optionally pushes to origin

Usage:
    python tools/add_meals_bulk.py
    python tools/add_meals_bulk.py "C:\\path\\to\\meal_photos"

Safe by default:
- asks for confirmation before changing files
- never deletes source images
- never overwrites catalogue data blindly
- does not push unless explicitly confirmed
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ENCODING = "utf-8"
DEFAULT_EMOJI = "🍽️"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_TS = REPO_ROOT / "src" / "data.ts"
ASSETS_DIR = REPO_ROOT / "src" / "assets" / "meals"

IMPORT_RE = re.compile(r'^import .*\n', re.MULTILINE)
ARRAY_RE = re.compile(r'(const RAW_CATALOG:[^\[]*\[)(.*?)(\n\];)', re.DOTALL)


def clean_input(prompt: str) -> str:
    return input(prompt).strip().strip('"').strip("'")


def run_git(*args: str, capture: bool = True):
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        capture_output=capture,
        text=True,
        encoding=ENCODING,
        errors="replace",
    )


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def to_camel_case(slug: str) -> str:
    parts = [p for p in slug.split("-") if p]
    return "img" + "".join(p.capitalize() for p in parts)


def friendly_name(path: Path) -> str:
    # Preserve deliberate casing such as BBQ / BLT.
    return re.sub(r"\s+", " ", path.stem.replace("_", " ")).strip()


def find_images(folder: Path) -> list[Path]:
    return sorted(
        [
            p
            for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
        ],
        key=lambda p: p.name.lower(),
    )


def entry_pattern(meal_name: str) -> re.Pattern[str]:
    return re.compile(r'\{\s*name:\s*"' + re.escape(meal_name) + r'".*?\}')


def ensure_import(text: str, import_name: str, dest_name: str) -> str:
    import_line = f'import {import_name} from "./assets/meals/{dest_name}";\n'
    if import_line in text:
        return text

    imports = list(IMPORT_RE.finditer(text))
    insert_at = imports[-1].end() if imports else 0
    return text[:insert_at] + import_line + text[insert_at:]


def update_existing_entry(
    text: str,
    meal_name: str,
    import_name: str,
) -> tuple[str, bool]:
    pattern = entry_pattern(meal_name)
    match = pattern.search(text)
    if not match:
        return text, False

    old_entry = match.group(0)
    new_entry, count = re.subn(
        r'photo:\s*(?:"[^"]*"|null|[A-Za-z_$][\w$]*)',
        f"photo: {import_name}",
        old_entry,
        count=1,
    )
    if count == 0:
        raise RuntimeError(
            f"Found {meal_name!r}, but couldn't find its photo field."
        )

    return text[: match.start()] + new_entry + text[match.end() :], True


def add_new_entry(
    text: str,
    meal_name: str,
    import_name: str,
    emoji: str = DEFAULT_EMOJI,
) -> str:
    array_match = ARRAY_RE.search(text)
    if not array_match:
        raise RuntimeError("Couldn't find RAW_CATALOG in src/data.ts.")

    safe_name = meal_name.replace("\\", "\\\\").replace('"', '\\"')
    safe_emoji = emoji.replace("\\", "\\\\").replace('"', '\\"')

    new_line = (
        f'  {{ name: "{safe_name}", emoji: "{safe_emoji}", '
        f"photo: {import_name}, def: 5 }},"
    )

    body = array_match.group(2)
    insertion = body.rstrip() + "\n" + new_line
    return (
        text[: array_match.start(2)]
        + insertion
        + text[array_match.end(2) :]
    )


def main() -> None:
    if not DATA_TS.is_file():
        sys.exit(
            f"Can't find {DATA_TS}. Put this file in MealPlanner/tools/."
        )

    if len(sys.argv) > 1:
        source_dir = Path(sys.argv[1]).expanduser()
    else:
        raw = clean_input("Folder containing meal photos: ")
        source_dir = Path(raw).expanduser()

    if not source_dir.is_dir():
        sys.exit(f"No such folder: {source_dir}")

    images = find_images(source_dir)
    if not images:
        sys.exit(
            "No supported images found. "
            f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    print(f"\nFound {len(images)} meal image(s):\n")
    for image in images:
        print(f"  {image.name:<36} -> {friendly_name(image)}")

    answer = clean_input("\nImport these meals? [Y/n]: ").lower()
    if answer == "n":
        sys.exit("Nothing changed.")

    original_text = DATA_TS.read_text(encoding=ENCODING)
    text = original_text

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    staged_files: list[Path] = []
    added: list[str] = []
    updated: list[str] = []
    skipped: list[str] = []

    for image in images:
        meal_name = friendly_name(image)

        if not meal_name:
            skipped.append(image.name)
            continue

        slug = slugify(meal_name)
        if not slug:
            skipped.append(image.name)
            continue

        ext = image.suffix.lower()
        dest = ASSETS_DIR / f"{slug}{ext}"
        import_name = to_camel_case(slug)

        # Copy only when source and destination are not the same file.
        try:
            same_file = image.resolve() == dest.resolve()
        except FileNotFoundError:
            same_file = False

        if not same_file:
            shutil.copy2(image, dest)

        text = ensure_import(text, import_name, dest.name)

        text, existed = update_existing_entry(
            text,
            meal_name,
            import_name,
        )

        if existed:
            updated.append(meal_name)
        else:
            text = add_new_entry(
                text,
                meal_name,
                import_name,
                DEFAULT_EMOJI,
            )
            added.append(meal_name)

        staged_files.append(dest)

    if text == original_text and not staged_files:
        print("Nothing changed.")
        return

    DATA_TS.write_text(text, encoding=ENCODING)

    git_targets = [str(DATA_TS), *[str(p) for p in staged_files]]
    run_git("add", *git_targets, capture=False)

    if run_git("diff", "--cached", "--quiet").returncode == 0:
        print("\nNothing changed after processing.")
        return

    print("\nSummary:")
    if added:
        print(f"  Added:   {len(added)}")
        for name in added:
            print(f"    + {name}")
    if updated:
        print(f"  Updated: {len(updated)}")
        for name in updated:
            print(f"    ~ {name}")
    if skipped:
        print(f"  Skipped: {len(skipped)}")
        for name in skipped:
            print(f"    - {name}")

    commit_message = (
        f"Bulk import {len(added) + len(updated)} meal photo"
        f"{'s' if len(added) + len(updated) != 1 else ''}"
    )

    commit = run_git("commit", "-m", commit_message)
    if commit.returncode != 0:
        sys.exit(
            f"\ngit commit failed:\n{commit.stdout}{commit.stderr}"
        )

    print(f"\nCommitted: {commit_message}")

    if clean_input("Push to origin now? [y/N]: ").lower() == "y":
        push = run_git("push")
        if push.returncode != 0:
            sys.exit(
                f"\ngit push failed:\n{push.stdout}{push.stderr}"
            )
        print("Pushed.")
    else:
        print("Not pushed. Run `git push` when ready.")


if __name__ == "__main__":
    main()
'''

out = Path("/mnt/data/add_meals_bulk.py")
out.write_text(script, encoding="utf-8")
print(out)
