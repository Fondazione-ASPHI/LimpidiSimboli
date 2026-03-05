/* js/pdfExport.js – PDF export for Limpidi Simboli
 * Dependencies: i18n.js (translateUI, setStatusKey), CDN (jspdf, html2canvas)
 * Loaded BEFORE app.js (which wires the button click)
 */

/**
 * Generate a PDF of the current symbol board.
 * Called by the #printPdfButton click handler in app.js.
 */
async function generateSymbolsPDF() {
  var resultDiv = document.getElementById('result');
  var tiles = resultDiv.querySelectorAll('.tile');

  if (tiles.length === 0) {
    alert(translateUI('pdf_print_no_tiles') || 'Nessun simbolo da stampare. Traduci prima una frase.');
    return;
  }

  setStatusKey('custom', { msg: translateUI('pdf_print_generating') || 'Generazione PDF in corso...' });

  // Temporarily hide action buttons and badges for print
  document.body.classList.add('printing-mode');
  var style = document.createElement('style');
  style.id = 'print-mode-style';
  style.textContent = [
    '.printing-mode .action-buttons-container,',
    '.printing-mode .sentence-actions,',
    '.printing-mode .remove-symbol-btn,',
    '.printing-mode .tile .badge,',
    '.printing-mode .abc-btn,',
    '.printing-mode .add-symbol-btn,',
    '.printing-mode .gpt-symbol-btn { display: none !important; }',
    '.printing-mode .sentence-box { page-break-inside: avoid; }'
  ].join('\n');
  document.head.appendChild(style);

  // Wait a moment for styles to apply
  await new Promise(function (resolve) { setTimeout(resolve, 300); });

  if (resultDiv.offsetHeight === 0 || resultDiv.offsetWidth === 0) {
    console.error('Result div has zero dimensions');
    document.body.classList.remove('printing-mode');
    var old = document.getElementById('print-mode-style');
    if (old) old.remove();
    alert('Errore: il contenuto da stampare non è visibile');
    return;
  }

  dbg('[PDF] Starting sentence-by-sentence PDF generation...');

  var sentenceBoxes = Array.from(resultDiv.children).filter(function (child) {
    return child.classList.contains('sentence-box');
  });
  dbg('[PDF] Found', sentenceBoxes.length, 'sentence boxes');

  var jsPDFLib = window.jspdf.jsPDF;
  var pdf = new jsPDFLib('p', 'mm', 'a4');
  var pdfWidth = 210;   // A4 width mm
  var pdfHeight = 297;  // A4 height mm
  var margin = 10;      // mm
  var currentY = margin;
  var isFirstBox = true;

  if (sentenceBoxes.length === 0) {
    // Fallback: no sentence boxes, capture entire div
    dbg('[PDF] No sentence boxes found, capturing entire div as fallback');
    var canvas = await html2canvas(resultDiv, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false
    });
    var imgWidth = pdfWidth;
    var imgHeight = (canvas.height * pdfWidth) / canvas.width;
    var imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    for (var i = 0; i < sentenceBoxes.length; i++) {
      var box = sentenceBoxes[i];
      dbg('[PDF] Processing sentence box ' + (i + 1) + '/' + sentenceBoxes.length);

      try {
        var canvas = await html2canvas(box, {
          scale: 2, useCORS: true, allowTaint: true,
          backgroundColor: window.getComputedStyle(box).backgroundColor || '#ffffff',
          logging: false
        });

        var boxImgWidth = pdfWidth - (2 * margin);
        var boxImgHeight = (canvas.height * boxImgWidth) / canvas.width;

        dbg('[PDF] Box ' + (i + 1) + ': canvas=' + canvas.width + 'x' + canvas.height +
          ', pdf=' + boxImgWidth.toFixed(2) + 'x' + boxImgHeight.toFixed(2) + 'mm, currentY=' + currentY.toFixed(2) + 'mm');

        // Check if we need a new page
        if (!isFirstBox && (currentY + boxImgHeight) > (pdfHeight - margin)) {
          dbg('[PDF] Adding new page');
          pdf.addPage();
          currentY = margin;
        }

        var imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, currentY, boxImgWidth, boxImgHeight);

        currentY += boxImgHeight + 5; // 5mm spacing between boxes
        isFirstBox = false;

      } catch (err) {
        console.error('[PDF] Error processing sentence box ' + (i + 1) + ':', err);
      }
    }
  }

  dbg('[PDF] Saving PDF...');
  pdf.save('simboli-' + new Date().toISOString().slice(0, 10) + '.pdf');

  document.body.classList.remove('printing-mode');
  var printStyle = document.getElementById('print-mode-style');
  if (printStyle) printStyle.remove();

  setStatusKey('custom', { msg: translateUI('pdf_print_success') || 'PDF generato con successo' });
}
