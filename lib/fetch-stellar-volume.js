// Script to fetch trading volume for Stellar blockchain
const axios = require('axios');

// Add this at the start of the file to help debug
const DEBUG = true;

/**
 * Fetches total trading volume data for Stellar blockchain from DeFiLlama API
 * @param {number} days Number of days to look back for volume data (default: 1)
 */
async function fetchStellarVolume(days = 1) {
  try {
    // Fetch DEX volume data from DeFiLlama
    const response = await axios.get('https://api.llama.fi/overview/dexs');
    
    // Filter for protocols on Stellar chain
    const stellarDexes = response.data.protocols.filter(protocol => 
      protocol.chains && protocol.chains.includes('Stellar')
    );
    
    // Debug the API response structure
    console.log('API Response Structure Example:');
    if (stellarDexes.length > 0) {
      console.log(JSON.stringify(stellarDexes[0], null, 2).substring(0, 500) + '...');
    }
    
    // Calculate total volume with proper property checking
    const totalVolume = stellarDexes.reduce((sum, dex) => {
      if (DEBUG) {
        console.log('Processing DEX:', dex.name, dex);
      }
      // More defensive property access
      const volume = dex?.volumeChange?.dailyVolume ?? 
                    dex?.volume1d ?? 
                    dex?.total24h ?? 
                    0;
      return sum + volume;
    }, 0);
    
    console.log('Stellar DEXes:', stellarDexes.map(dex => ({
      name: dex.name,
      dailyVolume: `$${(
        (dex.volumeChange && dex.volumeChange.dailyVolume) || 
        dex.volume1d || 
        dex.total24h || 
        dex.dailyVolume || 
        0
      ).toLocaleString()}`
    })));
    
    console.log(`\nTotal ${days}-day volume on Stellar: $${totalVolume.toLocaleString()}`);
    
    // For historical volume data, check if there are any DEXes first
    if (stellarDexes.length > 0) {
      console.log('\nFetching historical data for the largest DEX...');
      
      // Find the largest DEX with proper property checking
      const largestDex = stellarDexes.reduce((max, dex) => {
        const currentVolume = (dex.volumeChange && dex.volumeChange.dailyVolume) || 
                             dex.volume1d || 
                             dex.total24h || 
                             dex.dailyVolume || 
                             0;
        const maxVolume = (max.volumeChange && max.volumeChange.dailyVolume) || 
                         max.volume1d || 
                         max.total24h || 
                         max.dailyVolume || 
                         0;
                         
        return currentVolume > maxVolume ? dex : max;
      }, stellarDexes[0]);
      
      if (largestDex.slug) {
        try {
          // Get historical data for largest DEX
          const historicalData = await axios.get(`https://api.llama.fi/summary/dexs/${largestDex.slug}?dataType=dailyVolume`);
          if (historicalData.data && historicalData.data.totalDataChart) {
            console.log(`${largestDex.name} 7-day volume trend:`, historicalData.data.totalDataChart.slice(-7));
          } else {
            console.log(`Historical data not available in expected format for ${largestDex.name}`);
          }
        } catch (error) {
          console.log(`Could not fetch historical data: ${error.message}`);
        }
      } else {
        console.log('No slug property found for the largest DEX, cannot fetch historical data');
      }
    }
    
    if (DEBUG) {
      console.log('API Response:', JSON.stringify(response.data, null, 2));
    }
    
    return {
      totalVolume,
      dexes: stellarDexes
    };
  } catch (error) {
    console.error('Error fetching Stellar volume:', error.message);
    // Print more details for debugging
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    throw error;
  }
}

// Execute the function when this script is run directly
if (require.main === module) {
  fetchStellarVolume();
}

module.exports = { fetchStellarVolume }; 