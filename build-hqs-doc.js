/* build-hqs-doc.js — HQS pdfmake report builder (Phase 4)
 *
 * Independent of local storage and legacy parsing. It receives an ALREADY
 * normalized inspection (see generateHqsPdf in index.html) and returns
 * { docDefinition, filename }. Text-only headings; it never calls icon().
 * It reads the shared checklist constants (ROOM_ITEMS, KITCHEN_ITEMS,
 * BEDROOM_ITEMS, BATH_ITEMS, BUILDING_CHECKLIST, AMENITIES, ROOM_CODES) and
 * formatPropertyLocation from the application's global scope at call time.
 */
(function () {
  'use strict';

  /* Phase 4d — fixed Bluewood print palette (independent of app appearance mode) */
  var BLUEWOOD = '#313F59', BERMUDA = '#6691A3', MYSTIC = '#DBE2EB',
      HEATHER = '#B0C2CE', ONBAR = '#ffffff', BODY = '#111111',
      NEUTRAL = '#64748b', GREEN = '#16a34a', RED = '#dc2626';

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
  }

  // Thin gray grid for checklist tables (mirrors the 3b1 pv-table borders).
  var gridLayout = {
    hLineWidth: function () { return 0.5; }, vLineWidth: function () { return 0.5; },
    hLineColor: function () { return HEATHER; }, vLineColor: function () { return HEATHER; },
    paddingLeft: function () { return 4; }, paddingRight: function () { return 4; },
    paddingTop: function () { return 2; }, paddingBottom: function () { return 2; }
  };
  // Box outline: top, under-title, and bottom rules + left/right only.
  var boxLayout = {
    hLineWidth: function (i, node) { return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0; },
    vLineWidth: function () { return 0.5; },
    hLineColor: function () { return HEATHER; }, vLineColor: function () { return HEATHER; },
    paddingLeft: function () { return 0; }, paddingRight: function () { return 0; },
    paddingTop: function () { return 0; }, paddingBottom: function () { return 0; }
  };

  function sectionTitleBar(txt) {
    return { table: { widths: ['*'], body: [[ { text: txt, color: ONBAR, bold: true, fontSize: 9.5, fillColor: BLUEWOOD, margin: [4, 3, 4, 3] } ]] }, layout: 'noBorders', margin: [0, 8, 0, 0] };
  }

  function metaBox(title, rows) {
    var body = [[ { text: title, color: ONBAR, bold: true, fontSize: 8, fillColor: BLUEWOOD, margin: [6, 3, 6, 3] } ]];
    rows.forEach(function (pair) {
      var v = pair[1];
      body.push([ { text: [ { text: pair[0] + ': ', bold: true, color: '#444444' }, { text: (v == null || v === '') ? '\u2014' : String(v) } ], fontSize: 9.5, margin: [6, 1, 6, 1] } ]);
    });
    return { table: { widths: ['*'], body: body }, layout: boxLayout };
  }

  // One checklist section -> [titleBar, table] or null. Collects photos.
  function sectionTable(ci, prefix, items, label, photos) {
    var rows = [];
    items.forEach(function (item) {
      var key = prefix + '_' + item.id, chk = ci.checks[key] || {};
      var r = chk.result || '';
      if (!r && !chk.typeVal && !chk.comment) return;
      var typeLabel = item.id === 'window' ? 'Window' : item.typeField;
      var itemStack = [];
      if (typeLabel && chk.typeVal) itemStack.push({ text: [ { text: typeLabel + ': ', bold: true }, chk.typeVal ], fontSize: 8, color: BERMUDA, margin: [0, 0, 0, 1] });
      itemStack.push({ text: item.label, fontSize: 9.5 });
      var rColor = r === 'Pass' ? GREEN : r === 'Fail' ? RED : '#94a3b8';
      var fill = r === 'Fail' ? '#fff5f5' : null;
      rows.push([
        { stack: itemStack, fillColor: fill },
        { text: r || '\u2014', alignment: 'center', bold: !!r, color: rColor, fontSize: 9, fillColor: fill },
        { text: chk.comment || '', fontSize: 9.5, fillColor: fill }
      ]);
      (chk.photos || []).forEach(function (src) { photos.push({ section: label, item: item.label, comment: chk.comment || '', src: src }); });
    });
    if (!rows.length) return null;
    var body = [[ { text: 'Item', style: 'th' }, { text: 'Result', style: 'th', alignment: 'center' }, { text: 'Comment', style: 'th' } ]].concat(rows);
    return [ sectionTitleBar(label), { table: { headerRows: 1, widths: ['58%', '9%', '33%'], body: body }, layout: gridLayout } ];
  }

  function buildHqsDocument(ci) {
    var photos = [], content = [];

    // ── failed-item summary data
    var fails = [];
    function collectFails(prefix, items, area) {
      items.forEach(function (it) { var c = ci.checks[prefix + '_' + it.id] || {}; if (c.result === 'Fail') fails.push({ area: area, label: it.label, comment: c.comment || '' }); });
    }
    collectFails('living_room', ROOM_ITEMS, 'Living Room');
    collectFails('kitchen', KITCHEN_ITEMS, 'Kitchen');
    (ci.bedrooms || []).forEach(function (b, i) { collectFails('bed_' + i, BEDROOM_ITEMS, b.name || ('Bedroom ' + (i + 1))); });
    (ci.baths || []).forEach(function (b, i) { collectFails('bath_' + i, BATH_ITEMS, b.name || ('Bath ' + (i + 1))); });
    (ci.rooms || []).forEach(function (r, i) { collectFails('room_' + i, ROOM_ITEMS, r.name || ('Room ' + (i + 1) + ' (RC ' + (r.code || '?') + ')')); });
    BUILDING_CHECKLIST.forEach(function (s) { collectFails(s.id, s.items, s.title); });

    var addr = (typeof formatPropertyLocation === 'function' ? formatPropertyLocation(ci.info) : '') || 'No address';
    var inspDate = ci.info.dateInspection || fmtDate(ci.created);
    var resultKey = ci.summary.result || 'Pending';
    var badgeColor = resultKey === 'Pass' ? GREEN : resultKey === 'Fail' ? RED : NEUTRAL;

    // ── header
    content.push({ columns: [
      { width: '*', stack: [
        { text: 'Housing Unit Inspection Report', bold: true, fontSize: 15, color: BLUEWOOD },
        { text: 'Based on HUD Housing Quality Standards \u2014 Variations may not reflect HUD\u2019s official form', fontSize: 8, color: '#666666', margin: [0, 2, 0, 0] }
      ] },
      { width: 'auto', stack: [
        { text: (resultKey === 'Pending' ? 'PENDING' : resultKey.toUpperCase()), bold: true, fontSize: 12, color: badgeColor, alignment: 'right' },
        { text: 'Inspected: ' + inspDate, fontSize: 9, color: '#666666', alignment: 'right', margin: [0, 3, 0, 0] }
      ] }
    ] });
    content.push({ canvas: [{ type: 'line', x1: 0, y1: 3, x2: 532, y2: 3, lineWidth: 2, lineColor: BLUEWOOD }], margin: [0, 4, 0, 8] });

    // ── meta boxes
    content.push({ columns: [
      metaBox('Property & Inspection Info', [
        ['Address', addr], ['Tenant', ci.info.tenant], ['Tenant ID', ci.info.tenantId],
        ['Inspector', ci.info.inspector], ['PHA', ci.info.pha], ['Type', ci.info.typeInspection || 'Initial'],
        ['Date of Request', ci.info.dateRequest], ['Year Built', ci.info.yearBuilt],
        ['Bedrooms', ci.info.bedrooms], ['Children <6', ci.info.children || '0'], ['Housing Type', ci.info.housingType]
      ]),
      metaBox('Owner / Property Management', [
        ['Company', ci.owner.companyName], ['Contact', ci.owner.contactName], ['Phone', ci.owner.phone],
        ['Email', ci.owner.email], ['Mailing Address', ci.owner.address]
      ])
    ], columnGap: 8, margin: [0, 0, 0, 6] });

    // ── failed-item summary
    if (fails.length) {
      content.push({ table: { widths: ['*'], body: [[ { text: 'Failed Items Requiring Correction  (' + fails.length + ' item' + (fails.length !== 1 ? 's' : '') + ' \u2014 must be resolved before unit approval)', color: 'white', bold: true, fontSize: 9, fillColor: RED, margin: [6, 3, 6, 3] } ]] }, layout: 'noBorders', margin: [0, 8, 0, 0] });
      var fbody = [[ { text: 'Area', style: 'th' }, { text: 'Item', style: 'th' }, { text: 'Comment / Deficiency Detail', style: 'th' } ]];
      fails.forEach(function (f) {
        fbody.push([
          { text: f.area, fontSize: 9.5, fillColor: '#fff5f5' },
          { text: f.label, fontSize: 9.5, fillColor: '#fff5f5' },
          f.comment ? { text: f.comment, fontSize: 9.5, fillColor: '#fff5f5' } : { text: 'No comment', italics: true, color: '#94a3b8', fontSize: 9.5, fillColor: '#fff5f5' }
        ]);
      });
      content.push({ table: { headerRows: 1, widths: ['22%', '38%', '40%'], body: fbody }, layout: gridLayout });
    }

    // ── checklist sections (same order as 3b1)
    function push(blocks) { if (blocks) blocks.forEach(function (b) { content.push(b); }); }
    push(sectionTable(ci, 'living_room', ROOM_ITEMS, 'Living Room', photos));
    push(sectionTable(ci, 'kitchen', KITCHEN_ITEMS, 'Kitchen', photos));
    (ci.bedrooms || []).forEach(function (b, i) { push(sectionTable(ci, 'bed_' + i, BEDROOM_ITEMS, 'Bedroom: ' + (b.name || ('Bedroom ' + (i + 1))), photos)); });
    (ci.baths || []).forEach(function (b, i) { push(sectionTable(ci, 'bath_' + i, BATH_ITEMS, 'Bathroom: ' + (b.name || ('Bath ' + (i + 1))), photos)); });
    (ci.rooms || []).forEach(function (r, i) {
      var code = r.code ? ('RC ' + r.code + ' \u2014 ' + (ROOM_CODES[r.code] || '')) : 'No Code';
      push(sectionTable(ci, 'room_' + i, ROOM_ITEMS, (r.name || ('Area ' + (i + 1))) + ' (' + code + ')', photos));
    });
    BUILDING_CHECKLIST.forEach(function (s) { push(sectionTable(ci, s.id, s.items, s.title, photos)); });

    // ── special amenities
    var am = ci.amenities || {}, amRows = [];
    AMENITIES.forEach(function (group) {
      var checked = group.items.filter(function (it) { return am[group.id + '_' + it.id]; }).map(function (it) { return it.label; });
      var other = am[group.id + '_other'];
      if (checked.length || other) {
        var feat = checked.join('  \u00b7  ');
        if (other) feat += (checked.length ? '  \u00b7  ' : '') + 'Other: ' + other;
        amRows.push([ { text: group.title, bold: true, fontSize: 9.5 }, { text: feat, fontSize: 9.5 } ]);
      }
    });
    if (amRows.length) {
      content.push(sectionTitleBar('Section C \u2014 Special Amenities'));
      content.push({ table: { headerRows: 1, widths: ['22%', '*'], body: [[ { text: 'Area', style: 'th' }, { text: 'Features Observed', style: 'th' } ]].concat(amRows) }, layout: gridLayout });
    }

    // ── notes + signatures page
    content.push({ text: '', pageBreak: 'before' });
    content.push({ table: { widths: ['*'], body: [
      [ { text: 'Inspector Notes', color: BLUEWOOD, bold: true, fontSize: 8.5, fillColor: MYSTIC, margin: [6, 3, 6, 3] } ],
      [ { text: ci.summary.notes || 'No notes recorded.', italics: !ci.summary.notes, color: ci.summary.notes ? '#111111' : '#94a3b8', fontSize: 10, lineHeight: 1.4, margin: [6, 8, 6, 8] } ]
    ] }, layout: boxLayout });
    content.push({ columns: [
      { width: '*', stack: [ { canvas: [{ type: 'line', x1: 0, y1: 32, x2: 230, y2: 32, lineWidth: 1, lineColor: '#111111' }] }, { text: 'Inspector Signature                                    Date', fontSize: 8.5, color: '#666666', margin: [0, 3, 0, 0] } ] },
      { width: '*', stack: [ { canvas: [{ type: 'line', x1: 0, y1: 32, x2: 230, y2: 32, lineWidth: 1, lineColor: '#111111' }] }, { text: 'Owner / Agent Signature                           Date', fontSize: 8.5, color: '#666666', margin: [0, 3, 0, 0] } ] }
    ], columnGap: 30, margin: [0, 24, 0, 0] });
    content.push({ text: [
      'Based on HUD Housing Quality Standards (HUD-52580, 4/2023) \u2014 Variations in this report may not reflect HUD\u2019s official standards\n',
      { text: 'Generated: ' + new Date().toLocaleString() + '  |  Housing Unit Inspection Tool v1.0  |  Labor Compliance Solutions  |  https://github.com/robvilla14', color: '#94a3b8' }
    ], fontSize: 8, color: '#94a3b8', margin: [0, 12, 0, 0] });

    // ── photo appendix
    if (photos.length) {
      content.push({ text: 'Photo Documentation Appendix  \u00b7  ' + addr + (ci.info.tenantId ? '  #' + ci.info.tenantId : '') + '  \u00b7  ' + photos.length + ' photo' + (photos.length !== 1 ? 's' : ''), bold: true, fontSize: 11, color: BLUEWOOD, pageBreak: 'before', margin: [0, 0, 0, 10] });
      function photoCell(p) {
        if (!p) return { width: '*', text: '' };
        var st = [ { image: p.src, fit: [240, 150] },
                   { text: p.section, bold: true, fontSize: 8, color: BERMUDA, margin: [0, 4, 0, 0] },
                   { text: p.item, fontSize: 9.5, color: BODY } ];
        if (p.comment) st.push({ text: p.comment, italics: true, fontSize: 9, color: NEUTRAL });
        return { width: '*', stack: st, margin: [0, 0, 0, 12] };
      }
      for (var i = 0; i < photos.length; i += 2) {
        content.push({ columns: [ photoCell(photos[i]), photoCell(photos[i + 1]) ], columnGap: 16 });
      }
    }

    return {
      docDefinition: {
        pageSize: 'LETTER',
        pageMargins: [40, 40, 40, 40],
        defaultStyle: { fontSize: 9.5, color: '#111111' },
        styles: { th: { fillColor: MYSTIC, color: BLUEWOOD, bold: true, fontSize: 8.5 } },
        content: content,
        footer: function (currentPage, pageCount) {
          return { text: 'Page ' + currentPage + ' of ' + pageCount, alignment: 'right', margin: [40, 0, 40, 20], fontSize: 8, color: NEUTRAL };
        }
      },
      filename: buildHqsFilename(ci)
    };
  }

  function buildHqsFilename(ci) {
    var addr = (ci.info.address || 'Inspection').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Inspection';
    var date = ci.info.dateInspection || (new Date().toISOString().slice(0, 10));
    return 'Housing_Unit_Inspection_' + addr + '_' + date + '.pdf';
  }

  window.HQSDOC = Object.freeze({ buildHqsDocument: buildHqsDocument });
})();
