// Traduit les messages d'erreur courants (Supabase / réseau, en anglais) en français.
// Message inconnu : renvoyé tel quel.
const RULES = [
  [/failed to fetch|networkerror|network request failed|load failed/i, 'Connexion au serveur impossible. Vérifie ta connexion internet.'],
  [/invalid login credentials/i, 'Identifiants invalides.'],
  [/email not confirmed/i, "Adresse email non confirmée."],
  [/rate limit|too many requests|only request this after/i, 'Trop de tentatives. Patiente quelques instants avant de réessayer.'],
  [/should be different from the old password/i, "Le nouveau mot de passe doit être différent de l'ancien."],
  [/password should be at least/i, 'Mot de passe trop court.'],
  [/weak password|password is known to be weak/i, 'Mot de passe trop faible : choisis-en un plus robuste.'],
  [/jwt expired|session.*(expired|missing)|not authenticated/i, 'Session expirée : reconnecte-toi.'],
  [/permission denied|row-level security/i, "Action non autorisée pour ce compte."],
];

export function frError(err) {
  const msg = typeof err === 'string' ? err : err?.message || '';
  if (!msg) return 'Une erreur inattendue est survenue.';
  const hit = RULES.find(([re]) => re.test(msg));
  return hit ? hit[1] : msg;
}
