#!/bin/bash
# Import critical links to connect the knowledge graph

echo "Importing essential links to connect AI companies and products..."

BRAIN_ID="134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY="4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"


echo "Creating links batch 1..."

# Anthropic -> Claude (owns)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "952e58f7-6365-4991-9cdc-a9be89039584", "relation": jump, "name": "owns", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude -> chat interface (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "952e58f7-6365-4991-9cdc-a9be89039584", "thoughtIdB": "f83e6bee-6edc-420a-9f63-743f05eb10c4", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude -> web access (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "952e58f7-6365-4991-9cdc-a9be89039584", "thoughtIdB": "c84581f0-8624-456a-8168-ef681a471a1d", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude -> mobile apps (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "952e58f7-6365-4991-9cdc-a9be89039584", "thoughtIdB": "fbb53e3f-e5b5-4ec1-8a50-ac9bdf1e72fe", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Claude Code (owns)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "fe4059c9-0dca-4b7c-aa5e-832e07c77d93", "relation": jump, "name": "owns", "color": "#6fbf6f"}' \
  -s > /dev/null
sleep 1

# Claude Code -> code generation (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fe4059c9-0dca-4b7c-aa5e-832e07c77d93", "thoughtIdB": "b0660763-1fff-4668-bc67-6ad465e03a59", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude Code -> debugging (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fe4059c9-0dca-4b7c-aa5e-832e07c77d93", "thoughtIdB": "678a6cb3-d36c-4e68-b07e-a4d2035bdf74", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude Code -> code review (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fe4059c9-0dca-4b7c-aa5e-832e07c77d93", "thoughtIdB": "3170074e-7dc8-4653-87f9-83820cea0d32", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Claude API (owns)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "8c30c471-03af-4752-9567-b7dc471e4684", "relation": jump, "name": "owns", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude API -> developer console (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8c30c471-03af-4752-9567-b7dc471e4684", "thoughtIdB": "16cb534b-f5a0-4169-9ec6-9d9f5e2f255a", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null
sleep 1

# Claude API -> documentation (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8c30c471-03af-4752-9567-b7dc471e4684", "thoughtIdB": "1284c6b8-608b-41e6-9230-c697c47f9156", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude API -> custom integrations (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8c30c471-03af-4752-9567-b7dc471e4684", "thoughtIdB": "e29467a5-be1e-40cb-8d23-2ce7f4a3ceaf", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Claude Haiku 3.5 (implements)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "804396af-fcb9-442d-9d74-3a8b3c6fe610", "relation": jump, "name": "implements", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Constitutional AI (implements)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "96714c57-7af6-4c6e-a5f7-1cffb348fb83", "relation": jump, "name": "implements", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Model Context Protocol (implements)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "f5e439f2-3105-4628-be72-92a83f53860a", "relation": jump, "name": "implements", "color": "#6fbf6f"}' \
  -s > /dev/null
sleep 1

# Anthropic -> Amazon Web Services (partners with)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "657f171a-7c32-4398-970c-d88a69b93c9e", "relation": jump, "name": "partners with", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Google Cloud (partners with)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "24dd2058-a14b-4190-b4f9-0ef73940ecd1", "relation": jump, "name": "partners with", "color": "#6fbf6f"}' \
  -s > /dev/null

# Anthropic -> Cohere (competes with)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "291949e5-8d64-4e8b-b8d4-1b3fa872516c", "thoughtIdB": "2f8d4c93-ecda-4c03-8ee2-0ad2fc970e36", "relation": jump, "name": "competes with", "color": "#6fbf6f"}' \
  -s > /dev/null

# Claude -> code generation (features)
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "952e58f7-6365-4991-9cdc-a9be89039584", "thoughtIdB": "b0660763-1fff-4668-bc67-6ad465e03a59", "relation": jump, "name": "features", "color": "#6fbf6f"}' \
  -s > /dev/null


echo ""
echo "Essential links import complete!"
echo "Created 19 critical connections"
echo ""
echo "Key connections established:"
echo "- Anthropic -> Claude products"
echo "- Claude -> Features (chat, web, mobile)"  
echo "- Claude Code -> Development features"
echo "- Claude API -> Developer features"
echo "- Companies -> Technologies"
echo "- Companies -> Partners"
