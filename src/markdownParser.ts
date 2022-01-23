/**
 * Parse markdown syntax and return ssml equivalent
 */
import * as Parser from "@fabien88/simple-text-parser";
import { defaultTo, is, reduce } from "ramda";
const parser = new Parser();

// Handle functions like extensions etc...
const addParseFunc = (
  name: string,
  callback: (s: any, t: string, p: any) => {}
) => {
  const regex = new RegExp(`\\[(.+?)\\]\\(${name}: (\\S+)\\)`, "gi");
  parser.addRule(regex, (tag: string, text: string) => {
    const [, , param] = new RegExp(regex).exec(tag) as RegExpExecArray;
    return {
      type: (s: string) => callback(s, text, param),
    };
  });
};

// Function for both volume rate and pitch
const volumes = ["silent", "x-soft", "soft", "medium", "loud", "x-loud"];
const rate = ["", "x-slow", "slow", "medium", "fast", "x-fast"];
const pitch = ["", "x-low", "low", "medium", "high", "x-high"];
addParseFunc("vrp", (s, text, param) => {
  const [vIdx, rIdx, pIdx] = param;
  return s.prosody(
    {
      volume: volumes[vIdx],
      rate: rate[rIdx],
      pitch: pitch[pIdx],
    },
    text
  );
});

addParseFunc("as", (s, text, params) =>
  s.sayAs({
    word: text,
    interpret: params,
  })
);

const extensions = {
  whisper: (text: string, s: any) => s.whisper(text),
  audio: (text: string, s: any) => s.audio(text),
};
addParseFunc("ext", (s: any, text: string, extension: "whisper" | "audio") =>
  extensions[extension](text, s)
);

// Handle audio (ie. link in parentheses)
const audioRegex = new RegExp(`\\[(.*?)\\]\\((\\S+) ?(.*)\\)`, "gi");
parser.addRule(audioRegex, (tag: string, text: string) => {
  const [, desc, param, alt] = new RegExp(audioRegex).exec(
    tag
  ) as RegExpExecArray;
  return {
    type: "text",
    text: `<audio src="${param}">${
      desc && `<desc>${desc}</desc>`
    }${alt}</audio>`,
  };
});

// Emphasis
parser.addRule(/\*\*(.+?)\*\*/gi, (tag: string, text: string) => ({
  type: (s: any) => s.emphasis("strong", text),
}));
parser.addRule(/~\*(.+?)\*~/gi, (tag: string, text: string) => ({
  type: (s: any) => s.emphasis("reduced", text),
}));
parser.addRule(/\*(.+?)\*/gi, (tag: string, text: string) => ({
  type: (s: any) => s.emphasis("moderate", text),
  text,
}));

// Volume
parser.addRule(/~(.+?)~/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        volume: "silent",
      },
      text
    ),
}));
parser.addRule(/--(.+?)--/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        volume: "x-soft",
      },
      text
    ),
}));
parser.addRule(/-(.+?)-/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        volume: "soft",
      },
      text
    ),
}));
parser.addRule(/\+\+(.+?)\+\+/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        volume: "x-loud",
      },
      text
    ),
}));
parser.addRule(/\+(.+?)\+/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        volume: "loud",
      },
      text
    ),
}));

// Rate
parser.addRule(/<<(.+?)<</gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        rate: "x-slow",
      },
      text
    ),
}));
parser.addRule(/<(.+?)</gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        rate: "slow",
      },
      text
    ),
}));
parser.addRule(/>>(.+?)>>/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        rate: "x-fast",
      },
      text
    ),
}));
parser.addRule(/>(.+?)>/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        rate: "fast",
      },
      text
    ),
}));

// Pitch
parser.addRule(/__(.+?)__/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        pitch: "x-low",
      },
      text
    ),
}));
parser.addRule(/_(.+?)_/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        pitch: "low",
      },
      text
    ),
}));
parser.addRule(/\^\^(.+?)\^\^/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        pitch: "x-high",
      },
      text
    ),
}));
parser.addRule(/\^(.+?)\^/gi, (tag: string, text: string) => ({
  type: (s: any) =>
    s.prosody(
      {
        pitch: "high",
      },
      text
    ),
}));

// Pause and break
const pauseRegex = /\.\.\.(\S+)(s|ms)/gi;
parser.addRule(new RegExp(pauseRegex), (tag: string) => {
  const [, time, unit] = new RegExp(pauseRegex).exec(tag) as RegExpExecArray;
  return {
    type: (s: any) => s.pause(time + unit),
  };
});

parser.addRule(/(\.\.\.)/gi, () => ({
  type: (s: any) => s.pause("1000ms"),
}));

// Heading, by default, use emphasis and break
parser.addRule(
  /^\s*(#+)\s*(.+)/gi,
  (tag: string, hashes: string, text: string) => {
    // determine how many # we have
    const headingLevel = hashes.length;

    // Apply tag on current speech object
    const execTag = (s: any, { tag, value }: { tag: string; value: any }) => {
      if (!tag) {
        throw new Error("tag is required in headingLevel config !");
      }
      value = defaultTo([], value);
      if (!is(Array, value)) {
        value = [value];
      }
      return s[tag](...[...value, text]);
    };

    return {
      type: (s: any, { headingLevels }: { headingLevels: [] }) => {
        if (!headingLevels[headingLevel]) {
          return s.say(tag);
        }
        return reduce(execTag, s, headingLevels[headingLevel]);
      },
    };
  }
);

export { parser };
