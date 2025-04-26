import { z } from "zod";
import { initializeMcpApiHandler } from "../lib/mcp-api-handler";
import { fetchStellarTVL } from "../lib/fetch-stellar-tvl";
import { fetchStellarTokenPrices } from "../lib/fetch-stellar-prices";
import { fetchStellarVolume } from "../lib/fetch-stellar-volume";

const handler = initializeMcpApiHandler(
  (server) => {
    server.tool(
      "get-token-price",
      "Get the price of a token in the Stellar network",
      { token_id: z.string() },
      async ({ token_id }) => {
        const priceData = await fetchStellarTokenPrices([token_id]);
        const tokenPrice = priceData[token_id];

        if (!tokenPrice) {
          return {
            content: [
              {
                type: "text",
                text: `Price data not found for token: ${token_id}. Available tokens: stellar, centre-usdc, ultrastellar-aqua, stellar-classic, lumenswap`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `${token_id.toUpperCase()} Price:\n` +
                    `USD: $${tokenPrice.usd.toLocaleString()}\n` +
                    `EUR: €${tokenPrice.eur.toLocaleString()}\n` +
                    `BTC: ₿${tokenPrice.btc.toFixed(8)}\n` +
                    `24h Change: ${tokenPrice.usd_24h_change?.toFixed(2) || 'N/A'}%\n` +
                    `Market Cap: $${tokenPrice.usd_market_cap?.toLocaleString() || 'N/A'}`,
            },
          ],
        };
      }
    );

    server.tool(
      "get-tvl",
      "Get the total value locked in Stellar network",
      {},
      async () => {
        const tvlData = await fetchStellarTVL();
        
        return {
          content: [
            {
              type: "text",
              text: `Current Stellar TVL: $${tvlData.totalTVL.toLocaleString()}\n` +
                    `Number of Protocols: ${tvlData.protocols.length}\n` +
                    `Protocols: ${tvlData.protocols.map(p => 
                      `\n- ${p.name}: $${p.tvl.toLocaleString()}`
                    ).join('')}`,
            },
          ],
        };
      }
    );

    server.tool(
      "get-volume",
      "Get the trading volume on Stellar DEXes",
      {},
      async () => {
        const volumeData = await fetchStellarVolume();
        
        return {
          content: [
            {
              type: "text",
              text: `24h Trading Volume: $${volumeData.totalVolume.toLocaleString()}\n` +
                    `DEXes: ${volumeData.dexes.map(d => 
                      `\n- ${d.name}: $${d.dailyVolume}`
                    ).join('')}`,
            },
          ],
        };
      }
    );

    server.tool(
      "get-market-overview",
      "Get comprehensive market overview for Stellar network",
      {},
      async () => {
        const [priceData, tvlData, volumeData] = await Promise.all([
          fetchStellarTokenPrices(['stellar']), // Get XLM price as reference
          fetchStellarTVL(),
          fetchStellarVolume()
        ]);

        const xlmPrice = priceData['stellar'];

        return {
          content: [
            {
              type: "text",
              text: 
                `Stellar Network Market Overview\n` +
                `----------------------------\n` +
                `XLM Price: $${xlmPrice?.usd.toLocaleString() || 'N/A'}\n` +
                `24h Change: ${xlmPrice?.usd_24h_change?.toFixed(2) || 'N/A'}%\n` +
                `24h Volume: $${volumeData.totalVolume.toLocaleString()}\n` +
                `Total TVL: $${tvlData.totalTVL.toLocaleString()}\n` +
                `Active Protocols: ${tvlData.protocols.length}\n\n` +
                `Top Protocols by TVL:\n` +
                `${tvlData.protocols.slice(0, 3).map(p => 
                  `- ${p.name}: $${p.tvl.toLocaleString()}`
                ).join('\n')}`,
            },
          ],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        "get-token-price": {
          description: "Get the current price and market data for any Stellar token",
          parameters: {
            token_id: { 
              type: "string",
              description: "Token ID (e.g., 'stellar' for XLM, 'centre-usdc' for USDC)"
            },
          },
        },
        "get-tvl": {
          description: "Get the total value locked in Stellar protocols",
          parameters: {},
        },
        "get-volume": {
          description: "Get the trading volume on Stellar DEXes",
          parameters: {},
        },
        "get-market-overview": {
          description: "Get comprehensive market overview for the Stellar network",
          parameters: {},
        },
      },
    },
  }
);

export default handler;
