#!/bin/bash

# Clean up dangerous schema modification scripts
# Run this to prevent accidental schema corruption

echo "🧹 Cleaning up dangerous schema modification scripts..."

# Directory to clean
DIR="/Users/sethredmore/ai-competitive-monitor/github-actions-backend"

# Create a backup directory for safety
BACKUP_DIR="$DIR/dangerous-scripts-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# List of dangerous patterns
DANGEROUS_PATTERNS=(
  "fix-*-schema*.js"
  "fix-postgres-*.js"
  "fix-baseline-*.js"
  "fix-all-*.js"
  "migrate-*.js"
  "cleanup-*.js"
  "quick-postgres-*.js"
)

# Move dangerous files to backup
echo "Moving dangerous files to backup directory: $BACKUP_DIR"

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  for file in $DIR/$pattern; do
    if [ -f "$file" ]; then
      # Skip our new protection script
      if [ "$(basename $file)" = "fix-postgres-schema-complete.js" ]; then
        echo "✅ Keeping: $file (master schema fix script)"
        continue
      fi
      
      echo "⚠️  Moving: $file"
      mv "$file" "$BACKUP_DIR/"
    fi
  done
done

echo ""
echo "✅ Cleanup complete!"
echo "📁 Dangerous scripts backed up to: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: From now on, all schema changes MUST use:"
echo "   - schema-protector.js for protection"
echo "   - fix-postgres-schema-complete.js as the master fix script"
echo ""
echo "To restore any script, find it in: $BACKUP_DIR"
