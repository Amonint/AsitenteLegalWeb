// app.js
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadLabel = document.getElementById('uploadLabel');
    const uploadStatus = document.getElementById('uploadStatus');
    const documentsList = document.getElementById('documentsList');
  
    function showStatus(message, type) {
      uploadStatus.className = `mt-4 p-4 rounded-lg flex items-center ${
        type === 'success' ? 'bg-green-50 text-green-700' :
        type === 'error' ? 'bg-red-50 text-red-700' :
        'bg-blue-50 text-blue-700'
      }`;
      uploadStatus.innerHTML = `
        ${type === 'loading' ? 
          '<div class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>' :
          type === 'success' ? 
            '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' :
            '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        }
        ${message}
      `;
      uploadStatus.classList.remove('hidden');
    }
  
    // Event Listeners
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.includes('pdf')) {
        showStatus('Por favor, sube un archivo PDF', 'error');
        return;
      }
  
      uploadLabel.textContent = 'Procesando...';
      showStatus('Procesando documento...', 'loading');
  
      try {
        const result = await processLegalDocument(file);
        if (result.success) {
          showStatus(`Documento ${result.tipoDocumento} procesado exitosamente`, 'success');
        } else {
          showStatus(`Error: ${result.error}`, 'error');
        }
      } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
      } finally {
        uploadLabel.textContent = 'Arrastra un PDF o haz clic para seleccionar';
      }
    });
  
    // Escuchar cambios en Firestore
    db.collection('documentosLegales')
      .orderBy('fechaProcesamiento', 'desc')
      .onSnapshot((snapshot) => {
        documentsList.innerHTML = '';
        if (snapshot.empty) {
          documentsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
              No hay documentos procesados
            </div>
          `;
          return;
        }
  
        snapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.fechaProcesamiento ? 
            new Date(data.fechaProcesamiento.toDate()).toLocaleString() : 
            'Fecha no disponible';
          
          documentsList.innerHTML += `
            <div class="py-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 class="font-medium">${data.nombreArchivo}</h3>
              </div>
              <div class="ml-7 text-sm text-gray-500">
                <p>Tipo: ${data.tipoDocumento}</p>
                <p>Procesado: ${date}</p>
              </div>
              <div class="ml-7 mt-2">
                <a href="${data.urlDocumento}" target="_blank" 
                   class="text-sm text-blue-600 hover:text-blue-800">
                  Ver documento original
                </a>
              </div>
              <div class="ml-7 mt-2 bg-gray-50 p-4 rounded-lg">
                <pre class="text-xs overflow-auto">
                  ${JSON.stringify(data.datosEstructurados, null, 2)}
                </pre>
              </div>
            </div>
          `;
        });
      });
  });