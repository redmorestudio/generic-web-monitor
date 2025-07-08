#!/bin/bash

# Apply AI enhancement changes to generate-static-data-three-db.js

echo "Applying AI enhancement changes..."

# Create a backup
cp github-actions-backend/generate-static-data-three-db.js github-actions-backend/generate-static-data-three-db.js.backup

# Apply the changes using sed
cd github-actions-backend

# 1. Add AI fields to the SELECT statement
sed -i '' '596,608s/cd.relevance_score,/cd.relevance_score,\
                    cd.ai_explanation,\
                    cd.ai_key_changes,\
                    cd.ai_business_context,/' generate-static-data-three-db.js

# 2. Add content fetching and AI explanation usage
sed -i '' '/let interestLevel = change.relevance_score/a\
                \
                // Use AI explanation if available\
                if (change.ai_explanation) {\
                    aiProcessed = true;\
                    aiSummary = change.ai_explanation;\
                    \
                    // Parse key changes if available\
                    try {\
                        if (change.ai_key_changes) {\
                            keyDevelopments = JSON.parse(change.ai_key_changes);\
                        }\
                    } catch (e) {\
                        // Ignore parsing errors\
                    }\
                }
' generate-static-data-three-db.js

# 3. Add content snippet variables before return statement
sed -i '' '/emoji: emoji,/a\
                \
                // Fetch actual content for before/after display\
                let beforeContent = null;\
                let afterContent = null;\
                let contentSnippets = { before: null, after: null };\
                \
                if (change.old_content_id && change.new_content_id) {\
                    try {\
                        const oldRecord = contentStmt.get(change.old_content_id);\
                        const newRecord = contentStmt.get(change.new_content_id);\
                        \
                        if (oldRecord && newRecord) {\
                            beforeContent = oldRecord.markdown_text;\
                            afterContent = newRecord.markdown_text;\
                            \
                            // Extract relevant snippets showing the change\
                            contentSnippets = extractContentSnippets(beforeContent, afterContent);\
                        }\
                    } catch (err) {\
                        console.warn(`Could not fetch content for change ${change.id}:`, err.message);\
                    }\
                }
' generate-static-data-three-db.js

echo "✅ Changes applied successfully!"
