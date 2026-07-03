#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

RESULTS_FILE="mutation-results/results.csv"
mkdir -p "mutation-results"
echo "mutation_id,mutation_name,tool,total,passed,failed,skipped,caught" > "$RESULTS_FILE"

echo "=========================================="
echo "  Mutation Test Runner"
echo "=========================================="

PASS=0
FAIL=0

run_mutation() {
  local mid="$1"
  local mname="$2"
  local tool_name="$3"
  local test_files="$4"
  local short_name="$5"
  
  echo "  Running: $short_name..."
  
  set +e
  output=$(LOCAL=true MUTATION_ID="$mid" npx playwright test $test_files \
    --project=chromium --reporter=json --retries=0 2>/dev/null)
  exit_code=$?
  set -e
  
  total=$(echo "$output" | python3 -c "import sys,json;print(json.load(sys.stdin)['stats']['expected'])" 2>/dev/null || echo 0)
  passed=$(echo "$output" | python3 -c "import sys,json;print(json.load(sys.stdin)['stats']['expected'])" 2>/dev/null || echo 0)
  failed=$(echo "$output" | python3 -c "import sys,json;print(json.load(sys.stdin)['stats']['unexpected'])" 2>/dev/null || echo 0)
  skipped=$(echo "$output" | python3 -c "import sys,json;print(json.load(sys.stdin)['stats']['skipped'])" 2>/dev/null || echo 0)
  duration=$(echo "$output" | python3 -c "import sys,json;print(json.load(sys.stdin)['stats']['duration'])" 2>/dev/null || echo 0)
  
  if [ "$failed" -gt 0 ]; then
    caught="yes"
    echo "    🔴 CAUGHT ($failed failures, ${duration}ms)"
  else
    caught="no"
    echo "    🟢 MISSED (${duration}ms)"
  fi
  
  echo "$mid,$mname,$tool_name,$total,$passed,$failed,$skipped,$caught" >> "$RESULTS_FILE"
}

echo "--- Control ---"
run_mutation "" "Control (no mutation)" "PW Agents" "e2e/workspace-notifications.spec.ts" "PW control"
run_mutation "" "Control (no mutation)" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "KISS control"

echo "--- M1: API 404 on PUT /config ---"
run_mutation "1" "API 404 on PUT /config" "PW Agents" "e2e/workspace-notifications.spec.ts" "M1-PW"
run_mutation "1" "API 404 on PUT /config" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "M1-KISS"

echo "--- M2: API 500 on POST ---"
run_mutation "2" "API 500 on POST" "PW Agents" "e2e/workspace-notifications.spec.ts" "M2-PW"
run_mutation "2" "API 500 on POST" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "M2-KISS"

echo "--- M3: Toggle reverts ---"
run_mutation "3" "Toggle reverts" "PW Agents" "e2e/workspace-notifications.spec.ts" "M3-PW"
run_mutation "3" "Toggle reverts" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "M3-KISS"

echo "--- M4: Validation text Required→Mandatory ---"
run_mutation "4" "Validation text Required→Mandatory" "PW Agents" "e2e/workspace-notifications.spec.ts" "M4-PW"
run_mutation "4" "Validation text Required→Mandatory" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "M4-KISS"

echo "--- M5: API 10s delay ---"
run_mutation "5" "API 10s delay" "PW Agents" "e2e/workspace-notifications.spec.ts" "M5-PW"
run_mutation "5" "API 10s delay" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "M5-KISS"

echo "--- M6: Page heading changed ---"
run_mutation "6" "Page heading changed" "PW Agents" "e2e/workspace-notifications.spec.ts" "M6-PW"
run_mutation "6" "Page heading changed" "KISS" "e2e/workspace-notifications-kiss.spec.ts e2e/workspace-notifications-advanced.spec.ts" "M6-KISS"

echo ""
echo "=========================================="
echo "  RESULTS"
echo "=========================================="
echo ""
printf "%-24s %-11s %-11s\n" "Mutation" "PW Agents" "KISS"
printf "%-24s %-11s %-11s\n" "----------------------" "----------" "----------"
for mid in "" 1 2 3 4 5 6; do
  label=$(head -1 "$RESULTS_FILE")
  if [ -z "$mid" ]; then
    mlabel="Control"
  else
    mlabel=$(grep "^$mid," "$RESULTS_FILE" | head -1 | cut -d',' -f2)
  fi
  pw=$(grep "^$mid,.*,PW Agents," "$RESULTS_FILE" | cut -d',' -f8)
  ks=$(grep "^$mid,.*,KISS," "$RESULTS_FILE" | cut -d',' -f8)
  printf "%-24s %-11s %-11s\n" "${mlabel:0:22}" "$pw" "$ks"
done

echo ""
pw_c=$(grep ",PW Agents," "$RESULTS_FILE" | grep ",yes$" | wc -l | tr -d ' ')
pw_t=$(grep -c ",PW Agents," "$RESULTS_FILE" || echo 0)
k_c=$(grep ",KISS," "$RESULTS_FILE" | grep ",yes$" | wc -l | tr -d ' ')
k_t=$(grep -c ",KISS," "$RESULTS_FILE" || echo 0)
echo "PW Agents: $pw_c/$pw_t mutations caught"
echo "KISS:      $k_c/$k_t mutations caught"
echo ""
echo "Full results: mutation-results/results.csv"
