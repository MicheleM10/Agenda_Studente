// ==================== LOGIN ====================
function effettuaLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username && password) {
        localStorage.setItem('utenteLoggato', JSON.stringify({ username, timestamp: new Date().getTime() }));
        document.getElementById('loginPage').classList.remove('attivo');
        document.getElementById('mainApp').classList.add('attivo');
        
        caricaOrario();
        aggiornaListaCompiti();
        aggiornaListaRipassi();
        aggiornaListaAppunti();
    } else {
        alert('❌ Inserisci username e password!');
    }
}

function effettuaLogout() {
    if (confirm('Vuoi veramente uscire?')) {
        localStorage.removeItem('utenteLoggato');
        document.getElementById('mainApp').classList.remove('attivo');
        document.getElementById('loginPage').classList.add('attivo');
        document.getElementById('loginForm').reset();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const utenteLoggato = JSON.parse(localStorage.getItem('utenteLoggato'));
    if (utenteLoggato) {
        document.getElementById('loginPage').classList.remove('attivo');
        document.getElementById('mainApp').classList.add('attivo');
        caricaOrario();
        aggiornaListaCompiti();
        aggiornaListaRipassi();
        aggiornaListaAppunti();
    }
});

// ==================== SEZIONI ====================
function mostraSezione(id) {
    document.querySelectorAll('.sezione').forEach(sec => sec.classList.remove('attiva'));
    document.getElementById(id).classList.add('attiva');
}

// ==================== ORARIO ====================
function salvaOrario(e) {
    if (e) e.preventDefault();
    const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
    const orario = {};
    giorni.forEach(giorno => {
        const testo = document.getElementById(giorno).value.trim();
        if (testo) orario[giorno] = testo;
    });
    localStorage.setItem('orario', JSON.stringify(orario));
    alert('✓ Orario salvato con successo!');
}

function caricaOrario() {
    const orario = JSON.parse(localStorage.getItem('orario')) || {};
    Object.keys(orario).forEach(giorno => {
        const elemento = document.getElementById(giorno);
        if (elemento) elemento.value = orario[giorno];
    });
}

// ==================== COMPITI ====================
let compiti = JSON.parse(localStorage.getItem('compiti')) || [];

function aggiungiCompito(e) {
    e.preventDefault();
    const testo = document.getElementById('compito').value.trim();
    const data = document.getElementById('dataCompito').value;
    if (testo) {
        compiti.push({ testo, data, id: Date.now() });
        document.getElementById('compito').value = '';
        document.getElementById('dataCompito').value = '';
        salvaCompiti();
    }
}

function eliminaCompito(id) {
    if (confirm('Eliminare questo compito?')) {
        compiti = compiti.filter(c => c.id !== id);
        salvaCompiti();
    }
}

function salvaCompiti() {
    localStorage.setItem('compiti', JSON.stringify(compiti));
    aggiornaListaCompiti();
}

function aggiornaListaCompiti() {
    const lista = document.getElementById('listaCompiti');
    lista.innerHTML = '';
    compiti.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <p class="item-testo">${c.testo}</p>
                ${c.data ? `<p class="item-data">📅 ${c.data}</p>` : ''}
            </div>
            <button class="btn-elimina" onclick="eliminaCompito(${c.id})">🗑️ Elimina</button>
        `;
        lista.appendChild(li);
    });
}

// ==================== RIPASSO ====================
let ripassi = JSON.parse(localStorage.getItem('ripassi')) || [];

function aggiungiRipasso(e) {
    e.preventDefault();
    const argomento = document.getElementById('argomento').value.trim();
    const data = document.getElementById('dataRipasso').value;
    const priorita = document.getElementById('priorita').value;
    if (argomento && priorita) {
        ripassi.push({ argomento, data, priorita, id: Date.now() });
        document.getElementById('argomento').value = '';
        document.getElementById('dataRipasso').value = '';
        document.getElementById('priorita').value = '';
        salvaRipassi();
    }
}

function eliminaRipasso(id) {
    if (confirm('Eliminare questo argomento?')) {
        ripassi = ripassi.filter(r => r.id !== id);
        salvaRipassi();
    }
}

function salvaRipassi() {
    localStorage.setItem('ripassi', JSON.stringify(ripassi));
    aggiornaListaRipassi();
}

function aggiornaListaRipassi() {
    const lista = document.getElementById('listaRipasso');
    lista.innerHTML = '';
    ripassi.forEach(r => {
        const li = document.createElement('li');
        li.className = `priorita-${r.priorita}`;
        const prioritaEmoji = r.priorita === 'alta' ? '🔴' : r.priorita === 'media' ? '🟡' : '🟢';
        li.innerHTML = `
            <div class="item-info">
                <p class="item-testo">${prioritaEmoji} ${r.argomento}</p>
                ${r.data ? `<p class="item-data">📅 ${r.data}</p>` : ''}
            </div>
            <button class="btn-elimina" onclick="eliminaRipasso(${r.id})">🗑️ Elimina</button>
        `;
        lista.appendChild(li);
    });
}

// ==================== APPUNTI CON CARICAMENTO FILE ====================
let appunti = JSON.parse(localStorage.getItem('appunti')) || [];

function aggiungiAppunto(e) {
    e.preventDefault();
    const materia = document.getElementById('materia').value.trim();
    const dataAppunto = document.getElementById('dataAppunto').value;
    const testoAppunto = document.getElementById('testoAppunto').value.trim();
    const fileInput = document.getElementById('fileAppunto');
    
    if (materia && dataAppunto && testoAppunto) {
        const file = fileInput.files[0];
        const appunto = {
            id: Date.now(),
            materia,
            dataAppunto,
            testo: testoAppunto,
            file: null,
            nomeFile: null
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                appunto.file = event.target.result;
                appunto.nomeFile = file.name;
                appunti.push(appunto);
                salvaAppunti();
                pulisciFormAppunti();
            };
            reader.readAsDataURL(file);
        } else {
            appunti.push(appunto);
            salvaAppunti();
            pulisciFormAppunti();
        }
    } else {
        alert('❌ Completa tutti i campi obbligatori!');
    }
}

function pulisciFormAppunti() {
    document.getElementById('materia').value = '';
    document.getElementById('dataAppunto').value = '';
    document.getElementById('testoAppunto').value = '';
    document.getElementById('fileAppunto').value = '';
}

function eliminaAppunto(id) {
    if (confirm('Eliminare questo appunto?')) {
        appunti = appunti.filter(a => a.id !== id);
        salvaAppunti();
    }
}

function salvaAppunti() {
    localStorage.setItem('appunti', JSON.stringify(appunti));
    aggiornaListaAppunti();
}

function aggiornaListaAppunti() {
    const lista = document.getElementById('listaAppunti');
    lista.innerHTML = '';
    
    if (appunti.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">📝 Nessun appunto ancora</p>';
        return;
    }

    appunti.forEach(a => {
        const div = document.createElement('div');
        div.className = 'appunto-card';
        
        const data = new Date(a.dataAppunto).toLocaleDateString('it-IT', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let fileHtml = '';
        if (a.file && a.nomeFile) {
            fileHtml = `<p class="appunto-file">📎 File: <strong>${a.nomeFile}</strong></p>`;
        }
        
        div.innerHTML = `
            <h4>${a.materia} - ${data}</h4>
            <p>${a.testo}</p>
            ${fileHtml}
            <div class="appunto-actions">
                ${a.file ? `<button class="btn btn--secondary btn--sm" onclick="scaricaFileAppunto(${a.id})">📥 Scarica File</button>` : ''}
                <button class="btn-elimina" onclick="eliminaAppunto(${a.id})">🗑️ Elimina</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

function scaricaFileAppunto(id) {
    const appunto = appunti.find(a => a.id === id);
    if (appunto && appunto.file) {
        const link = document.createElement('a');
        link.href = appunto.file;
        link.download = appunto.nomeFile || `appunto_${id}`;
        link.click();
    }
}

// ==================== GENERAZIONE PDF PER MATERIA ====================
function scaricaPDF() {
    if (appunti.length === 0) {
        alert('❌ Nessun appunto da esportare!');
        return;
    }

    // Raggruppa appunti per materia
    const appuntiPerMateria = {};
    appunti.forEach(a => {
        if (!appuntiPerMateria[a.materia]) {
            appuntiPerMateria[a.materia] = [];
        }
        appuntiPerMateria[a.materia].push(a);
    });

    // Ordina per data
    Object.keys(appuntiPerMateria).forEach(materia => {
        appuntiPerMateria[materia].sort((a, b) => new Date(a.dataAppunto) - new Date(b.dataAppunto));
    });

    // Crea un PDF per ogni materia
    Object.keys(appuntiPerMateria).forEach((materia, index) => {
        setTimeout(() => {
            generaPDFPerMateria(materia, appuntiPerMateria[materia]);
        }, index * 1000);
    });
}

function generaPDFPerMateria(materia, appuntiMateria) {
    const element = document.createElement('div');
    element.style.padding = '30px';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '14px';

    // Intestazione principale
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '30px';
    header.style.borderBottom = '3px solid #218894';
    header.style.paddingBottom = '20px';

    const title = document.createElement('h1');
    title.textContent = `📚 ${materia}`;
    title.style.margin = '0 0 10px 0';
    title.style.color = '#218894';
    title.style.fontSize = '28px';
    header.appendChild(title);

    const dataStampa = new Date().toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    
    const timeStampa = new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const dataElement = document.createElement('p');
    dataElement.textContent = `Generato il: ${dataStampa} - ${timeStampa}`;
    dataElement.style.margin = '0';
    dataElement.style.fontSize = '12px';
    dataElement.style.color = '#666666';
    header.appendChild(dataElement);
    
    element.appendChild(header);

    // Contenuto appunti raggruppati per data
    let dataCorrente = null;
    let primoElemento = true;

    appuntiMateria.forEach((a) => {
        const data = new Date(a.dataAppunto).toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Inserisci separatore di data se è diversa
        if (data !== dataCorrente) {
            if (!primoElemento) {
                const separator = document.createElement('hr');
                separator.style.margin = '25px 0';
                separator.style.border = 'none';
                separator.style.borderTop = '1px solid #dddddd';
                element.appendChild(separator);
            }
            
            const dataTitle = document.createElement('h2');
            dataTitle.textContent = `📅 ${data}`;
            dataTitle.style.color = '#218894';
            dataTitle.style.marginTop = '0';
            dataTitle.style.marginBottom = '15px';
            dataTitle.style.fontSize = '18px';
            dataTitle.style.borderBottom = '2px solid #e0e0e0';
            dataTitle.style.paddingBottom = '10px';
            element.appendChild(dataTitle);
            dataCorrente = data;
            primoElemento = false;
        }

        // Testo appunto
        const testoDiv = document.createElement('div');
        testoDiv.style.marginBottom = '20px';
        testoDiv.style.padding = '15px';
        testoDiv.style.backgroundColor = '#f9f9f9';
        testoDiv.style.borderLeft = '5px solid #218894';
        testoDiv.style.borderRadius = '4px';
        
        const testoP = document.createElement('p');
        testoP.textContent = a.testo;
        testoP.style.margin = '0';
        testoP.style.whiteSpace = 'pre-wrap';
        testoP.style.wordWrap = 'break-word';
        testoP.style.lineHeight = '1.6';
        testoP.style.color = '#333333';
        testoDiv.appendChild(testoP);

        if (a.nomeFile) {
            const fileInfo = document.createElement('p');
            fileInfo.textContent = `📎 File allegato: ${a.nomeFile}`;
            fileInfo.style.fontSize = '11px';
            fileInfo.style.color = '#999999';
            fileInfo.style.marginTop = '10px';
            fileInfo.style.marginBottom = '0';
            fileInfo.style.fontStyle = 'italic';
            testoDiv.appendChild(fileInfo);
        }

        element.appendChild(testoDiv);
    });

    // Piè di pagina
    const footer = document.createElement('div');
    footer.style.marginTop = '40px';
    footer.style.paddingTop = '20px';
    footer.style.borderTop = '1px solid #dddddd';
    footer.style.textAlign = 'center';
    footer.style.fontSize = '11px';
    footer.style.color = '#999999';
    footer.innerHTML = `<p style="margin: 0;">Appunti scolastici - ${materia}<br>Generato automaticamente dalla piattaforma Agenda Scolastica</p>`;
    element.appendChild(footer);

    // Configurazioni PDF
    const opt = {
        margin: 15,
        filename: `Appunti_${materia.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Genera PDF
    html2pdf().set(opt).from(element).save().then(() => {
        console.log(`PDF generato per ${materia}`);
    }).catch(err => {
        console.error('Errore nella generazione PDF:', err);
        alert('❌ Errore nella generazione del PDF');
    });
}

// Inizializza al caricamento
window.addEventListener('load', () => {
    aggiornaListaAppunti();
});