/* js/cropEditor.js – Image crop editor for Limpidi Simboli
 * Dependencies: utils.js (localFileHandleMap), i18n.js (translateUI),
 *               storage.js (saveImageToLocalFolder)
 * Loaded BEFORE tiles.js (which calls openCropEditor from action buttons)
 */

// Funzione per aprire l'editor di ritaglio immagine
function openCropEditor(imageDataUrl, word, tile) {
  const overlay = document.createElement('div');
  overlay.className = 'crop-overlay';

  const title = document.createElement('h2');
  title.textContent = translateUI('cropEditorTitle');
  title.className = 'crop-title';

  const instruction = document.createElement('p');
  instruction.textContent = translateUI('cropInstruction');
  instruction.className = 'crop-instruction';

  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'crop-canvas-container';

  const canvas = document.createElement('canvas');
  canvas.className = 'crop-canvas';

  const ctx = canvas.getContext('2d');

  // Variabili per la selezione
  var isDrawing = false;
  var startX, startY, currentX, currentY;

  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    canvas.onmousedown = function (e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      startX = (e.clientX - rect.left) * scaleX;
      startY = (e.clientY - rect.top) * scaleY;
      isDrawing = true;
    };

    canvas.onmousemove = function (e) {
      if (!isDrawing) return;
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      currentX = (e.clientX - rect.left) * scaleX;
      currentY = (e.clientY - rect.top) * scaleY;

      // Ridisegna l'immagine e il rettangolo di selezione
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Disegna overlay scuro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cancella l'area selezionata (mostra l'immagine originale)
      var x = Math.min(startX, currentX);
      var y = Math.min(startY, currentY);
      var w = Math.abs(currentX - startX);
      var h = Math.abs(currentY - startY);
      ctx.clearRect(x, y, w, h);
      ctx.drawImage(img, x, y, w, h, x, y, w, h);

      // Disegna il bordo della selezione
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
    };

    canvas.onmouseup = function () {
      isDrawing = false;
    };
  };
  img.src = imageDataUrl;

  var btnContainer = document.createElement('div');
  btnContainer.className = 'crop-btn-container';

  var cropBtn = document.createElement('button');
  cropBtn.textContent = translateUI('cropAndSave');
  cropBtn.className = 'button crop-confirm-btn';

  var cancelBtn = document.createElement('button');
  cancelBtn.textContent = translateUI('cancel');
  cancelBtn.className = 'button ghost crop-cancel-btn';

  cropBtn.onclick = async function () {
    if (!currentX || !currentY) {
      alert(translateUI('selectCropArea'));
      return;
    }

    cropBtn.disabled = true;
    cropBtn.textContent = translateUI('croppingInProgress');

    var x = Math.min(startX, currentX);
    var y = Math.min(startY, currentY);
    var w = Math.abs(currentX - startX);
    var h = Math.abs(currentY - startY);

    if (w < 10 || h < 10) {
      alert(translateUI('cropAreaTooSmall'));
      cropBtn.disabled = false;
      cropBtn.textContent = translateUI('cropAndSave');
      return;
    }

    // Crea un nuovo canvas con l'area ritagliata
    var croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = w;
    croppedCanvas.height = h;
    var croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(img, x, y, w, h, 0, 0, w, h);

    // Converti in data URL
    var croppedDataUrl = croppedCanvas.toDataURL('image/png');

    try {
      // Salva l'immagine ritagliata
      var fileHandle = await saveImageToLocalFolder(croppedDataUrl, word);

      dbg('[Crop] Saved cropped image for:', word);

      // Aggiorna il tile
      var uniqueId = 'local-file::' + fileHandle.name;
      localFileHandleMap.set(uniqueId, fileHandle);

      var ids = JSON.parse(tile.dataset.ids || '[]');
      var newLocalFile = {
        type: 'local-file',
        id: uniqueId,
        fileName: fileHandle.name,
        word: word
      };

      ids.unshift(newLocalFile);
      tile.dataset.ids = JSON.stringify(ids);
      tile.dataset.index = '0';

      var tileImg = tile.querySelector('img');
      if (!tileImg) {
        tileImg = document.createElement('img');
        var wordLabel = tile.querySelector('.word');
        if (wordLabel) {
          tile.insertBefore(tileImg, wordLabel);
        } else {
          tile.insertBefore(tileImg, tile.firstChild);
        }
      }

      var file = await fileHandle.getFile();
      var dataUrl = await new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function (e) { resolve(e.target.result); };
        reader.readAsDataURL(file);
      });
      tileImg.src = dataUrl;
      tileImg.alt = 'Simbolo ritagliato per "' + word + '"';

      // Rimuovi eventuale messaggio "nessun pittogramma"
      var miss = tile.querySelector('.miss');
      if (miss) miss.remove();

      document.body.removeChild(overlay);

    } catch (error) {
      console.error('[Crop] Failed to save:', error);
      alert(error.message || translateUI('imageSaveError'));
      cropBtn.disabled = false;
      cropBtn.textContent = translateUI('cropAndSave');
    }
  };

  cancelBtn.onclick = function () {
    document.body.removeChild(overlay);
  };

  btnContainer.appendChild(cropBtn);
  btnContainer.appendChild(cancelBtn);

  canvasContainer.appendChild(canvas);

  overlay.appendChild(title);
  overlay.appendChild(instruction);
  overlay.appendChild(canvasContainer);
  overlay.appendChild(btnContainer);

  document.body.appendChild(overlay);
}
