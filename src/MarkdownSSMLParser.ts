import { SSMDConfig, SSMDConfigAudioDetection } from "./config.interface";
import AmazonSpeech = require("ssml-builder/amazon_speech");
import { parser as markdownParser } from "./markdownParser";
import xmlFormatter = require("xml-formatter");
import {
  mergeDeepRight,
  compose,
  filter,
  identity,
  map,
  trim,
  split,
  head,
  join,
  reduce,
} from "ramda";

export const formatOptions = {
  indentation: "    ",
  whiteSpaceAtEndOfSelfclosingTag: true,
  stripComments: true,
  collapseContent: false,
  lineSeparator: "\r\n",
};

const defaultConfig: SSMDConfig = {
  outputSpeakTag: true,
  prettyPrint: true,
  audio: {
    detectionStrategy: SSMDConfigAudioDetection.SMART_DETECT,
    audioExtensions: [
      ".3gp",
      ".aa",
      ".aac",
      ".aiff",
      ".flac",
      ".m4a",
      ".mp3",
      ".ogg",
      ".mogg",
      ".oga",
      ".wav",
      ".wma",
      ".webm",
    ],
  },
  headingLevels: {
    1: [
      {
        tag: "emphasis",
        value: "strong",
      },
      {
        tag: "pause",
        value: "100ms",
      },
    ],
    2: [
      {
        tag: "emphasis",
        value: "moderate",
      },
      {
        tag: "pause",
        value: "75ms",
      },
    ],
    3: [
      {
        tag: "emphasis",
        value: "reduced",
      },
      {
        tag: "pause",
        value: "50ms",
      },
    ],
  },
};

const ssmd = (text: string, config = defaultConfig) => {
  const configMerged = mergeDeepRight(defaultConfig, config);
  const { outputSpeakTag, prettyPrint } = configMerged;

  const parseGeneric =
    (separator: any, tag: any, subCall: any) => (text: string) => {
      const outputParts = compose(
        filter(identity),
        map(trim),
        map((splitText: string) => subCall(splitText)),
        split(separator)
      )(text);

      let outputText;
      if (outputParts.length === 1) {
        outputText = head(outputParts);
      } else {
        // Join each part with the provided tag
        outputText = `<${tag}>${join(`</${tag}>${separator}<${tag}>`)(
          outputParts
        )}</${tag}>`;
      }
      return outputText;
    };

  const parseSentence = (sentence: string) =>
    reduce(
      (s: any, { type, text }: { type: any; text: string }) => {
        if (type === "text") {
          s.push(text);
          return s;
        }
        s.push(type(new AmazonSpeech(), configMerged).ssml(true));
        return s;
      },
      [],
      markdownParser.parser.toTree() && markdownParser.toTree(sentence)
    ).join("");

  // Will add s tag for each sentence
  const parseSentences = parseGeneric("\n", "s", parseSentence);
  // Will add p tag for each paragraph
  const parseParagraphs = parseGeneric("\n\n", "p", parseSentences);

  let ssmlOutput = parseParagraphs(text);
  if (outputSpeakTag) {
    ssmlOutput = `<speak>${ssmlOutput}</speak>`;
  }
  if (prettyPrint) {
    try {
      ssmlOutput = xmlFormatter(ssmlOutput, formatOptions);
    } catch (e) {
      console.error(e, ssmlOutput);
    }
  }
  return ssmlOutput;
};

export { ssmd };
