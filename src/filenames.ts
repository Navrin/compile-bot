/**
 * Apparently filenames are not implicit, and must be explicitally stated.
 * These filenames where extracted from a ripgrep of the site's container testing files.
 */
const filenames: {
    [key: string]: string,
} = {
    elm: 'main.elm',
    ats: 'main.dats',
    groovy: 'main.groovy',
    typescript: 'main.ts', // 🙌
    c: 'main.c',
    assembly: 'main.asm',
    erlang: 'main.erl',
    cplusplus: 'main.cpp',
    ocaml: 'main.ml',
    go: 'main.go',
    golang: 'main.go',
    perl: 'main.pl',
    bash: 'main.sh',
    rust: 'main.rs',
    python: 'main.py',
    nim: 'main.nim',
    java: 'Main.java',
    haskell: 'main.hs',
    crystal: 'main.cr',
    perl6: 'main.pl6',
    cobol: 'main.cob',
    csharp: 'main.cs',
    fsharp: 'main.fs',
    ruby: 'main.rb',
    dlang: 'main.d',
    php: 'main.php',
    julia: 'main.jl',
    clojure: 'main.clj',
    elixir: 'main.ex',
    swift: 'main.swift',
    javascript: 'main.js',
    coffeescript: 'main.coffee', // people still use this?
    kotlin: 'main.kt',
    scala: 'main.scala',
    mercury: 'main.m',
    idris: 'main.idr',
    lua: 'main.lua',
};

export default filenames;
