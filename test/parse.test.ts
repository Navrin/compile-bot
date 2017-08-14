import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';

import { parseCode } from '../src/glot';

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

    @test('short code parsing should return correctly')
    short() {
        const code = parseCode(`${this.language} ${this.code}`);

        expect(code).to.eq(this.response);
    }

    @test('short code with codeblock should return correctly')
    shortCode() {
        const code = parseCode(`${this.language} \`${this.code}\``);

        expect(code).to.eq(this.response);
    }

    @test('long form with codeblock should return correctly')
    longForm() {
        const code = parseCode(`${this.language} \`\`\`
            ${this.code}
        \`\`\` `);

        expect(code).to.eq(this.response);
    }

    @test('long form with codeblock and language highlighting should return correctly')
    longFormWithHighlighting() {
        const code = parseCode(`${this.language} \`\`\`${this.language}
            ${this.code}
        \`\`\``);

        expect(code).to.eq(this.response);
    }
}

