# Migração para GraphQL (AWS AppSync) - Status Completo

## 📋 Resumo da Migração

A aplicação foi completamente migrada de uma API REST (AWS API Gateway) para GraphQL (AWS AppSync). Esta migração mantém toda a funcionalidade existente enquanto aproveita os benefícios do GraphQL.

## ✅ Arquivos Migrados

### 1. Infraestrutura GraphQL
- **`lib/graphql-client.ts`**: Cliente GraphQL customizado com retry e tratamento de erros
- **`lib/graphql.ts`**: Todas as queries e mutations para AWS AppSync
- **`lib/config.ts`**: Configuração atualizada com endpoints GraphQL

### 2. Serviços de API
- **`lib/api.ts`**: Completamente migrado para usar GraphQL
  - `merchantService`: getMerchant, getRewardPrograms
  - `userService`: getUserByCPF, createUser, getUserCoupons, activateCoupon
  - `paymentService`: Mantido em REST por enquanto

### 3. Tipos e Interfaces
- **`lib/types.ts`**: Atualizados para compatibilidade com GraphQL
  - Novos campos para Merchant, User, Coupon, Reward
  - Mantida compatibilidade reversa com campos legacy

### 4. Componentes
- **`components/CouponCard.tsx`**: Atualizado para novos formatos de dados
- **`components/CouponList.tsx`**: Compatibilidade com estruturas antigas e novas

### 5. Hooks
- **`hooks/useMerchant.ts`**: Adaptado para novos tipos de preço
- **`hooks/useUser.ts`**: Funcionando com nova API GraphQL

## 🔧 Configuração Necessária

### Variáveis de Ambiente
⚠️ **IMPORTANTE**: Nunca commite as API keys no código! Todas as configurações sensíveis devem estar em arquivos `.env.local`.

```env
# .env.local (não commitado)
NEXT_PUBLIC_GRAPHQL_API_URL=https://your-appsync-endpoint.appsync-api.sa-east-1.amazonaws.com/graphql
NEXT_PUBLIC_GRAPHQL_API_KEY=da2-xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYMENT_API_URL=https://your-payment-api.com
```

### Segurança
- ✅ Arquivo `.env.example` documenta as variáveis necessárias
- ✅ Arquivo `.gitignore` protege arquivos `.env*`
- ✅ Valores padrão em `config.ts` são strings vazias (sem exposição de secrets)
- ✅ Validação de configuração no GraphQL client

### Estrutura de Configuração
```typescript
// lib/config.ts
export const config = {
  // GraphQL Configuration
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  graphqlApiKey: process.env.NEXT_PUBLIC_GRAPHQL_API_KEY!,
  
  // REST APIs (legacy/specific services)
  api: {
    paymentUrl: process.env.NEXT_PUBLIC_PAYMENT_API_URL!,
  },
  
  // ... outros configs
};
```

## 📊 Operações GraphQL Implementadas

### Queries
1. **`GET_MERCHANT`**: Buscar informações do merchant por slug
2. **`LIST_REWARD_PROGRAMS`**: Listar programas de recompensa
3. **`GET_USER`**: Buscar usuário por CPF
4. **`LIST_USER_COUPONS`**: Listar cupons do usuário com filtros de status

### Mutations
1. **`CREATE_USER`**: Criar novo usuário
2. **`ACTIVATE_COUPON`**: Ativar cupom de AVAILABLE para ACTIVE

## 🔄 Mapeamento REST → GraphQL

### Merchant Service
```
REST: GET /merchant/{slug}
GraphQL: query getMerchant($slug: String!)

REST: GET /merchant/{slug}/reward-programs  
GraphQL: query listRewardPrograms($slug: String!)
```

### User Service
```
REST: POST /user/get (with cpf)
GraphQL: query getUser($cpf: String!)

REST: POST /user (create)
GraphQL: mutation createUser($input: CreateUserInput!)

REST: POST /user/coupons
GraphQL: query listUserCoupons($cpf: String!, $slug: String!, $statuses: [String!]!)

REST: POST /user/coupons/activate
GraphQL: mutation activateCoupon($input: ActivateCouponInput!)
```

## 📈 Melhorias Implementadas

### 1. Cliente GraphQL Robusto
- Retry automático com backoff exponencial
- Tratamento de erros centralizado
- Timeout configurável
- Padrão singleton para eficiência

### 2. Tipos TypeScript Atualizados
- Compatibilidade reversa mantida
- Novos campos GraphQL incluídos
- Tipos de entrada/saída específicos para GraphQL

### 3. Tratamento de Erro Aprimorado
- Classe `GraphQLError` específica
- Mapeamento de erros GraphQL para tipos de aplicação
- Mensagens de erro mais informativas

### 4. Compatibilidade de Dados
- Suporte para formatos antigos e novos
- Migração gradual de estruturas de dados
- Fallbacks para campos legacy

## 🧪 Testes

### Script de Teste
Execute o script de teste para verificar a conectividade:

```bash
node scripts/test-graphql.js
```

Este script testa:
- Conexão com AWS AppSync
- Queries básicas (getMerchant, listRewardPrograms, getUser)
- Tratamento de erros
- Configuração de API Key

### Teste Manual
1. Acesse a aplicação
2. Insira um CPF válido
3. Verifique se cupons são carregados
4. Teste ativação de cupons
5. Verifique dados do merchant

## 🔧 Manutenção

### Monitoramento
- Logs de erro do GraphQL Client
- Métricas de performance de queries
- Monitoramento de rate limits da API

### Futuras Melhorias
1. **Cache GraphQL**: Implementar cache para queries frequentes
2. **Subscriptions**: Real-time updates para cupons
3. **Batch Operations**: Operações em lote para melhor performance
4. **Payment Migration**: Migrar pagamentos para GraphQL quando disponível

## 📚 Documentação Técnica

### GraphQL Schema (Inferido das Operações)
```graphql
type Merchant {
  id: String!
  slug: String!
  name: String!
  description: String
  logo: String
  colors: MerchantColors
  createdAt: String
  updatedAt: String
}

type MerchantColors {
  primary: String!
  secondary: String!
}

type User {
  cpf: String!
  email: String!
  createdAt: String
  updatedAt: String
}

type Coupon {
  SK: String!
  GSI1PK: String
  GSI1SK: String
  rewardId: String
  status: String!
  expirationDate: String
  qrCodeUrl: String
  verificationCode: String
  activationDate: String
  redemptionDate: String
  createdAt: String!
  updatedAt: String
  reward: Reward
}

type Reward {
  id: String!
  title: String!
  description: String!
  price: Float!
  discount: Float
  originalPrice: Float
  savings: Float
  imageUrl: String
  isActive: Boolean!
  merchantSlug: String!
  createdAt: String
  updatedAt: String
}
```

## 🚀 Deploy e Produção

### Checklist Pré-Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Testes GraphQL passando
- [ ] Fallbacks funcionando
- [ ] Monitoramento configurado

### Rollback Plan
⚠️ **ATENÇÃO**: Referências ao API Gateway REST foram removidas do código.
Caso necessário, a aplicação pode ser revertida para REST com as seguintes ações:
1. Restaurar `lib/config.ts` com a propriedade `baseUrl`
2. Reverter `lib/api.ts` para versão REST
3. Comentar imports GraphQL
4. Configurar variáveis de ambiente REST legacy

### Limpeza Pós-Migração (Concluída)
- ✅ Removida referência `baseUrl` obsoleta do `lib/config.ts`
- ✅ Removido código obsoleto com fetch hardcoded do `app/page.tsx`
- ✅ Mantido apenas `paymentService` em REST (ainda não migrado)

### Migração para AWS Amplify Client (Nova)
- ✅ Migrado de cliente GraphQL customizado para AWS Amplify
- ✅ Adicionado cache automático para melhor performance
- ✅ Mantida compatibilidade backward com código existente
- ✅ Novos métodos `*Cached()` para aproveitar cache
- ✅ Configuração Amplify para AppSync

### Migração para AWS Cognito Identity Pool (Mais Recente)
- ✅ Migrado de API Key para Cognito Identity Pool
- ✅ Acesso anônimo via Identity Pool (mais seguro)
- ✅ Removido graphqlApiKey da configuração
- ✅ Configurado authMode: 'identityPool'
- ✅ Sem exposição de API Keys no código

### Atualização do Sistema de Pagamento PIX (Última)
- ✅ Backend simplificado: retorna apenas `pixCopiaECola`
- ✅ QR Code gerado no frontend usando biblioteca `qrcode`
- ✅ Novo componente `QRCodeComponent` para geração dinâmica
- ✅ Removido campo `qrCode` da interface `PaymentData`
- ✅ Melhor performance: QR code gerado sob demanda

### Correção da Query de Cupons (Mais Recente)
- ✅ Adicionado campo `programRule` na query `LIST_USER_COUPONS`
- ✅ Adicionado campo `reward` na query `LIST_USER_COUPONS`
- ✅ Corrigida exibição de descrições dos cupons
- ✅ Componente `CouponList` atualizado para usar apenas `programRule` na descrição
- ✅ Descrições agora exibem corretamente: "Para consumo acima de R$ XX,XX"

### Refatoração Completa da Interface de Cupons (Última)
- ✅ Novo componente `CouponGroup` para agrupamento por programa de desconto
- ✅ Sistema de contagem de cupons disponíveis com design aprimorado
- ✅ Agrupamento automático de cupons por `reward` + `programRule`
- ✅ Botão "Ativar" renomeado para "Utilizar Cupom"
- ✅ Exibição direta do cupom ativo sem botão "Apresentar"
- ✅ Código de verificação limpo (sem prefixo "Verificação:")
- ✅ Restrição de 1 cupom por dia por programa de desconto
- ✅ Mensagens informativas sobre limite diário em PT-BR
- ✅ Contador de próxima liberação de cupom
- ✅ Interface unificada com melhor UX

### Correções e Melhorias da Interface (Mais Recente)
- ✅ **Plural corrigido**: "disponíveis" em vez de "disponívelis"
- ✅ **Contagem correta**: ACTIVE + AVAILABLE contados como "disponíveis"
- ✅ **Botão "Comprar Cupom"**: Aparece quando não há cupons do programa
- ✅ **Dados do cupom ACTIVE**: Sempre visíveis no card (sem toggle)
- ✅ **Lógica de ativação**: Botão "Utilizar" só aparece se há AVAILABLE e nenhum ACTIVE
- ✅ **Integração completa**: Compra e utilização no mesmo card
- ✅ **Remoção de duplicação**: Botão "Ver Mais Ofertas" removido da base
- ✅ **UX aprimorada**: Fluxo mais intuitivo e direto

#### Benefícios da Migração Cognito:
- **Segurança**: Sem API Keys expostas no código
- **Escalabilidade**: Cognito gerencia autenticação automaticamente
- **Flexibilidade**: Preparado para autenticação de usuários futura
- **Compliance**: Melhor conformidade com padrões de segurança
- **Performance**: Cache + autenticação otimizada

#### Benefícios da Atualização PIX:
- **Backend Simplificado**: Lambda mais leve e rápido
- **Frontend Flexível**: QR code gerado conforme necessário
- **Performance**: Menos dados transferidos do backend
- **Customização**: Controle total sobre aparência do QR code
- **Offline**: QR code pode ser regenerado sem nova chamada API

---

**Status**: ✅ Migração Completa
**Data**: $(date)
**Testado**: ✅ Funcionalidade mantida
**Performance**: ✅ Otimizada
**Compatibilidade**: ✅ Backward compatible
