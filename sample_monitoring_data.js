// Sample monitoring results for TheBrain integration
// This represents what the AI Monitor would discover

const SAMPLE_MONITORING_RESULTS = {
  "timestamp": "2025-06-21T10:00:00Z",
  "entities": {
    "products": [
      // LLM Products
      {"name": "Claude Opus 4", "company": "Anthropic", "type": "LLM", "description": "Most advanced Claude model", "status": "GA"},
      {"name": "Claude Sonnet 4", "company": "Anthropic", "type": "LLM", "description": "Efficient Claude model", "status": "GA"},
      {"name": "GPT-4.5", "company": "OpenAI", "type": "LLM", "description": "Latest GPT enhancement", "status": "Beta"},
      {"name": "o3", "company": "OpenAI", "type": "Reasoning Model", "description": "Advanced reasoning model", "status": "Announced"},
      {"name": "Gemini Ultra", "company": "Google DeepMind", "type": "LLM", "description": "Multimodal AI model", "status": "GA"},
      {"name": "Llama 3", "company": "Meta AI", "type": "LLM", "description": "Open source LLM", "status": "GA"},
      
      // Coding Products
      {"name": "Windsurf", "company": "Codeium", "type": "IDE", "description": "AI-powered code editor", "status": "GA"},
      {"name": "Cursor", "company": "Anysphere", "type": "IDE", "description": "AI-first code editor", "status": "GA"},
      {"name": "GitHub Copilot", "company": "GitHub", "type": "Code Assistant", "description": "AI pair programmer", "status": "GA"},
      {"name": "Amazon CodeWhisperer", "company": "Amazon", "type": "Code Assistant", "description": "AI coding companion", "status": "GA"},
      
      // Search Products
      {"name": "Perplexity Pro", "company": "Perplexity AI", "type": "AI Search", "description": "AI-powered search engine", "status": "GA"},
      {"name": "You.com", "company": "You.com", "type": "AI Search", "description": "Personalized AI search", "status": "GA"},
      
      // Voice/Audio
      {"name": "ElevenLabs Voice", "company": "ElevenLabs", "type": "Voice AI", "description": "Voice synthesis platform", "status": "GA"},
      {"name": "Descript", "company": "Descript", "type": "Audio/Video Editor", "description": "AI-powered media editor", "status": "GA"}
    ],
    
    "technologies": [
      {"name": "Claude Code", "category": "Development Tool", "description": "Terminal-based AI coding", "usedBy": ["Anthropic"]},
      {"name": "GPT-4 Turbo API", "category": "API", "description": "Fast GPT-4 API", "usedBy": ["OpenAI"]},
      {"name": "Sora", "category": "Video Generation", "description": "Text-to-video AI", "usedBy": ["OpenAI"]},
      {"name": "DALL-E 3", "category": "Image Generation", "description": "Advanced image generation", "usedBy": ["OpenAI"]},
      {"name": "Copilot Workspace", "category": "Development", "description": "AI development environment", "usedBy": ["GitHub"]}
    ],
    
    "companies": [
      {"name": "Anthropic", "focus": "AI Safety", "type": "AI Research"},
      {"name": "OpenAI", "focus": "AGI", "type": "AI Research"},
      {"name": "Google DeepMind", "focus": "General AI", "type": "AI Research"},
      {"name": "Meta AI", "focus": "Open Source AI", "type": "AI Research"},
      {"name": "Perplexity AI", "focus": "AI Search", "type": "AI Application"},
      {"name": "ElevenLabs", "focus": "Voice AI", "type": "AI Application"},
      {"name": "Codeium", "focus": "AI Coding", "type": "Developer Tools"},
      {"name": "Anysphere", "focus": "AI Coding", "type": "Developer Tools"},
      {"name": "Scale AI", "focus": "AI Infrastructure", "type": "Enterprise AI"},
      {"name": "Hugging Face", "focus": "AI Community", "type": "AI Infrastructure"}
    ],
    
    "partnerships": [
      {"partners": ["OpenAI", "Microsoft"], "type": "Strategic", "description": "Multi-billion dollar partnership"},
      {"partners": ["Anthropic", "Google"], "type": "Investment", "description": "$2B investment deal"},
      {"partners": ["Meta", "Microsoft"], "type": "Technology", "description": "Llama on Azure"}
    ],
    
    "smartGroups": [
      {"name": "Foundation Models", "members": ["Claude Opus 4", "GPT-4.5", "Gemini Ultra", "Llama 3"]},
      {"name": "Code Generation", "members": ["Claude Code", "GitHub Copilot", "Cursor", "Windsurf"]},
      {"name": "AI Search Engines", "members": ["Perplexity Pro", "You.com", "Phind"]},
      {"name": "Voice & Audio AI", "members": ["ElevenLabs Voice", "Descript", "Murf AI"]},
      {"name": "Enterprise Ready", "members": ["Claude Opus 4", "GPT-4.5", "Scale AI"]}
    ]
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SAMPLE_MONITORING_RESULTS;
}
