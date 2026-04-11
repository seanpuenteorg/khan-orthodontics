/* ============================================================================
 * Kaiser Booking Demo — app.js
 * Single-file router + state + dynamic rendering for Dentally Portal clone.
 * To add a new clinic: add an entry to CLINICS below and load via ?clinic=slug.
 * Uses only DOM methods (no innerHTML) to avoid XSS risks.
 * ============================================================================ */

const CLINICS = {
  'cube-dental': {
    name: 'Cube Dental',
    logo: 'assets/logos/cube-dental.png',
    phone: '+353949008128',
    countryCode: 'IE +353',
    locations: [
      { id: 'castlebar', name: 'Cube Dental Castlebar', address: "Davitt's Terrace, Castlebar, Mayo, F23 V227", shortAddress: "Davitt's Terrace, Castlebar, F23 V227" },
      { id: 'ennis',     name: 'Cube Dental Ennis',     address: 'Steeles Terrace, V95 W840',                  shortAddress: 'Steeles Terrace, V95 W840' },
      { id: 'gort',      name: 'Cube Dental Gort',      address: 'Unit 1, Markethall Shopping Centre',          shortAddress: 'Unit 1, Markethall Shopping Centre' },
    ],
    categories: [
      { id: 'checkup',      name: 'Dental checkup',  description: 'A checkup to screen for common problems' },
      { id: 'emergency',    name: 'Emergency',       description: 'For debilitating pain or accidents' },
      { id: 'consultation', name: 'Consultation',    description: 'Free Smile Consultation, Intravenous Sedation and Invisalign Consult appointments' },
      { id: 'other',        name: 'Something else',  description: "Can't see the appointment you need? Contact us on +353949008128 to discuss your options." },
    ],
    treatments: {
      checkup: [
        { id: 'invisalign',    name: 'Free Invisalign Consultation',  duration: '10 mins', deposit: null, description: 'Discover your perfect smile with our Free Invisalign Consultation. Our expert team will assess your dental needs, discuss personalised treatment options, and answer all your questions. Begin your journey to straighter teeth in a comfortable and welcoming environment.' },
        { id: 'kids-new',      name: 'Kids New patient',               duration: '15 mins', deposit: 15,   description: 'New patient examination for children, including a full oral health check and treatment plan.' },
        { id: 'emergency-new', name: 'New patient dental emergency',   duration: '15 mins', deposit: 50,   description: 'Experience prompt and professional care with our New Patient Emergency Dental Appointment. Our skilled team is ready to address your urgent dental needs, ensuring relief and expert treatment in a welcoming environment. Prioritise your oral health with immediate attention and exceptional service. Please note: we do not accept GMS card payments for new patients' },
        { id: 'new-exam',      name: 'New Patient Exam +Scale & Polish', duration: '30 mins', deposit: 15, description: 'Comprehensive new patient examination including X-rays, scale and polish with our experienced dental team.' },
        { id: 'other',         name: 'Something else',                 duration: null,      deposit: null, description: null },
      ],
      emergency:    [{ id: 'em-1', name: 'Emergency appointment', duration: '20 mins', deposit: 80, description: 'Urgent pain relief and assessment.' }],
      consultation: [{ id: 'co-1', name: 'Free Smile Consultation', duration: '20 mins', deposit: null, description: 'Discuss your options for a brighter smile with no obligation.' }],
      other:        [],
    },
    clinician: { name: 'Hosam Mohamedelfatih BSc (NUI), MSc Odont. (LSMU)', initials: 'HM', title: 'Dentist' },
    availability: [
      { label: 'Mon 18 May', dateFull: 'Monday 18th May 2026', slots: ['10:50','11:20','15:00','15:10','15:20','15:30','15:40','15:50','16:00'] },
      { unavailable: 'TUE 19 MAY - SUN 07 JUNE' },
      { label: 'Mon 08 June', dateFull: 'Monday 8th June 2026', slots: ['09:30','09:40','09:50','10:00','10:10','10:20','10:30','10:40','10:50'] },
      { unavailable: 'TUE 09 JUNE - SUN 14 JUNE' },
      { label: 'Mon 15 June', dateFull: 'Monday 15th June 2026', slots: ['09:30','09:40','09:50','10:00','10:10','10:20','10:30','10:40','10:50'] },
      { unavailable: 'TUE 16 JUNE - WED 17 JUNE' },
      { label: 'Mon 22 June', dateFull: 'Monday 22nd June 2026', slots: ['09:30','09:40','09:50','10:20','10:30','10:40','10:50','11:00','11:10'] },
    ],
  },
  'mk-dental': {
    name: 'MK Dental & Implant Clinic',
    logo: 'assets/logos/mk-dental.webp',
    phone: '+441234567890',
    countryCode: 'UK +44',
    locations: [
      { id: 'main', name: 'MK Dental & Implant Clinic', address: 'Milton Keynes, MK1 1AA', shortAddress: 'Milton Keynes, MK1 1AA' },
    ],
    categories: [
      { id: 'checkup',   name: 'Dental checkup',        description: 'A checkup to screen for common problems' },
      { id: 'implant',   name: 'Implant consultation',  description: 'Discuss dental implant options' },
      { id: 'emergency', name: 'Emergency',             description: 'For debilitating pain or accidents' },
      { id: 'other',     name: 'Something else',        description: "Contact us to discuss your options." },
    ],
    treatments: {
      checkup: [
        { id: 'new-exam', name: 'New Patient Exam', duration: '30 mins', deposit: 25, description: 'Comprehensive new patient examination with X-rays and oral health check.' },
        { id: 'routine',  name: 'Routine Check-up', duration: '20 mins', deposit: null, description: 'Regular dental check-up for existing patients.' },
      ],
      implant:   [{ id: 'im-1', name: 'Implant Consultation', duration: '45 mins', deposit: 50, description: 'Discuss implant options with our specialist.' }],
      emergency: [{ id: 'em-1', name: 'Emergency Appointment', duration: '20 mins', deposit: 80, description: 'Urgent pain relief and assessment.' }],
      other: [],
    },
    clinician: { name: 'Dr K. Patel BDS', initials: 'KP', title: 'Principal Dentist' },
    availability: [
      { label: 'Mon 18 May', dateFull: 'Monday 18th May 2026', slots: ['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30'] },
      { unavailable: 'TUE 19 MAY - SUN 24 MAY' },
      { label: 'Mon 25 May', dateFull: 'Monday 25th May 2026', slots: ['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30'] },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

// Determine which clinic config to use.
//
// Priority:
//   1. window.KAISER_CLINIC_CONFIG — production mode. Injected by dental-site-template/build.py
//      at build time via a <script> tag in index.html. Single clinic per deploy, no switching.
//   2. Path segment: /cube-dental → "cube-dental" — standalone dev mode / multi-clinic gallery.
//   3. Query param: ?clinic=cube-dental — local dev fallback.
//   4. Default: "cube-dental".
//
// Production mode (window.KAISER_CLINIC_CONFIG set) is used when this booking portal is embedded
// in a clinic website built by kaiser-dental-website. The clinic's logo, colors, phone,
// treatments, team, and locations are all pre-injected — no URL switching, no fallback to
// hardcoded data.
const urlParams = new URLSearchParams(location.search);
let CLINIC;
if (typeof window !== 'undefined' && window.KAISER_CLINIC_CONFIG && typeof window.KAISER_CLINIC_CONFIG === 'object') {
  CLINIC = window.KAISER_CLINIC_CONFIG;
} else {
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const clinicSlug = pathSegments[0] || urlParams.get('clinic') || 'cube-dental';
  CLINIC = CLINICS[clinicSlug] || CLINICS['cube-dental'];
}

const state = {
  selectedLocation: null,
  selectedCategory: null,
  selectedTreatment: null,
  selectedSlot: null,
  selectedSlotDate: null,
  patientEmail: '',
};

/* ------------------------------------------------------------------ */
/* DOM helpers                                                        */
/* ------------------------------------------------------------------ */

const SVG_NS = 'http://www.w3.org/2000/svg';

function h(tag, attrs, ...kids) {
  const isSvg = tag === 'svg' || tag === 'path' || tag === 'circle' || tag === 'g';
  const el = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      const val = attrs[key];
      if (val == null || val === false) continue;
      if (key === 'class')       el.setAttribute('class', val);
      else if (key === 'onClick') el.addEventListener('click', val);
      else                        el.setAttribute(key, val);
    }
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return el;
}

function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

/* ---- Heroicon factories (outline, 24x24, stroke currentColor) ---- */

function icon(d, className, strokeWidth) {
  return h('svg', { class: className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': strokeWidth || '2' },
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: d }));
}
function iconArrowRight(cls) { return icon('M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3', cls || 'w-5 h-5', '2.5'); }
function iconCheck(cls, sw)  { return icon('m4.5 12.75 6 6 9-13.5', cls || 'w-5 h-5', sw || '2.5'); }
function iconClock(cls)      { return icon('M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', cls || 'w-5 h-5'); }
function iconCard(cls)       { return icon('M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z', cls || 'w-4 h-4', '1.5'); }
function iconMapPin(cls) {
  return h('svg', { class: cls || 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' }));
}

/* ------------------------------------------------------------------ */
/* Router                                                             */
/* ------------------------------------------------------------------ */

function goScreen(name) { location.hash = name; }

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.querySelector(`[data-screen="${name}"]`) || document.querySelector('[data-screen="landing"]');
  target.classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'locations')    renderLocations();
  if (name === 'categories')   renderCategories();
  if (name === 'treatments')   renderTreatments();
  if (name === 'availability') renderAvailability();
  if (name === 'confirmed')    renderConfirmation();
}

window.addEventListener('hashchange', () => {
  const screen = location.hash.replace('#', '') || 'landing';
  showScreen(screen);
});

/* ------------------------------------------------------------------ */
/* Global event wiring                                                */
/* ------------------------------------------------------------------ */

function wireNav() {
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      e.preventDefault();
      // Production-mode redirect: if the user clicks "Book" in the slot-chosen modal
      // and this deploy is a real clinic site (realBookingUrl set in injected config),
      // open the clinic's actual booking system in a new tab instead of showing the
      // fake patient details / confirmation screens. Kaiser's UI is the funnel,
      // real bookings land in the clinic's existing system.
      if (navBtn.dataset.nav === 'details' && CLINIC.realBookingUrl) {
        window.open(CLINIC.realBookingUrl, '_blank', 'noopener,noreferrer');
        closeModal('slot');
        return;
      }
      goScreen(navBtn.dataset.nav);
      return;
    }
    const openCal = e.target.closest('[data-open-calendar]');
    if (openCal) { openModal('calendar'); return; }
    const closeModalBtn = e.target.closest('[data-close-modal]');
    if (closeModalBtn) { closeModal(closeModalBtn.dataset.closeModal); return; }
  });
}

function openModal(name) {
  const modal = document.querySelector(`[data-modal="${name}"]`);
  if (modal) { modal.classList.add('active'); document.body.classList.add('modal-open'); }
}
function closeModal(name) {
  const modal = document.querySelector(`[data-modal="${name}"]`);
  if (modal) { modal.classList.remove('active'); document.body.classList.remove('modal-open'); }
}

/* ------------------------------------------------------------------ */
/* Apply clinic branding globally                                     */
/* ------------------------------------------------------------------ */

function applyClinicBranding() {
  document.title = `${CLINIC.name} — Book an appointment`;
  document.querySelectorAll('[data-clinic-logo]').forEach(img => { img.src = CLINIC.logo; img.alt = CLINIC.name; });
  document.querySelectorAll('[data-clinician-initials]').forEach(el => el.textContent = CLINIC.clinician.initials);
  document.querySelectorAll('[data-clinician-name]').forEach(el => el.textContent = CLINIC.clinician.name);
  document.querySelectorAll('[data-clinician-title]').forEach(el => el.textContent = CLINIC.clinician.title);
}

/* ------------------------------------------------------------------ */
/* Shared card builder (Yes/No style with title + arrow + subtitle)  */
/* ------------------------------------------------------------------ */

function linkCard(title, subtitle, onClick, showArrow) {
  const btn = h('button', {
    class: 'w-full text-left bg-white border border-gray-200 hover:border-brand hover:shadow-sm rounded-lg p-5 transition-all',
    onClick: onClick,
  });
  const titleRow = h('div', { class: 'flex items-center gap-2 text-brand text-base font-bold mb-1' }, title);
  if (showArrow !== false) titleRow.appendChild(iconArrowRight('w-5 h-5'));
  btn.appendChild(titleRow);
  btn.appendChild(h('div', { class: 'text-sm text-gray-600' }, subtitle));
  return btn;
}

/* ------------------------------------------------------------------ */
/* Locations screen                                                   */
/* ------------------------------------------------------------------ */

function renderLocations() {
  const heading = document.querySelector('[data-locations-heading]');
  const list    = document.querySelector('[data-locations-list]');
  heading.textContent = `Choose from ${CLINIC.locations.length} location${CLINIC.locations.length === 1 ? '' : 's'}`;
  clear(list);
  CLINIC.locations.forEach(loc => {
    list.appendChild(linkCard(loc.name, loc.shortAddress, () => {
      state.selectedLocation = loc;
      goScreen('categories');
    }));
  });
}

/* ------------------------------------------------------------------ */
/* Categories screen                                                  */
/* ------------------------------------------------------------------ */

function renderCategories() {
  const list = document.querySelector('[data-categories-list]');
  clear(list);
  CLINIC.categories.forEach(cat => {
    const isOther = cat.id === 'other';
    list.appendChild(linkCard(cat.name, cat.description, () => {
      if (isOther) return;
      state.selectedCategory = cat;
      goScreen('treatments');
    }, !isOther));
  });
}

/* ------------------------------------------------------------------ */
/* Treatments screen                                                  */
/* ------------------------------------------------------------------ */

function renderTreatments() {
  const heading = document.querySelector('[data-treatments-heading]');
  const list    = document.querySelector('[data-treatments-list]');
  const cta     = document.querySelector('[data-treatments-cta]');
  const cat     = state.selectedCategory || CLINIC.categories[0];
  heading.textContent = cat.name;
  state.selectedTreatment = null;
  cta.classList.add('hidden');

  clear(list);
  const items = CLINIC.treatments[cat.id] || [];

  items.forEach(t => {
    const hasDeposit = t.deposit !== null;

    const card = h('button', {
      class: 'treatment-card w-full text-left bg-white border border-gray-200 hover:border-brand rounded-lg transition-all block',
      'data-treatment-id': t.id,
    });

    const radio = h('div', { class: 'treatment-radio flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5' });

    const textBlock = h('div', { class: 'flex-1' });
    textBlock.appendChild(h('div', { class: 'font-bold text-gray-900 mb-1' }, t.name));

    if (hasDeposit) {
      const deposit = h('div', { class: 'flex items-center gap-1.5 text-xs text-gray-600' }, iconCard('w-4 h-4'), `Deposit €${t.deposit}`);
      textBlock.appendChild(deposit);
    }

    const expanded = h('div', { class: 'treatment-expanded hidden mt-3' });
    if (t.duration)    expanded.appendChild(h('div', { class: 'text-sm text-gray-600 mb-2' }, t.duration));
    if (t.description) expanded.appendChild(h('div', { class: 'text-sm text-gray-700 leading-relaxed' }, t.description));
    textBlock.appendChild(expanded);

    card.appendChild(h('div', { class: 'p-5' },
      h('div', { class: 'flex items-start gap-3' }, radio, textBlock)));

    card.addEventListener('click', () => {
      // Reset all
      list.querySelectorAll('.treatment-card').forEach(c => {
        c.classList.remove('border-brand','bg-brand-light');
        c.classList.add('border-gray-200');
        const r = c.querySelector('.treatment-radio');
        clear(r);
        r.setAttribute('class', 'treatment-radio flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5');
        c.querySelector('.treatment-expanded').classList.add('hidden');
      });
      // Activate this one
      card.classList.remove('border-gray-200');
      card.classList.add('border-brand','bg-brand-light');
      radio.setAttribute('class', 'treatment-radio flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center mt-0.5 text-white');
      radio.appendChild(iconCheck('w-3 h-3', '3'));
      expanded.classList.remove('hidden');
      state.selectedTreatment = t;
      cta.classList.remove('hidden');
    });

    list.appendChild(card);
  });
}

/* ------------------------------------------------------------------ */
/* Availability screen                                                */
/* ------------------------------------------------------------------ */

function renderAvailability() {
  const subtitle = document.querySelector('[data-availability-subtitle]');
  const list     = document.querySelector('[data-availability-list]');
  const t        = state.selectedTreatment || (CLINIC.treatments.checkup && CLINIC.treatments.checkup[0]) || { name: 'Appointment' };

  clear(subtitle);
  subtitle.appendChild(document.createTextNode('Showing availability for '));
  subtitle.appendChild(h('span', { class: 'font-semibold text-gray-900' }, t.name));
  subtitle.appendChild(document.createTextNode(' with '));
  subtitle.appendChild(h('span', { class: 'font-semibold text-gray-900' }, CLINIC.clinician.name));

  clear(list);
  CLINIC.availability.forEach((row, idx) => {
    if (row.unavailable) {
      const block = h('div', { class: 'bg-gray-100 text-center py-5 my-3 rounded-md' },
        h('div', { class: 'text-xs font-medium uppercase tracking-wide text-gray-500' }, row.unavailable),
        h('div', { class: 'text-sm text-gray-500 mt-0.5' }, 'No availability'));
      list.appendChild(block);
      return;
    }
    const section = h('div', { class: 'mb-6' });
    section.appendChild(h('h2', { class: 'text-base font-bold text-gray-900 mb-3' }, row.label));

    const visibleSlots = row.slots.slice(0, 6);
    const hiddenSlots  = row.slots.slice(6);

    const grid = h('div', { class: 'grid grid-cols-3 sm:grid-cols-6 gap-2' });

    visibleSlots.forEach(slotTime => {
      grid.appendChild(makeSlotButton(slotTime, row.dateFull, t));
    });

    let hiddenGrid = null;
    if (hiddenSlots.length) {
      const showAll = h('button', {
        class: 'col-span-3 sm:col-span-1 bg-white border border-gray-200 hover:border-brand text-sm font-medium text-gray-900 py-2 rounded-full transition-colors',
      }, '+ show all');
      showAll.addEventListener('click', () => {
        hiddenGrid.classList.remove('hidden');
        showAll.remove();
      });
      grid.appendChild(showAll);

      hiddenGrid = h('div', { class: 'hidden grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2' });
      hiddenSlots.forEach(slotTime => {
        hiddenGrid.appendChild(makeSlotButton(slotTime, row.dateFull, t));
      });
    }

    section.appendChild(grid);
    if (hiddenGrid) section.appendChild(hiddenGrid);
    list.appendChild(section);
  });

  renderCalendarGrid();
}

function makeSlotButton(slotTime, dateFull, treatment) {
  const btn = h('button', {
    class: 'slot-chip bg-white border border-gray-200 hover:border-brand text-sm font-medium text-gray-900 py-2 rounded-full transition-colors',
  }, slotTime);
  btn.addEventListener('click', () => {
    state.selectedSlot = slotTime;
    state.selectedSlotDate = dateFull;
    const loc = state.selectedLocation || CLINIC.locations[0];
    document.querySelector('[data-slot-date]').textContent = dateFull;
    document.querySelector('[data-slot-time]').textContent = slotTime;
    document.querySelector('[data-slot-treatment]').textContent = `${treatment.name} (${treatment.duration || '10 mins'})`;
    document.querySelectorAll('[data-location-name]').forEach(el => el.textContent = loc.name);
    document.querySelectorAll('[data-location-address]').forEach(el => el.textContent = loc.address);
    openModal('slot');
  });
  return btn;
}

function renderCalendarGrid() {
  const calGrid = document.querySelector('[data-calendar-grid]');
  if (!calGrid) return;
  clear(calGrid);
  // Aug 2026: 1st is a Saturday. Mon-start grid → 5 leading days from July (27-31).
  const days = [];
  for (let d = 27; d <= 31; d++) days.push({ n: d, muted: true });
  for (let d = 1; d <= 31; d++)  days.push({ n: d, muted: false });
  for (let d = 1; d <= 6;  d++)  days.push({ n: d, muted: true });

  days.forEach(day => {
    if (day.n === 26 && !day.muted) {
      const cell = h('div', { class: 'py-2.5' },
        h('div', { class: 'w-9 h-9 mx-auto rounded-full bg-brand text-white font-semibold flex items-center justify-center' }, String(day.n)));
      calGrid.appendChild(cell);
    } else {
      const cls = day.muted ? 'py-2.5 text-gray-300 rounded' : 'py-2.5 text-gray-900 rounded hover:bg-gray-100 cursor-pointer';
      calGrid.appendChild(h('div', { class: cls }, String(day.n)));
    }
  });
}

/* ------------------------------------------------------------------ */
/* Confirmation screen                                                */
/* ------------------------------------------------------------------ */

function renderConfirmation() {
  const emailInput = document.querySelector('#details-email');
  const email = (emailInput && emailInput.value) || 'your email';
  state.patientEmail = email;
  document.querySelector('[data-confirm-email]').textContent = email;

  const t = state.selectedTreatment || { name: 'Appointment', duration: '10 mins' };
  const loc = state.selectedLocation || CLINIC.locations[0];
  const date = state.selectedSlotDate || 'Monday 18th May 2026';
  const time = state.selectedSlot || '15:20';

  document.querySelector('[data-confirm-datetime]').textContent = `${date} at ${time}`;
  document.querySelector('[data-confirm-treatment]').textContent = `${t.name} (${t.duration || '10 mins'})`;
  document.querySelectorAll('[data-location-name]').forEach(el => el.textContent = loc.name);
  document.querySelectorAll('[data-location-address]').forEach(el => el.textContent = loc.address);

  const initials = CLINIC.name.split(' ').map(w => w[0]).join('').toUpperCase();
  const ref = `${initials}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  document.querySelector('[data-confirm-ref]').textContent = ref;
}

/* ------------------------------------------------------------------ */
/* Init                                                               */
/* ------------------------------------------------------------------ */

function init() {
  // Hide "Demo prototype" banner when shared with a client via ?client=1
  if (urlParams.get('client') === '1') {
    document.body.classList.add('client-mode');
  }
  applyClinicBranding();
  wireNav();
  const screen = location.hash.replace('#', '') || 'landing';
  showScreen(screen);
  console.log(`%cKaiser Collective — Demo Portal — ${CLINIC.name}`, 'color:#2563eb;font-weight:bold');
  console.log('This is a demonstration, not a live booking system. No appointments are actually scheduled.');
}

init();
