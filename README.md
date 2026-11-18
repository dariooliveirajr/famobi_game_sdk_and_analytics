# famobi_game_sdk_and_analytics


Steps/Decisions

1- Do the unknown first, research for unknown tecnologies, play around with the SDK and read famobi SDK integration

1. SDK Integration

    1- Copied game from Famobi-GmbH/neon-snake@75584c3
    2- Added the SDK to the project. First catch: the game cannot load with script="module" and npm dev. It should build first and be passed to the SDK.init. 
        TODO/Drawback: dev doesn't works anymore. game.js is loaded globally.
    3- Created sdk types.ts
    4- Start-04 Games must report loading progress. After implementation I noticed that the SDK loads a localTester for local environments. 
    ## I can confirm that it was called because of the logging from GameInterface