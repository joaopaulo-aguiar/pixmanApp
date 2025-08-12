# 🚀 Configuração AWS Amplify - Pixman Deploy

## ✅ **PROBLEMAS IDENTIFICADOS E CORRIGIDOS**

### 🚨 **Problema Principal:**
- **Página 404**: `https://main.d3heu6ilfa1zwf.amplifyapp.com/batel_grill`
- **Causa**: Redirecionamento incorreto e configuração de deploy

---

## 🔧 **CORREÇÕES IMPLEMENTADAS**

### 1. **📄 Página Principal Corrigida**
#### **Antes (ERRO):**
```tsx
// ❌ Redirecionando para slug antigo
window.location.replace("/tevora_digital");
```

#### **Depois (CORRETO):**
```tsx
// ✅ Redirecionando para slug válido
window.location.replace("/batel_grill");
```

### 2. **⚙️ Next.js Config para Amplify**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Disable image optimization for Amplify compatibility  
  images: {
    unoptimized: true
  },
  
  // Configure for proper routing
  trailingSlash: false,
};
```

### 3. **🏗️ Amplify Build Configuration**
```yaml
# amplify.yml
version: 1
applications:
  - frontend:
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

### 4. **🔄 Redirects Configuration**
```json
// public/_redirects
[
  {
    "source": "/<*>",
    "target": "/index.html", 
    "status": "200",
    "condition": null
  }
]
```

---

## 🌐 **CONFIGURAÇÃO DO DOMÍNIO PIXMAN.CLICK**

### **No AWS Amplify Console:**

#### **1. Domain Management:**
- Acesse: AWS Amplify Console > App > Domain Management
- Clique em **"Add domain"**
- Digite: `pixman.click`
- Configure subdomain: `www.pixman.click` (opcional)

#### **2. DNS Configuration:**
Após adicionar o domínio, o Amplify fornecerá registros DNS:
```
Type: CNAME
Name: pixman.click
Value: d3heu6ilfa1zwf.amplifyapp.com
```

#### **3. SSL Certificate:**
- SSL será automaticamente provisionado pelo AWS
- Aguardar validação (pode levar até 24 horas)

### **No Provedor do Domínio (pixman.click):**
1. **Acesse o painel DNS** do registrador do domínio
2. **Adicione os registros CNAME** fornecidos pelo Amplify
3. **Aguarde propagação** (normalmente 1-24 horas)

---

## 🔑 **VARIÁVEIS DE AMBIENTE NO AMPLIFY**

### **No AWS Amplify Console:**
1. **Acesse**: App Settings > Environment Variables
2. **Adicione as variáveis**:

```env
NEXT_PUBLIC_APP_NAME=Pixman
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_AWS_IDENTITY_POOL_ID=sa-east-1:372c7524-c616-40b3-b0d4-e9932112f2eb
NEXT_PUBLIC_GRAPHQL_API_URL=https://os2rhzenxver7luspgqk72nune.appsync-api.sa-east-1.amazonaws.com/graphql
NEXT_PUBLIC_GRAPHQL_API_ID=lxq2ihek4nagbhliryd42evglm
NEXT_PUBLIC_PAYMENT_API_URL=https://jfuqinvfagyfpphetkwpzektou0lzdxg.lambda-url.sa-east-1.on.aws/
NEXT_PUBLIC_CLOUDFRONT_BASE_URL=https://d1j12ouc2a0rl8.cloudfront.net
```

---

## 🧪 **TESTE APÓS DEPLOY**

### **URLs para Testar:**
1. **Amplify URL**: `https://main.d3heu6ilfa1zwf.amplifyapp.com/batel_grill`
2. **Domínio Customizado**: `https://pixman.click/batel_grill` (após configuração)

### **Checklist de Teste:**
- [ ] Página inicial carrega sem erro 404
- [ ] Rota `/batel_grill` funciona
- [ ] CPF form aparece corretamente
- [ ] Consultas GraphQL funcionam
- [ ] Imagens do CloudFront carregam
- [ ] Design responsivo funciona

---

## 🔄 **PRÓXIMOS PASSOS**

### **1. Commit e Deploy:**
```bash
git add .
git commit -m "feat: configuração AWS Amplify e correção página 404"
git push origin main
```

### **2. Aguardar Build:**
- Amplify detectará automaticamente o push
- Build levará ~3-5 minutos
- Verificar logs no Amplify Console

### **3. Configurar Domínio:**
- Adicionar `pixman.click` no Amplify
- Configurar DNS no registrador
- Aguardar propagação SSL

### **4. Testar Funcionalidades:**
- Acessar site via Amplify URL
- Testar com slug `batel_grill`
- Verificar integração com GraphQL

---

## 🎯 **STATUS ESPERADO**

### ✅ **Após Deploy:**
- ✅ **URL Amplify**: Funcionando
- ✅ **Rota dinâmica**: `/batel_grill` acessível
- ✅ **App**: Carregando corretamente
- ✅ **GraphQL**: Conectando com credenciais corretas

### 🌐 **Após Configuração Domínio:**
- ✅ **pixman.click**: Redirecionando para Amplify
- ✅ **SSL**: Certificado válido
- ✅ **Performance**: Otimizada via CloudFront
- ✅ **SEO**: Meta tags corretas

---

## 🆘 **TROUBLESHOOTING**

### **Se ainda der 404:**
1. Verificar se o commit foi feito
2. Aguardar build completo no Amplify
3. Verificar logs de build por erros
4. Testar rota: `/batel_grill` (exata)

### **Se GraphQL der erro:**
1. Verificar environment variables no Amplify
2. Confirmar credenciais AWS estão corretas
3. Testar localmente primeiro

---

## 🏆 **DEPLOY PIXMAN: CONFIGURADO E PRONTO!**
