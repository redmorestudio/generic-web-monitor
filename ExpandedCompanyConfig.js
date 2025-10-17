/**
 * Expanded AI Competitor Monitor Configuration
 * ~50 companies covering major AI sectors
 * Updated for comprehensive market coverage
 */

const EXPANDED_MONITOR_CONFIG = [
  // === MAJOR LLM PROVIDERS ===
  {
    company: "Anthropic",
    urls: [
      { url: "https://anthropic.com", type: "homepage" },
      { url: "https://anthropic.com/claude", type: "product" },
      { url: "https://anthropic.com/pricing", type: "pricing" },
      { url: "https://anthropic.com/news", type: "news" }
    ]
  },
  {
    company: "OpenAI",
    urls: [
      { url: "https://openai.com", type: "homepage" },
      { url: "https://openai.com/chatgpt", type: "product" },
      { url: "https://openai.com/pricing", type: "pricing" },
      { url: "https://openai.com/blog", type: "blog" }
    ]
  },
  {
    company: "Google DeepMind",
    urls: [
      { url: "https://deepmind.google", type: "homepage" },
      { url: "https://ai.google/discover/gemini", type: "product" },
      { url: "https://blog.google/technology/ai/", type: "blog" }
    ]
  },
  {
    company: "Mistral AI",
    urls: [
      { url: "https://mistral.ai", type: "homepage" },
      { url: "https://mistral.ai/news/", type: "news" },
      { url: "https://mistral.ai/technology/", type: "technology" }
    ]
  },
  {
    company: "Meta AI",
    urls: [
      { url: "https://ai.meta.com", type: "homepage" },
      { url: "https://ai.meta.com/llama/", type: "product" },
      { url: "https://ai.meta.com/blog/", type: "blog" }
    ]
  },
  {
    company: "Cohere",
    urls: [
      { url: "https://cohere.com", type: "homepage" },
      { url: "https://cohere.com/products", type: "products" },
      { url: "https://cohere.com/pricing", type: "pricing" },
      { url: "https://cohere.com/blog", type: "blog" }
    ]
  },
  {
    company: "AI21 Labs",
    urls: [
      { url: "https://ai21.com", type: "homepage" },
      { url: "https://ai21.com/jamba", type: "product" },
      { url: "https://ai21.com/blog", type: "blog" }
    ]
  },
  {
    company: "Inflection AI",
    urls: [
      { url: "https://inflection.ai", type: "homepage" },
      { url: "https://pi.ai", type: "product" }
    ]
  },
  {
    company: "Aleph Alpha",
    urls: [
      { url: "https://aleph-alpha.com", type: "homepage" },
      { url: "https://aleph-alpha.com/luminous", type: "product" },
      { url: "https://aleph-alpha.com/blog", type: "blog" }
    ]
  },
  {
    company: "Stability AI",
    urls: [
      { url: "https://stability.ai", type: "homepage" },
      { url: "https://stability.ai/news", type: "news" },
      { url: "https://stability.ai/stable-diffusion", type: "product" }
    ]
  },
  
  // === AI-ASSISTED CODING ===
  {
    company: "Codeium",
    urls: [
      { url: "https://codeium.com", type: "homepage" },
      { url: "https://codeium.com/windsurf", type: "product" },
      { url: "https://codeium.com/pricing", type: "pricing" },
      { url: "https://codeium.com/blog", type: "blog" }
    ]
  },
  {
    company: "Anysphere (Cursor)",
    urls: [
      { url: "https://anysphere.inc", type: "homepage" },
      { url: "https://cursor.com", type: "product" },
      { url: "https://cursor.com/features", type: "features" },
      { url: "https://cursor.com/pricing", type: "pricing" }
    ]
  },
  {
    company: "GitHub Copilot",
    urls: [
      { url: "https://github.com/features/copilot", type: "product" },
      { url: "https://github.blog/tag/github-copilot/", type: "blog" },
      { url: "https://docs.github.com/en/copilot", type: "docs" }
    ]
  },
  {
    company: "Tabnine",
    urls: [
      { url: "https://tabnine.com", type: "homepage" },
      { url: "https://tabnine.com/pricing", type: "pricing" },
      { url: "https://tabnine.com/blog", type: "blog" }
    ]
  },
  {
    company: "Replit",
    urls: [
      { url: "https://replit.com", type: "homepage" },
      { url: "https://replit.com/ai", type: "product" },
      { url: "https://blog.replit.com", type: "blog" }
    ]
  },
  {
    company: "Amazon CodeWhisperer",
    urls: [
      { url: "https://aws.amazon.com/codewhisperer/", type: "product" },
      { url: "https://aws.amazon.com/codewhisperer/features/", type: "features" },
      { url: "https://aws.amazon.com/codewhisperer/pricing/", type: "pricing" }
    ]
  },
  {
    company: "Sourcegraph Cody",
    urls: [
      { url: "https://sourcegraph.com/cody", type: "product" },
      { url: "https://sourcegraph.com/pricing", type: "pricing" },
      { url: "https://about.sourcegraph.com/blog", type: "blog" }
    ]
  },
  {
    company: "Pieces for Developers",
    urls: [
      { url: "https://pieces.app", type: "homepage" },
      { url: "https://pieces.app/updates", type: "updates" }
    ]
  },
  
  // === AI SEARCH & RESEARCH ===
  {
    company: "Perplexity AI",
    urls: [
      { url: "https://perplexity.ai", type: "homepage" },
      { url: "https://perplexity.ai/pro", type: "pricing" },
      { url: "https://blog.perplexity.ai", type: "blog" }
    ]
  },
  {
    company: "You.com",
    urls: [
      { url: "https://you.com", type: "homepage" },
      { url: "https://you.com/pro", type: "pricing" },
      { url: "https://about.you.com/blog/", type: "blog" }
    ]
  },
  {
    company: "Neeva",
    urls: [
      { url: "https://neeva.com", type: "homepage" },
      { url: "https://neeva.com/blog", type: "blog" }
    ]
  },
  {
    company: "Andi Search",
    urls: [
      { url: "https://andisearch.com", type: "homepage" }
    ]
  },
  {
    company: "Phind",
    urls: [
      { url: "https://phind.com", type: "homepage" },
      { url: "https://phind.com/about", type: "about" }
    ]
  },
  
  // === AI VOICE & AUDIO ===
  {
    company: "ElevenLabs",
    urls: [
      { url: "https://elevenlabs.io", type: "homepage" },
      { url: "https://elevenlabs.io/pricing", type: "pricing" },
      { url: "https://elevenlabs.io/blog", type: "blog" }
    ]
  },
  {
    company: "Resemble AI",
    urls: [
      { url: "https://resemble.ai", type: "homepage" },
      { url: "https://resemble.ai/pricing/", type: "pricing" },
      { url: "https://resemble.ai/blog/", type: "blog" }
    ]
  },
  {
    company: "Descript",
    urls: [
      { url: "https://descript.com", type: "homepage" },
      { url: "https://descript.com/pricing", type: "pricing" },
      { url: "https://descript.com/blog", type: "blog" }
    ]
  },
  {
    company: "Murf AI",
    urls: [
      { url: "https://murf.ai", type: "homepage" },
      { url: "https://murf.ai/pricing", type: "pricing" }
    ]
  },
  {
    company: "WellSaid Labs",
    urls: [
      { url: "https://wellsaidlabs.com", type: "homepage" },
      { url: "https://wellsaidlabs.com/pricing/", type: "pricing" },
      { url: "https://wellsaidlabs.com/blog/", type: "blog" }
    ]
  },
  
  // === VIDEO & MEDIA AI (expanded) ===
  {
    company: "Synthesia",
    urls: [
      { url: "https://synthesia.io", type: "homepage" },
      { url: "https://synthesia.io/features", type: "features" },
      { url: "https://synthesia.io/pricing", type: "pricing" }
    ]
  },
  {
    company: "Pika",
    urls: [
      { url: "https://pika.art", type: "homepage" },
      { url: "https://pika.art/pricing", type: "pricing" }
    ]
  },
  {
    company: "RunwayML",
    urls: [
      { url: "https://runwayml.com", type: "homepage" },
      { url: "https://runwayml.com/pricing", type: "pricing" },
      { url: "https://runwayml.com/research", type: "research" }
    ]
  },
  {
    company: "HeyGen",
    urls: [
      { url: "https://heygen.com", type: "homepage" },
      { url: "https://heygen.com/pricing", type: "pricing" }
    ]
  },
  
  // === IMAGE GENERATION (expanded) ===
  {
    company: "Midjourney",
    urls: [
      { url: "https://midjourney.com", type: "homepage" },
      { url: "https://docs.midjourney.com", type: "docs" }
    ]
  },
  {
    company: "Ideogram",
    urls: [
      { url: "https://ideogram.ai", type: "homepage" },
      { url: "https://ideogram.ai/about", type: "about" }
    ]
  },
  {
    company: "Leonardo AI",
    urls: [
      { url: "https://leonardo.ai", type: "homepage" },
      { url: "https://leonardo.ai/pricing", type: "pricing" }
    ]
  },
  
  // === ENTERPRISE AI ===
  {
    company: "Scale AI",
    urls: [
      { url: "https://scale.com", type: "homepage" },
      { url: "https://scale.com/llm", type: "product" },
      { url: "https://scale.com/blog", type: "blog" }
    ]
  },
  {
    company: "Dataiku",
    urls: [
      { url: "https://dataiku.com", type: "homepage" },
      { url: "https://dataiku.com/product/", type: "product" },
      { url: "https://blog.dataiku.com", type: "blog" }
    ]
  },
  {
    company: "DataRobot",
    urls: [
      { url: "https://datarobot.com", type: "homepage" },
      { url: "https://datarobot.com/platform/", type: "platform" },
      { url: "https://datarobot.com/blog/", type: "blog" }
    ]
  },
  
  // === AI INFRASTRUCTURE ===
  {
    company: "Modular",
    urls: [
      { url: "https://modular.com", type: "homepage" },
      { url: "https://modular.com/mojo", type: "product" }
    ]
  },
  {
    company: "LangChain",
    urls: [
      { url: "https://langchain.com", type: "homepage" },
      { url: "https://langchain.com/langsmith", type: "product" },
      { url: "https://blog.langchain.dev", type: "blog" }
    ]
  },
  {
    company: "Weights & Biases",
    urls: [
      { url: "https://wandb.ai", type: "homepage" },
      { url: "https://wandb.ai/pricing", type: "pricing" },
      { url: "https://wandb.ai/fully-connected", type: "blog" }
    ]
  },
  {
    company: "Hugging Face",
    urls: [
      { url: "https://huggingface.co", type: "homepage" },
      { url: "https://huggingface.co/blog", type: "blog" },
      { url: "https://huggingface.co/pricing", type: "pricing" }
    ]
  },
  
  // === AI HARDWARE ===
  {
    company: "NVIDIA AI",
    urls: [
      { url: "https://nvidia.com/ai", type: "homepage" },
      { url: "https://blogs.nvidia.com/blog/category/artificial-intelligence/", type: "blog" },
      { url: "https://nvidia.com/en-us/ai-data-science/", type: "product" }
    ]
  },
  {
    company: "Cerebras",
    urls: [
      { url: "https://cerebras.net", type: "homepage" },
      { url: "https://cerebras.net/blog/", type: "blog" }
    ]
  },
  {
    company: "Graphcore",
    urls: [
      { url: "https://graphcore.ai", type: "homepage" },
      { url: "https://graphcore.ai/posts", type: "blog" }
    ]
  }
];

/**
 * Get expanded monitor configurations
 */
function getExpandedMonitorConfigurations() {
  return EXPANDED_MONITOR_CONFIG;
}

/**
 * Update configuration to use expanded list
 */
function upgradeToExpandedConfig() {
  const props = PropertiesService.getScriptProperties();
  
  // Store the new configuration
  props.setProperty('monitorConfigExpanded', JSON.stringify(EXPANDED_MONITOR_CONFIG));
  
  // Calculate statistics
  const totalUrls = EXPANDED_MONITOR_CONFIG.reduce((sum, company) => 
    sum + company.urls.length, 0
  );
  
  const categories = {
    'LLM Providers': 10,
    'AI Coding': 8,
    'AI Search': 5,
    'AI Voice/Audio': 5,
    'Video/Media AI': 4,
    'Image Generation': 3,
    'Enterprise AI': 3,
    'AI Infrastructure': 4,
    'AI Hardware': 3
  };
  
  const urlTypes = {};
  EXPANDED_MONITOR_CONFIG.forEach(company => {
    company.urls.forEach(urlObj => {
      urlTypes[urlObj.type] = (urlTypes[urlObj.type] || 0) + 1;
    });
  });
  
  // Log the update
  logActivity('config_update', {
    action: 'expanded_configuration',
    companies: EXPANDED_MONITOR_CONFIG.length,
    totalUrls: totalUrls,
    categories: categories,
    urlTypes: urlTypes,
    timestamp: new Date().toISOString()
  });
  
  return {
    success: true,
    message: 'Expanded configuration activated',
    stats: {
      companies: EXPANDED_MONITOR_CONFIG.length,
      totalUrls: totalUrls,
      avgUrlsPerCompany: (totalUrls / EXPANDED_MONITOR_CONFIG.length).toFixed(1),
      categories: categories,
      urlTypeBreakdown: urlTypes
    }
  };
}

/**
 * Get company list by category
 */
function getCompaniesByCategory() {
  return {
    'LLM Providers': [
      'Anthropic', 'OpenAI', 'Google DeepMind', 'Mistral AI', 'Meta AI',
      'Cohere', 'AI21 Labs', 'Inflection AI', 'Aleph Alpha', 'Stability AI'
    ],
    'AI Coding': [
      'Codeium', 'Anysphere (Cursor)', 'GitHub Copilot', 'Tabnine',
      'Replit', 'Amazon CodeWhisperer', 'Sourcegraph Cody', 'Pieces for Developers'
    ],
    'AI Search': [
      'Perplexity AI', 'You.com', 'Neeva', 'Andi Search', 'Phind'
    ],
    'AI Voice/Audio': [
      'ElevenLabs', 'Resemble AI', 'Descript', 'Murf AI', 'WellSaid Labs'
    ],
    'Video/Media AI': [
      'Synthesia', 'Pika', 'RunwayML', 'HeyGen'
    ],
    'Image Generation': [
      'Midjourney', 'Ideogram', 'Leonardo AI'
    ],
    'Enterprise AI': [
      'Scale AI', 'Dataiku', 'DataRobot'
    ],
    'AI Infrastructure': [
      'Modular', 'LangChain', 'Weights & Biases', 'Hugging Face'
    ],
    'AI Hardware': [
      'NVIDIA AI', 'Cerebras', 'Graphcore'
    ]
  };
}
