import { suite, test } from "mocha-typescript";
import { expect } from "chai";

import { parseCode, parseArguments } from "../src/parsing";

// @suite('Code Parsing ->')
// class Parsing {
//     code: string;
//     language: string;
//     response: {
//         language: string;
//         code: string;
//     };

//     before() {
//         this.code = '10 + 10';
//         this.language = 'js';
//         this.response = { language: this.language, code: this.code };
//     }

//     @test('it can parse shorthand code')
//     short() {
//         const code = parseCode(`${this.language} ${this.code}`);

//         expect(code).to.deep.eq(this.response);
//     }

//     @test('it can parse shorthand inline')
//     shortCode() {
//         const code = parseCode(`${this.language} \`${this.code}\``);

//         expect(code).to.deep.eq(this.response);
//     }

//     @test('it can parse full codeblocks')
//     longForm() {
//         const code = parseCode(`${this.language} \`\`\`
//             ${this.code}
//         \`\`\` `);

//         expect(code).to.deep.eq(this.response);
//     }

//     @test('it can parse full codeblocks with syntax highlighting')
//     longFormWithHighlighting() {
//         const code = parseCode(`${this.language} \n\`\`\`${this.language}
//             ${this.code}
//         \`\`\``);

//         expect(code).to.deep.eq(this.response);
//     }

//     @test('it can parse only codeblocks')
//     onlyCodeBlock() {
//         const code = parseCode(`\`\`\`${this.language}
//             ${this.code}
//         \`\`\``);

//         expect(code).to.deep.eq(this.response);
//     }

//     @test('it should parse real life code properly')
//     realExample() {
//         const code = parseCode(`e!run haskell
//         \`\`\`haskell
//         main = putStrLn "it supports haskell, the future!"
//         \`\`\`
//         `);

//         if (code === undefined) {
//             return;
//         }

//         return expect(code.code).to.not.be.empty;
//     }

//     @test('it should pass this')
//     moreTest() {
//         const code = parseCode(`javascript
//         \`\`\`javascript
//         console.log('hi');
//         asdjksadkjasdjlk
//         \`\`\``);

//         if (code === undefined) {
//             return;
//         }

//         expect(code.language).to.eq('javascript');
//         return expect(code.code).to.be.ok;
//     }

//     @test('it can parse optional arguments')
//     async arguments() {
//         const code = await parseArguments(`--shell "hello world" --version "latest" --file test.js \`\`\`${this.language}
//             ${this.code}
//         \`\`\``);

//         expect(code).to.deep.eq({
//             shell: 'hello world',
//             file: 'test.js',
//             version: 'latest',
//             input: undefined,
//             ...this.response,
//         });
//     }
// }

import parser from "../src/parser";
import _ = require("lodash");

@suite("Parser Testing ->")
class Parser {
    static FLAGLESS_RESULT = {
        language: "rust",
        code: "123+123",
    };

    static FLAG_RESULT = {
        ...Parser.FLAGLESS_RESULT,
        flags: "--eval",
    };

    static FLAG_EMPTY_RESULT = {
        ...Parser.FLAGLESS_RESULT,
        flags: "",
    };

    static cleanResult(obj: { [key: string]: string }) {
        return _.mapValues(obj, obj => {
            return obj.trim();
        });
    }
    @test("it can parse flags and code without language")
    flagsAndCode() {
        const result = parser.Triple.parse(
            `
        rust --eval
        \`\`\`
        123+123
        \`\`\`
        `.trim(),
        );

        const res = Parser.cleanResult((result as { value: any }).value!);
        expect(result.status).to.be.ok;
        expect(res).to.deep.eq(Parser.FLAG_RESULT);
    }

    @test("it can parse flags and code with language")
    flagsAndCodeAndLanguage() {
        const result = parser.Triple.parse(
            `
        rust --eval
        \`\`\`rust
        123+123
        \`\`\`
        `.trim(),
        );

        const res = Parser.cleanResult((result as { value: any }).value!);
        expect(result.status).to.be.ok;
        expect(res).to.deep.eq(Parser.FLAG_RESULT);
    }

    @test("it can parse language and inline language")
    languageAndInline() {
        const result = parser.Triple.parse(
            `rust
        \`\`\`rust
        123+123
        \`\`\`
        `.trim(),
        );

        const res = Parser.cleanResult((result as { value: any }).value!);
        expect(result.status).to.be.ok;
        expect(res).to.deep.eq(Parser.FLAG_EMPTY_RESULT);
    }

    @test("it can parse language and single tick code")
    languageAndSingleTickCode() {
        const result = parser.Single.parse(`rust \`123+123\``);
        const res = Parser.cleanResult((result as { value: any }).value!);
        expect(result.status).to.be.ok;
        expect(res).to.deep.eq(Parser.FLAG_EMPTY_RESULT);
    }

    // @test.skip("it can parse just inline language")
    // inlineLangOnly() {
    //     console.log(
    //         parser.Triple.parse(
    //             `\`\`\`rust
    //     123+123
    //     \`\`\`
    //     `.trim(),
    //         ),
    //     );
    // }

    @test("it can parse code without backticks")
    noBackticks() {
        const result = parser.SingleFlagless.parse(
            `
            rust 123+123
            `.trim(),
        );

        const res = Parser.cleanResult((result as { value: any }).value!);
        expect(result.status).to.be.ok;
        expect(res).to.deep.eq(Parser.FLAGLESS_RESULT);
    }

    @test("it can parse flags with backticks")
    flagsAndBackticks() {
        const result = parser.Single.parse(`rust --eval \`123+123\``);
        const res = Parser.cleanResult((result as { value: any }).value!);
        expect(result.status).to.be.ok;
        expect(res).to.deep.eq(Parser.FLAG_RESULT);
    }
}
