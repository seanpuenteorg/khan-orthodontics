#!/bin/bash
# ─────────────────────────────────────────────────────────
# Post-Build QA — catches content-level issues the validator misses.
# macOS compatible (no GNU grep -P).
#
# Exit codes:
#   0 = all checks pass
#   1+ = number of FAILs
#
# Usage: ./qa-check.sh [output-dir]
# ─────────────────────────────────────────────────────────

DIR="${1:-.}"
cd "$DIR" || exit 1

PASS=0
WARN=0
FAIL=0

pass()  { printf "  \033[0;32mPASS\033[0m  %s\n" "$1"; PASS=$((PASS+1)); }
warn()  { printf "  \033[0;33mWARN\033[0m  %s\n" "$1"; WARN=$((WARN+1)); }
fail()  { printf "  \033[0;31mFAIL\033[0m  %s\n" "$1"; FAIL=$((FAIL+1)); }

count_matches() {
    # Safe line counter that always returns a clean integer
    local result
    result=$(grep -r "$@" 2>/dev/null | wc -l)
    echo "$result" | tr -d '[:space:]'
}

echo ""
echo "═══════════════════════════════════════════"
echo "  Post-Build QA Check"
echo "═══════════════════════════════════════════"
echo ""

# ── 1. UNREPLACED TOKENS ──
echo "── Unreplaced Tokens ──"
TC=$(count_matches '{{[A-Z_]*}}' --include="*.html" | head -1)
if [ "${TC:-0}" -eq 0 ]; then
    pass "No unreplaced {{TOKEN}} placeholders"
else
    fail "$TC unreplaced tokens found"
    grep -rn '{{[A-Z_]*}}' --include="*.html" 2>/dev/null | head -5
fi

# ── 2. PYTHON LITERAL LEAKS ──
echo "── Python Literal Leaks ──"
NC=$(grep -r '>None<\|"None"\|src="None"\|href="None"' --include="*.html" 2>/dev/null | grep -v 'book/' | wc -l | tr -d '[:space:]')
if [ "${NC:-0}" -eq 0 ]; then
    pass "No Python None leaks"
else
    fail "$NC Python None leaks found"
    grep -rn '>None<\|"None"\|src="None"' --include="*.html" 2>/dev/null | grep -v 'book/' | head -5
fi

# ── 3. EMPTY MAPS LINKS ──
echo "── Maps Links ──"
EM=$(grep -r 'maps.google.com/?q="' --include="*.html" 2>/dev/null | grep -v 'book/' | wc -l | tr -d '[:space:]')
if [ "${EM:-0}" -eq 0 ]; then
    pass "All Google Maps links have a query"
else
    fail "$EM empty Google Maps links (no address)"
fi

# ── 4. CONTENT COMPLETENESS ──
echo "── Content Completeness ──"

# Footer — should have visible clinic name or address
if grep -A3 'footer-info' index.html 2>/dev/null | grep -q '>[A-Za-z0-9]'; then
    pass "Footer has visible clinic text"
else
    fail "Footer has no visible address or clinic text"
fi

# Treatment slider — cards should have descriptions
ED=$(grep -c 'slide-desc"></p>' index.html 2>/dev/null | head -1 | tr -d '[:space:]')
ED="${ED:-0}"
if [ "$ED" -eq 0 ]; then
    pass "Treatment slider cards have descriptions"
else
    fail "$ED treatment cards have empty descriptions"
fi

# Treatment grid — should have cards
if [ -f treatments.html ]; then
    GC=$(grep -c 'treatment-image-card' treatments.html 2>/dev/null || echo 0)
    if [ "${GC:-0}" -gt 0 ]; then
        pass "Treatment grid has $GC cards"
    else
        fail "Treatment grid has no cards"
    fi
fi

# Featured treatment — should have description text
if [ -f treatments.html ]; then
    if grep -A5 'featured-split-text' treatments.html 2>/dev/null | grep -q '<p>[A-Za-z]'; then
        pass "Featured treatment has description"
    else
        warn "Featured treatment description may be empty"
    fi
fi

# ── 5. TREATMENT DETAIL PAGE QUALITY ──
echo "── Treatment Detail Pages ──"
DC=$(find treatments/ -name "*.html" 2>/dev/null | wc -l | tr -d '[:space:]')
if [ "${DC:-0}" -gt 0 ]; then
    EB=0; EF=0; EI=0; BL=0

    for page in treatments/*.html; do
        # Benefits
        BI=$(grep -c '<li>' "$page" 2>/dev/null || echo 0)
        [ "${BI:-0}" -eq 0 ] && EB=$((EB+1))

        # FAQ
        FI=$(grep -c 'faq-question' "$page" 2>/dev/null || echo 0)
        [ "${FI:-0}" -eq 0 ] && EF=$((EF+1))

        # Intro text (not empty <p></p>)
        if ! grep -A1 'About This Treatment' "$page" 2>/dev/null | grep -q '<p>[A-Za-z]'; then
            EI=$((EI+1))
        fi

        # Logo path matches actual file
        if [ -f logo.svg ] && [ ! -f logo.png ]; then
            if grep -q 'src="/logo.png"' "$page" 2>/dev/null; then
                BL=$((BL+1))
            fi
        fi
    done

    [ "$EB" -eq 0 ] && pass "All $DC detail pages have benefits" || fail "$EB/$DC detail pages have empty benefits"
    [ "$EF" -eq 0 ] && pass "All $DC detail pages have FAQs" || fail "$EF/$DC detail pages have empty FAQs"
    [ "$EI" -eq 0 ] && pass "All $DC detail pages have intro text" || fail "$EI/$DC detail pages have empty intro"
    [ "$BL" -eq 0 ] && pass "All detail pages use correct logo path" || fail "$BL/$DC detail pages reference wrong logo file"
else
    warn "No treatment detail pages found"
fi

# ── 6. CSS VARIABLES ──
echo "── CSS Variables ──"
if [ -f styles.css ]; then
    # Extract used and defined vars (macOS compatible)
    USED=$(grep -o 'var(--[a-z0-9-]*)' styles.css | sed 's/var(//;s/)//' | sort -u)
    DEFINED=$(grep -E '^\s*--[a-z0-9-]+:' styles.css | sed 's/:.*//' | sed 's/^[[:space:]]*//' | sort -u)
    UNDEF=$(comm -23 <(echo "$USED") <(echo "$DEFINED") | tr '\n' ' ')
    if [ -z "$(echo "$UNDEF" | tr -d '[:space:]')" ]; then
        pass "All CSS variables are defined"
    else
        fail "Undefined CSS variables: $UNDEF"
    fi
fi

# ── 7. MAP EMBED ──
echo "── Map Embed ──"
if [ -f contact.html ]; then
    if grep -q 'iframe src=""' contact.html 2>/dev/null; then
        warn "Map iframe has empty src (no address data)"
    elif grep -q 'iframe src="None"' contact.html 2>/dev/null; then
        fail "Map iframe src is Python None"
    elif grep -q 'iframe src=' contact.html 2>/dev/null; then
        pass "Map iframe has valid src"
    else
        warn "No map iframe found"
    fi
fi

# ── 8. OG IMAGE ──
echo "── Social / OG Tags ──"
if grep -q 'og:image' index.html 2>/dev/null; then
    if grep 'og:image' index.html | grep -q 'logo.png' && [ ! -f logo.png ]; then
        warn "og:image references logo.png but only logo.svg exists"
    else
        pass "OG image tag valid"
    fi
fi

# ── 9. MOBILE RESPONSIVE ──
echo "── Mobile Responsiveness ──"
if [ -f styles.css ]; then
    MQ=$(grep -c '@media' styles.css 2>/dev/null || echo 0)
    if [ "${MQ:-0}" -ge 5 ]; then
        pass "$MQ responsive breakpoints in CSS"
    else
        warn "Only $MQ media queries"
    fi
    if grep -q 'RESPONSIVE OVERRIDES' styles.css 2>/dev/null; then
        pass "Inline grid responsive overrides present"
    else
        warn "Missing responsive overrides for inline grids"
    fi
fi

# ── 10. ACCESSIBILITY ──
echo "── Accessibility ──"
# Count images without alt (check all HTML except book/)
NA=$(grep -r '<img ' --include="*.html" 2>/dev/null | grep -v 'book/' | grep -v 'alt=' | wc -l | tr -d '[:space:]')
if [ "${NA:-0}" -eq 0 ]; then
    pass "All images have alt attributes"
else
    fail "$NA images missing alt attributes"
fi
if grep -q 'lang="en' index.html 2>/dev/null; then
    pass "HTML lang attribute set"
else
    warn "HTML lang attribute missing"
fi

# ── 11. HARDCODED LEAKS ──
echo "── Hardcoded Content Leaks ──"
LK=$(grep -ri 'cedarcrest\|acworth.*GA' --include="*.html" 2>/dev/null | grep -v 'book/' | wc -l | tr -d '[:space:]')
if [ "${LK:-0}" -eq 0 ]; then
    pass "No hardcoded clinic-specific content"
else
    warn "$LK potential hardcoded references"
fi

# ── 12. BOOKING PORTAL ──
echo "── Booking Portal ──"
if [ -f book/index.html ] && [ -f book/app.js ]; then
    if grep -q 'KAISER_CLINIC_CONFIG' book/index.html 2>/dev/null; then
        pass "Booking portal has clinic config"
    else
        fail "Booking portal missing config"
    fi
else
    fail "Booking portal files missing"
fi

# ── 13. PERFORMANCE ──
echo "── Performance ──"
LI=$(grep -r 'loading="lazy"' --include="*.html" 2>/dev/null | grep -v 'book/' | wc -l | tr -d '[:space:]')
pass "$LI images use lazy loading"
PN=$(grep -c 'preload="none"' index.html 2>/dev/null || echo 0)
if [ "${PN:-0}" -ge 2 ]; then
    pass "Non-active videos have preload=none"
else
    warn "Videos may load eagerly"
fi

# ── RESULTS ──
echo ""
echo "═══════════════════════════════════════════"
printf "  \033[0;32mPASS: %d\033[0m  \033[0;33mWARN: %d\033[0m  \033[0;31mFAIL: %d\033[0m\n" "$PASS" "$WARN" "$FAIL"
if [ "$FAIL" -eq 0 ]; then
    printf "  \033[0;32mQA PASSED\033[0m\n"
else
    printf "  \033[0;31mQA FAILED — %d issues must be fixed before deploy\033[0m\n" "$FAIL"
fi
echo "═══════════════════════════════════════════"
echo ""

exit "$FAIL"
