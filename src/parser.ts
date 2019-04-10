import * as P from "parsimmon";
import { loggit } from ".";

const CODE_REGEX = /```([a-z]*)\n*([\s\S]*?)\n*```/m;
const SINGLE_CODE_REGEX = /`([\S\s]+)`/im;
export const CODE_LANG = /```([a-z]+){1}\n[\s\S]+/im;

export type ParserResult = { language: string; flags?: string; code: string };
export type ParseResult = P.Result<ParserResult>;

const parser = P.createLanguage({
    Triple(r) {
        loggit("parsing with triple");

        return P.seqObj<ParserResult>(
            ["language", r.Lang.desc("langs")],
            ["flags", r.Flags.desc("flags")],
            P.optWhitespace
                .desc("maybewhite")
                .or(P.newline.desc("newline"))
                .desc("newline ph"),
            ["code", r.Code.desc("THE CODE")],
        );
    },

    Single(r) {
        loggit("parsing with single");

        return P.seqObj<ParserResult>(
            ["language", r.SingleLang],
            P.whitespace,
            ["flags", r.Flags],
            P.optWhitespace,
            ["code", r.Code],
        );
    },

    SingleFlagless(r) {
        return P.seqObj<ParserResult>(
            ["language", r.SingleLang],
            P.whitespace,
            ["code", r.Code],
        );
    },

    SingleLang(r) {
        return P.takeWhile(c => c !== " ");
    },

    Lang(r) {
        return P.takeWhile(c => ["-", "\n", "`", " "].every(i => i !== c));
    },

    Flags(r) {
        return P.takeWhile(c => c !== "`" && c !== "\n");
    },

    Code(r) {
        return P.regexp(CODE_REGEX, 2)
            .or(P.regexp(SINGLE_CODE_REGEX, 1))
            .or(P.all);
    },
});

export default parser;
