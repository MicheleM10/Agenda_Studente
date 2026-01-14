// ============================================
// SUPABASE BACKEND LOGIC FOR MicheleM10
// ============================================

const SUPABASE_URL = 'https://xcpnfxlajgkqilahcksg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcG5meGxhamdrcWlsYWhja3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjYzMzcsImV4cCI6MjA4MTUwMjMzN30.yHq_2aYxKyB9tif1azCTPkyLYgFWQSwpM4i0eyVPbvk';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Registers a new user
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @returns {Promise<Object>}
 */
async function registerUser(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username }
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Logs in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Authenticated user data
 */
async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) throw error;
    return data;
}

/**
 * Gets the current session
 * @returns {Promise<Object|null>}
 */
async function getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return session;
}

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
async function logoutUser() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}

// ============================================
// ORARIO FUNCTIONS
// ============================================

/**
 * Fetch schedule for the logged-in user
 * @returns {Promise<Object>}
 */
async function fetchSchedule() {
    const { data, error } = await supabaseClient
        .from('orario')
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Save or update a schedule
 * @param {Object} scheduleData
 * @returns {Promise<Object>}
 */
async function saveSchedule(scheduleData) {
    const { data, error } = await supabaseClient
        .from('orario')
        .upsert(scheduleData, { onConflict: ['user_id'] })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// COMPITI FUNCTIONS
// ============================================

/**
 * Fetch tasks for the logged-in user
 * @returns {Promise<Array>}
 */
async function fetchTasks() {
    const { data, error } = await supabaseClient
        .from('compiti')
        .select();

    if (error) throw error;
    return data;
}

/**
 * Add a new task
 * @param {Object} taskData
 * @returns {Promise<Object>}
 */
async function addTask(taskData) {
    const { data, error } = await supabaseClient
        .from('compiti')
        .insert(taskData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a task
 * @param {string} taskId
 * @param {Object} updatedData
 * @returns {Promise<Object>}
 */
async function updateTask(taskId, updatedData) {
    const { data, error } = await supabaseClient
        .from('compiti')
        .update(updatedData)
        .match({ id: taskId })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a task
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
    const { error } = await supabaseClient
        .from('compiti')
        .delete()
        .match({ id: taskId });

    if (error) throw error;
}

// ============================================
// APPUNTI (NOTES) FUNCTIONS
// ============================================

/**
 * Fetch all notes for the logged-in user
 * @returns {Promise<Array>}
 */
async function fetchNotes() {
    const { data, error } = await supabaseClient
        .from('appunti')
        .select();

    if (error) throw error;
    return data;
}

/**
 * Add a new note
 * @param {Object} noteData
 * @returns {Promise<Object>}
 */
async function addNote(noteData) {
    const { data, error } = await supabaseClient
        .from('appunti')
        .insert(noteData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a note
 * @param {string} noteId
 * @param {Object} updatedData
 * @returns {Promise<Object>}
 */
async function updateNote(noteId, updatedData) {
    const { data, error } = await supabaseClient
        .from('appunti')
        .update(updatedData)
        .match({ id: noteId })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a note
 * @param {string} noteId
 * @returns {Promise<void>}
 */
async function deleteNote(noteId) {
    const { error } = await supabaseClient
        .from('appunti')
        .delete()
        .match({ id: noteId });

    if (error) throw error;
}
