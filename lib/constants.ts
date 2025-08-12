// Centralized error messages and UI text

export const ERROR_MESSAGES = {
  // Network and API errors
  NETWORK: "Erro de rede ou servidor. Verifique sua conexão.",
  TIMEOUT: "Operação demorou muito para responder. Tente novamente.",
  API_ERROR: "Erro de comunicação com o servidor. Tente novamente.",
  
  // Validation errors
  CPF_INVALID: "CPF inválido. Por favor, verifique os dígitos.",
  CPF_REQUIRED: "CPF é obrigatório.",
  EMAIL_INVALID: "E-mail inválido.",
  EMAIL_REQUIRED: "E-mail é obrigatório.",
  
  // User-related errors
  USER_NOT_FOUND: "Erro de comunicação ao buscar CPF. Tente novamente.",
  USER_CREATE_FAILED: "Erro de comunicação ao criar usuário. Tente novamente.",
  
  // Business logic errors
  COUPONS_FETCH_ERROR: "Erro ao buscar seus cupons.",
  PAYMENT_ERROR: "Erro ao criar cobrança. Tente novamente.",
  PAGE_NOT_FOUND: "Página não encontrada.",
  MERCHANT_NOT_FOUND: "Lojista não encontrado.",
  REWARDS_FETCH_ERROR: "Erro ao buscar programas de recompensa.",
  
  // Generic errors
  UNKNOWN_ERROR: "Erro inesperado. Tente novamente.",
  UNAUTHORIZED: "Não autorizado. Faça login novamente.",
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: "Usuário criado com sucesso!",
  PAYMENT_CREATED: "Pagamento criado com sucesso!",
  DATA_LOADED: "Dados carregados com sucesso!",
} as const;

export const UI_TEXT = {
  // Form labels and placeholders
  CPF_LABEL: "CPF",
  CPF_PLACEHOLDER: "000.000.000-00",
  EMAIL_LABEL: "E-mail",
  EMAIL_PLACEHOLDER: "seu@email.com",
  
  // Buttons
  CONTINUE: "Continuar",
  LOADING: "Carregando...",
  TRY_AGAIN: "Tentar Novamente",
  BUY_NOW: "Comprar Agora",
  CANCEL: "Cancelar",
  
  // Titles and headings
  ENTER_CPF: "Informe seu CPF",
  ENTER_EMAIL: "Informe seu e-mail",
  YOUR_COUPONS: "Seus cupons ativos",
  REWARD_PROGRAMS: "Programas de Recompensa",
  PAYMENT_INFO: "Informações de Pagamento",
  
  // Status messages
  NO_COUPONS: "Você não possui cupons ativos para este lojista.",
  NO_REWARDS: "Nenhum programa de recompensa disponível.",
  CREATING_ACCOUNT: "Criando uma nova conta para o CPF",
  
  // Loading states
  LOADING_PAGE: "Carregando...",
  LOADING_COUPONS: "Carregando seus cupons...",
  LOADING_REWARDS: "Carregando programas de recompensa...",
  PROCESSING_PAYMENT: "Processando pagamento...",
} as const;

export const VALIDATION_RULES = {
  CPF: {
    MIN_LENGTH: 11,
    MAX_LENGTH: 14, // With formatting
    PATTERN: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  },
  EMAIL: {
    PATTERN: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
  },
} as const;
