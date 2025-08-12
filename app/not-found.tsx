"use client";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Pixman
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Sistema de Cupons Digitais
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Página não encontrada
          </h1>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            A página que você está procurando não existe ou foi removida.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Voltar
            </button>
            
            <a
              href="/"
              className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Ir para página inicial
            </a>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-1">Procurando seus cupons?</h3>
                <p className="text-blue-700 text-sm">
                  Escaneie o QR Code disponível no estabelecimento para acessar seus cupons digitais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Powered by Pixman
            </p>
            <p className="text-xs text-slate-400 mt-1">
              © 2025 - Sistema de cupons digitais
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
