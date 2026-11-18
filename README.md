# famobi_game_sdk_and_analytics


Steps/Decisions

1- Do the unknown first, research for unknown tecnologies, play around with the SDK and read famobi SDK integration

1. SDK Integration

    1- Copied game from Famobi-GmbH/neon-snake@75584c3

    2- Added the SDK to the project. First catch: the game cannot load with script="module" and npm dev. It should build first and be passed to the SDK.init.  
        TODO/Drawback: dev doesn't works anymore. game.js is loaded globally.

    3- Created sdk types.ts

    4- Start-04 Games must report loading progress. After implementation I noticed that the SDK loads a localTester for local environments. 

    > **Verified:** I can confirm that it was called because of the logging from GameInterface (`[game] sendPreloadProgress(0)` / `[game] sendPreloadProgress(100)` in the browser console).

    5- Start-05 famobi.json. Added because the docs require it. The game code never reads this file: the SDK fetches it during `GameInterface.init(...)` and uses it as platform configuration (number of levels, ad placements, in-app products).
        - It lives in `game/public/famobi.json`, because Vite only copies files from `public/` into `dist/`, which is where it ends up next to the built `index.html`.
        - It only contains `"maxLevels": 3`, matching the 3 levels in `levels.ts`. The docs example (1400 levels, ads, IAP product) was not used, because Neon Snake has no ads or shop, and the Famobi Tester checks that every ad event ID listed in `famobi.json` is actually triggered by the game.
        - No TypeScript interfaces were created for it: `FamobiJson` / `ProductData` in the docs describe the file format, not code the game uses.
