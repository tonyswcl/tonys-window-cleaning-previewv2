# Tony's character file (assets/quote/tech.glb)

The model is Mixamo Ch28, converted by Tony. These scripts rebuild the file the site ships from the previous version
(git history keeps every one). Round five, September 26:

1. `node bindpos.mjs tech.glb bind.json` writes each mesh's rest pose positions and uvs (undoing the quantization baked into the skin).
2. Pull the skin texture out of the file (any glTF viewer or `gltf-transform` can), save it as `diffuse.png`, then
   `python3 retex.py bind.json diffuse.png diffuse2.png` evens the skin tone between face and hands, softens the lips,
   paints dark brows and short dark hair on the scalp under the hair cards, and writes `diffuse2.png`. Convert it to webp (quality 88).
3. `node retex.mjs tech.glb diffuse2.webp tech-new.glb 0.371,0,0.547,0.088` swaps in the texture, drops the hair cards
   (they showed as specks and poked through the cap), splits the eyes into their own glossy material `Ch28_eye`,
   pulls the lips back toward the face in the rest pose, and meshopt compresses the result.

The node scripts need `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions` and `meshoptimizer`
(`npm i` them in a scratch folder, not in the repo). `retex.py` needs Pillow.

Material settings that go with the file live in `buildRig()` in `_quote/src/q3d.js`: matte skin (`Ch28_body`), glossy eyes
(`Ch28_eye`), dark lashes (`Ch28_hair`), the royal blue long sleeve and near black pants. The cap and glasses are built in
code by `headwear()` (`HW` holds their fit).
