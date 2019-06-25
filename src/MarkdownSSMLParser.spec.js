const {
  expect
} = require("chai");
const ssmd = require("./MarkdownSSMLParser");

const fs = require("fs");
const R = require("ramda");
const xmlFormatterBase = require('xml-formatter');
const xmlFormatter = (text) => xmlFormatterBase(text) || text;
const specsInput = fs.readFileSync("./SPECIFICATION.md", "utf8");
const testInputs = [];
const expectedOutputs = [];

const parser = /SSMD:.*?```\n(.*?)\n```.*?SSML:.*?```(html)?\n(.*?)\n```/gis;
let result = null;
while ((result = parser.exec(specsInput)) !== null) {
  testInputs.push(result[1]);
  expectedOutputs.push(result[3]);

}

const allTests = R.zip(testInputs, expectedOutputs);

const config = {
  outputSpeakTag: false,
  headingLevels: {
    1: [{
        tag: "emphasis",
        value: 'strong'
      },
      {
        tag: "pause",
        value: '300ms'
      },
    ],

    // 2: // for example, ommiting key 2 will use default params for heading 2

    3: [{
        tag: "pause",
        value: '50ms'
      }, {
        tag: "prosody",
        value: {
          rate: 'slow'
        }
      },
      {
        tag: "pause",
        value: '200ms'
      },
    ],
  }
};

describe("specParser", () => {
  R.forEach(([input, expected]) => {

    if (!input) {
      return;
    }
    it("Works with " + input, () => {
      const actual = ssmd(input, config);
      if (expected.startsWith("<speak>")) {
        expect(actual).to.be.eql(
          R.compose(
            xmlFormatter,
            R.replace("<speak>", ""),
            R.replace("</speak>", "")
          )(expected)
        );
      } else {
        expect(actual).to.be.eql(xmlFormatter(expected));
      }
    });
  }, allTests);
});

describe("LegacyConfig", () => {
  it("Should work with legacy parameter set to false", () => {
    const actual = ssmd("text", false);
    expect(actual).to.be.eql("text");
  })
  it("Should work with legacy parameter set to true", () => {
    const actual = ssmd("text", true);
    expect(actual).to.be.eql(("<speak>\r\n    text\r\n</speak>"));
  })
  it("Should work with legacy parameter set to undefined", () => {
    const actual = ssmd("text", undefined);
    expect(actual).to.be.eql(("<speak>\r\n    text\r\n</speak>"));
  })
  it("Should work with legacy parameter unset", () => {
    const actual = ssmd("text");
    expect(actual).to.be.eql(("<speak>\r\n    text\r\n</speak>"));
  })
})
describe("Config", () => {
  it("Should work with config parameter", () => {
    const actual = ssmd("text", {
      outputSpeakTag: true
    });
    expect(actual).to.be.eql(("<speak>\r\n    text\r\n</speak>"));
  })
  it("Should work with prettyprint set to false", () => {
    const actual = ssmd("text", {
      prettyPrint: false,
    });
    expect(actual).to.be.eql(("<speak>text</speak>"));
  })
  it("Should work with prettyprint set to true", () => {
    const actual = ssmd("text", {
      prettyPrint: true,
    });
    expect(actual).to.be.eql(("<speak>\r\n    text\r\n</speak>"));
  })
})