"""
Git Versioning & Changelog Tracker for Digital Product Studio
Tracks asset revisions, version bumps, and historical changes per product.
"""

import os
import subprocess
import time
from typing import Dict, Any, List

class GitTracker:
    def __init__(self, repo_path: str = "."):
        self.repo_path = os.path.abspath(repo_path)
        self._ensure_git_repo()

    def _ensure_git_repo(self):
        git_dir = os.path.join(self.repo_path, ".git")
        if not os.path.exists(git_dir):
            try:
                subprocess.run(["git", "init"], cwd=self.repo_path, check=True, stdout=subprocess.DEVNULL)
            except Exception as e:
                print(f"[Warning] Git repo initialization failed: {e}")

    def commit_product_change(self, product_id: str, title: str, version: str, change_description: str) -> str:
        """Commits product metadata/file updates to git repository with structured message."""
        message = f"chore(product): update {title} [{product_id}] to v{version}\n\n- {change_description}"
        try:
            subprocess.run(["git", "add", "catalog/"], cwd=self.repo_path, check=True, stdout=subprocess.DEVNULL)
            subprocess.run(["git", "commit", "-m", message], cwd=self.repo_path, check=True, stdout=subprocess.DEVNULL)
            return "committed"
        except Exception as e:
            return f"skipped ({e})"

    @staticmethod
    def create_changelog_entry(version: str, changes: str, author: str = "AI COO") -> Dict[str, Any]:
        return {
            "version": version,
            "date": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "changes": changes,
            "author": author
        }
