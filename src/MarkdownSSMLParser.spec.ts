import { formatOptions, ssmd } from "./MarkdownSSMLParser";
import * as fs from "fs";
import { zip, forEach, compose, replace } from "ramda";
import xmlFormatterBase = require("xml-formatter");
const xmlFormatter = (text: string) => {
  try {
    return xmlFormatterBase(text, formatOptions);
  } catch (e) {
    return text;
  }
};
const specsInput = fs.readFileSync("./SPECIFICATION.md", "utf8");
const testInputs = [];
const expectedOutputs = [];

const parser = /SSMD:.*?```\n(.*?)\n```.*?SSML:.*?```(html)?\n(.*?)\n```/gis;
let result = null;
while ((result = parser.exec(specsInput)) !== null) {
  testInputs.push(result[1]);
  expectedOutputs.push(result[3]);
}

const allTests = zip(testInputs, expectedOutputs);

const config = {
  outputSpeakTag: false,
  headingLevels: {
    1: [
      {
        tag: "emphasis",
        value: "strong",
      },
      {
        tag: "pause",
        value: "300ms",
      },
    ],

    // 2: // for example, ommiting key 2 will use default params for heading 2

    3: [
      {
        tag: "pause",
        value: "50ms",
      },
      {
        tag: "prosody",
        value: {
          rate: "slow",
        },
      },
      {
        tag: "pause",
        value: "200ms",
      },
    ],
  },
};

describe("specParser", () => {
  forEach(([input, expected]: [input: any, expected: any]) => {
    if (!input) {
      return;
    }
    it("Works with " + input, () => {
      const actual = ssmd(input, config);
      if (expected.startsWith("<speak>")) {
        expect(actual).toBe(
          compose(
            xmlFormatter,
            replace("<speak>", ""),
            replace("</speak>", "")
          )(expected)
        );
      } else {
        expect(actual).toBe(xmlFormatter(expected));
      }
    });
  }, allTests);
});

describe("Config", () => {
  it("Should work with config parameter", () => {
    const actual = ssmd("text", {
      outputSpeakTag: true,
    });
    expect(actual).toBe("<speak>\r\n    text\r\n</speak>");
  });
  it("Should work with prettyprint set to false", () => {
    const actual = ssmd("text", {
      prettyPrint: false,
    });
    expect(actual).toBe("<speak>text</speak>");
  });
  it("Should work with prettyprint set to true", () => {
    const actual = ssmd("text", {
      prettyPrint: true,
    });
    expect(actual).toBe("<speak>\r\n    text\r\n</speak>");
  });
});
