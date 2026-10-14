---
title: Steam Games Analysis
category: data
order: 3
summary: What makes a Steam game succeed. Python analysis and a live dashboard on the 400 most-owned Steam games.
stats:
  - { value: "92% vs 81%", label: "positive reviews, paid vs free-to-play" }
  - { value: "400", label: "most-owned Steam games analysed" }
facts:
  - Pulled the 1,000 most-owned games from the SteamSpy API, then added genres and tags for the top 400.
  - Action is the most common genre at 72% of titles, and it is not the highest rated.
  - The dashboard filters by genre, price, and review count.
tags: [Python, pandas, Plotly, Streamlit]
links:
  - { label: Live demo, url: "https://steam-games-eda-kazookat.streamlit.app/", note: "May take 30 seconds to wake up" }
  - { label: Code, url: "https://github.com/KazooKat/steam-games-eda" }
media:
  image: ./media/steam-genres.png
  alt: Bar chart of rating by genre, with indie and strategy at the top
---
