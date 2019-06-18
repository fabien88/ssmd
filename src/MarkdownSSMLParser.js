const R = require("ramda");
const AmazonSpeech = require("ssml-builder/amazon_speech");
const markdownParser = require("./markdownParser");


const defaultConfig = {
  outputSpeakTag: true,
  headingLevels: {
    1: [{
        tag: "emphasis",
        value: 'strong'
      },
      {
        tag: "pause",
        value: '100ms'
      },
    ],
    2: [{
        tag: "emphasis",
        value: 'moderate'
      },
      {
        tag: "pause",
        value: '75ms'
      },
    ],
    3: [{
        tag: "emphasis",
        value: 'reduced'
      },
      {
        tag: "pause",
        value: '50ms'
      },
    ],
  }
}

const ssmd = (text, config = {}) => {

  if (config === false) {
    config = {
      outputSpeakTag: false
    }
  }
  const configMerged = R.mergeDeepRight(defaultConfig, config);
  const {
    outputSpeakTag
  } = configMerged;

  const parseGeneric = (separator, tag, subCall) => text => {
    const outputParts = R.compose(
      R.filter(R.identity),
      R.map(R.trim),
      R.map(splitText => subCall(splitText)),
      R.split(separator)
    )(text);

    let outputText;
    if (outputParts.length === 1) {
      outputText = R.head(outputParts);
    } else {
      // Join each part with the provided tag
      outputText = `<${tag}>${R.join(`</${tag}>${separator}<${tag}>`)(
      outputParts
    )}</${tag}>`;
    }
    return outputText;
  };

  const parseSentence = sentence =>
    R.reduce(
      (s, {
        type,
        text
      }) => {
        if (type === "text") {
          s.push(text);
          return s;
        }
        s.push(type(new AmazonSpeech(), configMerged).ssml(true));
        return s;
      },
      [],
      markdownParser.toTree() && markdownParser.toTree(sentence)
    ).join("");

  // Will add s tag for each sentence
  const parseSentences = parseGeneric("\n", "s", parseSentence);
  // Will add p tag for each paragraph
  const parseParagraphs = parseGeneric("\n\n", "p", parseSentences);

  if (outputSpeakTag) {
    return `<speak>${parseParagraphs(text)}</speak>`;
  }
  return `${parseParagraphs(text)}`;
};

module.exports = ssmd;