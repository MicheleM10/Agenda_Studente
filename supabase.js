// ============================================
// SUPABASE CONFIGURATION FOR MicheleM10
// ============================================

const SUPABASE_URL = 'https://[your-supabase-url].supabase.co';
const SUPABASE_ANON_KEY = '[your-anon-key]';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - Display name for the user
 * @returns {Promise<Object>} - Supabase auth response
 */
async function signUp(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username
            }
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Sign in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Supabase auth response
 */
async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) throw error;
    return data;
}

/**
 * Get the current logged-in user
 * @returns {Promise<Object|null>} - Current user or null
 */
async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}

// Other schedule/task management functions can be added as necessary