// Cliente Supabase — variavel global "db"
var db = supabase.createClient(
  'https://onpqygajdhkelpmhvltx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucHF5Z2FqZGhrZWxwbWh2bHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDQ4NzIsImV4cCI6MjA5NjMyMDg3Mn0.ZZ2KEcdf6SzRUH9r1Fa94YBa6FcytlWEsHxvR3OfCMQ'
);

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

async function requireAuth() {
  var res = await db.auth.getSession();
  var session = res.data.session;
  if (!session) window.location.href = 'login.html';
  return session;
}