#!/bin/bash
# CS ERP Pipeline Runner — monitors cserp tmux session, chains module builds
# Safe restart: skips already-done modules, clears scrollback before each wait

TMUX_SESSION="cserp"
TASK_DIR="/home/ubuntu"
LOG="/root/cs_erp_pipeline.log"
REPO="/root/cs-erp"

DB_EXEC="docker exec -i 06-build-postgres-1 psql -U codilla -d codilla -t -A"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

# ─── Check if a module phase is already done in DB ─────────────────────────
is_done() {
    local mod="$1" phase="$2"
    local result=$($DB_EXEC -c "SELECT count(*) FROM cs_erp_build_progress WHERE module_id='$mod' AND phase='$phase' AND status='completed';" 2>/dev/null | tr -d ' ')
    [ "$result" = "1" ]
}

mark_done() {
    local mod="$1" phase="$2"
    $DB_EXEC -c "INSERT INTO cs_erp_build_progress (module_id, phase, status, started_at, completed_at) VALUES ('$mod','$phase','completed',NOW(),NOW()) ON CONFLICT (module_id, phase) DO UPDATE SET status='completed', completed_at=NOW();" > /dev/null 2>&1
}

# ─── tmux helpers ───────────────────────────────────────────────────────────
wait_for_prompt() {
    local tries=0
    while [ $tries -lt 60 ]; do
        local pane=$(tmux capture-pane -t "$TMUX_SESSION" -p 2>/dev/null | tail -6)
        # Prompt is ready when ❯ appears alone (not in queued message display)
        if echo "$pane" | grep -qE "^❯\s*$" || echo "$pane" | grep -qE "^❯\s*$"; then
            return 0
        fi
        # Also accept: bypass permissions line visible (claude is waiting)
        if echo "$pane" | grep -q "bypass permissions" && ! echo "$pane" | grep -q "Press up"; then
            return 0
        fi
        sleep 20
        tries=$((tries + 1))
    done
    log "WARNING: prompt wait timed out"
    return 1
}

wait_for_signal() {
    local signal="$1" timeout_min="${2:-60}"
    local deadline=$(($(date +%s) + timeout_min * 60))
    # Clear scrollback to avoid false positives from old history
    tmux clear-history -t "$TMUX_SESSION" 2>/dev/null || true
    log "Waiting for signal: $signal (${timeout_min}min timeout)"
    while [ $(date +%s) -lt $deadline ]; do
        sleep 30
        if tmux capture-pane -t "$TMUX_SESSION" -p -S -100 2>/dev/null | grep -q "$signal"; then
            log "✅ $signal"
            sleep 5  # let Claude Code finish any trailing output
            return 0
        fi
        # Print progress
        local last=$(tmux capture-pane -t "$TMUX_SESSION" -p 2>/dev/null | grep -v "^$" | grep -v "^─" | tail -1)
        [ -n "$last" ] && log "  → ${last:0:80}"
    done
    log "❌ TIMEOUT: $signal"
    return 1
}

send_task() {
    local task_file="$1" signal="$2"
    log "Sending: $task_file"
    wait_for_prompt
    sleep 3
    local msg="Please read and execute all instructions in ${task_file}. Complete every deliverable then echo exactly: ${signal}"
    tmux send-keys -t "$TMUX_SESSION" "$msg" Enter
    sleep 8
}

notify_wa() {
    openclaw message send --channel whatsapp --target "+97474085579" -m "$1" 2>/dev/null || true
}

# ─── Module build function ──────────────────────────────────────────────────
build_part() {
    local mod="$1" part="$2"
    local phase="codegen-p${part}"
    local num=$(echo "$mod" | sed 's/MOD-//')
    local signal="MOD${num}_P${part}_DONE"
    local task_file="${TASK_DIR}/cc_$(echo $mod | tr '[:upper:]' '[:lower:]' | tr -d '-')_p${part}_task.md"

    if is_done "$mod" "$phase"; then
        log "⏭️  $mod Part $part already done — skipping"
        return 0
    fi

    # Generate task file if not already written
    if [ ! -f "$task_file" ]; then
        log "Generating task file for $mod Part $part..."
        python3 /root/cs_erp_builder.py --module "$mod" --dry-run 2>/dev/null
        python3 -c "
import sys; sys.path.insert(0,'/')
exec(open('/root/cs_erp_builder.py').read().split('if __name__')[0])
mod_info = get_module_info('$mod')
features = get_features('$mod')
generate_task_file('$mod', $part, mod_info, features)
print('Task generated:', '$task_file')
" 2>/dev/null || log "Task generation warning (file may already exist)"
    fi

    if [ ! -f "$task_file" ]; then
        log "❌ Task file missing: $task_file"
        return 1
    fi

    send_task "$task_file" "$signal"

    if wait_for_signal "$signal" 60; then
        mark_done "$mod" "$phase"
        log "✅ $mod Part $part DONE"
        notify_wa "✅ CS ERP $mod Part $part complete — ${mod}"
        return 0
    else
        log "❌ $mod Part $part FAILED (timeout)"
        notify_wa "⚠️ CS ERP $mod Part $part TIMEOUT — check tmux cserp"
        return 1
    fi
}

# ─── Main build sequence ────────────────────────────────────────────────────
log "========================================="
log " CS ERP Pipeline Runner — $(date '+%Y-%m-%d %H:%M')"
log " All 61 modules, sequential"
log "========================================="

# Complex modules (3 parts), rest are 2 parts
declare -A PARTS=(
    [MOD-000]=2 [MOD-001]=2 [MOD-004]=3 [MOD-005]=3
    [MOD-009]=3 [MOD-031]=3 [MOD-041]=3 [MOD-050]=2
)

BUILD_ORDER=(
    MOD-000
    MOD-032 MOD-033 MOD-034 MOD-036
    MOD-003 MOD-012 MOD-011 MOD-010
    MOD-005 MOD-007 MOD-009 MOD-027
    MOD-023 MOD-024 MOD-022
    MOD-014 MOD-015 MOD-016 MOD-017
    MOD-041 MOD-040 MOD-006 MOD-008
    MOD-013 MOD-018 MOD-019 MOD-020
    MOD-021 MOD-025 MOD-026 MOD-028
    MOD-029 MOD-030 MOD-035 MOD-037
    MOD-038 MOD-039 MOD-042 MOD-043
    MOD-044 MOD-045 MOD-046 MOD-047
    MOD-048 MOD-049 MOD-051 MOD-052
    MOD-053 MOD-056 MOD-057 MOD-058
    MOD-059 MOD-060
    MOD-004 MOD-031 MOD-001 MOD-002
    MOD-050 MOD-054 MOD-055
)

total=0; failed=0

for mod in "${BUILD_ORDER[@]}"; do
    max_parts=${PARTS[$mod]:-2}
    for part in $(seq 1 $max_parts); do
        build_part "$mod" $part
        rc=$?
        if [ $rc -eq 0 ]; then
            total=$((total + 1))
        else
            failed=$((failed + 1))
            # Don't stop on failure — try next module
        fi
        sleep 5
    done
done

log "========================================="
log " PIPELINE COMPLETE: $total done, $failed failed"
log "========================================="
notify_wa "🎉 CS ERP Build Pipeline Complete! $total parts done, $failed failed."
