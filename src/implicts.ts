type ContextCreator = (expr: string) => string;

const javascript = (expr: string) => `
const expr = (
    ${expr}
);

console.log(expr)
`;

const python = (expr: string) => `
expr = ${expr}

print(f"{expr}")
`;

const rust = (expr: string) => `
fn main() {
    println!("{}", {
        ${expr}
    });
}
`;

const haskell = (expr: string) => `
main = putStrLn $ show expr
    where expr = ${expr}
`;

const clojure = (expr: string) => `
(println 
    ${expr}
    )
`;

const coffeescript = (expr: string) => `
expr = ${expr}

console.log expr
`;

const cpp = (expr: string) => `
#include <iostream>
using namespace std;

int main() {
    auto expr = ${expr}
        ;
    cout << expr;
    return 0;
}
`;

const crystal = (expr: string) => `
expr = ${expr}

puts expr
`;

const csharp = (expr: string) => `
using System;

class MainClass {
    static void Main() {
        var expr = ${expr}
            ;
        
        Console.WriteLine(expr);
    }
}`;

const d = (expr: string) => `
import std.stdio;

void main()
{
    auto expr = ${expr}
        ;
    
    writeln(expr);
}
`;

const elixir = (expr: string) => `
expr = ${expr}

IO.puts expr
`;

const go = (expr: string) => `
package main

import (
    "fmt"
)

func main() {
    expr :=
        ${expr}
        
    fmt.Println(expr)
}
`;

const kotlin = (expr: string) => `
fun main(args : Array<String>){
    var expr = 
        ${expr}
        
    println(expr)
}
`;

const lua = (expr: string) => `
expr = ${expr}

print(expr);
`;

const ruby = (expr: string) => `
expr = 
    ${expr}

puts expr
`;

const scala = (expr: string) => `
object Main extends App {
    var expr = 
        ${expr}
        
    println(expr)
}`;

const swift = (expr: string) => `
let expr =
    ${expr}
    ;

print(expr)
`;

const typescript = javascript;

const implictsForLang: { [key: string]: ContextCreator | undefined } = {
    javascript,
    python,
    rust,
    haskell,
    clojure,
    coffeescript,
    cpp,
    crystal,
    csharp,
    d,
    elixir,
    go,
    kotlin,
    lua,
    ruby,
    scala,
    swift,
    typescript,
};

export { implictsForLang };
