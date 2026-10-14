---
title: Custom Item Highlighter
category: tools
order: 4
summary: A client-side Fabric mod that puts a colored border on the LumaMC server's custom items wherever item stacks are drawn.
facts:
  - Spots custom items by their custom name or plugin data, then takes the border color from the tier line in the item's lore.
  - Items with more than one tier color fade from one color to the next, 1 second per color by default.
  - Works in containers, the hotbar, and other mods' HUDs (Inventory HUD+, MiniHUD, Tweakeroo).
tags: [Java, Fabric, Mixins, Minecraft]
links:
  - { label: Download, url: "https://github.com/KazooKat/sortmod/releases" }
  - { label: Code, url: "https://github.com/KazooKat/sortmod" }
media:
  panel:
    - { value: "3", label: "Minecraft versions with builds (1.21.11, 26.1, 26.2)" }
    - { value: "2", label: "ways to detect a custom item" }
    - { value: "1 s", label: "per color when an item has several tiers" }
---
