#!/usr/bin/env python3
"""
Generate notes for TheBrain thoughts based on entity types
"""
import json
import os
from datetime import datetime

# Load the knowledge graph data
BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
with open(os.path.join(BASE_DIR, "thebrain-knowledge-graph.json"), 'r') as f:
    data = json.load(f)

# Note templates by entity type
NOTE_TEMPLATES = {
    "company": """# {name}

**Entity Type:** Company
**Category:** {label}
**Industry Focus:** AI/Technology
**Added:** {date}

## Overview
{name} is a key player in the AI competitive landscape. This company represents a significant force in the development and deployment of artificial intelligence technologies.

## Key Areas
- AI research and development
- Product innovation
- Market presence
- Strategic partnerships

## Competitive Analysis
- **Market Position:** Established competitor in AI space
- **Core Strengths:** Technology development, market reach
- **Key Products:** See linked products and features
- **Technologies:** See linked technology implementations

## Keywords
{name}, AI company, artificial intelligence, {label}, technology competitor, innovation

## Notes
This entity is monitored as part of the competitive intelligence system. All related products, features, and technologies are linked as child thoughts.
""",

    "product": """# {name}

**Entity Type:** Product
**Category:** {label}
**Product Type:** AI-Powered Solution
**Status:** Active

## Product Description
{name} represents a key product offering in the AI ecosystem. This product demonstrates the practical application of advanced AI technologies in real-world scenarios.

## Key Features
- Advanced AI capabilities
- User-focused design
- Scalable architecture
- Integration capabilities

## Market Impact
- Target audience: Varies by product segment
- Competitive advantage: Innovation and performance
- Market penetration: Growing adoption

## Technical Specifications
- Built on advanced AI models
- Cloud-native architecture
- API-first design
- Enterprise-ready features

## Keywords
{name}, AI product, {label}, artificial intelligence solution, technology product

## Related Information
Connected features and capabilities are linked as child thoughts. Parent company provides additional context.
""",

    "feature": """# {name}

**Entity Type:** Feature
**Category:** {label}
**Feature Type:** AI Capability
**Implementation:** Active

## Feature Overview
{name} is a specific capability or functionality that enhances AI products and services. This feature represents a key differentiator in the competitive landscape.

## Description
This feature enables advanced functionality within AI systems, providing users with enhanced capabilities and improved experiences.

## Benefits
- Enhanced user experience
- Improved efficiency
- Advanced capabilities
- Competitive differentiation

## Technical Details
- Integration: Seamless with parent products
- Performance: Optimized for scale
- Reliability: Enterprise-grade
- Security: Built-in protections

## Keywords
{name}, AI feature, {label}, capability, functionality, enhancement

## Usage Context
This feature is typically found in modern AI applications and represents current best practices in AI development.
""",

    "technology": """# {name}

**Entity Type:** Technology
**Category:** {label}
**Tech Stack:** AI/ML Infrastructure
**Maturity:** Production-Ready

## Technology Overview
{name} represents a fundamental technology component in the AI ecosystem. This technology enables advanced capabilities and serves as a building block for AI solutions.

## Technical Description
This technology provides core functionality for AI systems, enabling sophisticated processing, learning, and inference capabilities.

## Key Characteristics
- **Architecture:** Advanced design patterns
- **Scalability:** Built for enterprise scale
- **Performance:** Optimized for AI workloads
- **Flexibility:** Adaptable to various use cases

## Applications
- Machine learning systems
- Natural language processing
- Computer vision
- Predictive analytics
- Automation solutions

## Industry Impact
This technology is shaping the future of AI development and deployment across industries.

## Keywords
{name}, AI technology, {label}, machine learning, artificial intelligence, tech stack

## Related Components
See linked products and features that utilize this technology.
""",

    "pricing": """# {name}

**Entity Type:** Pricing
**Category:** {label}
**Model Type:** Subscription/Usage-Based
**Market Segment:** Varies

## Pricing Overview
{name} represents a pricing model in the AI competitive landscape. Understanding pricing strategies is crucial for competitive intelligence.

## Pricing Structure
This pricing tier/model reflects current market approaches to AI monetization and accessibility.

## Key Considerations
- **Target Market:** Specific user segments
- **Value Proposition:** Cost vs. capabilities
- **Competitive Position:** Market comparison
- **Flexibility:** Scalability options

## Market Analysis
Pricing strategies in AI reflect the balance between innovation investment and market accessibility.

## Keywords
{name}, AI pricing, {label}, subscription model, pricing strategy, competitive pricing

## Strategic Implications
Pricing models influence market adoption and competitive dynamics in the AI space.
""",

    "person": """# {name}

**Entity Type:** Person
**Category:** {label}
**Role:** AI Industry Leader
**Influence:** High

## Profile Overview
{name} is a key figure in the AI industry, contributing to the advancement and direction of artificial intelligence technologies.

## Background
Industry leader with significant influence on AI development, strategy, and adoption.

## Areas of Influence
- Thought leadership
- Strategic direction
- Technology advocacy
- Industry partnerships

## Contributions
- AI research and development
- Industry insights
- Strategic initiatives
- Community building

## Keywords
{name}, AI leader, {label}, industry expert, thought leader, AI influencer

## Professional Network
Connected to various companies, products, and initiatives in the AI ecosystem.
""",

    "market": """# {name}

**Entity Type:** Market
**Category:** {label}
**Market Type:** AI/Technology Segment
**Geographic Scope:** Varies

## Market Overview
{name} represents a key market segment in the AI competitive landscape. Understanding market dynamics is essential for strategic positioning.

## Market Characteristics
- **Size:** Significant and growing
- **Growth Rate:** Rapid expansion
- **Competition:** Intense innovation
- **Barriers:** Technical and resource requirements

## Key Drivers
- Digital transformation
- AI adoption
- Efficiency demands
- Innovation pressure

## Opportunities
- Emerging use cases
- Unmet needs
- Technology convergence
- Market expansion

## Keywords
{name}, AI market, {label}, market segment, industry analysis, competitive landscape

## Strategic Importance
This market segment represents significant opportunities for AI innovation and deployment.
""",

    "capability": """# {name}

**Entity Type:** Capability
**Category:** {label}
**Type:** Strategic AI Capability
**Implementation Level:** Advanced

## Capability Overview
{name} represents a core capability in the AI competitive landscape. This capability enables organizations to deliver advanced AI solutions and maintain competitive advantage.

## Description
This capability encompasses the skills, technologies, and processes required to deliver sophisticated AI functionality.

## Key Components
- Technical expertise
- Infrastructure support
- Process maturity
- Innovation capacity

## Strategic Value
- **Differentiation:** Unique value proposition
- **Efficiency:** Operational excellence
- **Innovation:** Future readiness
- **Scale:** Growth enablement

## Implementation
Organizations develop this capability through:
- Technology investment
- Talent acquisition
- Process optimization
- Partnership strategies

## Keywords
{name}, AI capability, {label}, strategic capability, competitive advantage, core competency

## Related Elements
This capability supports various products and features across the AI ecosystem.
""",

    "concept": """# {name}

**Entity Type:** Concept
**Category:** {label}
**Domain:** AI/Technology
**Relevance:** High

## Concept Overview
{name} is a fundamental concept in the AI domain that shapes understanding and development of artificial intelligence technologies.

## Definition
This concept represents key ideas, principles, or frameworks that guide AI development and deployment.

## Significance
- Theoretical foundation
- Practical applications
- Industry standards
- Future directions

## Applications
- AI system design
- Implementation strategies
- Best practices
- Innovation frameworks

## Keywords
{name}, AI concept, {label}, artificial intelligence, conceptual framework, theory

## Related Topics
Connected to various implementations and applications across the AI landscape.
""",

    "tech_category": """# {name}

**Entity Type:** Technology Category
**Category:** {label}
**Scope:** AI Technology Classification
**Coverage:** Comprehensive

## Category Overview
{name} represents a major technology category in the AI ecosystem, encompassing related technologies, approaches, and solutions.

## Description
This category groups related AI technologies and approaches, providing structure to the complex AI landscape.

## Included Technologies
- Core technologies
- Supporting infrastructure
- Development tools
- Deployment solutions

## Industry Relevance
- Market segmentation
- Technology tracking
- Innovation patterns
- Investment focus

## Keywords
{name}, technology category, {label}, AI classification, tech taxonomy, industry categorization

## Strategic Context
Understanding technology categories helps in mapping the competitive landscape and identifying opportunities.
"""
}

def generate_note(thought):
    """Generate a note for a thought based on its entity type"""
    entity_type = thought.get('entityType', 'unknown')
    template = NOTE_TEMPLATES.get(entity_type, NOTE_TEMPLATES['concept'])
    
    # Generate note using template
    note = template.format(
        name=thought['name'],
        label=thought.get('label', 'N/A'),
        date=datetime.now().strftime('%Y-%m-%d')
    )
    
    return note

def main():
    print("Generating notes for all thoughts...")
    print("="*60)
    
    # Generate notes for all thoughts
    notes = {}
    
    # Count by entity type
    entity_counts = {}
    
    for thought in data['thoughts']:
        entity_type = thought.get('entityType', 'unknown')
        entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1
        
        # Generate note
        note_content = generate_note(thought)
        notes[thought['id']] = note_content
    
    print(f"Generated {len(notes)} notes")
    print("\nNotes by entity type:")
    for entity_type, count in sorted(entity_counts.items()):
        print(f"  - {entity_type}: {count}")
    
    # Save notes
    notes_file = os.path.join(BASE_DIR, "generated_notes.json")
    with open(notes_file, 'w') as f:
        json.dump(notes, f, indent=2)
    
    print(f"\nNotes saved to: {notes_file}")
    
    # Also create a sample file with first 5 notes for review
    sample_notes = {k: notes[k] for k in list(notes.keys())[:5]}
    sample_file = os.path.join(BASE_DIR, "sample_notes.json")
    with open(sample_file, 'w') as f:
        json.dump(sample_notes, f, indent=2)
    
    print(f"Sample notes saved to: {sample_file}")
    
    # Create import script for notes
    import_script = """#!/usr/bin/env python3
'''
Import notes into TheBrain after thoughts are created
'''
import json
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"

# Load ID mappings
with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
    id_mapping = json.load(f)

# Load generated notes
with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
    notes = json.load(f)

print(f"Ready to import {len(notes)} notes")
print(f"Have mappings for {len(id_mapping)} thoughts")

# Match notes to new thought IDs
notes_to_import = []
for old_id, note_content in notes.items():
    if old_id in id_mapping:
        new_id = id_mapping[old_id]
        notes_to_import.append({
            'thought_id': new_id,
            'old_id': old_id,
            'content': note_content
        })

print(f"Matched {len(notes_to_import)} notes to import")

# Save matched notes for import
with open(os.path.join(BASE_DIR, "notes_to_import.json"), 'w') as f:
    json.dump(notes_to_import, f, indent=2)

print("Notes prepared for import!")
"""
    
    script_file = os.path.join(BASE_DIR, "prepare_notes_import.py")
    with open(script_file, 'w') as f:
        f.write(import_script)
    
    print(f"\nImport script saved to: {script_file}")

if __name__ == "__main__":
    main()
