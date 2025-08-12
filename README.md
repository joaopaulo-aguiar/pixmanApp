# Pixman - Sistema de Cupons Digitais

Sistema responsivo de cupons digitais com acesso via QR Code, desenvolvido com Next.js e AWS.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **AWS Amplify** - Autenticação
- **AWS AppSync** - GraphQL API
- **AWS Lambda** - Payment API
- **CloudFront** - CDN para imagens

## ⚙️ Configuração

1. **Clone o repositório:**
```bash
git clone https://github.com/joaopaulo-aguiar/pixmanApp.git
cd pixmanApp
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

4. **Execute o projeto:**

4. **Execute o projeto:**
```bash
npm run dev
```

5. **Acesse:**
```
http://localhost:3000/[slug-do-merchant]
```

## 🏗️ Estrutura do Projeto

```
pixmanApp/
├── app/                 # App Router (Next.js 13+)
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página inicial
│   └── [slug]/         # Páginas dinâmicas de merchants
├── components/         # Componentes reutilizáveis
├── hooks/             # Hooks customizados
├── lib/               # Utilitários e configurações
└── public/            # Arquivos estáticos
```

## 🔧 Configuração AWS

O projeto utiliza os seguintes serviços AWS:
- **Cognito Identity Pool**: Autenticação anônima
- **AppSync**: API GraphQL
- **Lambda**: Payment API
- **CloudFront**: CDN para imagens

## 📱 Funcionalidades

- ✅ Acesso via QR Code
- ✅ Listagem de cupons por CPF
- ✅ Ativação de cupons
- ✅ Programas de recompensa
- ✅ Pagamentos via PIX
- ✅ Design responsivo
- ✅ Suporte offline básico

## 🌐 Deploy

Para deploy em produção, configure as variáveis de ambiente no seu provedor de hospedagem.
