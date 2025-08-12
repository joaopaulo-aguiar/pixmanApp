# 🚨 PROBLEMA: Erro 401 Unauthorized no AppSync

## 📋 **Análise do Erro**

### 🔍 **Error Details:**
```
Status Code: 401 Unauthorized
URL: https://os2rhzenxver7luspgqk72nune.appsync-api.sa-east-1.amazonaws.com/graphql
Error Type: UnauthorizedException
Request ID: af9da8ac-0f6e-408a-bc59-eb9cbc43de4f
```

### 🎯 **Causa Provável:**
O **Cognito Identity Pool** não tem as **permissões necessárias** para acessar o **AppSync GraphQL API**.

---

## 🔧 **SOLUÇÕES NECESSÁRIAS NA AWS**

### 1. **Verificar IAM Role do Cognito Identity Pool**

#### **No AWS Console > Cognito > Identity Pools:**
- Acesse: `sa-east-1:372c7524-c616-40b3-b0d4-e9932112f2eb`
- Vá em **"Identity pool settings"**
- Verifique as **IAM Roles** configuradas

#### **Política Necessária para Unauthenticated Role:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "appsync:GraphQL"
            ],
            "Resource": [
                "arn:aws:appsync:sa-east-1:*:apis/lxq2ihek4nagbhliryd42evglm/*"
            ]
        }
    ]
}
```

### 2. **Verificar AppSync Authorization Mode**

#### **No AWS Console > AppSync > lxq2ihek4nagbhliryd42evglm:**
- Vá em **"Settings" > "Authorization"**
- Verificar se **"Amazon Cognito Identity Pool"** está habilitado
- Confirmar se o **Identity Pool ID** está correto

### 3. **Verificar Resource-based Authorization**

#### **No AppSync > Schema:**
- Verificar se as queries/mutations têm as diretivas de autorização corretas
- Exemplo: `@aws_iam` ou `@aws_cognito_user_pools`

---

## 🔍 **CHECKLIST DE VERIFICAÇÃO**

### ✅ **AWS Cognito Identity Pool:**
- [ ] Identity Pool existe: `sa-east-1:372c7524-c616-40b3-b0d4-e9932112f2eb`
- [ ] "Allow unauthenticated identities" está habilitado
- [ ] IAM Role para "Unauthenticated role" existe
- [ ] Role tem permissão `appsync:GraphQL`

### ✅ **AWS AppSync:**
- [ ] API existe: `lxq2ihek4nagbhliryd42evglm`
- [ ] Authorization mode "AWS_IAM" está habilitado
- [ ] Identity Pool está configurado como data source

### ✅ **Aplicação:**
- [ ] Environment variables estão corretas
- [ ] Amplify config está usando `identityPool` auth mode
- [ ] Não há credentials hardcoded (✅ Corrigido)

---

## 🛠️ **COMANDOS AWS CLI PARA VERIFICAÇÃO**

### **1. Verificar Identity Pool:**
```bash
aws cognito-identity describe-identity-pool \
  --identity-pool-id sa-east-1:372c7524-c616-40b3-b0d4-e9932112f2eb \
  --region sa-east-1
```

### **2. Verificar AppSync API:**
```bash
aws appsync get-graphql-api \
  --api-id lxq2ihek4nagbhliryd42evglm \
  --region sa-east-1
```

### **3. Listar Authorization Types:**
```bash
aws appsync list-graphql-apis \
  --region sa-east-1 \
  --query 'graphqlApis[?apiId==`lxq2ihek4nagbhliryd42evglm`].authenticationType'
```

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Verificar configurações na AWS** (acima)
2. **Corrigir permissões do Identity Pool**
3. **Testar novamente a aplicação**
4. **Remover logs de debug** quando funcionar

---

## 📧 **INFORMAÇÕES PARA O ADMINISTRADOR AWS**

### **Identity Pool ID:** `sa-east-1:372c7524-c616-40b3-b0d4-e9932112f2eb`
### **AppSync API ID:** `lxq2ihek4nagbhliryd42evglm`
### **Região:** `sa-east-1`

**Permissão necessária:** O Identity Pool precisa de acesso `appsync:GraphQL` ao AppSync API específico.
