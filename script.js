// ==================== CONFIGURAZIONE SUPABASE ====================
const SUPABASE_URL = 'https://xcpnfxlajgkqilahcksg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcG5meGxhamdrcWlsYWhja3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjYzMzcsImV4cCI6MjA4MTUwMjMzN30.yHq_2aYxKyB9tif1azCTPkyLYgFWQSwpM4i0eyVPbvk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== LOGIN ====================
async function effettuaLogin(e) {
    e.preventDefault();
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('❌ Inserisci email e password!');
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        alert('✅ Login effettuato con successo!');
        document.getElementById('loginPage').classList.remove('attivo');
        document.getElementById('mainApp').classList.add('attivo');

        caricaOrario();
        aggiornaListaCompiti();
        aggiornaListaAppunti();
    } catch (err) {
        console.error('Errore di login:', err.message);
        alert(`❌ Errore: ${err.message}`);
    }
}

async function effettuaLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        alert('✅ Logout effettuato!');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPage').classList.add('attivo');
    } catch (err) {
        console.error('Errore di logout:', err.message);
        alert(`❌ Errore: ${err.message}`);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const session = await supabaseClient.auth.getSession();
    if (session.data.session) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        caricaOrario();
        aggiornaListaCompiti();
        aggiornaListaAppunti();
    }
});

// ==================== SEZIONI ====================
function mostraSezione(id) {
    document.querySelectorAll('.sezione').forEach(sec => sec.classList.remove('attiva'));
    document.getElementById(id).classList.add('attiva');
}

// ==================== ORARIO ====================
async function salvaOrario(e) {
    e.preventDefault();
    const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
    const orario = {};
    giorni.forEach(giorno => {
        const testo = document.getElementById(giorno).value.trim();
        if (testo) orario[giorno] = testo;
    });

    try {
        const { error } = await supabaseClient
            .from('orario')
            .upsert({ ...orario, user_id: supabaseClient.auth.getSession().data.session.user.id });

        if (error) throw error;
        alert('✅ Orario salvato con successo!');
    } catch (err) {
        console.error('Errore di salvataggio orario:', err.message);
        alert(`❌ Errore: ${err.message}`);
    }
}

async function caricaOrario() {
    try {
        const { data, error } = await supabaseClient
            .from('orario')
            .select('*')
            .eq('user_id', supabaseClient.auth.getSession().data.session.user.id)
            .single();

        if (error) throw error;

        Object.keys(data).forEach(giorno => {
            const elemento = document.getElementById(giorno);
            if (elemento && data[giorno]) {
                elemento.value = data[giorno];
            }
        });
    } catch (err) {
        console.error('Errore nel caricamento orario:', err.message);
    }
}

// ==================== COMPITI ====================
async function aggiungiCompito(e) {
    e.preventDefault();
    const testo = document.getElementById('compito').value.trim();
    const data = document.getElementById('dataCompito').value;

    if (!testo || !data) {
        alert('❌ Inserisci tutti i campi obbligatori!');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('compiti')
            .insert({
                descrizione: testo,
                data,
                user_id: supabaseClient.auth.getSession().data.session.user.id,
            });

        if (error) throw error;

        aggiornaListaCompiti();
        alert('✅ Compito aggiunto con successo!');
    } catch (err) {
        console.error('Errore nell\'aggiunta del compito:', err.message);
        alert(`❌ Errore: ${err.message}`);
    }
}

async function aggiornaListaCompiti() {
    try {
        const { data, error } = await supabaseClient
            .from('compiti')
            .select('*')
            .eq('user_id', supabaseClient.auth.getSession().data.session.user.id);

        if (error) throw error;

        const lista = document.getElementById('listaCompiti');
        lista.innerHTML = '';

        data.forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <p class="item-testo">${c.descrizione}</p>
                    ${c.data ? `<p class="item-data">📅 ${c.data}</p>` : ''}
                </div>
                <button class="btn-elimina" onclick="eliminaCompito(${c.id})">🗑️ Elimina</button>
            `;
            lista.appendChild(li);
        });
    } catch (err) {
        console.error('Errore nel caricamento compiti:', err.message);
    }
}

async function eliminaCompito(id) {
    try {
        const { error } = await supabaseClient
            .from('compiti')
            .delete()
            .eq('id', id);

        if (error) throw error;

        aggiornaListaCompiti();
        alert('✅ Compito eliminato!');
    } catch (err) {
        console.error('Errore nella rimozione del compito:', err.message);
        alert(`❌ Errore: ${err.message}`);
    }
}

// ==================== APPUNTI ====================
async function aggiungiAppunto(e) {
    e.preventDefault();
    const materia = document.getElementById('materia').value.trim();
    const contenuto = document.getElementById('contenuto').value.trim();

    if (!materia || !contenuto) {
        alert('❌ Inserisci tutti i campi obbligatori!');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('appunti')
            .insert({
                materia,
                contenuto,
                user_id: supabaseClient.auth.getSession().data.session.user.id,
            });

        if (error) throw error;

        aggiornaListaAppunti();
        alert('✅ Appunto aggiunto con successo!');
    } catch (err) {
        console.error('Errore nell\'aggiunta dell\'appunto:', err.message);
        alert(`❌ Errore: ${err.message}`);
    }
}

async function aggiornaListaAppunti() {
    try {
        const { data, error } = await supabaseClient
            .from('appunti')
            .select('*')
            .eq('user_id', supabaseClient.auth.getSession().data.session.user.id);

        if (error) throw error;

        const lista = document.getElementById('listaAppunti');
        lista.innerHTML = '';

        data.forEach(a => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h4>${a.materia}</h4>
                <p>${a.contenuto}</p>
            `;
            lista.appendChild(li);
        });
    } catch (err) {
        console.error('Errore nel caricamento appunti:', err.message);
    }
}
