---
title: Credit Default Prediction
category: data
order: 2
summary: Predicts credit card default on 30,000 accounts, with a live risk scorer.
stats:
  - { value: "0.78", label: "ROC-AUC, random forest" }
  - { value: "30,000", label: "credit card accounts" }
facts:
  - Logistic regression vs random forest (0.71 vs 0.78 ROC-AUC) on the UCI dataset, with class weights for the 22% default rate.
  - Recent repayment status was the strongest predictor.
  - The Streamlit scorer comes with notes on fairness and responsible use.
tags: [Python, scikit-learn, Streamlit]
links:
  - { label: Live demo, url: "https://credit-risk-ml-kazookat.streamlit.app/", note: "May take 30 seconds to wake up" }
  - { label: Code, url: "https://github.com/KazooKat/credit-risk-ml" }
media:
  image: ./media/credit-roc.png
  fit: contain
  alt: ROC curves with the random forest (AUC 0.776) above logistic regression (AUC 0.708)
---
