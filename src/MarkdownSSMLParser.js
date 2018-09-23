const R = require("ramda");
const AmazonSpeech = require("ssml-builder/amazon_speech");
const markdownParser = require("./markdownParser");

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
    (s, { type, text }) => {
      if (type === "text") {
        s.push(text);
        return s;
      }
      s.push(type(new AmazonSpeech()).ssml(true));
      return s;
    },
    [],
    markdownParser.toTree() && markdownParser.toTree(sentence)
  ).join("");

// Will add s tag for each sentence
const parseSentences = parseGeneric("\n", "s", parseSentence);
// Will add p tag for each paragraph
const parseParagraphs = parseGeneric("\n\n", "p", parseSentences);

const ssmd = (text, outputSpeakTag = true) => {
  if (outputSpeakTag) {
    return `<speak>${parseParagraphs(text)}</speak>`;
  }
  return `${parseParagraphs(text)}`;
};

module.exports = ssmd;
