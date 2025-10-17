#!/usr/bin/env node

/**
 * Sync AI Monitor Results to TheBrain
 * Reads the latest monitoring data and creates/updates TheBrain entities
 */

const fs = require('fs');
const path = require('path');

// Read the TheBrain export data
const exportPath = path.join(__dirname, 'github-actions-backend', 'data', 'thebrain-export.json');
const smartGroupsPath = path.join(__dirname, 'github-actions-backend', 'data', 'smart-groups-report.json');

async function syncToTheBrain() {
  console.log('🧠 Syncing AI Monitor results to TheBrain...\n');

  try {
    // Read export data
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    const smartGroups = JSON.parse(fs.readFileSync(smartGroupsPath, 'utf8'));

    console.log('📊 Data Overview:');
    console.log(`- Thoughts to sync: ${exportData.thoughts.length}`);
    console.log(`- Links to create: ${exportData.links.length}`);
    console.log(`- Smart groups discovered: ${Object.keys(smartGroups.groups).length}`);
    console.log(`- Entities found:`);
    console.log(`  - Products: ${smartGroups.entities.products.length}`);
    console.log(`  - Technologies: ${smartGroups.entities.technologies.length}`);
    console.log(`  - Companies: ${smartGroups.entities.companies.length}`);
    console.log(`  - People: ${smartGroups.entities.people.length}`);

    console.log('\n📈 Top Smart Groups:');
    const topGroups = Object.entries(smartGroups.groups)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    topGroups.forEach(([name, data]) => {
      console.log(`  - ${name}: ${data.count} occurrences across ${data.companies.length} companies`);
    });

    console.log('\n🔥 High Threat Changes:');
    let highThreatCount = 0;
    Object.values(smartGroups.groups).forEach(group => {
      group.changes.forEach(change => {
        if (change.threat_level >= 7) {
          console.log(`  - ${change.company}: Threat level ${change.threat_level}/10`);
          highThreatCount++;
        }
      });
    });
    
    if (highThreatCount === 0) {
      console.log('  - No high threat changes detected');
    }

    console.log('\n💡 AI Recommendations:');
    smartGroups.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    // Create structure for TheBrain import
    const brainStructure = {
      mainThought: 'AI Monitor Entity Graph',
      categories: {
        products: {
          name: '🤖 Products',
          items: smartGroups.entities.products
        },
        technologies: {
          name: '💻 Technologies', 
          items: smartGroups.entities.technologies
        },
        companies: {
          name: '🏢 Companies',
          items: smartGroups.entities.companies
        },
        smartGroups: {
          name: '🎯 Smart Groups',
          items: Object.keys(smartGroups.groups)
        }
      },
      relationships: []
    };

    // Save formatted data for manual TheBrain import
    const formattedPath = path.join(__dirname, 'thebrain-import-ready.json');
    fs.writeFileSync(formattedPath, JSON.stringify(brainStructure, null, 2));

    console.log(`\n✅ TheBrain import data saved to: ${formattedPath}`);
    console.log('\n🔄 Next Steps:');
    console.log('1. The monitoring has discovered all entities');
    console.log('2. Smart groups have been auto-created');
    console.log('3. Use the formatted data to update TheBrain');
    console.log('4. Or run the MCP integration to auto-sync');

  } catch (error) {
    console.error('❌ Error syncing to TheBrain:', error);
    console.log('\nMake sure the monitoring has completed first!');
  }
}

// Run the sync
syncToTheBrain();
