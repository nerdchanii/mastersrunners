#!/usr/bin/env python3
from __future__ import annotations

import json
import sys


def main() -> int:
    # The repository no longer uses Stop-hook review automation. Keep this
    # script as a compatibility no-op for older local configs that may still
    # call it before they are refreshed.
    print(
        json.dumps(
            {
                "decision": "allow",
                "reason": "Codex Stop review automation is disabled for this repository.",
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
