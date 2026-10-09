# Spy Fox in "Dry Cereal": mobile tribute

A fan-made, touch-friendly point-and-click adventure inspired by Humongous Entertainment's 1997 CD-ROM *Spy Fox in "Dry Cereal"*. It runs in any phone or desktop browser; turn your phone sideways to play.

Everything is made in code: characters and backgrounds are SVG, the spy-jazz music and sound effects are synthesized with Web Audio, and characters speak with the browser's built-in voices. No assets from the original game are used.

## The mission

William the Once-Great, a goat with a grudge, has kidnapped Mr. Udder of the Udder Milk Company. He plans to use the Dry-O-Matic to turn every drop of cow's milk on Earth to dust, so the world will have to buy his goat milk. Without milk, kids everywhere would have to eat their cereal dry!

1. **SPY Corp HQ**: Monkey Penny briefs you and gives you the password. Professor Quack hands over Spy Gum, Laser Lipstick and Spy Mist Cologne.
2. **Acidophilus Island**: drive the Spy Car across the sea to the harbor, then explore the town square, Café Feta and the casino.
3. **Find your contact**: one café patron is reading the newspaper upside down. Say the right password.
4. **Get into the casino**: Bruno the doorman wants a red carnation, Baa-bara the flower seller wants a cappuccino, and Walter the Waiter makes cappuccinos.
5. **Go Fish with Napoleon LeRoach**: he never loses, because he's peeking at your cards. Find out how, stop him, and win his fortress keycard.
6. **The Goat Fortress**: open the gate, reveal the invisible lasers and time your dash through them.
7. **The lab**: free Mr. Udder and play the secret cowbell code to shut down the Dry-O-Matic.

The password, the contact's seat and the cowbell code change every game.

## Controls

- **Tap** the ground to walk, and tap people and things to talk or look.
- **Tap an item** in your spy kit, then tap where to use it. Tap the same item again to hear what it is.
- **Spy Watch** (bottom left): call Monkey Penny for a hint, and change music, voice and sound settings, or save and quit.
- **Spy Vision** (sunglasses, bottom right): briefly highlights everything you can tap.
- Progress saves automatically in your browser.

## Development

```sh
node tools/build.mjs        # writes dist/index.html (+ PWA files) and dist/spyfox-artifact.html
npx http-server dist        # play locally
```

Source lives in `src/`:

| File | What it does |
| --- | --- |
| `src/index.html` | Page shell |
| `src/style.css` | Stage, UI and animation styles |
| `src/js/audio.js` | Music sequencer, sound effects, character voices |
| `src/js/art.js` | Character and item art |
| `src/js/engine.js` | Adventure engine: walking, talking, inventory, Spy Watch, saving |
| `src/js/scenes.js` | Every location, its characters and its puzzles |
| `src/js/minigames.js` | Go Fish and the cowbell code |
| `src/js/main.js` | Title screen, cutscenes, hints, boot |

Pushing to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`. Turn on Pages once under **Settings → Pages → Source: GitHub Actions**.

---

*Spy Fox* is a trademark of its respective owners. This is an unofficial, non-commercial fan tribute and is not affiliated with Humongous Entertainment or its successors.
