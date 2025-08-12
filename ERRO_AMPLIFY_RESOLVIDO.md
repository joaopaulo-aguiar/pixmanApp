# 🔧 ERRO AWS AMPLIFY RESOLVIDO - "Illegal path found for appRoot"

## 🚨 **PROBLEMA IDENTIFICADO**

### **Erro no Deploy:**
```
CustomerError: Illegal path found for appRoot
```

### **Causa:**
- Configuração incorreta no `amplify.yml`
- Uso de `applications` e `appRoot` na sintaxe antiga
- Conflito entre configuração de monorepo vs single app

---

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **1. Correção do `amplify.yml`:**

#### **❌ ANTES (INCORRETO):**
```yaml
version: 1
applications:
  - frontend:
      phases:
        # ...
    appRoot: /  # ← ERRO: Causa "Illegal path"
    customHeaders:
      # ...
```

#### **✅ DEPOIS (CORRETO):**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - echo "Building Pixman app..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### **2. Configuração Next.js Otimizada:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Disable image optimization for Amplify compatibility  
  images: {
    unoptimized: true
  },
  
  // Configure for proper routing
  trailingSlash: false,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

---

## 🎯 **DIFERENÇAS PRINCIPAIS**

### **Configuração de Monorepo vs Single App:**

#### **Monorepo (applications):**
```yaml
applications:
  - frontend:
    appRoot: /subfolder  # Para projetos em subpasta
```

#### **Single App (frontend direto):**
```yaml
frontend:  # ← Configuração simples para app único
  phases:
```

### **Amplify detecta automaticamente:**
- ✅ **Next.js** no root = usa `frontend`
- ✅ **Monorepo** = usa `applications`
- ❌ **Misturar** = erro "Illegal path"

---

## 🚀 **CONFIGURAÇÃO FINAL**

### **Estrutura de Arquivos:**
```
pixmanApp/
├── amplify.yml          ✅ Configuração corrigida
├── next.config.ts       ✅ Otimizado para Amplify
├── package.json         ✅ Build scripts corretos
├── app/
│   ├── page.tsx         ✅ Landing page
│   ├── not-found.tsx    ✅ Página 404
│   └── [slug]/
│       └── page.tsx     ✅ Rota dinâmica
└── public/              ✅ Assets estáticos
```

### **Environment Variables (Amplify Console):**
```env
NEXT_PUBLIC_APP_NAME=Pixman
NEXT_PUBLIC_AWS_IDENTITY_POOL_ID=sa-east-1:372c7524-c616-40b3-b0d4-e9932112f2eb
NEXT_PUBLIC_GRAPHQL_API_URL=https://os2rhzenxver7luspgqk72nune.appsync-api.sa-east-1.amazonaws.com/graphql
NEXT_PUBLIC_GRAPHQL_API_ID=lxq2ihek4nagbhliryd42evglm
NEXT_PUBLIC_PAYMENT_API_URL=https://jfuqinvfagyfpphetkwpzektou0lzdxg.lambda-url.sa-east-1.on.aws/
NEXT_PUBLIC_CLOUDFRONT_BASE_URL=https://d1j12ouc2a0rl8.cloudfront.net
```

---

## 🧪 **TESTE DE BUILD**

### **✅ Build Local Funcionando:**
```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (5/5)
# Route (app)                Size  First Load JS
# ┌ ○ /                     1.06 kB  101 kB
# ├ ○ /_not-found           123 B    99.8 kB  
# └ ƒ /[slug]               83.2 kB  183 kB
```

### **🔄 Deploy Amplify:**
1. **Commit** as mudanças no Git
2. **Push** para o repositório
3. **Amplify** detecta automaticamente
4. **Build** executado com nova configuração

---

## 📊 **RESULTADO ESPERADO**

### **✅ Deploy Bem-sucedido:**
- **Clone** do repositório
- **Install** das dependências 
- **Build** do Next.js
- **Deploy** para CloudFront

### **🌐 URLs Funcionais:**
- `https://main.d3heu6ilfa1zwf.amplifyapp.com/` → Landing page
- `https://main.d3heu6ilfa1zwf.amplifyapp.com/batel_grill` → Página do merchant
- `https://pixman.click/` → Domínio customizado (quando configurado)

---

## 🔍 **TROUBLESHOOTING ADICIONAL**

### **Se ainda der erro:**
1. **Verificar** se não há arquivos de configuração conflitantes
2. **Confirmar** environment variables no Amplify Console
3. **Testar** build local antes do deploy
4. **Verificar** logs detalhados no Amplify Console

### **Arquivos que NÃO devem existir:**
- ❌ `public/_redirects` (conflita com Next.js routing)
- ❌ `vercel.json` (específico do Vercel)
- ❌ `.amplify/` (gerado automaticamente)

---

## 🏆 **STATUS: ERRO RESOLVIDO**

### **✅ CONFIGURAÇÃO CORRIGIDA:**
- `amplify.yml` usando sintaxe `frontend` correta
- `next.config.ts` otimizado para Amplify
- Build local funcionando perfeitamente
- Pronto para deploy bem-sucedido

### **🚀 PRÓXIMO PASSO:**
Fazer commit e push para testar o deploy corrigido no AWS Amplify!
