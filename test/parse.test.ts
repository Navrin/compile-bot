import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';

import { parseCode, parseArguments } from '../src/parsing';

@suite('Code Parsing ->')
class Parsing {
    code: string;
    language: string;
    response: {
        language: string;
        code: string;
    };

    before() {
        this.code = '10 + 10';
        this.language = 'js';
        this.response = { language: this.language, code: this.code };
    }

    @test('it can parse shorthand code')
    short() {
        const code = parseCode(`${this.language} ${this.code}`);

        expect(code).to.deep.eq(this.response);
    }

    @test('it can parse shorthand inline')
    shortCode() {
        const code = parseCode(`${this.language} \`${this.code}\``);

        expect(code).to.deep.eq(this.response);
    }

    @test('it can parse full codeblocks')
    longForm() {
        const code = parseCode(`${this.language} \`\`\`
            ${this.code}
        \`\`\` `);

        expect(code).to.deep.eq(this.response);
    }

    @test('it can parse full codeblocks with syntax highlighting')
    longFormWithHighlighting() {
        const code = parseCode(`${this.language} \n\`\`\`${this.language}
            ${this.code}
        \`\`\``);

        expect(code).to.deep.eq(this.response);
    }

    @test('it can parse only codeblocks')
    onlyCodeBlock() {
        const code = parseCode(`\`\`\`${this.language}
            ${this.code}
        \`\`\``);

        expect(code).to.deep.eq(this.response);
    }

    @test('it should parse real life code properly')
    realExample() {
        const code = parseCode(`e!run haskell
        \`\`\`haskell
        main = putStrLn "it supports haskell, the future!"
        \`\`\`
        `);

        return expect(code.code).to.not.be.empty;
    }

    @test('it should pass this')
    moreTest() {
        const code = parseCode(`javascript 
        \`\`\`javascript
        console.log('hi');
        asdjksadkjasdjlk
        \`\`\``);

        expect(code.language).to.eq('javascript');
        return expect(code.code).to.be.ok;
    }

    @test('it can parse optional arguments')
    async arguments() {
        const code = await parseArguments(`--shell "hello world" --version "latest" --file test.js \`\`\`${this.language}
            ${this.code}
        \`\`\``);

        expect(code).to.deep.eq({
            shell: 'hello world',
            file: 'test.js',
            version: 'latest',
            input: undefined,
            ...this.response,
        });
    }
}

