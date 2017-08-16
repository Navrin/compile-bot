# Discord Compile Bot

[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

This project is a bot made in typescript + discord.js to compile user given code in a docker sandbox, and return the output in the discord chat.

## Glot
[glot.io](https://www.glot.io/) is a free, open-sourced pastebin service that allows users to enter code and run it, and save them as snippets. This bot uses the open glot API to run and create snippets. 

## Features
* Run code in a safe docker sandbox, and output directly in chat.
* Prevents overly large outputs by snippeting outputs > 1000 characters.
* Allows for stdin inputs with the `--input "hello code"` flag
* Allows for custom shell commands to be run, like `--shell "echo "hi"; node main.js" 
* Allows for custom filenames to be given with the `--file "test.js"` flag.
* Supports a large amount of languages, listed below.

## Languages

```txt
assembly      idris
ats           java
bash          javascript
c             julia
clojure       kotlin
cobol         lua
coffeescript  mercury
cpp           nim
crystal       ocaml
csharp        perl
d             perl6
elixir        php
elm           python
erlang        ruby
fsharp        rust
go            scala
groovy        swift
haskell       typescript
```

## How to host / use
This bot requires 2 env tokens to be set.

`COMPILE_BOT_DISCORD_TOKEN` = Your discord token for the bot

`COMPILE_BOT_GLOT_TOKEN` = The token that can be found [here](https://glot.io/account/token). (requires a registered account)

Then run `yarn run start` or if you are using pm2 `yarn run build; pm2 start -n "compile bot" dist/index.js`
