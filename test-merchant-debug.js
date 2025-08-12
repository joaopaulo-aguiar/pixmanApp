// Teste para verificar a query GraphQL do merchant
const { merchantService } = require('./lib/api');

async function testMerchantQuery() {
  try {
    console.log('🔍 Testando busca do merchant...');
    
    const merchant = await merchantService.getMerchant('batel_grill');
    
    console.log('✅ Merchant encontrado:');
    console.log('- slug:', merchant.slug);
    console.log('- displayName:', merchant.displayName);
    console.log('- legalName:', merchant.legalName);
    console.log('- status:', merchant.status);
    console.log('- contactEmail:', merchant.contactEmail);
    console.log('- logoImage:', merchant.logoImage);
    console.log('- coverImage:', merchant.coverImage);
    console.log('- address:', merchant.address);
    console.log('- createdAt:', merchant.createdAt);
    
    if (merchant.address) {
      console.log('📍 Endereço detalhado:');
      console.log('- street:', merchant.address.street);
      console.log('- city:', merchant.address.city);
      console.log('- state:', merchant.address.state);
      console.log('- zipCode:', merchant.address.zipCode);
    } else {
      console.log('❌ Address não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar merchant:', error);
  }
}

testMerchantQuery();
