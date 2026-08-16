import os
import re

OLD_BRAND_PATTERNS = [
    (r"digital\s+products\s+house", "Old brand name (case-insensitive)"),
    (r"digitalproductshouse\.com", "Old domain (case-insensitive)"),
    (r"\bhello@digitalproductshouse\b", "Old business email"),
    (r"\bsupport@digitalproductshouse\b", "Old support email"),
    (r"\b(?!DPS-)DPH\b", "Old iconmark (DPH)"), # Check for "DPH" but ignore "DPS-DPH" or similar if any
]

EXCLUDE_DIRS = {".git", "node_modules", ".venv", "venv", "dist", ".pytest_cache", "logs", "__pycache__", "brain", "knowledge"}
EXCLUDE_FILES = {"rebrand_migration.py", "rebrand_validation.py", "task-49.log", "task-66.log"}

def scan_workspace(root_dir):
    findings = []
    total_files_scanned = 0

    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file in EXCLUDE_FILES:
                continue
            file_path = os.path.join(root, file)
            
            # Skip binary files
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                total_files_scanned += 1
            except UnicodeDecodeError:
                continue

            # Scan lines
            lines = content.splitlines()
            for line_idx, line in enumerate(lines, 1):
                for pattern, desc in OLD_BRAND_PATTERNS:
                    matches = re.findall(pattern, line, re.IGNORECASE)
                    if matches:
                        findings.append({
                            "file": os.path.relpath(file_path, root_dir),
                            "line_num": line_idx,
                            "content": line.strip(),
                            "pattern_matched": pattern,
                            "matches_found": matches,
                            "description": desc
                        })

    return total_files_scanned, findings

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    scanned_count, findings = scan_workspace(root_dir)
    
    # Calculate brand consistency score
    # Formula: 100 - min(100, len(findings) * 5)
    score = max(0, 100 - (len(findings) * 2))

    print("==================================================")
    print("           BRAND MIGRATION AUDIT REPORT           ")
    print("==================================================")
    print(f"Total Text Files Scanned: {scanned_count}")
    print(f"Brand Consistency Score:  {score}%")
    print(f"Total Old Brand Matches:  {len(findings)}")
    print("==================================================")

    if findings:
        print("\n--- Remaining Old Brand References ---")
        for f in findings:
            print(f"File: {f['file']} (Line {f['line_num']})")
            print(f"  Match: {f['matches_found']} ({f['description']})")
            print(f"  Line:  \"{f['content']}\"")
            print("-" * 50)
    else:
        print("\nSUCCESS: Zero remaining references to the old brand found in the text files!")
    
    # Check if database has any remaining references
    db_path = os.path.join(root_dir, "catalog", "studio_catalog.db")
    if os.path.exists(db_path):
        import sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT sku, title, raw_data FROM products")
            rows = cursor.fetchall()
            db_matches = 0
            for row in rows:
                row_str = f"{row[0]} {row[1]} {row[2]}"
                if "digital products house" in row_str.lower() or "digitalproductshouse" in row_str.lower() or "dph" in row_str.lower():
                    db_matches += 1
            print(f"Database products containing old references: {db_matches}")
        except Exception as e:
            print(f"Database audit failed: {e}")
        finally:
            conn.close()

if __name__ == "__main__":
    main()
