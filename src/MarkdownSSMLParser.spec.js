const { expect } = require("chai");
const ssmd = require("./MarkdownSSMLParser");

const fs = require("fs");
const R = require("ramda");
const md = require("markdown").markdown;
const tree = md.parse(fs.readFileSync("./SPECIFICATION.md", "utf8"));

const testInputs = [];
const expectedOutputs = [];
for (let i = 1; i < tree.length; ++i) {
  const [blockType, blockValue] = tree[i - 1];
  if (blockType === "para" && blockValue === "SSMD:") {
    testInputs.push(tree[i][1][1]);
  }
  if (blockType === "para" && blockValue === "SSML:") {
    expectedOutputs.push(
      R.compose(
        R.replace(/html\n/, ""),
        R.replace(/\n$/, "")
      )(tree[i][1][1])
    );
  }
}

const allTests = R.zip(testInputs, expectedOutputs);

describe("specParser", () => {
  R.forEach(([input, expected]) => {
    if (!input) {
      return;
    }
    it("Works with " + input, () => {
      const actual = ssmd(input, false);
      if (expected.startsWith("<speak>")) {
        expect(actual).to.be.eql(
          R.compose(
            R.replace("<speak>", ""),
            R.replace("</speak>", "")
          )(expected)
        );
      } else {
        expect(actual).to.be.eql(expected);
      }
    });
  }, allTests);
});
