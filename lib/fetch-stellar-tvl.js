// Script to fetch Total Value Locked (TVL) for Stellar blockchain
const axios = require('axios');

/**
 * Fetches TVL data for Stellar blockchain from DeFiLlama API
 */
async function fetchStellarTVL() {
  try {
    // Fetch protocol data from DeFiLlama
    const response = await axios.get('https://api.llama.fi/protocols');
    
    // Filter protocols on Stellar chain
    const stellarProtocols = response.data.filter(protocol => 
      protocol.chains.includes('Stellar')
    );
    
    // Calculate total TVL for Stellar
    const totalTVL = stellarProtocols.reduce((sum, protocol) => sum + protocol.tvl, 0);
    
    console.log('Stellar Protocols:', stellarProtocols.map(p => ({
      name: p.name,
      tvl: `$${(p.tvl).toLocaleString()}`
    })));
    
    console.log(`\nTotal TVL on Stellar: $${totalTVL.toLocaleString()}`);
    
    return {
      totalTVL,
      protocols: stellarProtocols
    };
  } catch (error) {
    console.error('Error fetching Stellar TVL:', error.message);
    throw error;
  }
}

// Execute the function when this script is run directly
if (require.main === module) {
  fetchStellarTVL();
}

module.exports = { fetchStellarTVL }; 