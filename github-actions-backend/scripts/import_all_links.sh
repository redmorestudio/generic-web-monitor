#!/bin/bash
# Auto-generated TheBrain links import script
# This will import all 743 links

echo "Starting TheBrain import of 743 links..."
echo ""

# Brain ID  
BRAIN_ID="134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY="4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

# Import all links
echo "Importing links..."


echo 'Progress: Importing links 1 to 50...'

# Link 1: 106bd0876b202b114115af61835bd36e -> c2812622a114892f20341032d2580f10
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "c2812622a114892f20341032d2580f10", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 2: c2812622a114892f20341032d2580f10 -> 01d578a40b91652e2ba6adc3b39dd5f3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "01d578a40b91652e2ba6adc3b39dd5f3", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 3: c2812622a114892f20341032d2580f10 -> daf8aadd85aff6d31b042534a3bcc484
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "daf8aadd85aff6d31b042534a3bcc484", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 4: c2812622a114892f20341032d2580f10 -> 385c8d0c745daff73bb1cc3683022e2a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "385c8d0c745daff73bb1cc3683022e2a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 5: 106bd0876b202b114115af61835bd36e -> 3cc98b80bd87f2337a927b0451f0dd43
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "3cc98b80bd87f2337a927b0451f0dd43", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 6: 3cc98b80bd87f2337a927b0451f0dd43 -> aeea9baf1f5b102106fc38921dc6c70a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "aeea9baf1f5b102106fc38921dc6c70a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 7: 3cc98b80bd87f2337a927b0451f0dd43 -> 011c37b7182412061de0f76acf0ed97d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "011c37b7182412061de0f76acf0ed97d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 8: 3cc98b80bd87f2337a927b0451f0dd43 -> 7534ae1cc21ca8afaf3967be66c055e0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "7534ae1cc21ca8afaf3967be66c055e0", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 9: 106bd0876b202b114115af61835bd36e -> 80e036e542b880c4c6a8399cc583dad8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "80e036e542b880c4c6a8399cc583dad8", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 10: 80e036e542b880c4c6a8399cc583dad8 -> e637bde0560c366c23179e07816f47fa
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "e637bde0560c366c23179e07816f47fa", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 11: 80e036e542b880c4c6a8399cc583dad8 -> 3bd5b345df3490422d2c1fe0a643494e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "3bd5b345df3490422d2c1fe0a643494e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 12: 80e036e542b880c4c6a8399cc583dad8 -> edac2625b6fb5e1fbb432dc133dd42b4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "edac2625b6fb5e1fbb432dc133dd42b4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 13: 106bd0876b202b114115af61835bd36e -> 039cda031581553bea7a01d7d3826d3a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "039cda031581553bea7a01d7d3826d3a", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 14: 106bd0876b202b114115af61835bd36e -> 824a26f61c7831a59180574af351ba19
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "824a26f61c7831a59180574af351ba19", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 15: 106bd0876b202b114115af61835bd36e -> b1ca6eb9d8887decf7426758a71582c3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "b1ca6eb9d8887decf7426758a71582c3", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 16: 106bd0876b202b114115af61835bd36e -> 850227f030f0daed82d7a2b0c7ada158
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "850227f030f0daed82d7a2b0c7ada158", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 17: 106bd0876b202b114115af61835bd36e -> 681e5504b13ccdeb2021a0aea70ef576
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "681e5504b13ccdeb2021a0aea70ef576", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 18: 106bd0876b202b114115af61835bd36e -> 89960936f84f50c3c685a905ab5ea0e2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "89960936f84f50c3c685a905ab5ea0e2", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 19: 106bd0876b202b114115af61835bd36e -> d947634644322f459000d23d3b723235
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "d947634644322f459000d23d3b723235", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 20: 106bd0876b202b114115af61835bd36e -> df7f07c5b1e4cd27ae59db6c9034e6f5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "df7f07c5b1e4cd27ae59db6c9034e6f5", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 21: 106bd0876b202b114115af61835bd36e -> 6d240db81fee0106c285569e24a50a27
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "6d240db81fee0106c285569e24a50a27", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 22: 106bd0876b202b114115af61835bd36e -> 1c0433dc819a5cac3351d499c1714e38
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "1c0433dc819a5cac3351d499c1714e38", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 23: 106bd0876b202b114115af61835bd36e -> 2e295211220d287cfd65dcf42cbbb039
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "2e295211220d287cfd65dcf42cbbb039", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 24: 106bd0876b202b114115af61835bd36e -> c524558407824dfcbd90ff682d1342f3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "c524558407824dfcbd90ff682d1342f3", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 25: 106bd0876b202b114115af61835bd36e -> 52b506d457a89e64a6dcf95126145ce4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "52b506d457a89e64a6dcf95126145ce4", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 26: 106bd0876b202b114115af61835bd36e -> eeb34a68883c2db3edf10993a920a41c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "eeb34a68883c2db3edf10993a920a41c", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 27: 106bd0876b202b114115af61835bd36e -> 7051dc3f27d8d018dd6cfb52b99dd842
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "7051dc3f27d8d018dd6cfb52b99dd842", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 28: 106bd0876b202b114115af61835bd36e -> 9843104d817b57926aad05d8df01cd9e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "9843104d817b57926aad05d8df01cd9e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 29: 106bd0876b202b114115af61835bd36e -> 85a510ef0e4ece4ff6850dde6dbcff69
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "85a510ef0e4ece4ff6850dde6dbcff69", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 30: 106bd0876b202b114115af61835bd36e -> 9598305c9a03445febd3e07c32343c8b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "9598305c9a03445febd3e07c32343c8b", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 31: 106bd0876b202b114115af61835bd36e -> 35649fa9102409eb3e4422633a71aca1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "35649fa9102409eb3e4422633a71aca1", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 32: 106bd0876b202b114115af61835bd36e -> 7d5a82c8b74db2aecf2f422ba8770d86
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "7d5a82c8b74db2aecf2f422ba8770d86", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 33: 106bd0876b202b114115af61835bd36e -> 6e5a03053d8487f2b5838a80bd395ed4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "6e5a03053d8487f2b5838a80bd395ed4", "relation": jump, "name": "competes with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 34: 106bd0876b202b114115af61835bd36e -> b563d2d8df2387cc1ed2a447a4634786
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "b563d2d8df2387cc1ed2a447a4634786", "relation": jump, "name": "competes with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 35: c2812622a114892f20341032d2580f10 -> aeea9baf1f5b102106fc38921dc6c70a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "aeea9baf1f5b102106fc38921dc6c70a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 36: c2812622a114892f20341032d2580f10 -> 4e720cec528dd35ba031d392290f00a2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "4e720cec528dd35ba031d392290f00a2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 37: c2812622a114892f20341032d2580f10 -> aaf13b445211601b2d3cbb3cfeb8c847
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "aaf13b445211601b2d3cbb3cfeb8c847", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 38: c2812622a114892f20341032d2580f10 -> fb383eb9db6e29ead08d3184e6d04117
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "fb383eb9db6e29ead08d3184e6d04117", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 39: c2812622a114892f20341032d2580f10 -> 2f5a13c77ac78fdf887bf0067111f1b9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "2f5a13c77ac78fdf887bf0067111f1b9", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 40: c2812622a114892f20341032d2580f10 -> 39c043e2c77704b5dffb76e9efe4378c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "39c043e2c77704b5dffb76e9efe4378c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 41: c2812622a114892f20341032d2580f10 -> b1695e5fc4ec75213b7e7ba6973b672a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "b1695e5fc4ec75213b7e7ba6973b672a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 42: 80e036e542b880c4c6a8399cc583dad8 -> a4db3c18e3ea3bc1c0b7c175d3179f63
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "a4db3c18e3ea3bc1c0b7c175d3179f63", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 43: 80e036e542b880c4c6a8399cc583dad8 -> a86cab3cba3f95f15439e4f42d9dbc1c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "a86cab3cba3f95f15439e4f42d9dbc1c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 44: 80e036e542b880c4c6a8399cc583dad8 -> 97664924605efb82e37895566fe114bb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "97664924605efb82e37895566fe114bb", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 45: 80e036e542b880c4c6a8399cc583dad8 -> 74b257f529553cbef8349041c3ed0df7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "74b257f529553cbef8349041c3ed0df7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 46: 3cc98b80bd87f2337a927b0451f0dd43 -> 0efc7a2ede5d016671e8a9e91959cb2b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "0efc7a2ede5d016671e8a9e91959cb2b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 47: 3cc98b80bd87f2337a927b0451f0dd43 -> 0512ed0403391b9b4cc73b3dd71ba5cb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "0512ed0403391b9b4cc73b3dd71ba5cb", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 48: 106bd0876b202b114115af61835bd36e -> 99c8c55e59f9215fb4eee0def1f599f8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "99c8c55e59f9215fb4eee0def1f599f8", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 49: 106bd0876b202b114115af61835bd36e -> 5676381d115a9ac91ea7fd8c43f5c722
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "5676381d115a9ac91ea7fd8c43f5c722", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 50: 106bd0876b202b114115af61835bd36e -> e959339e051cee9c389c9d8584b46495
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "e959339e051cee9c389c9d8584b46495", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 51 to 100...'

# Link 51: 106bd0876b202b114115af61835bd36e -> d518d85f4325a90093ed0cbbcfb84a7b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "d518d85f4325a90093ed0cbbcfb84a7b", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 52: 106bd0876b202b114115af61835bd36e -> 0d04d4cdf02c6d0867f65716c175d85c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "0d04d4cdf02c6d0867f65716c175d85c", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 53: 106bd0876b202b114115af61835bd36e -> 09dffc608413924dd3404242a0ae9acb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "09dffc608413924dd3404242a0ae9acb", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 54: 106bd0876b202b114115af61835bd36e -> d1ef506e0ea04c27be83daa1ce815940
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "d1ef506e0ea04c27be83daa1ce815940", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 55: 106bd0876b202b114115af61835bd36e -> 52936e7d801433af0c8c999c22172423
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "52936e7d801433af0c8c999c22172423", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 56: 106bd0876b202b114115af61835bd36e -> 6dc0edf1762a48348219de9725c60a4b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "6dc0edf1762a48348219de9725c60a4b", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 57: 106bd0876b202b114115af61835bd36e -> cbb84d9fa1d8b681e15f210948b8d785
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "cbb84d9fa1d8b681e15f210948b8d785", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 58: 106bd0876b202b114115af61835bd36e -> 87e32fe40589180e841ce518e421889b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "87e32fe40589180e841ce518e421889b", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 59: 106bd0876b202b114115af61835bd36e -> 6fa25a61295aec833a2b647ea38e089c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "6fa25a61295aec833a2b647ea38e089c", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 60: 106bd0876b202b114115af61835bd36e -> 694e50859adae9b4327c1547a2a20b8c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "694e50859adae9b4327c1547a2a20b8c", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 61: 106bd0876b202b114115af61835bd36e -> 26e87a6e62a6f4bc3a4b6bc5173d7f75
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "26e87a6e62a6f4bc3a4b6bc5173d7f75", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 62: 106bd0876b202b114115af61835bd36e -> 1f2cff07fe524aab9c139cc5d05fbf24
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "1f2cff07fe524aab9c139cc5d05fbf24", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 63: 106bd0876b202b114115af61835bd36e -> d314285c3075e7ed8f7ecf644e4889ae
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "d314285c3075e7ed8f7ecf644e4889ae", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 64: 106bd0876b202b114115af61835bd36e -> d04bd5a6a989bf1e82dfb44175fa3b7a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "d04bd5a6a989bf1e82dfb44175fa3b7a", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 65: 106bd0876b202b114115af61835bd36e -> c36de3210039d5249b1b967730527175
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "c36de3210039d5249b1b967730527175", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 66: 106bd0876b202b114115af61835bd36e -> 170cc92eb852bace04e60e47494bf00f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "170cc92eb852bace04e60e47494bf00f", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 67: c2812622a114892f20341032d2580f10 -> 524f2fd64eb76462c2d290d5d47a34f3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "524f2fd64eb76462c2d290d5d47a34f3", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 68: c2812622a114892f20341032d2580f10 -> 30659d882b3ba9a3e71e7b266bc57af1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "30659d882b3ba9a3e71e7b266bc57af1", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 69: c2812622a114892f20341032d2580f10 -> c77191a3ebb89d3d1b1ad847b487d2cf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "c77191a3ebb89d3d1b1ad847b487d2cf", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 70: c2812622a114892f20341032d2580f10 -> 323112ea0ff48f14526fbc0a3f8e291b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "323112ea0ff48f14526fbc0a3f8e291b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 71: c2812622a114892f20341032d2580f10 -> 8a9ddd60093bcd442912e200e8d4e57e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c2812622a114892f20341032d2580f10", "thoughtIdB": "8a9ddd60093bcd442912e200e8d4e57e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 72: 3cc98b80bd87f2337a927b0451f0dd43 -> 694f91c8c33c89cf4a94a92595ca42dd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "694f91c8c33c89cf4a94a92595ca42dd", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 73: 3cc98b80bd87f2337a927b0451f0dd43 -> c48899f7ca1d58d2b6bb13fc5d672172
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3cc98b80bd87f2337a927b0451f0dd43", "thoughtIdB": "c48899f7ca1d58d2b6bb13fc5d672172", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 74: 80e036e542b880c4c6a8399cc583dad8 -> 9a68b113eeb13806f09487cd277db235
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "80e036e542b880c4c6a8399cc583dad8", "thoughtIdB": "9a68b113eeb13806f09487cd277db235", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 75: 106bd0876b202b114115af61835bd36e -> eaf4f501ad49c313dfd20ca0afcdb263
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "eaf4f501ad49c313dfd20ca0afcdb263", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 76: 106bd0876b202b114115af61835bd36e -> 2f8d3e5a8248caecd42b872be0f75465
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "2f8d3e5a8248caecd42b872be0f75465", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 77: 106bd0876b202b114115af61835bd36e -> ab9f750f9ba1978de8662ac614f21c30
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "ab9f750f9ba1978de8662ac614f21c30", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 78: 106bd0876b202b114115af61835bd36e -> fef69070789e141eaed83ef42b249213
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "fef69070789e141eaed83ef42b249213", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 79: 106bd0876b202b114115af61835bd36e -> 2af69705fb3a9258528f8affa0d0c5b8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "2af69705fb3a9258528f8affa0d0c5b8", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 80: 106bd0876b202b114115af61835bd36e -> 1fef885171de088395b8f0e4abeb419c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "1fef885171de088395b8f0e4abeb419c", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 81: 106bd0876b202b114115af61835bd36e -> 45a42ae4951d876b82afadc5118814b6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "45a42ae4951d876b82afadc5118814b6", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 82: 106bd0876b202b114115af61835bd36e -> 20b8a72e38fd85562dc9eff1c61d559f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "20b8a72e38fd85562dc9eff1c61d559f", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 83: 106bd0876b202b114115af61835bd36e -> 6d8a67ae071b13e26019b6163c26b56b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "6d8a67ae071b13e26019b6163c26b56b", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 84: 106bd0876b202b114115af61835bd36e -> f916cfcc38581e33aebacccde80fda98
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "106bd0876b202b114115af61835bd36e", "thoughtIdB": "f916cfcc38581e33aebacccde80fda98", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 85: b563d2d8df2387cc1ed2a447a4634786 -> 0906ce18d4920f58855471a7f36c37c6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "0906ce18d4920f58855471a7f36c37c6", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 86: 0906ce18d4920f58855471a7f36c37c6 -> fb0551218d549005d7025eec07d358b9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0906ce18d4920f58855471a7f36c37c6", "thoughtIdB": "fb0551218d549005d7025eec07d358b9", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 87: 0906ce18d4920f58855471a7f36c37c6 -> 3ae59424c92fca1cd6b417fc4bb897e6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0906ce18d4920f58855471a7f36c37c6", "thoughtIdB": "3ae59424c92fca1cd6b417fc4bb897e6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 88: 0906ce18d4920f58855471a7f36c37c6 -> bd276e793bc90e0000c95d3e8d035b32
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0906ce18d4920f58855471a7f36c37c6", "thoughtIdB": "bd276e793bc90e0000c95d3e8d035b32", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 89: 0906ce18d4920f58855471a7f36c37c6 -> bfdf04d28a7b54cd076e97c0f653c3f1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0906ce18d4920f58855471a7f36c37c6", "thoughtIdB": "bfdf04d28a7b54cd076e97c0f653c3f1", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 90: 0906ce18d4920f58855471a7f36c37c6 -> b397faae896f52b07fc0e52e29af4449
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0906ce18d4920f58855471a7f36c37c6", "thoughtIdB": "b397faae896f52b07fc0e52e29af4449", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 91: 0906ce18d4920f58855471a7f36c37c6 -> c9686dc616ee1d4fe55c12b9ace33851
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0906ce18d4920f58855471a7f36c37c6", "thoughtIdB": "c9686dc616ee1d4fe55c12b9ace33851", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 92: b563d2d8df2387cc1ed2a447a4634786 -> fdb3c0976fc8fb79c4b91dc8b3d9777c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "fdb3c0976fc8fb79c4b91dc8b3d9777c", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 93: fdb3c0976fc8fb79c4b91dc8b3d9777c -> 7e068cc532912fa440901e274e8fb85c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdb3c0976fc8fb79c4b91dc8b3d9777c", "thoughtIdB": "7e068cc532912fa440901e274e8fb85c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 94: fdb3c0976fc8fb79c4b91dc8b3d9777c -> 0f917c8cf7081fbbe5b56ee19fa0a5f5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdb3c0976fc8fb79c4b91dc8b3d9777c", "thoughtIdB": "0f917c8cf7081fbbe5b56ee19fa0a5f5", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 95: fdb3c0976fc8fb79c4b91dc8b3d9777c -> ed5461f6e97fccd7d2c01305971cab65
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdb3c0976fc8fb79c4b91dc8b3d9777c", "thoughtIdB": "ed5461f6e97fccd7d2c01305971cab65", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 96: b563d2d8df2387cc1ed2a447a4634786 -> 30b49d60b8d40641b9d74e7cdc00c0bf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "30b49d60b8d40641b9d74e7cdc00c0bf", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 97: b563d2d8df2387cc1ed2a447a4634786 -> 585a5001bfe3a2f5a392b128adb77ac8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "585a5001bfe3a2f5a392b128adb77ac8", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 98: b563d2d8df2387cc1ed2a447a4634786 -> b3fadbe01cc0e11c98dc85ee55ccd647
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "b3fadbe01cc0e11c98dc85ee55ccd647", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 99: b563d2d8df2387cc1ed2a447a4634786 -> da5a9b52d03a0ab396c8710e8372ee79
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "da5a9b52d03a0ab396c8710e8372ee79", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 100: b563d2d8df2387cc1ed2a447a4634786 -> acaed85cfc336009b5c1523e84b34e28
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "acaed85cfc336009b5c1523e84b34e28", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 101 to 150...'

# Link 101: b563d2d8df2387cc1ed2a447a4634786 -> c1016d89f9479f4a9663c4f8b1c6846c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "c1016d89f9479f4a9663c4f8b1c6846c", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 102: b563d2d8df2387cc1ed2a447a4634786 -> 3999f24e9f1a1a316551b63183919e68
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "3999f24e9f1a1a316551b63183919e68", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 103: b563d2d8df2387cc1ed2a447a4634786 -> 2471d687c580170aa0a437e33147d5c0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "2471d687c580170aa0a437e33147d5c0", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 104: b563d2d8df2387cc1ed2a447a4634786 -> fc85d8e194e10534e7bdf07fcbd25b5a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "fc85d8e194e10534e7bdf07fcbd25b5a", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 105: b563d2d8df2387cc1ed2a447a4634786 -> cdf456e4cc09b9ad4fad4e093d09ac8f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "cdf456e4cc09b9ad4fad4e093d09ac8f", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 106: b563d2d8df2387cc1ed2a447a4634786 -> 1f4379bb223b9c55c2b362943b4d758b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "1f4379bb223b9c55c2b362943b4d758b", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 107: b563d2d8df2387cc1ed2a447a4634786 -> f1564904a8fe775ca01f1ac728777ba4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "f1564904a8fe775ca01f1ac728777ba4", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 108: b563d2d8df2387cc1ed2a447a4634786 -> 43f58402b48cb51ee60df4de8585cd63
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "43f58402b48cb51ee60df4de8585cd63", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 109: b563d2d8df2387cc1ed2a447a4634786 -> ffb69dcfb12d7e03a8def745446afba9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "ffb69dcfb12d7e03a8def745446afba9", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 110: b563d2d8df2387cc1ed2a447a4634786 -> e2bd1648a32b9876add08ce6bc5af986
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "e2bd1648a32b9876add08ce6bc5af986", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 111: b563d2d8df2387cc1ed2a447a4634786 -> 296285c3078bed7203f6d3d43a51651b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "296285c3078bed7203f6d3d43a51651b", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 112: b563d2d8df2387cc1ed2a447a4634786 -> 56236274c450773fcf05bf92c4a4abc2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "56236274c450773fcf05bf92c4a4abc2", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 113: b563d2d8df2387cc1ed2a447a4634786 -> 829062bea0abbe8b1d7fa6fe9f5fbb97
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "829062bea0abbe8b1d7fa6fe9f5fbb97", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 114: b563d2d8df2387cc1ed2a447a4634786 -> d395f863dc4dd4f186f52603a26413e0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "d395f863dc4dd4f186f52603a26413e0", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 115: b563d2d8df2387cc1ed2a447a4634786 -> 8890d2561e6e81c54795ffe46bc28fa4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "8890d2561e6e81c54795ffe46bc28fa4", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 116: b563d2d8df2387cc1ed2a447a4634786 -> 5eb60da23a8f22b4d10faebf4520962e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "5eb60da23a8f22b4d10faebf4520962e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 117: b563d2d8df2387cc1ed2a447a4634786 -> 64be75f28067d3734662b41e2189fe3f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "64be75f28067d3734662b41e2189fe3f", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 118: 64be75f28067d3734662b41e2189fe3f -> c6d3edd8971a015b5b06fab4e2fdd6ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "c6d3edd8971a015b5b06fab4e2fdd6ee", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 119: 64be75f28067d3734662b41e2189fe3f -> 1c7bf95c14b0dcd75fd3ae52f2867978
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "1c7bf95c14b0dcd75fd3ae52f2867978", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 120: 64be75f28067d3734662b41e2189fe3f -> a5f7937abaaadb01c752ef0633fbfc5d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "a5f7937abaaadb01c752ef0633fbfc5d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 121: 64be75f28067d3734662b41e2189fe3f -> 56063585dddfbe64e22b6b960ce8517f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "56063585dddfbe64e22b6b960ce8517f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 122: b563d2d8df2387cc1ed2a447a4634786 -> f61cae28feaaaa07788613f1583ff779
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "f61cae28feaaaa07788613f1583ff779", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 123: f61cae28feaaaa07788613f1583ff779 -> b397faae896f52b07fc0e52e29af4449
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "b397faae896f52b07fc0e52e29af4449", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 124: f61cae28feaaaa07788613f1583ff779 -> b824779b3974726563004853559c2f8a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "b824779b3974726563004853559c2f8a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 125: f61cae28feaaaa07788613f1583ff779 -> 7dd7340157147b2433c05b2c98ca5d58
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "7dd7340157147b2433c05b2c98ca5d58", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 126: f61cae28feaaaa07788613f1583ff779 -> e1011641f94df1fa2818b58797769a77
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "e1011641f94df1fa2818b58797769a77", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 127: b563d2d8df2387cc1ed2a447a4634786 -> 2b086c433e0c9289b99902974868abc5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "2b086c433e0c9289b99902974868abc5", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 128: 2b086c433e0c9289b99902974868abc5 -> a9dec262ff294026b56fe254cec6e127
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "a9dec262ff294026b56fe254cec6e127", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 129: 2b086c433e0c9289b99902974868abc5 -> 0d030795e8ee1152d6d659cf576d552b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "0d030795e8ee1152d6d659cf576d552b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 130: 2b086c433e0c9289b99902974868abc5 -> 0cfd1c95e249b1a28852366b73834107
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "0cfd1c95e249b1a28852366b73834107", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 131: b563d2d8df2387cc1ed2a447a4634786 -> f365dd323a257ff34a5e03f67627ce43
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "f365dd323a257ff34a5e03f67627ce43", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 132: f365dd323a257ff34a5e03f67627ce43 -> 3f8517f04f21091588df56878562d07d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f365dd323a257ff34a5e03f67627ce43", "thoughtIdB": "3f8517f04f21091588df56878562d07d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 133: f365dd323a257ff34a5e03f67627ce43 -> 8b45e1570c2c8f0dd8c239e5d2f71e78
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f365dd323a257ff34a5e03f67627ce43", "thoughtIdB": "8b45e1570c2c8f0dd8c239e5d2f71e78", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 134: b563d2d8df2387cc1ed2a447a4634786 -> a117235e7a530c4e3b52d9883af62026
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "a117235e7a530c4e3b52d9883af62026", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 135: a117235e7a530c4e3b52d9883af62026 -> 9c0f80b4107ee88826113f33aa353251
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a117235e7a530c4e3b52d9883af62026", "thoughtIdB": "9c0f80b4107ee88826113f33aa353251", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 136: a117235e7a530c4e3b52d9883af62026 -> c2f1347167722d5ca49f6daa6737df65
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a117235e7a530c4e3b52d9883af62026", "thoughtIdB": "c2f1347167722d5ca49f6daa6737df65", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 137: b563d2d8df2387cc1ed2a447a4634786 -> 64bb11b4b314487c3c755b7371ea11b6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "64bb11b4b314487c3c755b7371ea11b6", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 138: b563d2d8df2387cc1ed2a447a4634786 -> 262dbafeb2b1ce5726e39d276d87a2e5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "262dbafeb2b1ce5726e39d276d87a2e5", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 139: b563d2d8df2387cc1ed2a447a4634786 -> 7890773304b71b253415cc09883f2d32
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "7890773304b71b253415cc09883f2d32", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 140: b563d2d8df2387cc1ed2a447a4634786 -> a46a9f2c186f8da08eb0b38477dff82a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "a46a9f2c186f8da08eb0b38477dff82a", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 141: b563d2d8df2387cc1ed2a447a4634786 -> e7436cbcd345ef803e1bbc4f9cdd5c76
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "e7436cbcd345ef803e1bbc4f9cdd5c76", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 142: b563d2d8df2387cc1ed2a447a4634786 -> fb714db27feef39b46335be4e4a6799a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "fb714db27feef39b46335be4e4a6799a", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 143: b563d2d8df2387cc1ed2a447a4634786 -> 66bb15a4b846eb8490f62920a46d73ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "66bb15a4b846eb8490f62920a46d73ee", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 144: b563d2d8df2387cc1ed2a447a4634786 -> e5f521bff76f4cd07138276ba6674be8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "e5f521bff76f4cd07138276ba6674be8", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 145: b563d2d8df2387cc1ed2a447a4634786 -> 68f9beda982b8b70f36059422622ff5e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "68f9beda982b8b70f36059422622ff5e", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 146: b563d2d8df2387cc1ed2a447a4634786 -> 8c3a18fe20cdd83e6e2f8d4dd97390e7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "8c3a18fe20cdd83e6e2f8d4dd97390e7", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 147: b563d2d8df2387cc1ed2a447a4634786 -> 8904321bf36f1c4033f631d208d8d53b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "8904321bf36f1c4033f631d208d8d53b", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 148: b563d2d8df2387cc1ed2a447a4634786 -> 75e2ecad00dcb242962d40e9c3d7c184
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "75e2ecad00dcb242962d40e9c3d7c184", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 149: b563d2d8df2387cc1ed2a447a4634786 -> 60baae962ea908b6b936af340ebcfe3d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "60baae962ea908b6b936af340ebcfe3d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 150: b563d2d8df2387cc1ed2a447a4634786 -> 573ea2c726ca94f315fb80a71d906e13
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "573ea2c726ca94f315fb80a71d906e13", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 151 to 200...'

# Link 151: b563d2d8df2387cc1ed2a447a4634786 -> 736b4eaa176289b946fff98b094cda84
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "736b4eaa176289b946fff98b094cda84", "relation": jump, "name": "competes with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 152: b563d2d8df2387cc1ed2a447a4634786 -> fdbfb236729ea007a5029530792657d2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "fdbfb236729ea007a5029530792657d2", "relation": jump, "name": "competes with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 153: 64be75f28067d3734662b41e2189fe3f -> a0b96862249c774fef90577255b9438d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "a0b96862249c774fef90577255b9438d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 154: 64be75f28067d3734662b41e2189fe3f -> 902dec1f9e1c31fa31145b81ea5fb6de
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "902dec1f9e1c31fa31145b81ea5fb6de", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 155: 64be75f28067d3734662b41e2189fe3f -> a400515ffaab6af305ef1dfd97de037c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "a400515ffaab6af305ef1dfd97de037c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 156: b563d2d8df2387cc1ed2a447a4634786 -> 2a8ca3b6a46f98359eed9a85fe180325
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "2a8ca3b6a46f98359eed9a85fe180325", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 157: 2a8ca3b6a46f98359eed9a85fe180325 -> 9eecbeb4df5f25b646748a04a0e816ac
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2a8ca3b6a46f98359eed9a85fe180325", "thoughtIdB": "9eecbeb4df5f25b646748a04a0e816ac", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 158: 2a8ca3b6a46f98359eed9a85fe180325 -> 8ae7cb4f593dff4b02b4dd4674e5d30c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2a8ca3b6a46f98359eed9a85fe180325", "thoughtIdB": "8ae7cb4f593dff4b02b4dd4674e5d30c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 159: 2a8ca3b6a46f98359eed9a85fe180325 -> c7321ceabbcea9566ccb6c3513aada26
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2a8ca3b6a46f98359eed9a85fe180325", "thoughtIdB": "c7321ceabbcea9566ccb6c3513aada26", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 160: f365dd323a257ff34a5e03f67627ce43 -> 47a98b65bf6e41df47802cbd1be52a2b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f365dd323a257ff34a5e03f67627ce43", "thoughtIdB": "47a98b65bf6e41df47802cbd1be52a2b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 161: f365dd323a257ff34a5e03f67627ce43 -> b2bba3d51c8ad668d8b776199edd5032
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f365dd323a257ff34a5e03f67627ce43", "thoughtIdB": "b2bba3d51c8ad668d8b776199edd5032", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 162: f365dd323a257ff34a5e03f67627ce43 -> 6bf15805ebd1f4af9a75b3c54e3ddbf8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f365dd323a257ff34a5e03f67627ce43", "thoughtIdB": "6bf15805ebd1f4af9a75b3c54e3ddbf8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 163: a117235e7a530c4e3b52d9883af62026 -> dc7a08910593147ec487dba9c7b65708
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a117235e7a530c4e3b52d9883af62026", "thoughtIdB": "dc7a08910593147ec487dba9c7b65708", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 164: a117235e7a530c4e3b52d9883af62026 -> e5096e545a1efa151457b11483cca33c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a117235e7a530c4e3b52d9883af62026", "thoughtIdB": "e5096e545a1efa151457b11483cca33c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 165: a117235e7a530c4e3b52d9883af62026 -> 66ac2aee40cb1671b34dc62ddecced0e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a117235e7a530c4e3b52d9883af62026", "thoughtIdB": "66ac2aee40cb1671b34dc62ddecced0e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 166: f61cae28feaaaa07788613f1583ff779 -> 326b11806f549bb22e06b9bac97808db
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "326b11806f549bb22e06b9bac97808db", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 167: f61cae28feaaaa07788613f1583ff779 -> 46333a35d5e64db0490e1f47a9e7ecd0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "46333a35d5e64db0490e1f47a9e7ecd0", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 168: f61cae28feaaaa07788613f1583ff779 -> fc6e3521980928652e3566430f259fbc
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f61cae28feaaaa07788613f1583ff779", "thoughtIdB": "fc6e3521980928652e3566430f259fbc", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 169: 2b086c433e0c9289b99902974868abc5 -> 26ba737799883d49d39fd8394cbf7474
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "26ba737799883d49d39fd8394cbf7474", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 170: 2b086c433e0c9289b99902974868abc5 -> 0d65f68afed1a4800bb9698b5f991420
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "0d65f68afed1a4800bb9698b5f991420", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 171: 2b086c433e0c9289b99902974868abc5 -> 7aed04e56f95f711d145bf81fc4ead83
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "7aed04e56f95f711d145bf81fc4ead83", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 172: 2b086c433e0c9289b99902974868abc5 -> 09b1b67412f48c9abf83a1a0e94eee2f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2b086c433e0c9289b99902974868abc5", "thoughtIdB": "09b1b67412f48c9abf83a1a0e94eee2f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 173: b563d2d8df2387cc1ed2a447a4634786 -> ceb40186494f3aeb23dd0b167a07aa06
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "ceb40186494f3aeb23dd0b167a07aa06", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 174: b563d2d8df2387cc1ed2a447a4634786 -> c5f9fd3e4c073b9e1377792252c1e870
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "c5f9fd3e4c073b9e1377792252c1e870", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 175: b563d2d8df2387cc1ed2a447a4634786 -> 8e37288a36dce24fef8b43c925be8cea
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "8e37288a36dce24fef8b43c925be8cea", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 176: b563d2d8df2387cc1ed2a447a4634786 -> d9c00166f62770702d2d5d2c5555a7b6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "d9c00166f62770702d2d5d2c5555a7b6", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 177: b563d2d8df2387cc1ed2a447a4634786 -> fdf836ba91c90a56260989ef242bccef
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "fdf836ba91c90a56260989ef242bccef", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 178: b563d2d8df2387cc1ed2a447a4634786 -> 79348a128347b2a6b08ab95e8c5717ac
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "79348a128347b2a6b08ab95e8c5717ac", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 179: b563d2d8df2387cc1ed2a447a4634786 -> 3f24371c3b1205d43deda365e15a5e6d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "3f24371c3b1205d43deda365e15a5e6d", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 180: b563d2d8df2387cc1ed2a447a4634786 -> bc68b34827fb8b038e33977823dbd6f6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "bc68b34827fb8b038e33977823dbd6f6", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 181: b563d2d8df2387cc1ed2a447a4634786 -> 51c2c446bef28dd1d183e572e44f5a9f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "51c2c446bef28dd1d183e572e44f5a9f", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 182: b563d2d8df2387cc1ed2a447a4634786 -> 9843104d817b57926aad05d8df01cd9e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "9843104d817b57926aad05d8df01cd9e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 183: b563d2d8df2387cc1ed2a447a4634786 -> 19ec42ae0ae183fc089fefb0f432e2e8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "19ec42ae0ae183fc089fefb0f432e2e8", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 184: b563d2d8df2387cc1ed2a447a4634786 -> 286252a01f4759f25cd70fa56337e461
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "286252a01f4759f25cd70fa56337e461", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 185: b563d2d8df2387cc1ed2a447a4634786 -> cfc1c3ba8dc2e3c43091b62a2b46c33f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "cfc1c3ba8dc2e3c43091b62a2b46c33f", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 186: b563d2d8df2387cc1ed2a447a4634786 -> f7bad3399dd7cb28800b70b46fc1cd5a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b563d2d8df2387cc1ed2a447a4634786", "thoughtIdB": "f7bad3399dd7cb28800b70b46fc1cd5a", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 187: 736b4eaa176289b946fff98b094cda84 -> d4d493e9c46ec48cea7640dde94b84b2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "d4d493e9c46ec48cea7640dde94b84b2", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 188: d4d493e9c46ec48cea7640dde94b84b2 -> e0fd7f1500718e89c2ad2d71a191870f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d4d493e9c46ec48cea7640dde94b84b2", "thoughtIdB": "e0fd7f1500718e89c2ad2d71a191870f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 189: d4d493e9c46ec48cea7640dde94b84b2 -> 65322f52e787528695a9ba79627e480c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d4d493e9c46ec48cea7640dde94b84b2", "thoughtIdB": "65322f52e787528695a9ba79627e480c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 190: d4d493e9c46ec48cea7640dde94b84b2 -> 1d7d1e867f82f88d8ec78fcbead21659
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d4d493e9c46ec48cea7640dde94b84b2", "thoughtIdB": "1d7d1e867f82f88d8ec78fcbead21659", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 191: d4d493e9c46ec48cea7640dde94b84b2 -> 1e9257bef87671894e337a7128cbe7a8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d4d493e9c46ec48cea7640dde94b84b2", "thoughtIdB": "1e9257bef87671894e337a7128cbe7a8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 192: d4d493e9c46ec48cea7640dde94b84b2 -> e446596f2899cb7d99d6f7766ea7be61
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d4d493e9c46ec48cea7640dde94b84b2", "thoughtIdB": "e446596f2899cb7d99d6f7766ea7be61", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 193: 736b4eaa176289b946fff98b094cda84 -> 1515759b7bf51eef0cb0e96f42f9b3d9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "1515759b7bf51eef0cb0e96f42f9b3d9", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 194: 1515759b7bf51eef0cb0e96f42f9b3d9 -> e6a2341ac40c5dbe84a4e75c3284a214
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1515759b7bf51eef0cb0e96f42f9b3d9", "thoughtIdB": "e6a2341ac40c5dbe84a4e75c3284a214", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 195: 1515759b7bf51eef0cb0e96f42f9b3d9 -> d1e1ac327f4b737d4e48a6f9c65fa965
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1515759b7bf51eef0cb0e96f42f9b3d9", "thoughtIdB": "d1e1ac327f4b737d4e48a6f9c65fa965", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 196: 1515759b7bf51eef0cb0e96f42f9b3d9 -> f3b86e35fc3808dd551303ec743abf1c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1515759b7bf51eef0cb0e96f42f9b3d9", "thoughtIdB": "f3b86e35fc3808dd551303ec743abf1c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 197: 736b4eaa176289b946fff98b094cda84 -> e2bce461815de8e3ed9e57e76b773d4a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "e2bce461815de8e3ed9e57e76b773d4a", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 198: 736b4eaa176289b946fff98b094cda84 -> 17dfdfc641b2839267baa5dfae60a489
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "17dfdfc641b2839267baa5dfae60a489", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 199: 736b4eaa176289b946fff98b094cda84 -> da6177319ed15e431aff43c27b58296d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "da6177319ed15e431aff43c27b58296d", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 200: 736b4eaa176289b946fff98b094cda84 -> c6b4d45c8174cb119e6e11451b4da491
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "c6b4d45c8174cb119e6e11451b4da491", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 201 to 250...'

# Link 201: 736b4eaa176289b946fff98b094cda84 -> 4af07228413e57a9269f77bdf197b2d2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "4af07228413e57a9269f77bdf197b2d2", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 202: 736b4eaa176289b946fff98b094cda84 -> b1d3763d9f537d62626eba957890b646
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "b1d3763d9f537d62626eba957890b646", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 203: 736b4eaa176289b946fff98b094cda84 -> 2a24fed8d343191624d30100a0696959
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "2a24fed8d343191624d30100a0696959", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 204: 736b4eaa176289b946fff98b094cda84 -> 5f0d65afed93fb29b223778bded64e30
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "5f0d65afed93fb29b223778bded64e30", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 205: 736b4eaa176289b946fff98b094cda84 -> 6b01ca34c45276d78b30e66ab0a55abd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "6b01ca34c45276d78b30e66ab0a55abd", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 206: 736b4eaa176289b946fff98b094cda84 -> d9204c46a6240c59cf6eb717b6420071
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "d9204c46a6240c59cf6eb717b6420071", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 207: 736b4eaa176289b946fff98b094cda84 -> c524558407824dfcbd90ff682d1342f3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "c524558407824dfcbd90ff682d1342f3", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 208: 736b4eaa176289b946fff98b094cda84 -> 52b506d457a89e64a6dcf95126145ce4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "52b506d457a89e64a6dcf95126145ce4", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 209: 736b4eaa176289b946fff98b094cda84 -> c9fa3f77c47b7cd8d51d8c145ba9eb8e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "c9fa3f77c47b7cd8d51d8c145ba9eb8e", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 210: 736b4eaa176289b946fff98b094cda84 -> 46711f454382abf042cc99a9dd51ff46
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "46711f454382abf042cc99a9dd51ff46", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 211: 736b4eaa176289b946fff98b094cda84 -> a520390ffcbac19f2115398092f199ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "a520390ffcbac19f2115398092f199ee", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 212: 736b4eaa176289b946fff98b094cda84 -> 94b8fc6d943d09414870af5f0e5186ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "94b8fc6d943d09414870af5f0e5186ee", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 213: 736b4eaa176289b946fff98b094cda84 -> 60baae962ea908b6b936af340ebcfe3d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "60baae962ea908b6b936af340ebcfe3d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 214: 736b4eaa176289b946fff98b094cda84 -> 8b71fb016f5a2d4c898683e131379b03
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "736b4eaa176289b946fff98b094cda84", "thoughtIdB": "8b71fb016f5a2d4c898683e131379b03", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 215: 6e5a03053d8487f2b5838a80bd395ed4 -> fb90b3b0be16f42e15c97c6ffaf4f4a3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "fb90b3b0be16f42e15c97c6ffaf4f4a3", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 216: fb90b3b0be16f42e15c97c6ffaf4f4a3 -> d3c2c65ab78b0eabc086893dd440d9be
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fb90b3b0be16f42e15c97c6ffaf4f4a3", "thoughtIdB": "d3c2c65ab78b0eabc086893dd440d9be", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 217: fb90b3b0be16f42e15c97c6ffaf4f4a3 -> a60975ebc185e201a516152162dd7aea
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fb90b3b0be16f42e15c97c6ffaf4f4a3", "thoughtIdB": "a60975ebc185e201a516152162dd7aea", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 218: fb90b3b0be16f42e15c97c6ffaf4f4a3 -> a0728b5bf90bd50c07b83abd75a5a897
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fb90b3b0be16f42e15c97c6ffaf4f4a3", "thoughtIdB": "a0728b5bf90bd50c07b83abd75a5a897", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 219: fb90b3b0be16f42e15c97c6ffaf4f4a3 -> f94e8c7cb795c220463f5e11ed535f7e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fb90b3b0be16f42e15c97c6ffaf4f4a3", "thoughtIdB": "f94e8c7cb795c220463f5e11ed535f7e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 220: 6e5a03053d8487f2b5838a80bd395ed4 -> f5d08615ddd8d444538610531fd7ce32
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "f5d08615ddd8d444538610531fd7ce32", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 221: f5d08615ddd8d444538610531fd7ce32 -> fcfb22732e494209bd35b703086e9dc6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f5d08615ddd8d444538610531fd7ce32", "thoughtIdB": "fcfb22732e494209bd35b703086e9dc6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 222: f5d08615ddd8d444538610531fd7ce32 -> 278ebd02fc7e98f0e908f187ea96ac86
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f5d08615ddd8d444538610531fd7ce32", "thoughtIdB": "278ebd02fc7e98f0e908f187ea96ac86", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 223: f5d08615ddd8d444538610531fd7ce32 -> 4eb70da525228cab3ee1bfac0748a2d2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f5d08615ddd8d444538610531fd7ce32", "thoughtIdB": "4eb70da525228cab3ee1bfac0748a2d2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 224: 6e5a03053d8487f2b5838a80bd395ed4 -> 31d87c6fd00d02ed945b61eaf0b6a5fd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "31d87c6fd00d02ed945b61eaf0b6a5fd", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 225: 31d87c6fd00d02ed945b61eaf0b6a5fd -> fef40bafe8e97ed35f284585249ed3d6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "31d87c6fd00d02ed945b61eaf0b6a5fd", "thoughtIdB": "fef40bafe8e97ed35f284585249ed3d6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 226: 31d87c6fd00d02ed945b61eaf0b6a5fd -> 5f6b0d1fa34bb089367f0132356efe4c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "31d87c6fd00d02ed945b61eaf0b6a5fd", "thoughtIdB": "5f6b0d1fa34bb089367f0132356efe4c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 227: 6e5a03053d8487f2b5838a80bd395ed4 -> c5544f3edae19039f3d51075a23005c6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "c5544f3edae19039f3d51075a23005c6", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 228: c5544f3edae19039f3d51075a23005c6 -> d896437f70bb762d2c0b3f805bbbc092
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c5544f3edae19039f3d51075a23005c6", "thoughtIdB": "d896437f70bb762d2c0b3f805bbbc092", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 229: c5544f3edae19039f3d51075a23005c6 -> 5fea306230734bb5e29f3156c7ee2c14
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c5544f3edae19039f3d51075a23005c6", "thoughtIdB": "5fea306230734bb5e29f3156c7ee2c14", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 230: c5544f3edae19039f3d51075a23005c6 -> d33f980035892f3297f482f765b1b6e7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c5544f3edae19039f3d51075a23005c6", "thoughtIdB": "d33f980035892f3297f482f765b1b6e7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 231: c5544f3edae19039f3d51075a23005c6 -> 0749dd3e507169146de8435a75185f4e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c5544f3edae19039f3d51075a23005c6", "thoughtIdB": "0749dd3e507169146de8435a75185f4e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 232: 6e5a03053d8487f2b5838a80bd395ed4 -> ec02284cf79d71783e6149e6de1cd668
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "ec02284cf79d71783e6149e6de1cd668", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 233: ec02284cf79d71783e6149e6de1cd668 -> 68e5d0a6b70d34faa1db3ccb25b4651d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ec02284cf79d71783e6149e6de1cd668", "thoughtIdB": "68e5d0a6b70d34faa1db3ccb25b4651d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 234: ec02284cf79d71783e6149e6de1cd668 -> 46ecddc0b83634df77cce65f2f5dd70a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ec02284cf79d71783e6149e6de1cd668", "thoughtIdB": "46ecddc0b83634df77cce65f2f5dd70a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 235: ec02284cf79d71783e6149e6de1cd668 -> 59d6b3340ca3911dfcbef8d063176196
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ec02284cf79d71783e6149e6de1cd668", "thoughtIdB": "59d6b3340ca3911dfcbef8d063176196", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 236: 6e5a03053d8487f2b5838a80bd395ed4 -> fff198618f42578b942655af9a64aab8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "fff198618f42578b942655af9a64aab8", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 237: fff198618f42578b942655af9a64aab8 -> 9fde2a343d68c3cfe8d14483502a1d83
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fff198618f42578b942655af9a64aab8", "thoughtIdB": "9fde2a343d68c3cfe8d14483502a1d83", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 238: fff198618f42578b942655af9a64aab8 -> 068c3cd8f87ec4c1a68894908e2fa1a4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fff198618f42578b942655af9a64aab8", "thoughtIdB": "068c3cd8f87ec4c1a68894908e2fa1a4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 239: fff198618f42578b942655af9a64aab8 -> f41b25f69e90eb979bbde5e554787930
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fff198618f42578b942655af9a64aab8", "thoughtIdB": "f41b25f69e90eb979bbde5e554787930", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 240: fff198618f42578b942655af9a64aab8 -> d78709af6f7d4964728e195215a0064d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fff198618f42578b942655af9a64aab8", "thoughtIdB": "d78709af6f7d4964728e195215a0064d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 241: 6e5a03053d8487f2b5838a80bd395ed4 -> 0f5265fc56914425c59269b347a13e14
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "0f5265fc56914425c59269b347a13e14", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 242: 6e5a03053d8487f2b5838a80bd395ed4 -> 4de7fa06911fda9465ec085bc95942dd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "4de7fa06911fda9465ec085bc95942dd", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 243: 6e5a03053d8487f2b5838a80bd395ed4 -> 0e40c3942981684c475f5154229e5798
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "0e40c3942981684c475f5154229e5798", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 244: 6e5a03053d8487f2b5838a80bd395ed4 -> 0d06462a27d247599e802dbe57a10897
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "0d06462a27d247599e802dbe57a10897", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 245: 6e5a03053d8487f2b5838a80bd395ed4 -> 4277e6a855265f2024881e963a52bcfd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "4277e6a855265f2024881e963a52bcfd", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 246: 6e5a03053d8487f2b5838a80bd395ed4 -> f476a920409fad32a0783133b61e8aca
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "f476a920409fad32a0783133b61e8aca", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 247: 6e5a03053d8487f2b5838a80bd395ed4 -> 6fa25a61295aec833a2b647ea38e089c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "6fa25a61295aec833a2b647ea38e089c", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 248: 6e5a03053d8487f2b5838a80bd395ed4 -> cf3e22b522205bf049d77267a1006d88
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "cf3e22b522205bf049d77267a1006d88", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 249: 6e5a03053d8487f2b5838a80bd395ed4 -> e2bd1648a32b9876add08ce6bc5af986
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "e2bd1648a32b9876add08ce6bc5af986", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 250: 6e5a03053d8487f2b5838a80bd395ed4 -> 11f4765abf53d5a488855caa160cb720
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "11f4765abf53d5a488855caa160cb720", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 251 to 300...'

# Link 251: 6e5a03053d8487f2b5838a80bd395ed4 -> 5cbbc7855eea0045be6a63c4d1778805
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "5cbbc7855eea0045be6a63c4d1778805", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 252: 6e5a03053d8487f2b5838a80bd395ed4 -> bee7058a2441b2ab3062acc9db30e75e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "bee7058a2441b2ab3062acc9db30e75e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 253: 6e5a03053d8487f2b5838a80bd395ed4 -> 6524513b5aa5b288e95f56d3a3bf835b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "6524513b5aa5b288e95f56d3a3bf835b", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 254: 6e5a03053d8487f2b5838a80bd395ed4 -> 8a48d6adffb36470c81ed77caeb6f68e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "8a48d6adffb36470c81ed77caeb6f68e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 255: 6e5a03053d8487f2b5838a80bd395ed4 -> 44c6d0aea2e7306c6fc9c86a2ae0667c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "44c6d0aea2e7306c6fc9c86a2ae0667c", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 256: 6e5a03053d8487f2b5838a80bd395ed4 -> 4b271db615d28383f353db3efc36a93f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "4b271db615d28383f353db3efc36a93f", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 257: 4b271db615d28383f353db3efc36a93f -> f5111fa2333f46af135cc59396750d95
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4b271db615d28383f353db3efc36a93f", "thoughtIdB": "f5111fa2333f46af135cc59396750d95", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 258: 4b271db615d28383f353db3efc36a93f -> 7d00bb49f367bb1e466e64b9e5ed3942
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4b271db615d28383f353db3efc36a93f", "thoughtIdB": "7d00bb49f367bb1e466e64b9e5ed3942", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 259: 4b271db615d28383f353db3efc36a93f -> c6d3edd8971a015b5b06fab4e2fdd6ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4b271db615d28383f353db3efc36a93f", "thoughtIdB": "c6d3edd8971a015b5b06fab4e2fdd6ee", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 260: 4b271db615d28383f353db3efc36a93f -> acb38ef56301df47b2299c68bc12a1e6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4b271db615d28383f353db3efc36a93f", "thoughtIdB": "acb38ef56301df47b2299c68bc12a1e6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 261: 4b271db615d28383f353db3efc36a93f -> 0a67da09f0e36ccd0cac0e078a270e6f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4b271db615d28383f353db3efc36a93f", "thoughtIdB": "0a67da09f0e36ccd0cac0e078a270e6f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 262: 4b271db615d28383f353db3efc36a93f -> 079ff4dca14214a7281f143047bef1dd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4b271db615d28383f353db3efc36a93f", "thoughtIdB": "079ff4dca14214a7281f143047bef1dd", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 263: 6e5a03053d8487f2b5838a80bd395ed4 -> d14597f6f3590e68d380386e50713e23
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "d14597f6f3590e68d380386e50713e23", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 264: d14597f6f3590e68d380386e50713e23 -> bbb6f233321d39e50cacd2127b06394d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d14597f6f3590e68d380386e50713e23", "thoughtIdB": "bbb6f233321d39e50cacd2127b06394d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 265: d14597f6f3590e68d380386e50713e23 -> 3c7068ad8ed9d2980c2953a7d9225f63
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d14597f6f3590e68d380386e50713e23", "thoughtIdB": "3c7068ad8ed9d2980c2953a7d9225f63", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 266: d14597f6f3590e68d380386e50713e23 -> 1b49fedaa650e935cb6f0eefd9a4d3e8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d14597f6f3590e68d380386e50713e23", "thoughtIdB": "1b49fedaa650e935cb6f0eefd9a4d3e8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 267: 6e5a03053d8487f2b5838a80bd395ed4 -> 8a100d8a7d3e402d56b1b199ea7035d9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "8a100d8a7d3e402d56b1b199ea7035d9", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 268: 8a100d8a7d3e402d56b1b199ea7035d9 -> d9a8f106b6f0f1e3b663cf59917ba0f0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8a100d8a7d3e402d56b1b199ea7035d9", "thoughtIdB": "d9a8f106b6f0f1e3b663cf59917ba0f0", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 269: 8a100d8a7d3e402d56b1b199ea7035d9 -> 0a67da09f0e36ccd0cac0e078a270e6f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8a100d8a7d3e402d56b1b199ea7035d9", "thoughtIdB": "0a67da09f0e36ccd0cac0e078a270e6f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 270: 8a100d8a7d3e402d56b1b199ea7035d9 -> 6ae4c3507ecbb218228f6e020f533569
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8a100d8a7d3e402d56b1b199ea7035d9", "thoughtIdB": "6ae4c3507ecbb218228f6e020f533569", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 271: 8a100d8a7d3e402d56b1b199ea7035d9 -> b14639e5d0cab3c798b3a13632521efa
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8a100d8a7d3e402d56b1b199ea7035d9", "thoughtIdB": "b14639e5d0cab3c798b3a13632521efa", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 272: 6e5a03053d8487f2b5838a80bd395ed4 -> 62b762ac227f7152092b2d023bbb89bd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "62b762ac227f7152092b2d023bbb89bd", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 273: 6e5a03053d8487f2b5838a80bd395ed4 -> 471817a15d4b6fffe56ec55922ea0e23
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "471817a15d4b6fffe56ec55922ea0e23", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 274: 6e5a03053d8487f2b5838a80bd395ed4 -> 7cc17e74ab6ea0f85c433efefa0cc361
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "7cc17e74ab6ea0f85c433efefa0cc361", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 275: 6e5a03053d8487f2b5838a80bd395ed4 -> 5ce7f0732571b9499ebdfa30a88dd7ca
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "5ce7f0732571b9499ebdfa30a88dd7ca", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 276: c9efbffb17cdcf1c040ba22295a88b6b -> 6e5a03053d8487f2b5838a80bd395ed4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "c9efbffb17cdcf1c040ba22295a88b6b", "thoughtIdB": "6e5a03053d8487f2b5838a80bd395ed4", "relation": jump, "name": "leads", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 277: 6e5a03053d8487f2b5838a80bd395ed4 -> 81fb64d1d0b47b5add2a074a1d19cb7a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "81fb64d1d0b47b5add2a074a1d19cb7a", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 278: 6e5a03053d8487f2b5838a80bd395ed4 -> 9b08793e680b9a2d626e0134afce307b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "9b08793e680b9a2d626e0134afce307b", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 279: 6e5a03053d8487f2b5838a80bd395ed4 -> 86e55f1ccc9eb6dffee75fb2f6a486d4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "86e55f1ccc9eb6dffee75fb2f6a486d4", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 280: 6e5a03053d8487f2b5838a80bd395ed4 -> 22857596d90ac2f86f8941aaf68d98f7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "22857596d90ac2f86f8941aaf68d98f7", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 281: 6e5a03053d8487f2b5838a80bd395ed4 -> 6d3f9beb45210d66dec029b53b79ab07
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "6d3f9beb45210d66dec029b53b79ab07", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 282: 6e5a03053d8487f2b5838a80bd395ed4 -> f5cd71ccff8c960e0807e1888b9ab50e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "f5cd71ccff8c960e0807e1888b9ab50e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 283: 6e5a03053d8487f2b5838a80bd395ed4 -> 2a0bb6648e1f4d316c01d6b548a3b0ac
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "2a0bb6648e1f4d316c01d6b548a3b0ac", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 284: 6e5a03053d8487f2b5838a80bd395ed4 -> 106bd0876b202b114115af61835bd36e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5a03053d8487f2b5838a80bd395ed4", "thoughtIdB": "106bd0876b202b114115af61835bd36e", "relation": jump, "name": "competes with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 285: b0db1b014260ba35b62876e2dd6c424c -> b6f9de2b9f9dd503c653221c083f2590
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "b6f9de2b9f9dd503c653221c083f2590", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 286: b6f9de2b9f9dd503c653221c083f2590 -> 638e25cb577ea146d41aae4669b2f0d6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "638e25cb577ea146d41aae4669b2f0d6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 287: b6f9de2b9f9dd503c653221c083f2590 -> 8af96ccc9206b236ea724d0a730b248e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "8af96ccc9206b236ea724d0a730b248e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 288: b6f9de2b9f9dd503c653221c083f2590 -> 14cb29d927fb14372657b532fc228cab
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "14cb29d927fb14372657b532fc228cab", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 289: b6f9de2b9f9dd503c653221c083f2590 -> ab042f44a055b2772b6f0c7c2f1fb358
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "ab042f44a055b2772b6f0c7c2f1fb358", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 290: b6f9de2b9f9dd503c653221c083f2590 -> 01a3ad034df8610d48c37dc1fab143fa
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "01a3ad034df8610d48c37dc1fab143fa", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 291: b0db1b014260ba35b62876e2dd6c424c -> 933e559bb2c1df289b1b9457df1e61d2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "933e559bb2c1df289b1b9457df1e61d2", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 292: 933e559bb2c1df289b1b9457df1e61d2 -> e7d0c5f08432df502619fab6d6384ea3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "933e559bb2c1df289b1b9457df1e61d2", "thoughtIdB": "e7d0c5f08432df502619fab6d6384ea3", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 293: 933e559bb2c1df289b1b9457df1e61d2 -> a5f4f51db0087ae9aa6325633b38bd5c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "933e559bb2c1df289b1b9457df1e61d2", "thoughtIdB": "a5f4f51db0087ae9aa6325633b38bd5c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 294: 933e559bb2c1df289b1b9457df1e61d2 -> 98f8fae7e6a49ce90851d2505c1ef665
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "933e559bb2c1df289b1b9457df1e61d2", "thoughtIdB": "98f8fae7e6a49ce90851d2505c1ef665", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 295: b0db1b014260ba35b62876e2dd6c424c -> aa2ba88f7fbd028f0b657bdc73921ad7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "aa2ba88f7fbd028f0b657bdc73921ad7", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 296: b0db1b014260ba35b62876e2dd6c424c -> b9f9aa575ef0a50b74b979bbff8abe84
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "b9f9aa575ef0a50b74b979bbff8abe84", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 297: b0db1b014260ba35b62876e2dd6c424c -> b92c51d07c11b18d8480b3d641cf5e8c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "b92c51d07c11b18d8480b3d641cf5e8c", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 298: b0db1b014260ba35b62876e2dd6c424c -> f3a931edd7eef9a3a9ecf6d8aa330c02
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "f3a931edd7eef9a3a9ecf6d8aa330c02", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 299: b0db1b014260ba35b62876e2dd6c424c -> 55839bc560b1a704c4806c975a9fd331
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "55839bc560b1a704c4806c975a9fd331", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 300: b0db1b014260ba35b62876e2dd6c424c -> 05038c335663e7c5708c20bc43bf374e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "05038c335663e7c5708c20bc43bf374e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 301 to 350...'

# Link 301: b0db1b014260ba35b62876e2dd6c424c -> 434f5706502403f7083eecd24f65da05
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "434f5706502403f7083eecd24f65da05", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 302: b0db1b014260ba35b62876e2dd6c424c -> 65c2ecb03ff55e8fa8f84dad19eaa1c6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "65c2ecb03ff55e8fa8f84dad19eaa1c6", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 303: b0db1b014260ba35b62876e2dd6c424c -> 9905515f89021cde194ba70cb70bb8f1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "9905515f89021cde194ba70cb70bb8f1", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 304: b0db1b014260ba35b62876e2dd6c424c -> fdbfb236729ea007a5029530792657d2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "fdbfb236729ea007a5029530792657d2", "relation": jump, "name": "competes with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 305: b0db1b014260ba35b62876e2dd6c424c -> 87ecb1fef0ba4ae5860eade2ba2bd3e2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 306: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> cab5c7c8a7ee552e98a282b19e35385d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "cab5c7c8a7ee552e98a282b19e35385d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 307: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 233e5805a095678ec71aeaa25a5bb91e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "233e5805a095678ec71aeaa25a5bb91e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 308: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 60fd5fbf326dcc8b676cd45d8d503a85
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "60fd5fbf326dcc8b676cd45d8d503a85", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 309: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 61218909ee1ca56238bcda759269072b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "61218909ee1ca56238bcda759269072b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 310: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 51ed889d0c1b77801f4d6030fff72bb7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "51ed889d0c1b77801f4d6030fff72bb7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 311: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> b27dc4d6fa7b24ebbcf20440a8f48907
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "b27dc4d6fa7b24ebbcf20440a8f48907", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 312: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 01ae34b24fa3c38e79bb856271516eb2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "01ae34b24fa3c38e79bb856271516eb2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 313: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> d07d6703ecf90e74df755a80175b6778
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "d07d6703ecf90e74df755a80175b6778", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 314: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> af2587e91f4f570045787ac2829abf21
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "af2587e91f4f570045787ac2829abf21", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 315: b0db1b014260ba35b62876e2dd6c424c -> 4bedfac60cad923f0d6e587756d33bc1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "4bedfac60cad923f0d6e587756d33bc1", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 316: 4bedfac60cad923f0d6e587756d33bc1 -> 1d89c7de56ff36f5a8a6fd7b2ebddd11
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "1d89c7de56ff36f5a8a6fd7b2ebddd11", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 317: 4bedfac60cad923f0d6e587756d33bc1 -> 3b65979257b01251aae8d08578c367ea
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "3b65979257b01251aae8d08578c367ea", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 318: 4bedfac60cad923f0d6e587756d33bc1 -> bc2f105745332a631ff66d288290a568
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "bc2f105745332a631ff66d288290a568", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 319: 4bedfac60cad923f0d6e587756d33bc1 -> e112085010ede56510b73c5404fb6700
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "e112085010ede56510b73c5404fb6700", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 320: 4bedfac60cad923f0d6e587756d33bc1 -> 8b4f0ba9f81e35f3640889312a3afd1d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "8b4f0ba9f81e35f3640889312a3afd1d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 321: b0db1b014260ba35b62876e2dd6c424c -> d83d5ce191911e3576bee47391029dd8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "d83d5ce191911e3576bee47391029dd8", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 322: d83d5ce191911e3576bee47391029dd8 -> 1364d94f4439330514f3f413f419a85b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d83d5ce191911e3576bee47391029dd8", "thoughtIdB": "1364d94f4439330514f3f413f419a85b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 323: d83d5ce191911e3576bee47391029dd8 -> b8e78ee6d4db4aad32ecf7846918085c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d83d5ce191911e3576bee47391029dd8", "thoughtIdB": "b8e78ee6d4db4aad32ecf7846918085c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 324: b0db1b014260ba35b62876e2dd6c424c -> 45a01e5651d598baa20567d809844663
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "45a01e5651d598baa20567d809844663", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 325: b0db1b014260ba35b62876e2dd6c424c -> 0b7a65a74cf222348b7c036d0f02da80
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "0b7a65a74cf222348b7c036d0f02da80", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 326: b0db1b014260ba35b62876e2dd6c424c -> e030cc6a8daec4131a8bd509f2bd6eb8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "e030cc6a8daec4131a8bd509f2bd6eb8", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 327: b0db1b014260ba35b62876e2dd6c424c -> 81440156bb54f48edd16f182e361eabb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "81440156bb54f48edd16f182e361eabb", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 328: b0db1b014260ba35b62876e2dd6c424c -> a53a623672ca372ea1933d474be66cc7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "a53a623672ca372ea1933d474be66cc7", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 329: b0db1b014260ba35b62876e2dd6c424c -> 12d2bae7b00267396ae49dffcbd563d6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "12d2bae7b00267396ae49dffcbd563d6", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 330: b0db1b014260ba35b62876e2dd6c424c -> c33e97f79fb370f44971ed66640a2b86
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "c33e97f79fb370f44971ed66640a2b86", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 331: b0db1b014260ba35b62876e2dd6c424c -> 49fb25d3d30ce86eb832753b24dc44e0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "49fb25d3d30ce86eb832753b24dc44e0", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 332: b0db1b014260ba35b62876e2dd6c424c -> bf678bc9267969fbf7984693e0f302cb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "bf678bc9267969fbf7984693e0f302cb", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 333: b0db1b014260ba35b62876e2dd6c424c -> c6e8d0ca099967be0cb6a2cc34027e3a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "c6e8d0ca099967be0cb6a2cc34027e3a", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 334: b6f9de2b9f9dd503c653221c083f2590 -> 73025656ca430683c824eb6079e7fdba
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "73025656ca430683c824eb6079e7fdba", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 335: b6f9de2b9f9dd503c653221c083f2590 -> 4a0ee59e5d93b239d335783e93ebcebb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b6f9de2b9f9dd503c653221c083f2590", "thoughtIdB": "4a0ee59e5d93b239d335783e93ebcebb", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 336: b0db1b014260ba35b62876e2dd6c424c -> 945889f89da65fc5a7c7c646520547af
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "945889f89da65fc5a7c7c646520547af", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 337: 945889f89da65fc5a7c7c646520547af -> fc63f2895c1452e133887b09bfac0fb8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "945889f89da65fc5a7c7c646520547af", "thoughtIdB": "fc63f2895c1452e133887b09bfac0fb8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 338: b0db1b014260ba35b62876e2dd6c424c -> 1e35ae0e8c156a9d656a49fca94c9862
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "1e35ae0e8c156a9d656a49fca94c9862", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 339: 1e35ae0e8c156a9d656a49fca94c9862 -> 0d47418e42b5f84e9b7ec29745e2f4f4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1e35ae0e8c156a9d656a49fca94c9862", "thoughtIdB": "0d47418e42b5f84e9b7ec29745e2f4f4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 340: 1e35ae0e8c156a9d656a49fca94c9862 -> ae2c7af0b6120f1b91d6caeb8327de81
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1e35ae0e8c156a9d656a49fca94c9862", "thoughtIdB": "ae2c7af0b6120f1b91d6caeb8327de81", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 341: b0db1b014260ba35b62876e2dd6c424c -> 64be75f28067d3734662b41e2189fe3f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "64be75f28067d3734662b41e2189fe3f", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 342: 64be75f28067d3734662b41e2189fe3f -> a8e2c2565bf8a4d51c1b1bf07e48c896
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "64be75f28067d3734662b41e2189fe3f", "thoughtIdB": "a8e2c2565bf8a4d51c1b1bf07e48c896", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 343: b0db1b014260ba35b62876e2dd6c424c -> 496a0638175e1b7cd8a4b97ddb894102
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "496a0638175e1b7cd8a4b97ddb894102", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 344: 496a0638175e1b7cd8a4b97ddb894102 -> a8e2c2565bf8a4d51c1b1bf07e48c896
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "496a0638175e1b7cd8a4b97ddb894102", "thoughtIdB": "a8e2c2565bf8a4d51c1b1bf07e48c896", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 345: b0db1b014260ba35b62876e2dd6c424c -> 446059cbbfc38e0961fa2968a3e42109
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "446059cbbfc38e0961fa2968a3e42109", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 346: 446059cbbfc38e0961fa2968a3e42109 -> 425040d861724dc851d16bb6015a4d4b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "446059cbbfc38e0961fa2968a3e42109", "thoughtIdB": "425040d861724dc851d16bb6015a4d4b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 347: 446059cbbfc38e0961fa2968a3e42109 -> cd79f7d3615ec8e32c6f62758071a926
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "446059cbbfc38e0961fa2968a3e42109", "thoughtIdB": "cd79f7d3615ec8e32c6f62758071a926", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 348: 4bedfac60cad923f0d6e587756d33bc1 -> b9452e3f734a0a9a866f92b1d199f20f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "b9452e3f734a0a9a866f92b1d199f20f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 349: b0db1b014260ba35b62876e2dd6c424c -> 80960dfb9705e6f2815de9aa6c0b8faa
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "80960dfb9705e6f2815de9aa6c0b8faa", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 350: b0db1b014260ba35b62876e2dd6c424c -> 0a7188225f4b4c2cbee36831fbe921a4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "0a7188225f4b4c2cbee36831fbe921a4", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 351 to 400...'

# Link 351: b0db1b014260ba35b62876e2dd6c424c -> 425273e64ec53567933513058e37e8b4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "425273e64ec53567933513058e37e8b4", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 352: b0db1b014260ba35b62876e2dd6c424c -> cdb7dff20accde3d31635587c347aa7e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "cdb7dff20accde3d31635587c347aa7e", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 353: b0db1b014260ba35b62876e2dd6c424c -> 4d82953a5c80f63267202da66fbf42fc
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "4d82953a5c80f63267202da66fbf42fc", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 354: b0db1b014260ba35b62876e2dd6c424c -> 99494286f87a69bbda07b7b6a780d4d5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "99494286f87a69bbda07b7b6a780d4d5", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 355: b0db1b014260ba35b62876e2dd6c424c -> aaa3183ad42445d9abcbc035f8b34362
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "aaa3183ad42445d9abcbc035f8b34362", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 356: b0db1b014260ba35b62876e2dd6c424c -> 5c169235e2e5438a127d66d326e4efd9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "5c169235e2e5438a127d66d326e4efd9", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 357: b0db1b014260ba35b62876e2dd6c424c -> fe5a15f1bd7c224dbbf3dc307ee2d37a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "fe5a15f1bd7c224dbbf3dc307ee2d37a", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 358: b0db1b014260ba35b62876e2dd6c424c -> 261d191f84554215f82ca2973c8c732d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "261d191f84554215f82ca2973c8c732d", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 359: b0db1b014260ba35b62876e2dd6c424c -> 6fa25a61295aec833a2b647ea38e089c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "6fa25a61295aec833a2b647ea38e089c", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 360: b0db1b014260ba35b62876e2dd6c424c -> f263b1335bc1a655c314279f9438c278
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "f263b1335bc1a655c314279f9438c278", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 361: b0db1b014260ba35b62876e2dd6c424c -> 59d7b91265a7d5c4de80b2404b0de1c8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "59d7b91265a7d5c4de80b2404b0de1c8", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 362: b0db1b014260ba35b62876e2dd6c424c -> 51c1d40b1260263978e647f2699f4768
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "51c1d40b1260263978e647f2699f4768", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 363: b0db1b014260ba35b62876e2dd6c424c -> 822db1ffd059e39fc2d612ab841ccbe5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "822db1ffd059e39fc2d612ab841ccbe5", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 364: b0db1b014260ba35b62876e2dd6c424c -> 2b0187b03fd9651e2434ad3e09892b70
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "2b0187b03fd9651e2434ad3e09892b70", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 365: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> f624ecb23a11b15c46a4a825baa80bf6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "f624ecb23a11b15c46a4a825baa80bf6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 366: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 22c07d5762879e2b29cf409742b58130
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "22c07d5762879e2b29cf409742b58130", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 367: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> ffb5c7a5bdff8ce15ba0057afa463ea7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "ffb5c7a5bdff8ce15ba0057afa463ea7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 368: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 993516cf4889899a9c9300cdb759ebac
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "993516cf4889899a9c9300cdb759ebac", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 369: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> f7441a0f9ee53b99f76c78185bd0784c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "f7441a0f9ee53b99f76c78185bd0784c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 370: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 4d414340b278cfaea97be682c20fb03d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "4d414340b278cfaea97be682c20fb03d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 371: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> d625d91c632f0db2da930d3f4bad0eeb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "d625d91c632f0db2da930d3f4bad0eeb", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 372: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 1b0b55b022028cfef7f3b8bd051f9508
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "1b0b55b022028cfef7f3b8bd051f9508", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 373: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 3003c6c107667ae6ed2acc881247c6f9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "3003c6c107667ae6ed2acc881247c6f9", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 374: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> 74c84acac1c6d7726844a043c0c85112
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "74c84acac1c6d7726844a043c0c85112", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 375: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> af676e3182e1a716e7c24bfa7db14066
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "af676e3182e1a716e7c24bfa7db14066", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 376: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> b2016cb68d1b625f83a9a78c894dabc7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "b2016cb68d1b625f83a9a78c894dabc7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 377: 87ecb1fef0ba4ae5860eade2ba2bd3e2 -> dcf2bcdd8c0ee7b39f03676e6ca57506
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "87ecb1fef0ba4ae5860eade2ba2bd3e2", "thoughtIdB": "dcf2bcdd8c0ee7b39f03676e6ca57506", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 378: 4bedfac60cad923f0d6e587756d33bc1 -> b4228a76636ebf3147a1d4f053402e00
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "b4228a76636ebf3147a1d4f053402e00", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 379: 4bedfac60cad923f0d6e587756d33bc1 -> f643481beaf813368f0953c5ce8e2889
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "f643481beaf813368f0953c5ce8e2889", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 380: 4bedfac60cad923f0d6e587756d33bc1 -> d70fd55e1325b5f85af162c106ab4341
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "d70fd55e1325b5f85af162c106ab4341", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 381: 4bedfac60cad923f0d6e587756d33bc1 -> 15cf3e51181d8089aaf2727ff72ffbd8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "15cf3e51181d8089aaf2727ff72ffbd8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 382: 4bedfac60cad923f0d6e587756d33bc1 -> 02a4bbb11e9f5654d567605bda41ffff
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "02a4bbb11e9f5654d567605bda41ffff", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 383: 4bedfac60cad923f0d6e587756d33bc1 -> 5bdbcbfb8b83578447ac8f9087ac8b42
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bedfac60cad923f0d6e587756d33bc1", "thoughtIdB": "5bdbcbfb8b83578447ac8f9087ac8b42", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 384: b0db1b014260ba35b62876e2dd6c424c -> 9ffb9bedc513ee6ce1aea2753d1e5c2f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "9ffb9bedc513ee6ce1aea2753d1e5c2f", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 385: 9ffb9bedc513ee6ce1aea2753d1e5c2f -> 156c50c94239aca07b00a9bea00cc529
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9ffb9bedc513ee6ce1aea2753d1e5c2f", "thoughtIdB": "156c50c94239aca07b00a9bea00cc529", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 386: 9ffb9bedc513ee6ce1aea2753d1e5c2f -> 97f3d1f4de0564cce2e8d7922069e7c2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9ffb9bedc513ee6ce1aea2753d1e5c2f", "thoughtIdB": "97f3d1f4de0564cce2e8d7922069e7c2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 387: 9ffb9bedc513ee6ce1aea2753d1e5c2f -> 4261f18dd3a4ec86c01ff8503795acf0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9ffb9bedc513ee6ce1aea2753d1e5c2f", "thoughtIdB": "4261f18dd3a4ec86c01ff8503795acf0", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 388: b0db1b014260ba35b62876e2dd6c424c -> a36e924d5789f383d0e6be805d9f46eb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "a36e924d5789f383d0e6be805d9f46eb", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 389: a36e924d5789f383d0e6be805d9f46eb -> 02170471b7910d46333c90732e6410be
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a36e924d5789f383d0e6be805d9f46eb", "thoughtIdB": "02170471b7910d46333c90732e6410be", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 390: a36e924d5789f383d0e6be805d9f46eb -> 5e106418d37e6717a36ddc083379ab1f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a36e924d5789f383d0e6be805d9f46eb", "thoughtIdB": "5e106418d37e6717a36ddc083379ab1f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 391: a36e924d5789f383d0e6be805d9f46eb -> 3c3704958d05440720b85b9b2d309714
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a36e924d5789f383d0e6be805d9f46eb", "thoughtIdB": "3c3704958d05440720b85b9b2d309714", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 392: a36e924d5789f383d0e6be805d9f46eb -> 993516cf4889899a9c9300cdb759ebac
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a36e924d5789f383d0e6be805d9f46eb", "thoughtIdB": "993516cf4889899a9c9300cdb759ebac", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 393: a36e924d5789f383d0e6be805d9f46eb -> 8e0b7524f6d87bfd733fd28cddf17f64
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a36e924d5789f383d0e6be805d9f46eb", "thoughtIdB": "8e0b7524f6d87bfd733fd28cddf17f64", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 394: b0db1b014260ba35b62876e2dd6c424c -> cb8ede41d5a17d760c472ead744b04ce
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "cb8ede41d5a17d760c472ead744b04ce", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 395: b0db1b014260ba35b62876e2dd6c424c -> df0150ebc851e2591a18a5001f6fec80
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "df0150ebc851e2591a18a5001f6fec80", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 396: b0db1b014260ba35b62876e2dd6c424c -> ed1aed2510b7f8a2a35e322e5da7d3d5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "ed1aed2510b7f8a2a35e322e5da7d3d5", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 397: b0db1b014260ba35b62876e2dd6c424c -> fda1eb95069a84b1641512abbaafd1ae
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "fda1eb95069a84b1641512abbaafd1ae", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 398: b0db1b014260ba35b62876e2dd6c424c -> 1b00fa99930c5a39535a595947af789e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "1b00fa99930c5a39535a595947af789e", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 399: b0db1b014260ba35b62876e2dd6c424c -> 4b21a46dc63773570d9137ded8ef0b36
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "4b21a46dc63773570d9137ded8ef0b36", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 400: b0db1b014260ba35b62876e2dd6c424c -> 8d038b449ab0387db8716fa6d0f4174f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "8d038b449ab0387db8716fa6d0f4174f", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 401 to 450...'

# Link 401: b0db1b014260ba35b62876e2dd6c424c -> aa734d0f5125f8a72ecf8b6476f0e56c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "aa734d0f5125f8a72ecf8b6476f0e56c", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 402: b0db1b014260ba35b62876e2dd6c424c -> 2db48df208c97e7233da0dc444a82661
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "2db48df208c97e7233da0dc444a82661", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 403: b0db1b014260ba35b62876e2dd6c424c -> 1abd40108089a31684e85024380479b1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "1abd40108089a31684e85024380479b1", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 404: b0db1b014260ba35b62876e2dd6c424c -> d8dcc61d50eb8406867cff47d876c75b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "d8dcc61d50eb8406867cff47d876c75b", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 405: b0db1b014260ba35b62876e2dd6c424c -> 6de753a142d060177de5ad71d2ffcdb4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "6de753a142d060177de5ad71d2ffcdb4", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 406: b0db1b014260ba35b62876e2dd6c424c -> 5bd6a9e2446b38275dd271d9167dce2e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b0db1b014260ba35b62876e2dd6c424c", "thoughtIdB": "5bd6a9e2446b38275dd271d9167dce2e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 407: 2963560d418225c27c0bdb4822125692 -> 9cff9a65f796dadf2a30abf84b19a1e9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "9cff9a65f796dadf2a30abf84b19a1e9", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 408: 9cff9a65f796dadf2a30abf84b19a1e9 -> e07754366fd5660eb0c134352449efff
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "e07754366fd5660eb0c134352449efff", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 409: 9cff9a65f796dadf2a30abf84b19a1e9 -> 91a2cefbb416114d8e11af58ed6f3dbf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "91a2cefbb416114d8e11af58ed6f3dbf", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 410: 9cff9a65f796dadf2a30abf84b19a1e9 -> 188ce997964835a86c0b0a7cd495e277
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "188ce997964835a86c0b0a7cd495e277", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 411: 9cff9a65f796dadf2a30abf84b19a1e9 -> a1e963e20c5cefbd239dfa929575d023
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "a1e963e20c5cefbd239dfa929575d023", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 412: 9cff9a65f796dadf2a30abf84b19a1e9 -> a0e335bb95a99a27df5cd5b158c01b90
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "a0e335bb95a99a27df5cd5b158c01b90", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 413: 9cff9a65f796dadf2a30abf84b19a1e9 -> 2da6616e3bdb5f983bc6176c584fb6e5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "2da6616e3bdb5f983bc6176c584fb6e5", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 414: 9cff9a65f796dadf2a30abf84b19a1e9 -> c5940b97cf6bd50ee2ad6dcfd84880d8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "c5940b97cf6bd50ee2ad6dcfd84880d8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 415: 9cff9a65f796dadf2a30abf84b19a1e9 -> b2b481625d063402b115ffd0a8c583bf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "b2b481625d063402b115ffd0a8c583bf", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 416: 9cff9a65f796dadf2a30abf84b19a1e9 -> a9fa758416c9dfdd63eda2feb6cb6e17
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "a9fa758416c9dfdd63eda2feb6cb6e17", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 417: 9cff9a65f796dadf2a30abf84b19a1e9 -> e4f7c69d4f41fb33d1c24459e0325cc7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "e4f7c69d4f41fb33d1c24459e0325cc7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 418: 9cff9a65f796dadf2a30abf84b19a1e9 -> 5673aa086e7a68aa975ba8fb2d187147
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "5673aa086e7a68aa975ba8fb2d187147", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 419: 9cff9a65f796dadf2a30abf84b19a1e9 -> 743f8866c0f14252eb5f2e654ad8b834
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "743f8866c0f14252eb5f2e654ad8b834", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 420: 2963560d418225c27c0bdb4822125692 -> 4fe6d2ddbe2bc446ba5395e8414ba974
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "4fe6d2ddbe2bc446ba5395e8414ba974", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 421: 2963560d418225c27c0bdb4822125692 -> 13545406c23c88ba11eaa476fe387079
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "13545406c23c88ba11eaa476fe387079", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 422: 2963560d418225c27c0bdb4822125692 -> b28eaa147d39876c03b6f9546eef0087
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "b28eaa147d39876c03b6f9546eef0087", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 423: 2963560d418225c27c0bdb4822125692 -> b55965783d3fd30ddf106a2dc1011c38
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "b55965783d3fd30ddf106a2dc1011c38", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 424: 2963560d418225c27c0bdb4822125692 -> bb33cc07c50e27f090ebe589ddafb7a5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "bb33cc07c50e27f090ebe589ddafb7a5", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 425: 2963560d418225c27c0bdb4822125692 -> 262478cc8f8bd8ce71e3dee010aeab1f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "262478cc8f8bd8ce71e3dee010aeab1f", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 426: 2963560d418225c27c0bdb4822125692 -> da3eb0779a1a5ea3d33a3a1a6cb3be38
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "da3eb0779a1a5ea3d33a3a1a6cb3be38", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 427: 2963560d418225c27c0bdb4822125692 -> 01d59681dba435ea137111bd69e7c929
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "01d59681dba435ea137111bd69e7c929", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 428: 2963560d418225c27c0bdb4822125692 -> 463e93053200d5788655b45fac73fdca
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "463e93053200d5788655b45fac73fdca", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 429: 2963560d418225c27c0bdb4822125692 -> 42f5519d75ef7be2663d57d9a8b90993
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "42f5519d75ef7be2663d57d9a8b90993", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 430: 9cff9a65f796dadf2a30abf84b19a1e9 -> 3a0f53feb936fc0829eb00aa1cc38477
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "3a0f53feb936fc0829eb00aa1cc38477", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 431: 9cff9a65f796dadf2a30abf84b19a1e9 -> c6083ea41e7e9c8d0ff58190dfb330e4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "c6083ea41e7e9c8d0ff58190dfb330e4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 432: 9cff9a65f796dadf2a30abf84b19a1e9 -> 582faeb953cb4900265a5e94a21021be
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "582faeb953cb4900265a5e94a21021be", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 433: 9cff9a65f796dadf2a30abf84b19a1e9 -> f6d562c94c31a9d7c6adb79f4aae7486
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "f6d562c94c31a9d7c6adb79f4aae7486", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 434: 9cff9a65f796dadf2a30abf84b19a1e9 -> 9eb2bfd93cb1bc405bd27902734b523d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "9eb2bfd93cb1bc405bd27902734b523d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 435: 9cff9a65f796dadf2a30abf84b19a1e9 -> 280811cd457b8986bea4128ab9426314
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "280811cd457b8986bea4128ab9426314", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 436: 2963560d418225c27c0bdb4822125692 -> f66b14c56deb119dcdaddd30e07fb816
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "f66b14c56deb119dcdaddd30e07fb816", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 437: f66b14c56deb119dcdaddd30e07fb816 -> d0f2e21e88f18de28364b5e7660e5d1c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f66b14c56deb119dcdaddd30e07fb816", "thoughtIdB": "d0f2e21e88f18de28364b5e7660e5d1c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 438: f66b14c56deb119dcdaddd30e07fb816 -> f47e957134d260eeafd5ead6e2f03b4d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f66b14c56deb119dcdaddd30e07fb816", "thoughtIdB": "f47e957134d260eeafd5ead6e2f03b4d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 439: 2963560d418225c27c0bdb4822125692 -> 824a26f61c7831a59180574af351ba19
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "824a26f61c7831a59180574af351ba19", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 440: 2963560d418225c27c0bdb4822125692 -> 9b05f01f329bdd0d15e13a89849a28c6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "9b05f01f329bdd0d15e13a89849a28c6", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 441: 2963560d418225c27c0bdb4822125692 -> 5a3d3b565df6611ad38095abdc035795
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "5a3d3b565df6611ad38095abdc035795", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 442: 2963560d418225c27c0bdb4822125692 -> 80c9b6d8f94fc08d4b0ecc3adaca4aff
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "80c9b6d8f94fc08d4b0ecc3adaca4aff", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 443: 2963560d418225c27c0bdb4822125692 -> 8d0c22922d728f0ce46bdba85e173e01
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "8d0c22922d728f0ce46bdba85e173e01", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 444: 2963560d418225c27c0bdb4822125692 -> 9ef97d759d7c525be1abc8d3c6d1afd0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "9ef97d759d7c525be1abc8d3c6d1afd0", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 445: 2963560d418225c27c0bdb4822125692 -> 25e5047aeb1841856c12f97115e03959
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "25e5047aeb1841856c12f97115e03959", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 446: 2963560d418225c27c0bdb4822125692 -> 7c36baf0c04d356ef1dfbdb0ba472f16
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "7c36baf0c04d356ef1dfbdb0ba472f16", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 447: 2963560d418225c27c0bdb4822125692 -> 9c00eaf4d5d6b9d59ea2d655b90a34d5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "9c00eaf4d5d6b9d59ea2d655b90a34d5", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 448: 2963560d418225c27c0bdb4822125692 -> 2c85bd8abfa1edc3ad7399219bd084f1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "2c85bd8abfa1edc3ad7399219bd084f1", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 449: 2963560d418225c27c0bdb4822125692 -> 1349f328d3d9029f3638b74d08b01331
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "1349f328d3d9029f3638b74d08b01331", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 450: 2963560d418225c27c0bdb4822125692 -> 045ee03936c97da8d39ba74d92bfe962
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "045ee03936c97da8d39ba74d92bfe962", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 451 to 500...'

# Link 451: 2963560d418225c27c0bdb4822125692 -> 42c2ed48e16eec34749409e5a8b934a5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "42c2ed48e16eec34749409e5a8b934a5", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 452: 2963560d418225c27c0bdb4822125692 -> d428c9bc8f21a78891f634ecdc162587
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "d428c9bc8f21a78891f634ecdc162587", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 453: 2963560d418225c27c0bdb4822125692 -> 7a66953b9db53105922a848c95d9034e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "7a66953b9db53105922a848c95d9034e", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 454: 2963560d418225c27c0bdb4822125692 -> 07c2f4968960240d0fd36569230eb2fb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "07c2f4968960240d0fd36569230eb2fb", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 455: 2963560d418225c27c0bdb4822125692 -> 608700e17c2d71d827f439f28bc315b6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "608700e17c2d71d827f439f28bc315b6", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 456: 2963560d418225c27c0bdb4822125692 -> d68600b74300870fab36655a55ed4a5a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "d68600b74300870fab36655a55ed4a5a", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 457: 2963560d418225c27c0bdb4822125692 -> 58cf5b4d856189f745ab303240d723d6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "58cf5b4d856189f745ab303240d723d6", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 458: 2963560d418225c27c0bdb4822125692 -> a409fe3ef2d9a0ae0ee0c8877ba47f4d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "a409fe3ef2d9a0ae0ee0c8877ba47f4d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 459: 9cff9a65f796dadf2a30abf84b19a1e9 -> 60c8b44509c9268e754b7268164d91b7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "60c8b44509c9268e754b7268164d91b7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 460: 9cff9a65f796dadf2a30abf84b19a1e9 -> 5fc4f3fdd292c5bc16473bdda9ce281b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "5fc4f3fdd292c5bc16473bdda9ce281b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 461: 9cff9a65f796dadf2a30abf84b19a1e9 -> fc524977c4f4468e718798c1c96a5dfb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "fc524977c4f4468e718798c1c96a5dfb", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 462: 9cff9a65f796dadf2a30abf84b19a1e9 -> 403d22493ae14cc6b8fd50988120c587
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "403d22493ae14cc6b8fd50988120c587", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 463: 9cff9a65f796dadf2a30abf84b19a1e9 -> 19ee2e3e02535e0290c66e02bca343a0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "19ee2e3e02535e0290c66e02bca343a0", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 464: 9cff9a65f796dadf2a30abf84b19a1e9 -> 1461165cb5debb89c2e4de7fdaf9548f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9cff9a65f796dadf2a30abf84b19a1e9", "thoughtIdB": "1461165cb5debb89c2e4de7fdaf9548f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 465: 2963560d418225c27c0bdb4822125692 -> dd59cc6c95d92d9e6ebadcc884d23c6b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "dd59cc6c95d92d9e6ebadcc884d23c6b", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 466: 2963560d418225c27c0bdb4822125692 -> d6220472ccb7553860616e24a22421a1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "d6220472ccb7553860616e24a22421a1", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 467: 2963560d418225c27c0bdb4822125692 -> 5cd3b3fddf926dceed39dc9be15225a8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "5cd3b3fddf926dceed39dc9be15225a8", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 468: 2963560d418225c27c0bdb4822125692 -> 1f0ec2f1d305b7decb4a23fcc0601ccd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "1f0ec2f1d305b7decb4a23fcc0601ccd", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 469: 2963560d418225c27c0bdb4822125692 -> b6f24045cbcf9c1126b47c045e44341d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "b6f24045cbcf9c1126b47c045e44341d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 470: 2963560d418225c27c0bdb4822125692 -> 5c439d2c7bd390df5458b27c32c48142
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "5c439d2c7bd390df5458b27c32c48142", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 471: 2963560d418225c27c0bdb4822125692 -> 1c3975b620355241aee19f6c620a0814
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "1c3975b620355241aee19f6c620a0814", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 472: 2963560d418225c27c0bdb4822125692 -> 22501c8bc3d001eca81e2b1a84d7047c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2963560d418225c27c0bdb4822125692", "thoughtIdB": "22501c8bc3d001eca81e2b1a84d7047c", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 473: 30ec157314726e1d2ba5c9aeb9fded44 -> a5207ccc986d9e870a0a577df8e58692
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "a5207ccc986d9e870a0a577df8e58692", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 474: a5207ccc986d9e870a0a577df8e58692 -> 105c3d8fec769bb8d4584d4e69f54037
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "105c3d8fec769bb8d4584d4e69f54037", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 475: a5207ccc986d9e870a0a577df8e58692 -> 50c954e84a9f6f37b783533a7964fe4d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "50c954e84a9f6f37b783533a7964fe4d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 476: a5207ccc986d9e870a0a577df8e58692 -> d0c3c6e2b52c9f138db8b9149960f05e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "d0c3c6e2b52c9f138db8b9149960f05e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 477: a5207ccc986d9e870a0a577df8e58692 -> 8a462783200b38f361179bb0087c49b4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "8a462783200b38f361179bb0087c49b4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 478: a5207ccc986d9e870a0a577df8e58692 -> 01db165704d50f34c3414ac007e66b68
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "01db165704d50f34c3414ac007e66b68", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 479: a5207ccc986d9e870a0a577df8e58692 -> b552ebfe14a6c5f6a19f53d63f99bd1b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "b552ebfe14a6c5f6a19f53d63f99bd1b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 480: a5207ccc986d9e870a0a577df8e58692 -> aac07021f47e5f366e57555944d1f6b7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "aac07021f47e5f366e57555944d1f6b7", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 481: a5207ccc986d9e870a0a577df8e58692 -> 52c4fe60a93586e37ea14f4eb5ff9ffe
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "52c4fe60a93586e37ea14f4eb5ff9ffe", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 482: a5207ccc986d9e870a0a577df8e58692 -> ffa02fa38b9daf0655235a2e9500f307
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "ffa02fa38b9daf0655235a2e9500f307", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 483: a5207ccc986d9e870a0a577df8e58692 -> f03018d78b70b9a41cef0b94ae2dcdc2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "f03018d78b70b9a41cef0b94ae2dcdc2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 484: a5207ccc986d9e870a0a577df8e58692 -> e9d64ec5e9f0425fc09daa2bed577703
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "e9d64ec5e9f0425fc09daa2bed577703", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 485: a5207ccc986d9e870a0a577df8e58692 -> dc98571f65667017fd79ea126c6a1d1b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "dc98571f65667017fd79ea126c6a1d1b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 486: 30ec157314726e1d2ba5c9aeb9fded44 -> 67ae7ffe680bfd5a1b3af95698067d2f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "67ae7ffe680bfd5a1b3af95698067d2f", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 487: 30ec157314726e1d2ba5c9aeb9fded44 -> 8fbefc3bb74ed4d24d94de8e232fde95
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "8fbefc3bb74ed4d24d94de8e232fde95", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 488: 30ec157314726e1d2ba5c9aeb9fded44 -> 5a9d2ca070c7853dc078b03886013417
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "5a9d2ca070c7853dc078b03886013417", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 489: 30ec157314726e1d2ba5c9aeb9fded44 -> bd0b960ba02b307b4e9140c7b054f4bc
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "bd0b960ba02b307b4e9140c7b054f4bc", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 490: 30ec157314726e1d2ba5c9aeb9fded44 -> e030cc6a8daec4131a8bd509f2bd6eb8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "e030cc6a8daec4131a8bd509f2bd6eb8", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 491: 30ec157314726e1d2ba5c9aeb9fded44 -> 786d3d8698caa66320a6ffe912c4adae
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "786d3d8698caa66320a6ffe912c4adae", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 492: 30ec157314726e1d2ba5c9aeb9fded44 -> fbd4273b6b275a4e9df8866cc3c862e7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "fbd4273b6b275a4e9df8866cc3c862e7", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 493: 30ec157314726e1d2ba5c9aeb9fded44 -> 6f5a2733e69b3226859a780145a8b49f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "6f5a2733e69b3226859a780145a8b49f", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 494: 30ec157314726e1d2ba5c9aeb9fded44 -> 1f0ec2f1d305b7decb4a23fcc0601ccd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "1f0ec2f1d305b7decb4a23fcc0601ccd", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 495: 30ec157314726e1d2ba5c9aeb9fded44 -> 05038c335663e7c5708c20bc43bf374e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "05038c335663e7c5708c20bc43bf374e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 496: 30ec157314726e1d2ba5c9aeb9fded44 -> 0a9ab821d1dadc25c8cbd6274ad940b9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "0a9ab821d1dadc25c8cbd6274ad940b9", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 497: 30ec157314726e1d2ba5c9aeb9fded44 -> 624c0604759023790d2c9f53a1cb4e31
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "624c0604759023790d2c9f53a1cb4e31", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 498: 30ec157314726e1d2ba5c9aeb9fded44 -> 5dd6e1b70f92b747518a68d0e549e3e5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "5dd6e1b70f92b747518a68d0e549e3e5", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 499: 30ec157314726e1d2ba5c9aeb9fded44 -> 8c9adcf35b0725577bedb2a7d242c129
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "8c9adcf35b0725577bedb2a7d242c129", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 500: a5207ccc986d9e870a0a577df8e58692 -> 74fa824387b0f2d730400951b620c262
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "74fa824387b0f2d730400951b620c262", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 501 to 550...'

# Link 501: a5207ccc986d9e870a0a577df8e58692 -> 3dbe5aa57fd153a903eff8ef3218af42
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a5207ccc986d9e870a0a577df8e58692", "thoughtIdB": "3dbe5aa57fd153a903eff8ef3218af42", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 502: 30ec157314726e1d2ba5c9aeb9fded44 -> e98c540c41fa1147037abffeb2f7ed4a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "e98c540c41fa1147037abffeb2f7ed4a", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 503: 30ec157314726e1d2ba5c9aeb9fded44 -> 728294eaee478bbf497a1b663c03a197
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "728294eaee478bbf497a1b663c03a197", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 504: 30ec157314726e1d2ba5c9aeb9fded44 -> ebe088cf4074cc170b559f76a70171d8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "30ec157314726e1d2ba5c9aeb9fded44", "thoughtIdB": "ebe088cf4074cc170b559f76a70171d8", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 505: 3a433b0c63b056593ac38ecf0ff0f0a4 -> a24764f40f93c0c5ff27de33b8cafc89
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "a24764f40f93c0c5ff27de33b8cafc89", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 506: a24764f40f93c0c5ff27de33b8cafc89 -> 7497ed757d0be3ab1925d0e47f4a4db6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a24764f40f93c0c5ff27de33b8cafc89", "thoughtIdB": "7497ed757d0be3ab1925d0e47f4a4db6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 507: a24764f40f93c0c5ff27de33b8cafc89 -> a26e20d177a28891d08ed3fe4c3003c9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a24764f40f93c0c5ff27de33b8cafc89", "thoughtIdB": "a26e20d177a28891d08ed3fe4c3003c9", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 508: a24764f40f93c0c5ff27de33b8cafc89 -> 0099e54b7305e673d9efd1ab5b1e6ae1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a24764f40f93c0c5ff27de33b8cafc89", "thoughtIdB": "0099e54b7305e673d9efd1ab5b1e6ae1", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 509: a24764f40f93c0c5ff27de33b8cafc89 -> e0f4d8c17f20ed8b7e8e65d5f328b0ca
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a24764f40f93c0c5ff27de33b8cafc89", "thoughtIdB": "e0f4d8c17f20ed8b7e8e65d5f328b0ca", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 510: 3a433b0c63b056593ac38ecf0ff0f0a4 -> 39c0156283bedd2ce5932e4f085b90e7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "39c0156283bedd2ce5932e4f085b90e7", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 511: 3a433b0c63b056593ac38ecf0ff0f0a4 -> 3f265831375e9c42ed46087e8bfc19e5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "3f265831375e9c42ed46087e8bfc19e5", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 512: 3a433b0c63b056593ac38ecf0ff0f0a4 -> ebac931d091111d8507c7fe199958bc8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "ebac931d091111d8507c7fe199958bc8", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 513: 3a433b0c63b056593ac38ecf0ff0f0a4 -> 10a0d2414f1395cc31318165eecc1ba4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "10a0d2414f1395cc31318165eecc1ba4", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 514: 3a433b0c63b056593ac38ecf0ff0f0a4 -> 694bd8c053c1891a0b5e7322a80d36a6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "694bd8c053c1891a0b5e7322a80d36a6", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 515: 3a433b0c63b056593ac38ecf0ff0f0a4 -> 5e25e74c7bf2f8242683cb9f021eacc9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3a433b0c63b056593ac38ecf0ff0f0a4", "thoughtIdB": "5e25e74c7bf2f8242683cb9f021eacc9", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 516: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 983c95c1c574bc1cfdce1cd6bbd806f5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "983c95c1c574bc1cfdce1cd6bbd806f5", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 517: 983c95c1c574bc1cfdce1cd6bbd806f5 -> 8e71dba2f85c1ad58dee37a61bf5ef07
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "983c95c1c574bc1cfdce1cd6bbd806f5", "thoughtIdB": "8e71dba2f85c1ad58dee37a61bf5ef07", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 518: 983c95c1c574bc1cfdce1cd6bbd806f5 -> 42f6edb55e9fc81a8e1e6c3f585ff671
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "983c95c1c574bc1cfdce1cd6bbd806f5", "thoughtIdB": "42f6edb55e9fc81a8e1e6c3f585ff671", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 519: 983c95c1c574bc1cfdce1cd6bbd806f5 -> 1c9931c079bd274d62cd933abb1922c2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "983c95c1c574bc1cfdce1cd6bbd806f5", "thoughtIdB": "1c9931c079bd274d62cd933abb1922c2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 520: 983c95c1c574bc1cfdce1cd6bbd806f5 -> 92c3206b86554b2a84bbd69e4d416f95
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "983c95c1c574bc1cfdce1cd6bbd806f5", "thoughtIdB": "92c3206b86554b2a84bbd69e4d416f95", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 521: 983c95c1c574bc1cfdce1cd6bbd806f5 -> c64e48381b321b669a4946b54a2e6c5d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "983c95c1c574bc1cfdce1cd6bbd806f5", "thoughtIdB": "c64e48381b321b669a4946b54a2e6c5d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 522: 0f4121ab8a77cfe1da0cedeb39807ea9 -> e9b7a20cc3c247a8e0dd36a7c185cb52
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "e9b7a20cc3c247a8e0dd36a7c185cb52", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 523: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 16eac9f88adbed03368747f9d8132f4b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "16eac9f88adbed03368747f9d8132f4b", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 524: 0f4121ab8a77cfe1da0cedeb39807ea9 -> be9a4ac446c2598ea719d929e801afae
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "be9a4ac446c2598ea719d929e801afae", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 525: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 926460d56019ea43bb63451396e0d678
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "926460d56019ea43bb63451396e0d678", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 526: 0f4121ab8a77cfe1da0cedeb39807ea9 -> ada38e500760e183a6cf542db0d515cf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "ada38e500760e183a6cf542db0d515cf", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 527: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 88879cbb547863e0c3615536db8e0b12
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "88879cbb547863e0c3615536db8e0b12", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 528: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 35df7d2fffbd1f328d7a9d7dfaaf52e7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "35df7d2fffbd1f328d7a9d7dfaaf52e7", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 529: 0f4121ab8a77cfe1da0cedeb39807ea9 -> d5038e119f3bf5698eba279d11030ee1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "d5038e119f3bf5698eba279d11030ee1", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 530: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 92151a0e8060629e7c596972eac8f4a7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "92151a0e8060629e7c596972eac8f4a7", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 531: 0f4121ab8a77cfe1da0cedeb39807ea9 -> e14fe1ee6aa74e8c835e6fee7e6cce1a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "e14fe1ee6aa74e8c835e6fee7e6cce1a", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 532: 0f4121ab8a77cfe1da0cedeb39807ea9 -> b851c2d27265e5cecfe636b4e4c87085
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "b851c2d27265e5cecfe636b4e4c87085", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 533: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 592ce87529ae858f846a9913594f7b64
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "592ce87529ae858f846a9913594f7b64", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 534: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 08623f2caf92b88e6ca25ea80457dcd7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "08623f2caf92b88e6ca25ea80457dcd7", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 535: 0f4121ab8a77cfe1da0cedeb39807ea9 -> a74946c62bb6418203dabc6dcd51f502
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "a74946c62bb6418203dabc6dcd51f502", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 536: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 9779c54d791c76b3aecf999901cd360c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "9779c54d791c76b3aecf999901cd360c", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 537: 0f4121ab8a77cfe1da0cedeb39807ea9 -> 4a03507b140e9c92f551f8f0f07e41b2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0f4121ab8a77cfe1da0cedeb39807ea9", "thoughtIdB": "4a03507b140e9c92f551f8f0f07e41b2", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 538: fdbfb236729ea007a5029530792657d2 -> 333d052cdc5f093973b8af50ff5eb819
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "333d052cdc5f093973b8af50ff5eb819", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 539: 333d052cdc5f093973b8af50ff5eb819 -> be98e114a07eac3f8643502357e5b0d5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "be98e114a07eac3f8643502357e5b0d5", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 540: 333d052cdc5f093973b8af50ff5eb819 -> 4afcaebe3cc17c7876b73d21162e8d86
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "4afcaebe3cc17c7876b73d21162e8d86", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 541: 333d052cdc5f093973b8af50ff5eb819 -> fd70b4c63e586b38053947448e4120fe
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "fd70b4c63e586b38053947448e4120fe", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 542: 333d052cdc5f093973b8af50ff5eb819 -> adfdfe4473e0eeb2d386e380adf37358
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "adfdfe4473e0eeb2d386e380adf37358", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 543: 333d052cdc5f093973b8af50ff5eb819 -> 019332cf48c1ef40f8f1e0835d61f0ca
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "019332cf48c1ef40f8f1e0835d61f0ca", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 544: fdbfb236729ea007a5029530792657d2 -> 9eef3ce8790d4d32e4affaf07db18c94
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "9eef3ce8790d4d32e4affaf07db18c94", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 545: 9eef3ce8790d4d32e4affaf07db18c94 -> afa0d391ba94f64b0d375bf540ba2fa3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9eef3ce8790d4d32e4affaf07db18c94", "thoughtIdB": "afa0d391ba94f64b0d375bf540ba2fa3", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 546: 9eef3ce8790d4d32e4affaf07db18c94 -> 12d7c5d372b3317c9f8653cc0bb35fbd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9eef3ce8790d4d32e4affaf07db18c94", "thoughtIdB": "12d7c5d372b3317c9f8653cc0bb35fbd", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 547: 9eef3ce8790d4d32e4affaf07db18c94 -> eaff934ab0f1f61197e9e983addefa73
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9eef3ce8790d4d32e4affaf07db18c94", "thoughtIdB": "eaff934ab0f1f61197e9e983addefa73", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 548: 9eef3ce8790d4d32e4affaf07db18c94 -> d06e88702ca23a8300280b971878dbb1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9eef3ce8790d4d32e4affaf07db18c94", "thoughtIdB": "d06e88702ca23a8300280b971878dbb1", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 549: fdbfb236729ea007a5029530792657d2 -> 1973730c572a33812b79a861f19a7568
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "1973730c572a33812b79a861f19a7568", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 550: 1973730c572a33812b79a861f19a7568 -> 42d2da7af0af843b66f2234e4c4b36b2
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1973730c572a33812b79a861f19a7568", "thoughtIdB": "42d2da7af0af843b66f2234e4c4b36b2", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 551 to 600...'

# Link 551: 1973730c572a33812b79a861f19a7568 -> f02be3bbbecdd37a0363988ca493bf2e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1973730c572a33812b79a861f19a7568", "thoughtIdB": "f02be3bbbecdd37a0363988ca493bf2e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 552: 1973730c572a33812b79a861f19a7568 -> 50c2e477606085a711569f7fc82336ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1973730c572a33812b79a861f19a7568", "thoughtIdB": "50c2e477606085a711569f7fc82336ee", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 553: 1973730c572a33812b79a861f19a7568 -> 0e2d8a1d86943d9b8e5a88fefa4af27a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "1973730c572a33812b79a861f19a7568", "thoughtIdB": "0e2d8a1d86943d9b8e5a88fefa4af27a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 554: fdbfb236729ea007a5029530792657d2 -> 18deb8d634b2e2ce544dc77c3013cb98
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "18deb8d634b2e2ce544dc77c3013cb98", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 555: 18deb8d634b2e2ce544dc77c3013cb98 -> 30e396e5f6aeb34738d7a01fe51bee6a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "18deb8d634b2e2ce544dc77c3013cb98", "thoughtIdB": "30e396e5f6aeb34738d7a01fe51bee6a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 556: 18deb8d634b2e2ce544dc77c3013cb98 -> 88f85efcbc85c5a260626f13b12f027e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "18deb8d634b2e2ce544dc77c3013cb98", "thoughtIdB": "88f85efcbc85c5a260626f13b12f027e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 557: 18deb8d634b2e2ce544dc77c3013cb98 -> 886639330c4e7c2aaefc7444975e277d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "18deb8d634b2e2ce544dc77c3013cb98", "thoughtIdB": "886639330c4e7c2aaefc7444975e277d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 558: 18deb8d634b2e2ce544dc77c3013cb98 -> 71097b4b67375de870d93166141f1a2c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "18deb8d634b2e2ce544dc77c3013cb98", "thoughtIdB": "71097b4b67375de870d93166141f1a2c", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 559: fdbfb236729ea007a5029530792657d2 -> b3fadbe01cc0e11c98dc85ee55ccd647
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "b3fadbe01cc0e11c98dc85ee55ccd647", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 560: fdbfb236729ea007a5029530792657d2 -> da1908f70d3a2491cafbc6fbc2bca049
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "da1908f70d3a2491cafbc6fbc2bca049", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 561: fdbfb236729ea007a5029530792657d2 -> db52bb954428ec68f838a59f5d8b99db
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "db52bb954428ec68f838a59f5d8b99db", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 562: fdbfb236729ea007a5029530792657d2 -> 572d25ebd630613df12431b70b1b6342
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "572d25ebd630613df12431b70b1b6342", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 563: fdbfb236729ea007a5029530792657d2 -> 148af1e287c9849a7be3e52f197daaaf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "148af1e287c9849a7be3e52f197daaaf", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 564: fdbfb236729ea007a5029530792657d2 -> da5a9b52d03a0ab396c8710e8372ee79
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "da5a9b52d03a0ab396c8710e8372ee79", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 565: fdbfb236729ea007a5029530792657d2 -> ffb69dcfb12d7e03a8def745446afba9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "ffb69dcfb12d7e03a8def745446afba9", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 566: fdbfb236729ea007a5029530792657d2 -> 66bb15a4b846eb8490f62920a46d73ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "66bb15a4b846eb8490f62920a46d73ee", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 567: fdbfb236729ea007a5029530792657d2 -> e2bd1648a32b9876add08ce6bc5af986
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "e2bd1648a32b9876add08ce6bc5af986", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 568: fdbfb236729ea007a5029530792657d2 -> 68f9beda982b8b70f36059422622ff5e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "68f9beda982b8b70f36059422622ff5e", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 569: fdbfb236729ea007a5029530792657d2 -> ef5d36805fb858a3f1bc39f8e4c734ca
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "ef5d36805fb858a3f1bc39f8e4c734ca", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 570: fdbfb236729ea007a5029530792657d2 -> 9fdce724d2e9118f9713c44b21319039
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "9fdce724d2e9118f9713c44b21319039", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 571: fdbfb236729ea007a5029530792657d2 -> ef4660ee44a8a5e9820d761839a06c3d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "ef4660ee44a8a5e9820d761839a06c3d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 572: fdbfb236729ea007a5029530792657d2 -> ff513cafb631cb2c2622109a4d60a9cd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "ff513cafb631cb2c2622109a4d60a9cd", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 573: fdbfb236729ea007a5029530792657d2 -> 63a55d847f96ac9fddae95a6dabfec5d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "63a55d847f96ac9fddae95a6dabfec5d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 574: 333d052cdc5f093973b8af50ff5eb819 -> 49e35c32e7afbc6cad6b825d6140b00f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "49e35c32e7afbc6cad6b825d6140b00f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 575: 333d052cdc5f093973b8af50ff5eb819 -> bec7b1c30ff168b82bd3a51942f3ad33
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "bec7b1c30ff168b82bd3a51942f3ad33", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 576: 333d052cdc5f093973b8af50ff5eb819 -> fe5de5772da207e4ee1faf58ea580a3d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "fe5de5772da207e4ee1faf58ea580a3d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 577: 333d052cdc5f093973b8af50ff5eb819 -> 2846ce682d8372e062ec31183b537a05
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "2846ce682d8372e062ec31183b537a05", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 578: 333d052cdc5f093973b8af50ff5eb819 -> 92aa146dea1eeb7c683612e42bc9078b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "333d052cdc5f093973b8af50ff5eb819", "thoughtIdB": "92aa146dea1eeb7c683612e42bc9078b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 579: fdbfb236729ea007a5029530792657d2 -> e818f180c0fece3266fb0a45643a0492
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "e818f180c0fece3266fb0a45643a0492", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 580: e818f180c0fece3266fb0a45643a0492 -> e507fc736a688ed2c6865aae951e3091
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "e818f180c0fece3266fb0a45643a0492", "thoughtIdB": "e507fc736a688ed2c6865aae951e3091", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 581: e818f180c0fece3266fb0a45643a0492 -> cecb52caf5d69fa4b5a1798e3c5efeb4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "e818f180c0fece3266fb0a45643a0492", "thoughtIdB": "cecb52caf5d69fa4b5a1798e3c5efeb4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 582: fdbfb236729ea007a5029530792657d2 -> f07da46437828bfb1559ce476548a3f0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "f07da46437828bfb1559ce476548a3f0", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 583: f07da46437828bfb1559ce476548a3f0 -> 25a7ab7b8281bc3c8d7b60ff5eeeb716
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f07da46437828bfb1559ce476548a3f0", "thoughtIdB": "25a7ab7b8281bc3c8d7b60ff5eeeb716", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 584: f07da46437828bfb1559ce476548a3f0 -> 8430caab40c40b3f37360a205024e8b8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f07da46437828bfb1559ce476548a3f0", "thoughtIdB": "8430caab40c40b3f37360a205024e8b8", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 585: fdbfb236729ea007a5029530792657d2 -> 67ae7ffe680bfd5a1b3af95698067d2f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "67ae7ffe680bfd5a1b3af95698067d2f", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 586: fdbfb236729ea007a5029530792657d2 -> c12ff0e0141c32b92f77690f81778ed0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "c12ff0e0141c32b92f77690f81778ed0", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 587: fdbfb236729ea007a5029530792657d2 -> fd4c6321ff1ce3fde4953da463493fcc
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "fd4c6321ff1ce3fde4953da463493fcc", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 588: fdbfb236729ea007a5029530792657d2 -> 0eb3d5e02a5a65394569ec2e68485734
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "0eb3d5e02a5a65394569ec2e68485734", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 589: fdbfb236729ea007a5029530792657d2 -> 4bb236932d70928b07928ce2a1bf4641
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "4bb236932d70928b07928ce2a1bf4641", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 590: fdbfb236729ea007a5029530792657d2 -> 238d52bbb069092c1a10decbf619fc56
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "238d52bbb069092c1a10decbf619fc56", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 591: fdbfb236729ea007a5029530792657d2 -> 5751469a9d80122438adcc94a479ec4c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "5751469a9d80122438adcc94a479ec4c", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 592: fdbfb236729ea007a5029530792657d2 -> 64114205f6aa5cdad791d72cbbc4a7ef
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "64114205f6aa5cdad791d72cbbc4a7ef", "relation": jump, "name": "priced at", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 593: fdbfb236729ea007a5029530792657d2 -> e5f521bff76f4cd07138276ba6674be8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "e5f521bff76f4cd07138276ba6674be8", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 594: fdbfb236729ea007a5029530792657d2 -> 399ac94afd8d47f96fdb3b3dfa1a3b9e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "399ac94afd8d47f96fdb3b3dfa1a3b9e", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 595: fdbfb236729ea007a5029530792657d2 -> db3f7b3055acb4870f6ab5ebedc32c3d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "db3f7b3055acb4870f6ab5ebedc32c3d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 596: fdbfb236729ea007a5029530792657d2 -> da24c20016749ad070855040643c9472
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "da24c20016749ad070855040643c9472", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 597: fdbfb236729ea007a5029530792657d2 -> 8890d2561e6e81c54795ffe46bc28fa4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "8890d2561e6e81c54795ffe46bc28fa4", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 598: fdbfb236729ea007a5029530792657d2 -> 97d11835375e8b6fa0275d825295436a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "97d11835375e8b6fa0275d825295436a", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 599: 97d11835375e8b6fa0275d825295436a -> be98e114a07eac3f8643502357e5b0d5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "97d11835375e8b6fa0275d825295436a", "thoughtIdB": "be98e114a07eac3f8643502357e5b0d5", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 600: 97d11835375e8b6fa0275d825295436a -> 2846ce682d8372e062ec31183b537a05
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "97d11835375e8b6fa0275d825295436a", "thoughtIdB": "2846ce682d8372e062ec31183b537a05", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 601 to 650...'

# Link 601: 97d11835375e8b6fa0275d825295436a -> fe5de5772da207e4ee1faf58ea580a3d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "97d11835375e8b6fa0275d825295436a", "thoughtIdB": "fe5de5772da207e4ee1faf58ea580a3d", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 602: 97d11835375e8b6fa0275d825295436a -> 49e35c32e7afbc6cad6b825d6140b00f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "97d11835375e8b6fa0275d825295436a", "thoughtIdB": "49e35c32e7afbc6cad6b825d6140b00f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 603: 97d11835375e8b6fa0275d825295436a -> bec7b1c30ff168b82bd3a51942f3ad33
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "97d11835375e8b6fa0275d825295436a", "thoughtIdB": "bec7b1c30ff168b82bd3a51942f3ad33", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 604: 97d11835375e8b6fa0275d825295436a -> 92aa146dea1eeb7c683612e42bc9078b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "97d11835375e8b6fa0275d825295436a", "thoughtIdB": "92aa146dea1eeb7c683612e42bc9078b", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 605: fdbfb236729ea007a5029530792657d2 -> c37d26f69ac595603671d8c07e260b38
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "c37d26f69ac595603671d8c07e260b38", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 606: fdbfb236729ea007a5029530792657d2 -> 6b4544594a8d8030866e646cb41a7091
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "6b4544594a8d8030866e646cb41a7091", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 607: fdbfb236729ea007a5029530792657d2 -> 574ab4ab7a94141b6f9903d321b1c492
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "574ab4ab7a94141b6f9903d321b1c492", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 608: fdbfb236729ea007a5029530792657d2 -> 29027bdadbd3facf22b027bb18e25ef5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "29027bdadbd3facf22b027bb18e25ef5", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 609: fdbfb236729ea007a5029530792657d2 -> 96b29aa74d058c558554c6824c434c60
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "96b29aa74d058c558554c6824c434c60", "relation": jump, "name": "employs", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 610: fdbfb236729ea007a5029530792657d2 -> c524558407824dfcbd90ff682d1342f3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "c524558407824dfcbd90ff682d1342f3", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 611: fdbfb236729ea007a5029530792657d2 -> a94dcda99b5022676113ad35dd2d7317
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "a94dcda99b5022676113ad35dd2d7317", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 612: fdbfb236729ea007a5029530792657d2 -> 4d2c0a82702b8086ba4f4dd7b053f7eb
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "4d2c0a82702b8086ba4f4dd7b053f7eb", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 613: fdbfb236729ea007a5029530792657d2 -> c6d8680cac372df67791e63436aeb30b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "c6d8680cac372df67791e63436aeb30b", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 614: fdbfb236729ea007a5029530792657d2 -> b795f653e436742d7569f8ca63efbd6c
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "b795f653e436742d7569f8ca63efbd6c", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 615: fdbfb236729ea007a5029530792657d2 -> 26215a4b6529f5d5d4b4f4720adc0fe0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "26215a4b6529f5d5d4b4f4720adc0fe0", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 616: fdbfb236729ea007a5029530792657d2 -> 41b65458eee94d272ad8558d8030ccaa
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "41b65458eee94d272ad8558d8030ccaa", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 617: fdbfb236729ea007a5029530792657d2 -> af1d898b9970f373db15f0d37eadfd3f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fdbfb236729ea007a5029530792657d2", "thoughtIdB": "af1d898b9970f373db15f0d37eadfd3f", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 618: a78d3e6f3953dd95feffb2b77ebc5aff -> 19471f258d5a62edada92b9fafa73a1d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "19471f258d5a62edada92b9fafa73a1d", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 619: 19471f258d5a62edada92b9fafa73a1d -> ffd3a3f79b826abdb88f5ae855a4aa00
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "ffd3a3f79b826abdb88f5ae855a4aa00", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 620: 19471f258d5a62edada92b9fafa73a1d -> b5abee0c51d7c6a86b75510f1011204e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "b5abee0c51d7c6a86b75510f1011204e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 621: 19471f258d5a62edada92b9fafa73a1d -> f460d3cc5273b5b7848951259cc45cf4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "f460d3cc5273b5b7848951259cc45cf4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 622: 19471f258d5a62edada92b9fafa73a1d -> 9a68b113eeb13806f09487cd277db235
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "9a68b113eeb13806f09487cd277db235", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 623: a78d3e6f3953dd95feffb2b77ebc5aff -> 51f2bf5f67c3e556c83ab1c9a842eb94
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "51f2bf5f67c3e556c83ab1c9a842eb94", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 624: 51f2bf5f67c3e556c83ab1c9a842eb94 -> c8f8412bb40f5a6d079d7586f9d5c8a6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "51f2bf5f67c3e556c83ab1c9a842eb94", "thoughtIdB": "c8f8412bb40f5a6d079d7586f9d5c8a6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 625: 51f2bf5f67c3e556c83ab1c9a842eb94 -> 063e5ca939a16c3111c028491caaae93
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "51f2bf5f67c3e556c83ab1c9a842eb94", "thoughtIdB": "063e5ca939a16c3111c028491caaae93", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 626: 51f2bf5f67c3e556c83ab1c9a842eb94 -> 407b2043aacb701d50771d59ddbe10f6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "51f2bf5f67c3e556c83ab1c9a842eb94", "thoughtIdB": "407b2043aacb701d50771d59ddbe10f6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 627: a78d3e6f3953dd95feffb2b77ebc5aff -> 79eeca8f8853c243d8a12af7ff28e136
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "79eeca8f8853c243d8a12af7ff28e136", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 628: 79eeca8f8853c243d8a12af7ff28e136 -> 9372cc4cf56030c588086c9a4c7f5e86
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "79eeca8f8853c243d8a12af7ff28e136", "thoughtIdB": "9372cc4cf56030c588086c9a4c7f5e86", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 629: 79eeca8f8853c243d8a12af7ff28e136 -> e7d7f80721d64bf835d6d08da4382c1a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "79eeca8f8853c243d8a12af7ff28e136", "thoughtIdB": "e7d7f80721d64bf835d6d08da4382c1a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 630: 79eeca8f8853c243d8a12af7ff28e136 -> 77a75ae6036d93b62d43be77eb13d311
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "79eeca8f8853c243d8a12af7ff28e136", "thoughtIdB": "77a75ae6036d93b62d43be77eb13d311", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 631: a78d3e6f3953dd95feffb2b77ebc5aff -> 7c00828c79649853524cd4b288477afd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "7c00828c79649853524cd4b288477afd", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 632: 7c00828c79649853524cd4b288477afd -> 697b99ba6134732b0226169c8005cec6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "7c00828c79649853524cd4b288477afd", "thoughtIdB": "697b99ba6134732b0226169c8005cec6", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 633: 7c00828c79649853524cd4b288477afd -> 60c603b612c7d66025c6a99bbcb8d924
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "7c00828c79649853524cd4b288477afd", "thoughtIdB": "60c603b612c7d66025c6a99bbcb8d924", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 634: 7c00828c79649853524cd4b288477afd -> 837962419cfc91cf6ca2bc652da5ac54
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "7c00828c79649853524cd4b288477afd", "thoughtIdB": "837962419cfc91cf6ca2bc652da5ac54", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 635: a78d3e6f3953dd95feffb2b77ebc5aff -> 20cf979972774238e192f0514c679d23
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "20cf979972774238e192f0514c679d23", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 636: a78d3e6f3953dd95feffb2b77ebc5aff -> 152b351b4160b7ec050a39a323afe98e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "152b351b4160b7ec050a39a323afe98e", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 637: a78d3e6f3953dd95feffb2b77ebc5aff -> 12e70b6822011ed91ae5240d1dd01632
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "12e70b6822011ed91ae5240d1dd01632", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 638: a78d3e6f3953dd95feffb2b77ebc5aff -> f33a121a963a3b0fbb982bf0679e8692
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "f33a121a963a3b0fbb982bf0679e8692", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 639: a78d3e6f3953dd95feffb2b77ebc5aff -> 797add010d09e09d48f693ebb89291ee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "797add010d09e09d48f693ebb89291ee", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 640: a78d3e6f3953dd95feffb2b77ebc5aff -> 250f3f70b535e15eca73212c05c5d55a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "250f3f70b535e15eca73212c05c5d55a", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 641: a78d3e6f3953dd95feffb2b77ebc5aff -> c524558407824dfcbd90ff682d1342f3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "c524558407824dfcbd90ff682d1342f3", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 642: a78d3e6f3953dd95feffb2b77ebc5aff -> bc84d8c67cd76721a9854613aa1e7ed8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "bc84d8c67cd76721a9854613aa1e7ed8", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 643: a78d3e6f3953dd95feffb2b77ebc5aff -> 0f9d78f20017f7eaec8673aebab2581e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "0f9d78f20017f7eaec8673aebab2581e", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 644: a78d3e6f3953dd95feffb2b77ebc5aff -> 3ad939470f0b2698be86376c05233872
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "3ad939470f0b2698be86376c05233872", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 645: a78d3e6f3953dd95feffb2b77ebc5aff -> 7369f6a9e31bfb5ebf744cdf28b2b9c4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "7369f6a9e31bfb5ebf744cdf28b2b9c4", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 646: a78d3e6f3953dd95feffb2b77ebc5aff -> 437d05c850c8d136ed527339bce9d537
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "437d05c850c8d136ed527339bce9d537", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 647: a78d3e6f3953dd95feffb2b77ebc5aff -> b0896a8395d9b1c1c987831815d3488d
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "b0896a8395d9b1c1c987831815d3488d", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 648: a78d3e6f3953dd95feffb2b77ebc5aff -> 7ad164feb60576366406c468fd2e108a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "7ad164feb60576366406c468fd2e108a", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 649: 7ad164feb60576366406c468fd2e108a -> 2b087af9b920937c3dd9690680e8feb5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "7ad164feb60576366406c468fd2e108a", "thoughtIdB": "2b087af9b920937c3dd9690680e8feb5", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 650: 7ad164feb60576366406c468fd2e108a -> ebd3018cea8be9e27b6c867da8c8510a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "7ad164feb60576366406c468fd2e108a", "thoughtIdB": "ebd3018cea8be9e27b6c867da8c8510a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 651 to 700...'

# Link 651: 7ad164feb60576366406c468fd2e108a -> 003d7db17b4854c21c53ebdc25206421
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "7ad164feb60576366406c468fd2e108a", "thoughtIdB": "003d7db17b4854c21c53ebdc25206421", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 652: 19471f258d5a62edada92b9fafa73a1d -> 436716a5fefdc4fffd657007cacabbe4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "436716a5fefdc4fffd657007cacabbe4", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 653: 19471f258d5a62edada92b9fafa73a1d -> 396136b2f187f2a1bd0c5bc57f96d53a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "396136b2f187f2a1bd0c5bc57f96d53a", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 654: 19471f258d5a62edada92b9fafa73a1d -> 0251da6fe04bfb0fc64ddeb45064aa9f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "0251da6fe04bfb0fc64ddeb45064aa9f", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 655: 19471f258d5a62edada92b9fafa73a1d -> 9b1a940360cf0ebba740598e2839d881
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "19471f258d5a62edada92b9fafa73a1d", "thoughtIdB": "9b1a940360cf0ebba740598e2839d881", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 656: a78d3e6f3953dd95feffb2b77ebc5aff -> d8b9de798787388157cd33b940359711
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "d8b9de798787388157cd33b940359711", "relation": jump, "name": "owns", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 657: d8b9de798787388157cd33b940359711 -> abc216ec55db9f4271008629f391623e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d8b9de798787388157cd33b940359711", "thoughtIdB": "abc216ec55db9f4271008629f391623e", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 658: d8b9de798787388157cd33b940359711 -> 2c156a04c17d02fa87a49e5f39478847
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d8b9de798787388157cd33b940359711", "thoughtIdB": "2c156a04c17d02fa87a49e5f39478847", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 659: d8b9de798787388157cd33b940359711 -> 5b80ec6c053a7c323fad8fb3819975ce
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d8b9de798787388157cd33b940359711", "thoughtIdB": "5b80ec6c053a7c323fad8fb3819975ce", "relation": jump, "name": "features", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 660: a78d3e6f3953dd95feffb2b77ebc5aff -> 6e26511fa84be2d98f744307a99532d3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "6e26511fa84be2d98f744307a99532d3", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 661: a78d3e6f3953dd95feffb2b77ebc5aff -> 79f47c5e80c8f5a57b5cd8ff8ee191ed
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "79f47c5e80c8f5a57b5cd8ff8ee191ed", "relation": jump, "name": "implements", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 662: a78d3e6f3953dd95feffb2b77ebc5aff -> e31a613ec1076631ba035f9f63245873
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "e31a613ec1076631ba035f9f63245873", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 663: a78d3e6f3953dd95feffb2b77ebc5aff -> a34b2260a2ca0c3f2accd0ca0d0f6d6f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "a34b2260a2ca0c3f2accd0ca0d0f6d6f", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 664: a78d3e6f3953dd95feffb2b77ebc5aff -> 49b46d3f462e7591a3c1c0b8dc002943
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "49b46d3f462e7591a3c1c0b8dc002943", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 665: a78d3e6f3953dd95feffb2b77ebc5aff -> b6eff0ccf73441b7aaddb7c21a34eb67
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "b6eff0ccf73441b7aaddb7c21a34eb67", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 666: a78d3e6f3953dd95feffb2b77ebc5aff -> 0a44a97000c1567d9232aa4ced174a8b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "0a44a97000c1567d9232aa4ced174a8b", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 667: a78d3e6f3953dd95feffb2b77ebc5aff -> c16b7e2bb568c6e876ba25133d317eee
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "c16b7e2bb568c6e876ba25133d317eee", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 668: a78d3e6f3953dd95feffb2b77ebc5aff -> 9dd477d0b77f94131feb84640b9b69f7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "9dd477d0b77f94131feb84640b9b69f7", "relation": jump, "name": "partners with", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 669: a78d3e6f3953dd95feffb2b77ebc5aff -> 4b28654acaae3d45415bba2cd69afdc4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "4b28654acaae3d45415bba2cd69afdc4", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 670: a78d3e6f3953dd95feffb2b77ebc5aff -> ea6c8b57fee5408bc689646be1116d70
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "ea6c8b57fee5408bc689646be1116d70", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 671: a78d3e6f3953dd95feffb2b77ebc5aff -> 6fa34728d5a80023f40e833873e5a385
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "6fa34728d5a80023f40e833873e5a385", "relation": jump, "name": "targets", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 672: a78d3e6f3953dd95feffb2b77ebc5aff -> 57ebd2296a58bd7a83ea04f43f10a3c9
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "57ebd2296a58bd7a83ea04f43f10a3c9", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 673: a78d3e6f3953dd95feffb2b77ebc5aff -> 40a6c3e84691f6fbad35d36b40659e43
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "40a6c3e84691f6fbad35d36b40659e43", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 674: a78d3e6f3953dd95feffb2b77ebc5aff -> af94325eac8a3dbb503c5795a3db26a0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "af94325eac8a3dbb503c5795a3db26a0", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 675: a78d3e6f3953dd95feffb2b77ebc5aff -> f2bd3947fdea48c12537f2d1936e8985
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a78d3e6f3953dd95feffb2b77ebc5aff", "thoughtIdB": "f2bd3947fdea48c12537f2d1936e8985", "relation": jump, "name": "provides", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 676: 04350f65731ec27178c03d948c894ced -> 7d5a82c8b74db2aecf2f422ba8770d86
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "7d5a82c8b74db2aecf2f422ba8770d86", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 677: 04350f65731ec27178c03d948c894ced -> c36de3210039d5249b1b967730527175
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "c36de3210039d5249b1b967730527175", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 678: 04350f65731ec27178c03d948c894ced -> 8890d2561e6e81c54795ffe46bc28fa4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "8890d2561e6e81c54795ffe46bc28fa4", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 679: 04350f65731ec27178c03d948c894ced -> cfc1c3ba8dc2e3c43091b62a2b46c33f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "cfc1c3ba8dc2e3c43091b62a2b46c33f", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 680: 04350f65731ec27178c03d948c894ced -> 6524513b5aa5b288e95f56d3a3bf835b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "6524513b5aa5b288e95f56d3a3bf835b", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 681: 04350f65731ec27178c03d948c894ced -> 49fb25d3d30ce86eb832753b24dc44e0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "49fb25d3d30ce86eb832753b24dc44e0", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 682: 04350f65731ec27178c03d948c894ced -> 624c0604759023790d2c9f53a1cb4e31
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "624c0604759023790d2c9f53a1cb4e31", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 683: 04350f65731ec27178c03d948c894ced -> ebe088cf4074cc170b559f76a70171d8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "04350f65731ec27178c03d948c894ced", "thoughtIdB": "ebe088cf4074cc170b559f76a70171d8", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 684: 6e5caa3664feee85b5e82de9667c824a -> 64bb11b4b314487c3c755b7371ea11b6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5caa3664feee85b5e82de9667c824a", "thoughtIdB": "64bb11b4b314487c3c755b7371ea11b6", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 685: 6e5caa3664feee85b5e82de9667c824a -> e2bce461815de8e3ed9e57e76b773d4a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6e5caa3664feee85b5e82de9667c824a", "thoughtIdB": "e2bce461815de8e3ed9e57e76b773d4a", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 686: 0a043571d0a51ecf7aff376fdddacb34 -> 471817a15d4b6fffe56ec55922ea0e23
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0a043571d0a51ecf7aff376fdddacb34", "thoughtIdB": "471817a15d4b6fffe56ec55922ea0e23", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 687: e591d8a8620686a21d432b6c77d14d8d -> 7cc17e74ab6ea0f85c433efefa0cc361
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "e591d8a8620686a21d432b6c77d14d8d", "thoughtIdB": "7cc17e74ab6ea0f85c433efefa0cc361", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 688: f6494e2e58a7c3e2de11d5cdd63db086 -> 6e26511fa84be2d98f744307a99532d3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "f6494e2e58a7c3e2de11d5cdd63db086", "thoughtIdB": "6e26511fa84be2d98f744307a99532d3", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 689: 41ab70790cd664b21eece942acf2bbb9 -> cb8ede41d5a17d760c472ead744b04ce
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "41ab70790cd664b21eece942acf2bbb9", "thoughtIdB": "cb8ede41d5a17d760c472ead744b04ce", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 690: 8592c501fb9a206fe4c75fdc169ba4ec -> 45a01e5651d598baa20567d809844663
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "8592c501fb9a206fe4c75fdc169ba4ec", "thoughtIdB": "45a01e5651d598baa20567d809844663", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 691: 4bc68ac76f8d219d41543c912cde7c04 -> fd4c6321ff1ce3fde4953da463493fcc
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "4bc68ac76f8d219d41543c912cde7c04", "thoughtIdB": "fd4c6321ff1ce3fde4953da463493fcc", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 692: 5d3a29fa6f75928e7f4d91f1fb05c6bf -> 0a7188225f4b4c2cbee36831fbe921a4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "5d3a29fa6f75928e7f4d91f1fb05c6bf", "thoughtIdB": "0a7188225f4b4c2cbee36831fbe921a4", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 693: 6a075cb5081989c01f3488f34c272623 -> 0e40c3942981684c475f5154229e5798
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6a075cb5081989c01f3488f34c272623", "thoughtIdB": "0e40c3942981684c475f5154229e5798", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 694: ef6c3a4aa1ba7204dbd5a0065c09754b -> c37d26f69ac595603671d8c07e260b38
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ef6c3a4aa1ba7204dbd5a0065c09754b", "thoughtIdB": "c37d26f69ac595603671d8c07e260b38", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 695: 513d89b1f02a19c90b47691267ffab6a -> 152b351b4160b7ec050a39a323afe98e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "513d89b1f02a19c90b47691267ffab6a", "thoughtIdB": "152b351b4160b7ec050a39a323afe98e", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 696: b47a287f89727ed122ab8e541764ec0c -> 850227f030f0daed82d7a2b0c7ada158
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b47a287f89727ed122ab8e541764ec0c", "thoughtIdB": "850227f030f0daed82d7a2b0c7ada158", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 697: b47a287f89727ed122ab8e541764ec0c -> db52bb954428ec68f838a59f5d8b99db
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b47a287f89727ed122ab8e541764ec0c", "thoughtIdB": "db52bb954428ec68f838a59f5d8b99db", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 698: 439ed3e9c33e55f4902ff383c2142cff -> 17dfdfc641b2839267baa5dfae60a489
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "439ed3e9c33e55f4902ff383c2142cff", "thoughtIdB": "17dfdfc641b2839267baa5dfae60a489", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 699: 439ed3e9c33e55f4902ff383c2142cff -> 4de7fa06911fda9465ec085bc95942dd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "439ed3e9c33e55f4902ff383c2142cff", "thoughtIdB": "4de7fa06911fda9465ec085bc95942dd", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 700: 9ded44755dd0a8558f0b78343899d22b -> 12e70b6822011ed91ae5240d1dd01632
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9ded44755dd0a8558f0b78343899d22b", "thoughtIdB": "12e70b6822011ed91ae5240d1dd01632", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

echo 'Progress: Importing links 701 to 743...'

# Link 701: ae1b79b6587049ff62ca494549d520b7 -> 30b49d60b8d40641b9d74e7cdc00c0bf
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "30b49d60b8d40641b9d74e7cdc00c0bf", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 702: ae1b79b6587049ff62ca494549d520b7 -> 585a5001bfe3a2f5a392b128adb77ac8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "585a5001bfe3a2f5a392b128adb77ac8", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 703: ae1b79b6587049ff62ca494549d520b7 -> b3fadbe01cc0e11c98dc85ee55ccd647
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "b3fadbe01cc0e11c98dc85ee55ccd647", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 704: ae1b79b6587049ff62ca494549d520b7 -> 62b762ac227f7152092b2d023bbb89bd
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "62b762ac227f7152092b2d023bbb89bd", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 705: ae1b79b6587049ff62ca494549d520b7 -> dd59cc6c95d92d9e6ebadcc884d23c6b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "dd59cc6c95d92d9e6ebadcc884d23c6b", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 706: ae1b79b6587049ff62ca494549d520b7 -> d6220472ccb7553860616e24a22421a1
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "d6220472ccb7553860616e24a22421a1", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 707: ae1b79b6587049ff62ca494549d520b7 -> c12ff0e0141c32b92f77690f81778ed0
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "ae1b79b6587049ff62ca494549d520b7", "thoughtIdB": "c12ff0e0141c32b92f77690f81778ed0", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 708: 01f770f911152037215a5920582eebb6 -> 0b7a65a74cf222348b7c036d0f02da80
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "01f770f911152037215a5920582eebb6", "thoughtIdB": "0b7a65a74cf222348b7c036d0f02da80", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 709: 01f770f911152037215a5920582eebb6 -> df0150ebc851e2591a18a5001f6fec80
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "01f770f911152037215a5920582eebb6", "thoughtIdB": "df0150ebc851e2591a18a5001f6fec80", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 710: 01f770f911152037215a5920582eebb6 -> 67ae7ffe680bfd5a1b3af95698067d2f
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "01f770f911152037215a5920582eebb6", "thoughtIdB": "67ae7ffe680bfd5a1b3af95698067d2f", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 711: 01f770f911152037215a5920582eebb6 -> e9b7a20cc3c247a8e0dd36a7c185cb52
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "01f770f911152037215a5920582eebb6", "thoughtIdB": "e9b7a20cc3c247a8e0dd36a7c185cb52", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 712: cd29942afe2f39772db9a045430bdb91 -> 425273e64ec53567933513058e37e8b4
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "cd29942afe2f39772db9a045430bdb91", "thoughtIdB": "425273e64ec53567933513058e37e8b4", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 713: 9c8545070d5011e51a7d337a3ce7ad4e -> 80c9b6d8f94fc08d4b0ecc3adaca4aff
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9c8545070d5011e51a7d337a3ce7ad4e", "thoughtIdB": "80c9b6d8f94fc08d4b0ecc3adaca4aff", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 714: 159c7cc3e814a0f06d73d785f7baa02d -> 8fbefc3bb74ed4d24d94de8e232fde95
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "159c7cc3e814a0f06d73d785f7baa02d", "thoughtIdB": "8fbefc3bb74ed4d24d94de8e232fde95", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 715: 9effd44aaefe41c26abe9b79bc181586 -> ed1aed2510b7f8a2a35e322e5da7d3d5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9effd44aaefe41c26abe9b79bc181586", "thoughtIdB": "ed1aed2510b7f8a2a35e322e5da7d3d5", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 716: 478debb148ef013991fc91a653fc8ead -> 20cf979972774238e192f0514c679d23
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "478debb148ef013991fc91a653fc8ead", "thoughtIdB": "20cf979972774238e192f0514c679d23", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 717: 02d1db29bdf481d5af0ee2fa13fc24e2 -> 8d0c22922d728f0ce46bdba85e173e01
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "02d1db29bdf481d5af0ee2fa13fc24e2", "thoughtIdB": "8d0c22922d728f0ce46bdba85e173e01", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 718: a90399fed84d9cc4e5617b494de384d7 -> 13545406c23c88ba11eaa476fe387079
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "a90399fed84d9cc4e5617b494de384d7", "thoughtIdB": "13545406c23c88ba11eaa476fe387079", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 719: 94c61f2f8cc3c72ee92275c1a0b2a29b -> 681e5504b13ccdeb2021a0aea70ef576
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "94c61f2f8cc3c72ee92275c1a0b2a29b", "thoughtIdB": "681e5504b13ccdeb2021a0aea70ef576", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 720: 6d4ba20418958659b9627b30b2d3602e -> eaf4f501ad49c313dfd20ca0afcdb263
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6d4ba20418958659b9627b30b2d3602e", "thoughtIdB": "eaf4f501ad49c313dfd20ca0afcdb263", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 721: 43650998f278185ffb6669b532f7e719 -> 262dbafeb2b1ce5726e39d276d87a2e5
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "43650998f278185ffb6669b532f7e719", "thoughtIdB": "262dbafeb2b1ce5726e39d276d87a2e5", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 722: 9857d90d1b15a72f5b704bb4c39522bd -> 039cda031581553bea7a01d7d3826d3a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9857d90d1b15a72f5b704bb4c39522bd", "thoughtIdB": "039cda031581553bea7a01d7d3826d3a", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 723: 9857d90d1b15a72f5b704bb4c39522bd -> 824a26f61c7831a59180574af351ba19
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9857d90d1b15a72f5b704bb4c39522bd", "thoughtIdB": "824a26f61c7831a59180574af351ba19", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 724: 9857d90d1b15a72f5b704bb4c39522bd -> b1ca6eb9d8887decf7426758a71582c3
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9857d90d1b15a72f5b704bb4c39522bd", "thoughtIdB": "b1ca6eb9d8887decf7426758a71582c3", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 725: 9857d90d1b15a72f5b704bb4c39522bd -> 80960dfb9705e6f2815de9aa6c0b8faa
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9857d90d1b15a72f5b704bb4c39522bd", "thoughtIdB": "80960dfb9705e6f2815de9aa6c0b8faa", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 726: 9857d90d1b15a72f5b704bb4c39522bd -> 9b05f01f329bdd0d15e13a89849a28c6
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "9857d90d1b15a72f5b704bb4c39522bd", "thoughtIdB": "9b05f01f329bdd0d15e13a89849a28c6", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 727: 2cc7152864cc2780bc6588263529e9f3 -> 0f5265fc56914425c59269b347a13e14
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "2cc7152864cc2780bc6588263529e9f3", "thoughtIdB": "0f5265fc56914425c59269b347a13e14", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 728: acef0d45091e5e704c22960e2e137961 -> 4fe6d2ddbe2bc446ba5395e8414ba974
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "acef0d45091e5e704c22960e2e137961", "thoughtIdB": "4fe6d2ddbe2bc446ba5395e8414ba974", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 729: 626ac919ee4050a26420fc2036a826d0 -> 16eac9f88adbed03368747f9d8132f4b
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "626ac919ee4050a26420fc2036a826d0", "thoughtIdB": "16eac9f88adbed03368747f9d8132f4b", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 730: 6aad16c36567e423ed96a3d2b8a1e071 -> 7890773304b71b253415cc09883f2d32
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "6aad16c36567e423ed96a3d2b8a1e071", "thoughtIdB": "7890773304b71b253415cc09883f2d32", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 731: 970867044bcf705bcf1b30e212c15309 -> da1908f70d3a2491cafbc6fbc2bca049
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "970867044bcf705bcf1b30e212c15309", "thoughtIdB": "da1908f70d3a2491cafbc6fbc2bca049", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 732: 5cd186b195cef5b590d669a781c5e091 -> 99c8c55e59f9215fb4eee0def1f599f8
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "5cd186b195cef5b590d669a781c5e091", "thoughtIdB": "99c8c55e59f9215fb4eee0def1f599f8", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 733: 98c30d7d8accdca99d5eac070f03b212 -> 5676381d115a9ac91ea7fd8c43f5c722
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "98c30d7d8accdca99d5eac070f03b212", "thoughtIdB": "5676381d115a9ac91ea7fd8c43f5c722", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 734: 0bbb783e2331f9b8091187b4c290c3c8 -> 5a3d3b565df6611ad38095abdc035795
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "0bbb783e2331f9b8091187b4c290c3c8", "thoughtIdB": "5a3d3b565df6611ad38095abdc035795", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 735: b8e1511ddd87ed04cf277c345e5125a6 -> a46a9f2c186f8da08eb0b38477dff82a
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b8e1511ddd87ed04cf277c345e5125a6", "thoughtIdB": "a46a9f2c186f8da08eb0b38477dff82a", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 736: b8e1511ddd87ed04cf277c345e5125a6 -> cdb7dff20accde3d31635587c347aa7e
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "b8e1511ddd87ed04cf277c345e5125a6", "thoughtIdB": "cdb7dff20accde3d31635587c347aa7e", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 737: 91548452726d0fc3fa5c055e39d1aee1 -> 79f47c5e80c8f5a57b5cd8ff8ee191ed
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "91548452726d0fc3fa5c055e39d1aee1", "thoughtIdB": "79f47c5e80c8f5a57b5cd8ff8ee191ed", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 738: 359cac1c84ee7dda8c038e49c5a286b8 -> b28eaa147d39876c03b6f9546eef0087
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "359cac1c84ee7dda8c038e49c5a286b8", "thoughtIdB": "b28eaa147d39876c03b6f9546eef0087", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 739: fc2f633a703e24c18180560b6e5763e7 -> ceb40186494f3aeb23dd0b167a07aa06
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "fc2f633a703e24c18180560b6e5763e7", "thoughtIdB": "ceb40186494f3aeb23dd0b167a07aa06", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 740: d82aa67bac11cb8a2113ea8f4a6f4821 -> aa2ba88f7fbd028f0b657bdc73921ad7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d82aa67bac11cb8a2113ea8f4a6f4821", "thoughtIdB": "aa2ba88f7fbd028f0b657bdc73921ad7", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null
sleep 1

# Link 741: d82aa67bac11cb8a2113ea8f4a6f4821 -> 39c0156283bedd2ce5932e4f085b90e7
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "d82aa67bac11cb8a2113ea8f4a6f4821", "thoughtIdB": "39c0156283bedd2ce5932e4f085b90e7", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 742: 3c2f6d199c2b64163869ca7c418222f4 -> c5f9fd3e4c073b9e1377792252c1e870
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "3c2f6d199c2b64163869ca7c418222f4", "thoughtIdB": "c5f9fd3e4c073b9e1377792252c1e870", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

# Link 743: eee73c8bfa6f17865d3e2af279afea7f -> b9f9aa575ef0a50b74b979bbff8abe84
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"thoughtIdA": "eee73c8bfa6f17865d3e2af279afea7f", "thoughtIdB": "b9f9aa575ef0a50b74b979bbff8abe84", "relation": jump, "name": "enables", "color": "#6fbf6f", "thickness": 1, "direction": 0}' \
  -s > /dev/null

echo ""
echo "All links imported successfully!"
echo "Total links imported: 743"
