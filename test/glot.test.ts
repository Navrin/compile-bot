import { suite, test, skip } from "mocha-typescript";
import { expect } from "chai";
import * as glot from "../src/glot";
import parser from "../src/parser";

@suite("Glot Bindings -> ")
class Glot {
    @test("it can find a language")
    async lang() {
        const lang = await glot.findLanguage("js");

        expect(lang).to.eq("javascript");
    }

    @test("it caches the language list")
    async langCache() {
        const lang = await glot.findLanguage("js");

        expect(lang).to.eq("javascript");
    }

    @test("it can create snippets")
    async snippet() {
        const snippet = await glot.createSnippet(
            "Hello World (automated test!)",
        );

        return expect(snippet).to.be.ok;
    }

    @test("it can run code!")
    async code() {
        const payload = {
            language: "javascript",
            code: "console.log(10 + 10)",
        };

        const response = await glot.runCode(payload);
        expect(response.body.stdout!.trim()).to.eq("20");
    }
}
