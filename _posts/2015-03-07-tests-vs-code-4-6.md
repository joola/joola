---
layout: post_no_sidebar
title:  "tests vs. code, 4-6"
date:   2015-03-07 11:43:51
author: Itay Weinberger
categories: blog
tags: tests metrics
---

I remember a few years back I checked our SQLite as part of this project and was surprised to read that 80% of their code base was tests, it was amazing for me how much effort they've placed into their tests.

Today, I checked Joola's stats out of curiosity, here are the findings:

| Folder | Language | Code | Comment | Total | % of Code |
|--------|----------|------:|---------:|-------:|-----:|
| lib | Javascript | 7,173 | 2,141 | 9,314 | **60%** | 
| test | Javascript | 4,859 | 225 | 5,084 | **40%** |
| wiki | Markdown | --- | 2,487 | 2,487 | --- |
| **Total** | --- | **12,032** | 4,853 | 16,885 | 100% | 

>
I've included *Comment* lines and the *Wiki* folder for reference only, they're not included in the percentage calculation.

So, as we can see 40% of the codebase is dedicated to tests, this means that we have 4 lines of code testing 6 lines of "real" code.