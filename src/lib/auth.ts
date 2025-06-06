import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function continueAsGuest(email: string) {
  // Use the deployed domain for email redirects
  const redirectUrl = window.location.hostname === 'localhost' 
    ? window.location.origin + '/create'
    : 'https://friendly-melomakarona-419814.netlify.app/create';

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    }
  });
  
  if (error) throw error;
  return data;
}

export async function resetPassword(email: string) {
  // Use the deployed domain for password reset redirects
  const redirectUrl = window.location.hostname === 'localhost'
    ? window.location.origin + '/reset-password'
    : 'https://friendly-melomakarona-419814.netlify.app/reset-password';

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
}