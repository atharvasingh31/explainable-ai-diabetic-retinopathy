#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

export MPLCONFIGDIR=/tmp/matplotlib
export PYTHONPATH="$DIR:$DIR/venv.nosync/lib/python3.10/site-packages"

echo "=========================================================="
echo " Starting Diabetic Retinopathy Screening System (FastAPI)"
echo " Server running on http://localhost:8000"
echo " Interactive UI:  http://localhost:8000"
echo " API Docs (Docs): http://localhost:8000/docs"
echo "=========================================================="

exec /Library/Frameworks/Python.framework/Versions/3.10/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
