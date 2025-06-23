/**
 * Complete AI Competitor Monitor Configuration - 50+ Companies
 * Covers the entire AI landscape: LLM providers, coding, search, voice, video, images, enterprise, infrastructure, hardware
 */

const COMPLETE_MONITOR_CONFIG = [
  // LLM Providers (10 companies)
  {
    company: "OpenAI",
    category: "LLM Providers",
    urls: [
      { url: "https://openai.com", type: "homepage" },
      { url: "https://openai.com/chatgpt", type: "product" },
      { url: "https://openai.com/pricing", type: "pricing" },
      { url: "https://openai.com/blog", type: "blog" },
      { url: "https://platform.openai.com", type: "api" }
    ]
  },
  {
    company: "Anthropic",
    category: "LLM Providers",
    urls: [
      { url: "https://anthropic.com", type: "homepage" },
      { url: "https://anthropic.com/claude", type: "product" },
      { url: "https://anthropic.com/pricing", type: "pricing" },
      { url: "https://anthropic.com/news", type: "news" },
      { url: "https://docs.anthropic.com", type: "docs" }
    ]
  },
  {
    company: "Google DeepMind",
    category: "LLM Providers",
    urls: [
      { url: "https://deepmind.google", type: "homepage" },
      { url: "https://ai.google/discover/gemini", type: "product" },
      { url: "https://cloud.google.com/vertex-ai/pricing", type: "pricing" },
      { url: "https://blog.google/technology/ai", type: "blog" },
      { url: "https://ai.google.dev", type: "api" }
    ]
  },
  {
    company: "Meta AI",
    category: "LLM Providers",
    urls: [
      { url: "https://ai.meta.com", type: "homepage" },
      { url: "https://ai.meta.com/llama", type: "product" },
      { url: "https://ai.meta.com/blog", type: "blog" },
      { url: "https://llama.meta.com", type: "api" }
    ]
  },
  {
    company: "Mistral AI",
    category: "LLM Providers",
    urls: [
      { url: "https://mistral.ai", type: "homepage" },
      { url: "https://mistral.ai/technology", type: "product" },
      { url: "https://mistral.ai/pricing", type: "pricing" },
      { url: "https://mistral.ai/news", type: "news" },
      { url: "https://docs.mistral.ai", type: "docs" }
    ]
  },
  {
    company: "Cohere",
    category: "LLM Providers",
    urls: [
      { url: "https://cohere.ai", type: "homepage" },
      { url: "https://cohere.ai/products", type: "product" },
      { url: "https://cohere.ai/pricing", type: "pricing" },
      { url: "https://cohere.ai/blog", type: "blog" },
      { url: "https://docs.cohere.ai", type: "docs" }
    ]
  },
  {
    company: "AI21 Labs",
    category: "LLM Providers",
    urls: [
      { url: "https://ai21.com", type: "homepage" },
      { url: "https://ai21.com/jamba", type: "product" },
      { url: "https://ai21.com/pricing", type: "pricing" },
      { url: "https://ai21.com/blog", type: "blog" }
    ]
  },
  {
    company: "Inflection AI",
    category: "LLM Providers",
    urls: [
      { url: "https://inflection.ai", type: "homepage" },
      { url: "https://pi.ai", type: "product" },
      { url: "https://inflection.ai/blog", type: "blog" }
    ]
  },
  {
    company: "Aleph Alpha",
    category: "LLM Providers",
    urls: [
      { url: "https://aleph-alpha.com", type: "homepage" },
      { url: "https://aleph-alpha.com/luminous", type: "product" },
      { url: "https://aleph-alpha.com/pricing", type: "pricing" },
      { url: "https://docs.aleph-alpha.com", type: "docs" }
    ]
  },
  {
    company: "Stability AI",
    category: "LLM Providers",
    urls: [
      { url: "https://stability.ai", type: "homepage" },
      { url: "https://stability.ai/stable-diffusion", type: "product" },
      { url: "https://stability.ai/pricing", type: "pricing" },
      { url: "https://stability.ai/blog", type: "blog" }
    ]
  },

  // AI Coding (8 companies)
  {
    company: "GitHub Copilot",
    category: "AI Coding",
    urls: [
      { url: "https://github.com/features/copilot", type: "homepage" },
      { url: "https://github.com/pricing", type: "pricing" },
      { url: "https://github.blog/tag/github-copilot", type: "blog" },
      { url: "https://docs.github.com/en/copilot", type: "docs" }
    ]
  },
  {
    company: "Codeium",
    category: "AI Coding",
    urls: [
      { url: "https://codeium.com", type: "homepage" },
      { url: "https://codeium.com/windsurf", type: "product" },
      { url: "https://codeium.com/pricing", type: "pricing" },
      { url: "https://codeium.com/blog", type: "blog" }
    ]
  },
  {
    company: "Cursor",
    category: "AI Coding",
    urls: [
      { url: "https://cursor.com", type: "homepage" },
      { url: "https://cursor.com/features", type: "features" },
      { url: "https://cursor.com/pricing", type: "pricing" },
      { url: "https://cursor.com/blog", type: "blog" }
    ]
  },
  {
    company: "Tabnine",
    category: "AI Coding",
    urls: [
      { url: "https://tabnine.com", type: "homepage" },
      { url: "https://tabnine.com/pricing", type: "pricing" },
      { url: "https://tabnine.com/blog", type: "blog" },
      { url: "https://docs.tabnine.com", type: "docs" }
    ]
  },
  {
    company: "Replit",
    category: "AI Coding",
    urls: [
      { url: "https://replit.com", type: "homepage" },
      { url: "https://replit.com/ai", type: "product" },
      { url: "https://replit.com/pricing", type: "pricing" },
      { url: "https://blog.replit.com", type: "blog" }
    ]
  },
  {
    company: "Amazon CodeWhisperer",
    category: "AI Coding",
    urls: [
      { url: "https://aws.amazon.com/codewhisperer", type: "homepage" },
      { url: "https://aws.amazon.com/codewhisperer/pricing", type: "pricing" },
      { url: "https://aws.amazon.com/blogs/aws/tag/amazon-codewhisperer", type: "blog" },
      { url: "https://docs.aws.amazon.com/codewhisperer", type: "docs" }
    ]
  },
  {
    company: "Sourcegraph",
    category: "AI Coding",
    urls: [
      { url: "https://sourcegraph.com", type: "homepage" },
      { url: "https://sourcegraph.com/cody", type: "product" },
      { url: "https://sourcegraph.com/pricing", type: "pricing" },
      { url: "https://sourcegraph.com/blog", type: "blog" }
    ]
  },
  {
    company: "Pieces",
    category: "AI Coding",
    urls: [
      { url: "https://pieces.app", type: "homepage" },
      { url: "https://pieces.app/features", type: "features" },
      { url: "https://pieces.app/pricing", type: "pricing" },
      { url: "https://pieces.app/blog", type: "blog" }
    ]
  },

  // AI Search (5 companies)
  {
    company: "Perplexity AI",
    category: "AI Search",
    urls: [
      { url: "https://perplexity.ai", type: "homepage" },
      { url: "https://perplexity.ai/pro", type: "product" },
      { url: "https://blog.perplexity.ai", type: "blog" }
    ]
  },
  {
    company: "You.com",
    category: "AI Search",
    urls: [
      { url: "https://you.com", type: "homepage" },
      { url: "https://you.com/search?q=pricing", type: "pricing" },
      { url: "https://you.com/code", type: "product" }
    ]
  },
  {
    company: "Phind",
    category: "AI Search",
    urls: [
      { url: "https://phind.com", type: "homepage" },
      { url: "https://phind.com/search?q=pricing", type: "pricing" }
    ]
  },
  {
    company: "Andi",
    category: "AI Search",
    urls: [
      { url: "https://andisearch.com", type: "homepage" }
    ]
  },
  {
    company: "Neeva",
    category: "AI Search",
    urls: [
      { url: "https://neeva.com", type: "homepage" }
    ]
  },

  // AI Voice/Audio (5 companies)
  {
    company: "ElevenLabs",
    category: "AI Voice/Audio",
    urls: [
      { url: "https://elevenlabs.io", type: "homepage" },
      { url: "https://elevenlabs.io/voice-generator", type: "product" },
      { url: "https://elevenlabs.io/pricing", type: "pricing" },
      { url: "https://elevenlabs.io/blog", type: "blog" }
    ]
  },
  {
    company: "Descript",
    category: "AI Voice/Audio",
    urls: [
      { url: "https://descript.com", type: "homepage" },
      { url: "https://descript.com/overdub", type: "product" },
      { url: "https://descript.com/pricing", type: "pricing" },
      { url: "https://descript.com/blog", type: "blog" }
    ]
  },
  {
    company: "Resemble AI",
    category: "AI Voice/Audio",
    urls: [
      { url: "https://resemble.ai", type: "homepage" },
      { url: "https://resemble.ai/pricing", type: "pricing" },
      { url: "https://resemble.ai/blog", type: "blog" }
    ]
  },
  {
    company: "Murf AI",
    category: "AI Voice/Audio",
    urls: [
      { url: "https://murf.ai", type: "homepage" },
      { url: "https://murf.ai/pricing", type: "pricing" },
      { url: "https://murf.ai/resources/blog", type: "blog" }
    ]
  },
  {
    company: "WellSaid Labs",
    category: "AI Voice/Audio",
    urls: [
      { url: "https://wellsaidlabs.com", type: "homepage" },
      { url: "https://wellsaidlabs.com/pricing", type: "pricing" },
      { url: "https://wellsaidlabs.com/blog", type: "blog" }
    ]
  },

  // Video AI (5 companies)
  {
    company: "Synthesia",
    category: "Video AI",
    urls: [
      { url: "https://synthesia.io", type: "homepage" },
      { url: "https://synthesia.io/features", type: "features" },
      { url: "https://synthesia.io/pricing", type: "pricing" },
      { url: "https://synthesia.io/blog", type: "blog" }
    ]
  },
  {
    company: "HeyGen",
    category: "Video AI",
    urls: [
      { url: "https://heygen.com", type: "homepage" },
      { url: "https://heygen.com/features", type: "features" },
      { url: "https://heygen.com/pricing", type: "pricing" },
      { url: "https://heygen.com/blog", type: "blog" }
    ]
  },
  {
    company: "Pika",
    category: "Video AI",
    urls: [
      { url: "https://pika.art", type: "homepage" },
      { url: "https://pika.art/pricing", type: "pricing" },
      { url: "https://pika.art/blog", type: "blog" }
    ]
  },
  {
    company: "Runway",
    category: "Video AI",
    urls: [
      { url: "https://runwayml.com", type: "homepage" },
      { url: "https://runwayml.com/pricing", type: "pricing" },
      { url: "https://runwayml.com/blog", type: "blog" }
    ]
  },
  {
    company: "Luma AI",
    category: "Video AI",
    urls: [
      { url: "https://lumalabs.ai", type: "homepage" },
      { url: "https://lumalabs.ai/dream-machine", type: "product" },
      { url: "https://lumalabs.ai/pricing", type: "pricing" }
    ]
  },

  // Image Generation (5 companies)
  {
    company: "Midjourney",
    category: "Image Generation",
    urls: [
      { url: "https://midjourney.com", type: "homepage" },
      { url: "https://docs.midjourney.com", type: "docs" },
      { url: "https://docs.midjourney.com/docs/plans", type: "pricing" }
    ]
  },
  {
    company: "DALL-E",
    category: "Image Generation",
    urls: [
      { url: "https://openai.com/dall-e-3", type: "homepage" },
      { url: "https://openai.com/pricing", type: "pricing" }
    ]
  },
  {
    company: "Ideogram",
    category: "Image Generation",
    urls: [
      { url: "https://ideogram.ai", type: "homepage" },
      { url: "https://ideogram.ai/pricing", type: "pricing" }
    ]
  },
  {
    company: "Leonardo AI",
    category: "Image Generation",
    urls: [
      { url: "https://leonardo.ai", type: "homepage" },
      { url: "https://leonardo.ai/pricing", type: "pricing" }
    ]
  },
  {
    company: "Flux",
    category: "Image Generation",
    urls: [
      { url: "https://blackforestlabs.ai", type: "homepage" },
      { url: "https://blackforestlabs.ai/our-models", type: "product" }
    ]
  },

  // Enterprise AI (4 companies)
  {
    company: "Palantir",
    category: "Enterprise AI",
    urls: [
      { url: "https://palantir.com", type: "homepage" },
      { url: "https://palantir.com/platforms/aip", type: "product" },
      { url: "https://blog.palantir.com", type: "blog" }
    ]
  },
  {
    company: "Scale AI",
    category: "Enterprise AI",
    urls: [
      { url: "https://scale.com", type: "homepage" },
      { url: "https://scale.com/enterprise", type: "product" },
      { url: "https://scale.com/blog", type: "blog" }
    ]
  },
  {
    company: "DataRobot",
    category: "Enterprise AI",
    urls: [
      { url: "https://datarobot.com", type: "homepage" },
      { url: "https://datarobot.com/platform", type: "product" },
      { url: "https://datarobot.com/blog", type: "blog" }
    ]
  },
  {
    company: "H2O.ai",
    category: "Enterprise AI",
    urls: [
      { url: "https://h2o.ai", type: "homepage" },
      { url: "https://h2o.ai/platform", type: "product" },
      { url: "https://h2o.ai/blog", type: "blog" }
    ]
  },

  // AI Infrastructure (5 companies)
  {
    company: "Hugging Face",
    category: "AI Infrastructure",
    urls: [
      { url: "https://huggingface.co", type: "homepage" },
      { url: "https://huggingface.co/pricing", type: "pricing" },
      { url: "https://huggingface.co/blog", type: "blog" },
      { url: "https://huggingface.co/docs", type: "docs" }
    ]
  },
  {
    company: "Weights & Biases",
    category: "AI Infrastructure",
    urls: [
      { url: "https://wandb.ai", type: "homepage" },
      { url: "https://wandb.ai/pricing", type: "pricing" },
      { url: "https://wandb.ai/fully-connected", type: "blog" }
    ]
  },
  {
    company: "LangChain",
    category: "AI Infrastructure",
    urls: [
      { url: "https://langchain.com", type: "homepage" },
      { url: "https://langchain.com/langsmith", type: "product" },
      { url: "https://blog.langchain.dev", type: "blog" },
      { url: "https://docs.langchain.com", type: "docs" }
    ]
  },
  {
    company: "Anyscale",
    category: "AI Infrastructure",
    urls: [
      { url: "https://anyscale.com", type: "homepage" },
      { url: "https://anyscale.com/pricing", type: "pricing" },
      { url: "https://anyscale.com/blog", type: "blog" }
    ]
  },
  {
    company: "Replicate",
    category: "AI Infrastructure",
    urls: [
      { url: "https://replicate.com", type: "homepage" },
      { url: "https://replicate.com/pricing", type: "pricing" },
      { url: "https://replicate.com/blog", type: "blog" }
    ]
  },

  // AI Hardware (5 companies)
  {
    company: "NVIDIA",
    category: "AI Hardware",
    urls: [
      { url: "https://nvidia.com/ai", type: "homepage" },
      { url: "https://nvidia.com/en-us/data-center/products", type: "product" },
      { url: "https://blogs.nvidia.com/ai", type: "blog" },
      { url: "https://developer.nvidia.com", type: "docs" }
    ]
  },
  {
    company: "AMD",
    category: "AI Hardware",
    urls: [
      { url: "https://amd.com/en/graphics/instinct-server-accelerators", type: "homepage" },
      { url: "https://amd.com/en/newsroom", type: "news" }
    ]
  },
  {
    company: "Intel",
    category: "AI Hardware",
    urls: [
      { url: "https://intel.com/content/www/us/en/artificial-intelligence", type: "homepage" },
      { url: "https://intel.com/content/www/us/en/newsroom", type: "news" }
    ]
  },
  {
    company: "Cerebras",
    category: "AI Hardware",
    urls: [
      { url: "https://cerebras.net", type: "homepage" },
      { url: "https://cerebras.net/product-system", type: "product" },
      { url: "https://cerebras.net/blog", type: "blog" }
    ]
  },
  {
    company: "SambaNova",
    category: "AI Hardware",
    urls: [
      { url: "https://sambanova.ai", type: "homepage" },
      { url: "https://sambanova.ai/products", type: "product" },
      { url: "https://sambanova.ai/blog", type: "blog" }
    ]
  }
];

/**
 * Get monitor configurations with multi-URL support
 */
function getMonitorConfigurationsMultiUrl() {
  const props = PropertiesService.getScriptProperties();
  const storedConfig = props.getProperty('monitorConfigMultiUrl');
  
  if (storedConfig) {
    return JSON.parse(storedConfig);
  }
  
  // Return default configuration with 50+ companies
  return COMPLETE_MONITOR_CONFIG;
}

/**
 * Update to the complete 50+ company configuration
 */
function updateToCompleteConfig() {
  const props = PropertiesService.getScriptProperties();
  
  // Store the new configuration
  props.setProperty('monitorConfigMultiUrl', JSON.stringify(COMPLETE_MONITOR_CONFIG));
  
  // Calculate statistics
  const totalUrls = COMPLETE_MONITOR_CONFIG.reduce((sum, company) => 
    sum + company.urls.length, 0
  );
  
  const categories = {};
  const urlTypes = {};
  
  COMPLETE_MONITOR_CONFIG.forEach(company => {
    categories[company.category] = (categories[company.category] || 0) + 1;
    
    company.urls.forEach(urlObj => {
      urlTypes[urlObj.type] = (urlTypes[urlObj.type] || 0) + 1;
    });
  });
  
  // Log the update
  logActivity('config_update', {
    action: 'complete_50_company_configuration',
    companies: COMPLETE_MONITOR_CONFIG.length,
    totalUrls: totalUrls,
    categories: categories,
    urlTypes: urlTypes,
    timestamp: new Date().toISOString()
  });
  
  // Update the main monitor function to use complete config
  props.setProperty('USE_COMPLETE_CONFIG', 'true');
  
  return {
    success: true,
    message: 'Complete 50+ company configuration activated',
    stats: {
      companies: COMPLETE_MONITOR_CONFIG.length,
      totalUrls: totalUrls,
      avgUrlsPerCompany: (totalUrls / COMPLETE_MONITOR_CONFIG.length).toFixed(1),
      categoryBreakdown: categories,
      urlTypeBreakdown: urlTypes
    }
  };
}

/**
 * Get configuration summary by category
 */
function getConfigSummary() {
  const categories = {};
  let totalUrls = 0;
  
  COMPLETE_MONITOR_CONFIG.forEach(company => {
    if (!categories[company.category]) {
      categories[company.category] = {
        companies: [],
        urlCount: 0
      };
    }
    
    categories[company.category].companies.push(company.company);
    categories[company.category].urlCount += company.urls.length;
    totalUrls += company.urls.length;
  });
  
  return {
    totalCompanies: COMPLETE_MONITOR_CONFIG.length,
    totalUrls: totalUrls,
    categories: Object.entries(categories).map(([category, data]) => ({
      category: category,
      companyCount: data.companies.length,
      companies: data.companies,
      urlCount: data.urlCount
    }))
  };
}

/**
 * Test monitoring for a specific category
 */
function testCategoryMonitoring(categoryName) {
  const categoryCompanies = COMPLETE_MONITOR_CONFIG.filter(c => c.category === categoryName);
  
  if (categoryCompanies.length === 0) {
    return { success: false, error: 'Category not found' };
  }
  
  const results = {
    category: categoryName,
    companies: [],
    totalTime: 0
  };
  
  categoryCompanies.forEach(company => {
    const companyResult = {
      company: company.company,
      urls: [],
      responseTime: 0
    };
    
    company.urls.forEach(urlObj => {
      const startTime = new Date().getTime();
      
      try {
        const response = UrlFetchApp.fetch(urlObj.url, {
          muteHttpExceptions: true,
          followRedirects: true,
          validateHttpsCertificates: false
        });
        
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        
        companyResult.urls.push({
          url: urlObj.url,
          type: urlObj.type,
          status: response.getResponseCode(),
          success: response.getResponseCode() === 200,
          responseTime: responseTime
        });
        
        companyResult.responseTime += responseTime;
        
        Utilities.sleep(500); // Respectful crawling
        
      } catch (error) {
        companyResult.urls.push({
          url: urlObj.url,
          type: urlObj.type,
          status: 'error',
          success: false,
          error: error.toString()
        });
      }
    });
    
    results.companies.push(companyResult);
    results.totalTime += companyResult.responseTime;
  });
  
  return results;
}

/**
 * Get all companies by category
 */
function getCompaniesByCategory() {
  const categorized = {};
  
  COMPLETE_MONITOR_CONFIG.forEach(company => {
    if (!categorized[company.category]) {
      categorized[company.category] = [];
    }
    categorized[company.category].push({
      name: company.company,
      urlCount: company.urls.length,
      urls: company.urls
    });
  });
  
  return categorized;
}

/**
 * Add missing logActivity function stub
 */
function logActivity(type, data) {
  console.log(`Activity [${type}]:`, data);
  // This would normally log to a sheet or monitoring system
  return true;
}

/**
 * Monitor all companies in the complete configuration
 */
function monitorAllCompaniesComplete() {
  console.log(`Starting monitoring of ${COMPLETE_MONITOR_CONFIG.length} companies...`);
  
  const results = {
    totalCompanies: COMPLETE_MONITOR_CONFIG.length,
    totalUrls: 0,
    processed: 0,
    errors: 0,
    startTime: new Date()
  };
  
  COMPLETE_MONITOR_CONFIG.forEach(company => {
    results.totalUrls += company.urls.length;
    
    try {
      // Process each company (this would call the actual monitoring function)
      console.log(`Processing ${company.company} (${company.category}) - ${company.urls.length} URLs`);
      results.processed++;
    } catch (error) {
      console.error(`Error processing ${company.company}: ${error}`);
      results.errors++;
    }
  });
  
  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;
  
  return results;
}
