// Demo business data presets for users who don't want to connect real data
const PRESETS = [
  {
    name: "Neighborhood Internet Café (Philippines)",
    businessType: "PC Rental / Mini Café",
    location: "Davao City",
    businessAge: 5,
    pcUnits: 10,
    currency: "PHP",
    grossMonthlyRevenue: 55000,
    expenses: 30000,
    depreciation: 4000,
    liabilities: 5000,
    netValue: 16000,
    popModifier: 0.90,

    narrative: "Good candidate for bartering off daily idle hours of productivity (via time tokenized)."
  },
  {
    name: "Food Stall at Mall (Singapore)",
    businessType: "Mall-based food stall",
    location: "VivoCity",
    businessAge: 2,
    productType: "Quick meals/snacks",
    currency: "SGD",
    grossMonthlyRevenue: 13000,
    expenses: 9000,
    depreciation: 300,
    liabilities: 1000,
    netValue: 3100,
    popModifier: 0.90,

    narrative: "Example for Singapore food stall preset."
  },
    {
      name: "Freelance Graphic Designer (Philippines)",
      businessType: "Solo Freelancer",
      location: "Makati (remote work)",
      businessAge: 2,
      pcUnits: 1,
      currency: "PHP",
      grossMonthlyRevenue: 75000,
      expenses: 20000,
      depreciation: 3000,
      liabilities: 7000,
      netValue: 45000,
      popModifier: 0.90,
  
      narrative: "Tokenizes creative labor output — potential for AP token derivation via project-based obligations."
    },
    {
      name: "Online Reseller (Shopee/Lazada, Philippines)",
      businessType: "E-commerce store",
      location: "Cebu",
      businessAge: 3,
      pcUnits: 1,
      currency: "PHP",
      grossMonthlyRevenue: 100000,
      expenses: 65000,
      depreciation: 2000,
      liabilities: 8000,
      netValue: 25000,
      popModifier: 0.90,
  
      narrative: "Could later create Kwid tokens for future delivery obligations, and AP tokens from vendor tie-ups."
    },
    {
      name: "Boutique Clothing Shop (Singapore)",
      businessType: "Small Retail (Fashion)",
      location: "Bugis+",
      businessAge: 4,
      pcUnits: 1,
      currency: "SGD",
      grossMonthlyRevenue: 18000,
      expenses: 12000,
      depreciation: 400,
      liabilities: 2500,
      netValue: 3100,
      popModifier: 0.90,
  
      narrative: "Retail productivity tokenized — ideal for urban merchant bartering and small-scale credit."
    },
    {
      name: "Food Stall at Mall (Singapore)",
      businessType: "Mall-based food stall",
      location: "VivoCity",
      businessAge: 2,
      pcUnits: 1,
      currency: "SGD",
      grossMonthlyRevenue: 13000,
      expenses: 9000,
      depreciation: 300,
      liabilities: 1000,
      netValue: 2700,
      popModifier: 0.90,
  
      narrative: "Perfect candidate for tokenizing short-cycle food service output with regular turnover."
    },
    {
      name: "Mobile Car Wash Service (Philippines)",
      businessType: "On-demand car wash",
      location: "Metro Manila",
      businessAge: 1.5,
      pcUnits: 3,
      currency: "PHP",
      grossMonthlyRevenue: 65000,
      expenses: 35000,
      depreciation: 2000,
      liabilities: 6000,
      netValue: 22000,
      popModifier: 0.90,
  
      narrative: "High rotation business — ideal to show productive real-world activity on-chain."
    },
      {
        name: "Neighborhood Bakery (Philippines)",
        businessType: "Food Production",
        location: "Quezon City",
        businessAge: 6,
        pcUnits: 4,
        currency: "PHP",
        grossMonthlyRevenue: 80000,
        expenses: 50000,
        depreciation: 5000,
        liabilities: 6000,
        netValue: 19000,
        popModifier: 0.90,
    
        narrative: "Great candidate for tokenizing early morning production capacity and daily yield."
      },
      {
        name: "Streetwear Thrift Shop (Philippines)",
        businessType: "Retail Thrift",
        location: "Baguio",
        businessAge: 3,
        pcUnits: 2,
        currency: "PHP",
        grossMonthlyRevenue: 45000,
        expenses: 25000,
        depreciation: 2000,
        liabilities: 3000,
        netValue: 15000,
        popModifier: 0.90,
    
        narrative: "Seasonal bartering opportunity with focus on high-rotation weekend traffic."
      },
      {
        name: "Coffee Cart (Singapore)",
        businessType: "Mobile Food Business",
        location: "Paya Lebar",
        businessAge: 2,
        pcUnits: 1,
        currency: "SGD",
        grossMonthlyRevenue: 9500,
        expenses: 6000,
        depreciation: 200,
        liabilities: 600,
        netValue: 2700,
        popModifier: 0.90,
    
        narrative: "Excellent case for daily yield bartering (e.g. morning rush hour capacity)."
      },
      {
        name: "Local Motorcycle Repair Shop (Philippines)",
        businessType: "Vehicle Services",
        location: "Cagayan de Oro",
        businessAge: 4,
        pcUnits: 2,
        currency: "PHP",
        grossMonthlyRevenue: 60000,
        expenses: 35000,
        depreciation: 3000,
        liabilities: 5000,
        netValue: 17000,
        popModifier: 0.90,
    
        narrative: "Solid use case for productivity tokenization of mechanical labor blocks."
      },
      {
        name: "Home-based Catering Services (Philippines)",
        businessType: "Food & Events",
        location: "Laguna",
        businessAge: 2.5,
        pcUnits: 2,
        currency: "PHP",
        grossMonthlyRevenue: 70000,
        expenses: 45000,
        depreciation: 2500,
        liabilities: 4000,
        netValue: 18500,
        popModifier: 0.90,
    
        narrative: "Potential for bartering yield slots for weekend events or weekly orders."
      },
      {
        name: "TikTok Live Seller (Singapore)",
        businessType: "Livestream Retail",
        location: "Tampines",
        businessAge: 1.5,
        pcUnits: 1,
        currency: "SGD",
        grossMonthlyRevenue: 12000,
        expenses: 7500,
        depreciation: 300,
        liabilities: 800,
        netValue: 3400,
        popModifier: 0.85,
    
        narrative: "Emerging model — stream time or inventory turns can be tokenized and bartered."
      } 
  ];

export function getPresetWithCap(preset) {
  return {
    ...preset,
    popTokenCap: Math.floor((preset.netValue * 0.90) / 3)
  };
}

export function getAllPresetsWithCap() {
  return PRESETS.map(getPresetWithCap);
}

export default PRESETS;
