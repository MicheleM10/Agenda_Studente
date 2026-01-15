// ==================== SUPABASE CONFIG ====================
// Statico puro: l'ANON KEY sarà visibile nel browser (normale). La sicurezza è garantita da RLS.
const SUPABASE_URL = "https://xcpnfxlajgkqilahcksg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcG5meGxhamdrcWlsYWhja3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjYzMzcsImV4cCI6MjA4MTUwMjMzN30.yHq_2aYxKyB9tif1azCTPkyLYgFWQSwpM4i0eyVPbvk"; // <-- sostituisci con quella reale

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== HELPERS ====================
async function requireUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Utente non autenticato");
  return data.user;
}

function showLogin() {
  document.getElementById("loginPage").classList.add("attivo");
  document.getElementById("loginPage").classList.remove("hidden");

  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("attivo");
}

function showApp() {
  document.getElementById("loginPage").classList.remove("attivo");
  document.getElementById("loginPage").classList.add("hidden");

  document.getElementById("mainApp").classList.remove("hidden");
  document.getElementById("mainApp").classList.add("attivo");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==================== AUTH ====================
async function effettuaRegistrazione(email, password) {
  // Con email confirmation attiva, Supabase invia mail di conferma.
  // L'utente non avrà sessione attiva finché non conferma.
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    // puoi aggiungere emailRedirectTo se vuoi forzare dove atterra dopo conferma,
    // ma è opzionale se hai configurato correttamente "Site URL" su Supabase.
    // options: { emailRedirectTo: "https://TUO-DOMINIO.vercel.app" }
  });

  if (error) throw error;
}

async function effettuaLogin(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  // Caso tipico con email non confermata:
  // Supabase può restituire error tipo "Email not confirmed"
  if (error) throw error;

  // data.session esiste solo se login ok
  if (!data.session) {
    throw new Error("Login non completato. Controlla conferma email.");
  }
}

async function effettuaLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  showLogin();
}

window.effettuaLogout = effettuaLogout;

// ==================== UI SECTIONS ====================
window.mostraSezione = function mostraSezione(id) {
  document.querySelectorAll(".sezione").forEach((sec) => sec.classList.remove("attiva"));
  document.getElementById(id).classList.add("attiva");
};

// ==================== ORARIO ====================
async function salvaOrario(e) {
  e.preventDefault();
  const user = await requireUser();

  const giorni = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
  const schedule_data = {};
  for (const g of giorni) {
    schedule_data[g] = document.getElementById(g).value.trim();
  }

  const { error } = await supabaseClient
    .from("orario")
    .upsert({ user_id: user.id, schedule_data }, { onConflict: "user_id" });

  if (error) throw error;
  alert("✅ Orario salvato!");
}

async function caricaOrario() {
  const user = await requireUser();

  const { data, error } = await supabaseClient
    .from("orario")
    .select("schedule_data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  const schedule = data?.schedule_data ?? {};
  for (const [giorno, val] of Object.entries(schedule)) {
    const el = document.getElementById(giorno);
    if (el) el.value = val ?? "";
  }
}

// ==================== COMPITI ====================
async function aggiungiCompito(e) {
  e.preventDefault();
  const user = await requireUser();

  const descrizione = document.getElementById("compito").value.trim();
  const data = document.getElementById("dataCompito").value;

  if (!descrizione || !data) {
    alert("❌ Inserisci descrizione e data.");
    return;
  }

  const { error } = await supabaseClient.from("compiti").insert({
    user_id: user.id,
    descrizione,
    data,
    completed: false,
  });

  if (error) throw error;

  document.getElementById("compitiForm").reset();
  await aggiornaListaCompiti();
}

async function aggiornaListaCompiti() {
  const user = await requireUser();

  const { data, error } = await supabaseClient
    .from("compiti")
    .select("*")
    .eq("user_id", user.id)
    .order("data", { ascending: true });

  if (error) throw error;

  const lista = document.getElementById("listaCompiti");
  lista.innerHTML = "";

  data.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="item-info">
        <p class="item-testo">${c.completed ? "✅ " : ""}${escapeHtml(c.descrizione)}</p>
        <p class="item-data">📅 ${c.data}</p>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn--secondary btn--sm" data-action="toggle">${c.completed ? "Non fatto" : "Fatto"}</button>
        <button class="btn-elimina" data-action="delete">🗑️ Elimina</button>
      </div>
    `;

    li.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      await eliminaCompito(c.id);
    });

    li.querySelector('[data-action="toggle"]').addEventListener("click", async () => {
      await toggleCompito(c.id, !c.completed);
    });

    lista.appendChild(li);
  });
}

async function eliminaCompito(id) {
  const user = await requireUser();

  const { error } = await supabaseClient
    .from("compiti")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  await aggiornaListaCompiti();
}

async function toggleCompito(id, completed) {
  const user = await requireUser();

  const { error } = await supabaseClient
    .from("compiti")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  await aggiornaListaCompiti();
}

// ==================== RIPASSO ====================
async function aggiungiRipasso(e) {
  e.preventDefault();
  const user = await requireUser();

  const argomento = document.getElementById("argomento").value.trim();
  const data = document.getElementById("dataRipasso").value;
  const priorita = document.getElementById("priorita").value;

  if (!argomento || !data || !priorita) {
    alert("❌ Compila tutti i campi.");
    return;
  }

  const { error } = await supabaseClient.from("ripasso").insert({
    user_id: user.id,
    argomento,
    data,
    priorita,
    completed: false,
  });

  if (error) throw error;

  document.getElementById("ripassoForm").reset();
  await aggiornaListaRipasso();
}

async function aggiornaListaRipasso() {
  const user = await requireUser();

  const { data, error } = await supabaseClient
    .from("ripasso")
    .select("*")
    .eq("user_id", user.id)
    .order("data", { ascending: true });

  if (error) throw error;

  const lista = document.getElementById("listaRipasso");
  lista.innerHTML = "";

  data.forEach((r) => {
    const li = document.createElement("li");
    li.classList.add(`priorita-${r.priorita}`);
    li.innerHTML = `
      <div class="item-info">
        <p class="item-testo">${r.completed ? "✅ " : ""}${escapeHtml(r.argomento)}</p>
        <p class="item-data">📅 ${r.data} • Priorità: ${r.priorita}</p>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn--secondary btn--sm" data-action="toggle">${r.completed ? "Non fatto" : "Fatto"}</button>
        <button class="btn-elimina" data-action="delete">🗑️ Elimina</button>
      </div>
    `;

    li.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      await eliminaRipasso(r.id);
    });

    li.querySelector('[data-action="toggle"]').addEventListener("click", async () => {
      await toggleRipasso(r.id, !r.completed);
    });

    lista.appendChild(li);
  });
}

async function eliminaRipasso(id) {
  const user = await requireUser();

  const { error } = await supabaseClient
    .from("ripasso")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  await aggiornaListaRipasso();
}

async function toggleRipasso(id, completed) {
  const user = await requireUser();

  const { error } = await supabaseClient
    .from("ripasso")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  await aggiornaListaRipasso();
}

// ==================== APPUNTI ====================
async function aggiungiAppunto(e) {
  e.preventDefault();
  const user = await requireUser();

  const materia = document.getElementById("materia").value.trim();
  const contenuto = document.getElementById("contenuto").value.trim();

  if (!materia || !contenuto) {
    alert("❌ Inserisci materia e contenuto.");
    return;
  }

  const { error } = await supabaseClient.from("appunti").insert({
    user_id: user.id,
    materia,
    contenuto,
  });

  if (error) throw error;

  document.getElementById("appuntiForm").reset();
  await aggiornaListaAppunti();
}

async function aggiornaListaAppunti() {
  const user = await requireUser();

  const { data, error } = await supabaseClient
    .from("appunti")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const lista = document.getElementById("listaAppunti");
  lista.innerHTML = "";

  data.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="item-info">
        <h4>${escapeHtml(a.materia)}</h4>
        <p style="white-space:pre-wrap; margin:0;">${escapeHtml(a.contenuto)}</p>
      </div>
      <button class="btn-elimina" data-action="delete">🗑️ Elimina</button>
    `;

    li.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      await eliminaAppunto(a.id);
    });

    lista.appendChild(li);
  });
}

async function eliminaAppunto(id) {
  const user = await requireUser();

  const { error } = await supabaseClient
    .from("appunti")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  await aggiornaListaAppunti();
}

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", async () => {
  // Bind forms
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await effettuaLogin(email, password);
      showApp();
      await caricaOrario();
      await aggiornaListaCompiti();
      await aggiornaListaRipasso();
      await aggiornaListaAppunti();
    } catch (err) {
      alert(`❌ Errore login: ${err.message}`);
    }
  });

  document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await effettuaRegistrazione(email, password);
      alert("✅ Registrazione completata! Controlla la mail e conferma l’account, poi fai login.");
    } catch (err) {
      alert(`❌ Errore registrazione: ${err.message}`);
    }
  });

  document.getElementById("orarioForm").addEventListener("submit", async (e) => {
    try {
      await salvaOrario(e);
    } catch (err) {
      alert(`❌ Errore orario: ${err.message}`);
    }
  });

  document.getElementById("compitiForm").addEventListener("submit", async (e) => {
    try {
      await aggiungiCompito(e);
    } catch (err) {
      alert(`❌ Errore compiti: ${err.message}`);
    }
  });

  document.getElementById("ripassoForm").addEventListener("submit", async (e) => {
    try {
      await aggiungiRipasso(e);
    } catch (err) {
      alert(`❌ Errore ripasso: ${err.message}`);
    }
  });

  document.getElementById("appuntiForm").addEventListener("submit", async (e) => {
    try {
      await aggiungiAppunto(e);
    } catch (err) {
      alert(`❌ Errore appunti: ${err.message}`);
    }
  });

  // Session check
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showApp();
    await caricaOrario();
    await aggiornaListaCompiti();
    await aggiornaListaRipasso();
    await aggiornaListaAppunti();
  } else {
    showLogin();
  }

  // Auth state changes
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      showApp();
      await caricaOrario();
      await aggiornaListaCompiti();
      await aggiornaListaRipasso();
      await aggiornaListaAppunti();
    } else {
      showLogin();
    }
  });
});
