#!/bin/bash
# ─────────────────────────────────────────────────────────
# Dental Site Validator — runs BEFORE code review
# Catches the 20 most common issues from builds 1-3
# Usage: ./validate.sh
# ─────────────────────────────────────────────────────────

RED='\033[0;31m'
YEL='\033[0;33m'
GRN='\033[0;32m'
NC='\033[0m'
PASS=0
WARN=0
FAIL=0

pass() { echo -e "  ${GRN}PASS${NC}  $1"; ((PASS++)); return 0; }
warn() { echo -e "  ${YEL}WARN${NC}  $1"; ((WARN++)); return 0; }
fail() { echo -e "  ${RED}FAIL${NC}  $1"; ((FAIL++)); return 0; }

echo ""
echo "═══════════════════════════════════════════"
echo "  Dental Site Validator"
echo "═══════════════════════════════════════════"
echo ""

# ── 1. File structure ──
echo "── File Structure ──"
[ -f "index.html" ] && pass "index.html exists" || fail "index.html missing"
[ -f "about.html" ] && pass "about.html exists" || fail "about.html missing"
[ -f "treatments.html" ] && pass "treatments.html exists" || fail "treatments.html missing"
[ -f "contact.html" ] && pass "contact.html exists" || fail "contact.html missing"
[ -f "styles.css" ] && pass "styles.css exists" || fail "styles.css missing"
[ -f "Dockerfile" ] && pass "Dockerfile exists" || fail "Dockerfile missing"
[ -f "nginx.conf" ] && pass "nginx.conf exists" || fail "nginx.conf missing"
[ -f "favicon.svg" ] && pass "favicon.svg exists" || warn "favicon.svg missing"
[ -f "favicon.png" ] && pass "favicon.png exists" || warn "favicon.png missing"
[ -f "apple-touch-icon.png" ] && pass "apple-touch-icon exists" || warn "apple-touch-icon.png missing"

TREATMENTS=$(find treatments/ -name "*.html" 2>/dev/null | wc -l | tr -d ' ')
[ "$TREATMENTS" -ge 1 ] && pass "Treatment detail pages: $TREATMENTS" || fail "No treatment detail pages in treatments/"

echo ""

# ── 2. Security ──
echo "── Security ──"
BLANK_TARGETS=$(grep -rn 'target="_blank"' *.html treatments/*.html 2>/dev/null | grep -v 'rel="noopener' | wc -l | tr -d ' ')
[ "$BLANK_TARGETS" -eq 0 ] && pass "All target=_blank have rel=noopener" || fail "$BLANK_TARGETS links missing rel=\"noopener noreferrer\""

grep -q 'X-Frame-Options' nginx.conf 2>/dev/null && pass "X-Frame-Options header in nginx" || warn "Missing X-Frame-Options in nginx.conf"
grep -q 'X-Content-Type-Options' nginx.conf 2>/dev/null && pass "X-Content-Type-Options in nginx" || warn "Missing X-Content-Type-Options in nginx.conf"

echo ""

# ── 3. CTA Hierarchy ──
echo "── CTA Hierarchy ──"
# Primary nav CTA should be booking, not phone
FIRST_NAV_CTA=$(grep -A2 'nav-ctas' index.html | grep 'btn btn-primary' | head -1)
if echo "$FIRST_NAV_CTA" | grep -q 'cal.com\|booking\|book\|portal\.dental\|dentally\.me\|dentally\.co\|dental24\|software-of-excellence\|nhs\.uk'; then
    pass "Primary nav CTA links to booking"
elif echo "$FIRST_NAV_CTA" | grep -q 'tel:'; then
    fail "Primary nav CTA links to phone — should be booking"
else
    warn "Cannot determine primary nav CTA target"
fi

# Hero CTA should be booking
HERO_CTA=$(grep 'btn-hero\|btn btn-hero' index.html | head -1)
if echo "$HERO_CTA" | grep -q 'cal.com\|booking\|book\|portal\.dental\|dentally\.me\|dentally\.co\|dental24\|software-of-excellence\|nhs\.uk'; then
    pass "Hero CTA links to booking"
elif echo "$HERO_CTA" | grep -q 'tel:'; then
    fail "Hero CTA links to phone — should be booking"
else
    warn "Cannot determine hero CTA target"
fi

echo ""

# ── 4. Contact Form ──
echo "── Contact Form ──"
if [ -f "contact.html" ]; then
    if grep -q 'action="#"' contact.html; then
        fail "Contact form action is '#' — submissions go nowhere"
    elif grep -q 'formspree\|formsubmit\|getform\|netlify' contact.html; then
        pass "Contact form has real endpoint"
    else
        warn "Contact form action not recognised — verify manually"
    fi
else
    fail "contact.html doesn't exist"
fi

echo ""

# ── 5. CSS Completeness ──
echo "── CSS Classes ──"
for class in "page-header" "card-grid" "\.card " "price-table" "treatment-detail" "faq-list" "faq-item" "faq-question" "faq-answer" "enquiry-box" "info-box" "float-cta"; do
    if grep -q "$class" styles.css 2>/dev/null; then
        pass "CSS has .$class"
    else
        fail "Missing .$class in styles.css"
    fi
done

# Check for undefined CSS variables
UNDEFINED_VARS=$(grep -ohP 'var\(--[a-z-]+\)' styles.css 2>/dev/null | sort -u | while read var; do
    VARNAME=$(echo "$var" | sed 's/var(//;s/)//')
    if ! grep -q "$VARNAME:" styles.css 2>/dev/null; then
        echo "$VARNAME"
    fi
done)
if [ -z "$UNDEFINED_VARS" ]; then
    pass "All CSS variables are defined"
else
    fail "Undefined CSS variables: $UNDEFINED_VARS"
fi

echo ""

# ── 6. Mobile Nav ──
echo "── Mobile Nav ──"
if grep -q 'nav-dropdown-menu.*display.*none.*!important' styles.css 2>/dev/null; then
    fail "Treatments dropdown killed on mobile with !important"
else
    pass "Treatments dropdown not force-hidden on mobile"
fi

if grep -q 'nav-links.open.*nav-dropdown-menu' styles.css 2>/dev/null; then
    pass "Mobile nav shows treatment links when open"
else
    warn "Can't confirm mobile nav shows treatments — verify manually"
fi

echo ""

# ── 7. Favicon ──
echo "── Favicon ──"
PAGES_WITHOUT_FAVICON=$(grep -rL 'rel="icon"' *.html treatments/*.html 2>/dev/null | wc -l | tr -d ' ')
[ "$PAGES_WITHOUT_FAVICON" -eq 0 ] && pass "All pages have favicon link" || fail "$PAGES_WITHOUT_FAVICON pages missing favicon"

echo ""

# ── 8. Video Preload ──
echo "── Video Preload ──"
if [ -f "index.html" ]; then
    EAGER_VIDEOS=$(grep '<video' index.html | grep -v 'preload="none"' | grep -v 'preload="metadata"' | grep -v 'class="active"' | wc -l | tr -d ' ')
    [ "$EAGER_VIDEOS" -eq 0 ] && pass "Non-active videos have preload=none" || warn "$EAGER_VIDEOS videos without preload attribute"
fi

echo ""

# ── 9. Internal Links ──
echo "── Internal Links ──"
BROKEN=0
for link in $(grep -rohP 'href="(/[^"]*\.html)"' *.html treatments/*.html 2>/dev/null | sed 's/href="//;s/"//' | sort -u); do
    FILEPATH=".${link}"
    if [ ! -f "$FILEPATH" ]; then
        fail "Broken link: $link (file not found)"
        ((BROKEN++))
    fi
done
[ "$BROKEN" -eq 0 ] && pass "All internal .html links resolve to files"

echo ""

# ── 10. Class naming ──
echo "── Class Naming ──"
if grep -q 'whatsapp-float' styles.css 2>/dev/null; then
    warn "Still using .whatsapp-float class — rename to .float-cta"
else
    pass "No .whatsapp-float class (using .float-cta)"
fi

echo ""
echo "═══════════════════════════════════════════"
echo -e "  ${GRN}PASS: $PASS${NC}  ${YEL}WARN: $WARN${NC}  ${RED}FAIL: $FAIL${NC}"
if [ "$FAIL" -gt 0 ]; then
    echo -e "  ${RED}FIX ALL FAILURES BEFORE DEPLOYING${NC}"
    exit 1
else
    echo -e "  ${GRN}READY TO DEPLOY${NC}"
    exit 0
fi
