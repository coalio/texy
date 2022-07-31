## TeXy

A Telegram bot that compiles LaTeX into a sticker, powered by [QuickLaTeX](https://quicklatex.com/).

TeXy is available via the alias [@texymathbot](https://t.me/texymathbot).

### Installation

```
yarn install
```

Create a file `src/token.txt` and paste your bot token in it, then run `yarn start`.

### Usage

TeXy can be invoked using inline queries for convenience, but direct messages are also accepted.

When using inline queries, write the formula first and then suffix it with `$$` to indicate that you're done.

```
\sum_{n=1}^{\infty} \frac{1}{n^2} $$
```

This is not required when using direct messages.
