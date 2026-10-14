---
title: Equity DCF
category: data
order: 1
summary: Type any US-listed ticker and get a discounted cash flow valuation built from its audited 10-K filings.
facts:
  - Pulls the full 10-K history from the SEC EDGAR XBRL API. No API key and no hand-keyed numbers.
  - Keeps only annual facts with a 330 to 400 day filter, so quarterly numbers never get counted as annual.
  - Outputs a WACC × terminal growth sensitivity grid and a football-field chart against the live market price.
tags: [Python, pandas, Plotly, Streamlit, SEC EDGAR]
links:
  - { label: Code, url: "https://github.com/KazooKat/equity-dcf" }
media:
  image: ./media/dcf.png
  alt: Equity DCF dashboard valuing Apple from its 10-K filings, with a free cash flow chart
---
