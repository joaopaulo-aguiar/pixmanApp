# 🔍 Query GraphQL Completa para Teste

## 📋 Use esta query no GraphQL playground para testar:

```graphql
query GetFullMerchantDetails {
  getMerchant(slug: "batel_grill") {
    slug
    displayName
    legalName
    status
    contactEmail
    logoImage
    coverImage
    address {
      street
      city
      state
      zipCode
    }
    createdAt
  }
}
```

## 🎯 **Diferenças da sua query de teste:**

### ❌ **Sua query (incompleta):**
```graphql
query MyQuery {
  getMerchant(slug: "batel_grill") {
    contactEmail
    coverImage
    createdAt
    displayName
    legalName
    logoImage
    slug
    status
    updatedAt
  }
}
```

### ✅ **Query correta (completa):**
```graphql
query GetFullMerchantDetails {
  getMerchant(slug: "batel_grill") {
    slug
    displayName
    legalName
    status
    contactEmail
    logoImage
    coverImage
    address {        # ← CAMPO FALTANDO na sua query
      street
      city
      state
      zipCode
    }
    createdAt
  }
}
```

## 📊 **Resultado esperado:**
```json
{
  "data": {
    "getMerchant": {
      "slug": "batel_grill",
      "displayName": "Churrascaria Batel Grill",
      "legalName": "Churrascaria Batel Grill LTDA",
      "status": "ACTIVE",
      "contactEmail": "tevora@tevora.com.br",
      "logoImage": "https://d1ha8p5njs0erj.cloudfront.net/logo_batel_grill.jpg",
      "coverImage": "https://d1ha8p5njs0erj.cloudfront.net/cover_batel_grill.jpg",
      "address": {
        "street": "Av. N. Sra. Aparecida, 78",
        "city": "Curitiba",
        "state": "PR",
        "zipCode": "80440-000"
      },
      "createdAt": "2025-01-15T09:00:00Z"
    }
  }
}
```

## 🛠️ **Ajustes feitos no componente:**
- ✅ Removido `legalName` (conforme solicitado)
- ✅ Removido `contactEmail` (conforme solicitado)
- ✅ Mantido apenas `displayName` e `address`
- ✅ Adicionado logs de debug para verificar dados recebidos
