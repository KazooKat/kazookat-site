---
title: Idle Game Market Analysis
category: data
order: 6
summary: A data map of the idle and incremental game market on Steam, published as an interactive report.
stats:
  - { value: "3,479", label: "idle and incremental games analysed" }
  - { value: "8", label: "themes, with nature the underserved niche" }
facts:
  - Seeds the catalogue from SteamSpy's Idler, Clicker and Incremental tags, then adds price, reviews, release dates and update history from the Steam APIs.
  - 9 analysis modules (topics, performance, gaps, quality, monetization, art, updates, trends, naming) feed a static Plotly report.
  - itch.io and Kongregate add context but stay out of the Steam comparison tables, because their data is thinner.
tags: [Python, pandas, Plotly, Jinja2]
links:
  - { label: Report, url: "https://kazookat.github.io/idle-game-market-analysis/" }
  - { label: Code, url: "https://github.com/KazooKat/idle-game-market-analysis" }
media:
  image: ./media/idle.png
  alt: Idle game market report showing 3,479 games analysed and 8 themes
---
