#!/usr/bin/env node

/**
 * Fix for 3D Graph Entity Data
 * 
 * This patch adds fallback entity data when baseline_analysis is empty
 * to ensure the 3D graph can render properly
 */

// Fallback entity data for each company category
const FALLBACK_ENTITIES = {
    'LLM Providers': {
        technologies: ['Transformer Models', 'Neural Networks', 'RLHF', 'Fine-tuning', 'Tokenization'],
        products: ['Language Models', 'API Services', 'Chat Interfaces', 'Embeddings', 'Code Generation'],
        ai_ml_concepts: ['Natural Language Processing', 'Deep Learning', 'Attention Mechanisms', 'Zero-shot Learning', 'Few-shot Learning']
    },
    'AI Coding': {
        technologies: ['Code Generation', 'AST Parsing', 'Language Models', 'IDE Integration', 'Syntax Analysis'],
        products: ['Code Completion', 'Bug Detection', 'Code Review', 'Documentation Generation', 'Test Generation'],
        ai_ml_concepts: ['Program Synthesis', 'Code Understanding', 'Semantic Code Search', 'AI Pair Programming', 'Code Refactoring']
    },
    'AI Search': {
        technologies: ['Vector Search', 'Embeddings', 'Knowledge Graphs', 'Semantic Search', 'RAG'],
        products: ['Search Engines', 'Answer Engines', 'Research Tools', 'Citation Systems', 'Query Understanding'],
        ai_ml_concepts: ['Information Retrieval', 'Query Expansion', 'Relevance Ranking', 'Semantic Similarity', 'Knowledge Extraction']
    },
    'Image Generation': {
        technologies: ['Diffusion Models', 'GANs', 'VAEs', 'Stable Diffusion', 'CLIP'],
        products: ['Text-to-Image', 'Image Editing', 'Style Transfer', 'Upscaling', 'Inpainting'],
        ai_ml_concepts: ['Generative AI', 'Latent Space', 'Prompt Engineering', 'Image Synthesis', 'Visual Understanding']
    },
    'AI Voice/Audio': {
        technologies: ['Speech Recognition', 'TTS', 'Voice Cloning', 'Audio Processing', 'Acoustic Models'],
        products: ['Voice Assistants', 'Transcription', 'Voice Synthesis', 'Audio Enhancement', 'Real-time Translation'],
        ai_ml_concepts: ['Speech Processing', 'Natural Language Understanding', 'Prosody', 'Voice Conversion', 'Audio Generation']
    },
    'Enterprise AI': {
        technologies: ['MLOps', 'Model Deployment', 'Data Pipelines', 'AutoML', 'Federated Learning'],
        products: ['AI Platforms', 'Model Management', 'Data Analytics', 'Business Intelligence', 'Workflow Automation'],
        ai_ml_concepts: ['Machine Learning Operations', 'Model Governance', 'AI Ethics', 'Explainable AI', 'Enterprise Integration']
    }
};

// Company-specific overrides
const COMPANY_ENTITIES = {
    'OpenAI': {
        technologies: ['GPT Architecture', 'DALL-E', 'Whisper', 'CLIP', 'WebGPT'],
        products: ['ChatGPT', 'GPT-4', 'DALL-E 3', 'Whisper API', 'GPT-4 Vision'],
        ai_ml_concepts: ['AGI Research', 'Constitutional AI', 'Multimodal AI', 'Chain of Thought', 'Emergent Abilities']
    },
    'Anthropic': {
        technologies: ['Constitutional AI', 'Claude Architecture', 'RLHF', 'AI Safety', 'Interpretability'],
        products: ['Claude', 'Claude Pro', 'Claude API', 'Claude for Business', 'Constitutional AI'],
        ai_ml_concepts: ['AI Alignment', 'Helpful Harmless Honest', 'Constitutional Training', 'AI Safety Research', 'Interpretable AI']
    },
    'Google DeepMind': {
        technologies: ['Gemini', 'PaLM', 'Chinchilla', 'Gopher', 'AlphaFold'],
        products: ['Bard', 'Gemini Pro', 'Gemini Ultra', 'PaLM API', 'Med-PaLM'],
        ai_ml_concepts: ['Multimodal Understanding', 'Scientific AI', 'Protein Folding', 'Reinforcement Learning', 'General Intelligence']
    },
    'Perplexity AI': {
        technologies: ['Search Augmented Generation', 'Real-time Web Access', 'Citation Systems', 'Query Understanding', 'RAG'],
        products: ['Perplexity Search', 'Perplexity Pro', 'Copilot', 'Academic Search', 'API Access'],
        ai_ml_concepts: ['Conversational Search', 'Source Attribution', 'Real-time Information', 'Answer Engine', 'Research Assistant']
    },
    'GitHub Copilot': {
        technologies: ['Codex', 'OpenAI Partnership', 'IDE Integration', 'Context Understanding', 'Multi-language Support'],
        products: ['Copilot', 'Copilot X', 'Copilot Chat', 'Copilot Voice', 'Copilot for Business'],
        ai_ml_concepts: ['AI Pair Programming', 'Code Completion', 'Natural Language to Code', 'Code Explanation', 'Test Generation']
    },
    'Midjourney': {
        technologies: ['Diffusion Models', 'Discord Integration', 'Prompt Understanding', 'Style Learning', 'Image Upscaling'],
        products: ['Midjourney Bot', 'Web Interface', 'Vary Region', 'Zoom Out', 'Style Tuner'],
        ai_ml_concepts: ['Artistic AI', 'Prompt Crafting', 'Style Transfer', 'Creative Generation', 'Visual Aesthetics']
    }
};

/**
 * Get entities for a company with fallback logic
 */
function getCompanyEntities(companyName, category) {
    // First check if we have company-specific data
    if (COMPANY_ENTITIES[companyName]) {
        return COMPANY_ENTITIES[companyName];
    }
    
    // Otherwise use category fallback
    if (FALLBACK_ENTITIES[category]) {
        return FALLBACK_ENTITIES[category];
    }
    
    // Default fallback
    return {
        technologies: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
        products: ['AI Services', 'API Platform', 'Cloud Solutions'],
        ai_ml_concepts: ['Artificial Intelligence', 'Automation', 'Data Processing']
    };
}

// Export for use in generate-static-data script
module.exports = {
    getCompanyEntities,
    FALLBACK_ENTITIES,
    COMPANY_ENTITIES
};

// If run directly, show the data
if (require.main === module) {
    console.log('Fallback Entity Data for 3D Graph Fix');
    console.log('=====================================\n');
    
    console.log('Category Fallbacks:');
    Object.entries(FALLBACK_ENTITIES).forEach(([category, entities]) => {
        console.log(`\n${category}:`);
        console.log(`  Technologies: ${entities.technologies.slice(0, 3).join(', ')}...`);
        console.log(`  Products: ${entities.products.slice(0, 3).join(', ')}...`);
        console.log(`  Concepts: ${entities.ai_ml_concepts.slice(0, 3).join(', ')}...`);
    });
    
    console.log('\n\nCompany-Specific Data:');
    Object.entries(COMPANY_ENTITIES).forEach(([company, entities]) => {
        console.log(`\n${company}:`);
        console.log(`  Technologies: ${entities.technologies.slice(0, 3).join(', ')}...`);
        console.log(`  Products: ${entities.products.slice(0, 3).join(', ')}...`);
        console.log(`  Concepts: ${entities.ai_ml_concepts.slice(0, 3).join(', ')}...`);
    });
}
