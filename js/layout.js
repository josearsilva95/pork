// Sidebar HTML injetado em todas as páginas
function renderLayout(activePage) {
  const nav = [
    { href: 'dashboard.html',     icon: '📊', label: 'Dashboard'     },
    { href: 'accounts.html',      icon: '🏦', label: 'Contas'        },
    { href: 'cards.html',         icon: '💳', label: 'Cartões'       },
    { href: 'transactions.html',  icon: '↔️',  label: 'Transações'   },
    { href: 'investments.html',   icon: '📈', label: 'Investimentos' },
  ];

  const links = nav.map(n => `
    <a href="${n.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
      ${activePage === n.href ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}">
      <span>${n.icon}</span>${n.label}
    </a>`).join('');

  document.getElementById('sidebar').innerHTML = `
    <div class="flex items-center gap-3 px-6 h-16 border-b border-gray-800">
      <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">FF</div>
      <span class="font-bold text-lg">FinanceFlow</span>
    </div>
    <nav class="flex-1 p-4 space-y-1">${links}</nav>
    <div class="p-4 border-t border-gray-800">
      <button onclick="logout()" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition">
        🚪 Sair
      </button>
    </div>`;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}