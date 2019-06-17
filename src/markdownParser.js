/**
 * Parse markdown syntax and return ssml equivalent
 */
const Parser = require("simple-text-parser");
const parser = new Parser();

// Emphasis
parser.addRule(/\*\*(.+?)\*\*/gi, (tag, text) => ({
  type: s => s.emphasis("strong", text)
}));
parser.addRule(/~\*(.+?)\*~/gi, (tag, text) => ({
  type: s => s.emphasis("reduced", text)
}));
parser.addRule(/\*(.+?)\*/gi, (tag, text) => ({
  type: s => s.emphasis("moderate", text),
  text
}));

// Volume
parser.addRule(/~(.+?)~/gi, (tag, text) => ({
  type: s => s.prosody({
    volume: "silent"
  }, text)
}));
parser.addRule(/-(.+?)-/gi, (tag, text) => ({
  type: s => s.prosody({
    volume: "soft"
  }, text)
}));
parser.addRule(/\+\+(.+?)\+\+/gi, (tag, text) => ({
  type: s => s.prosody({
    volume: "x-loud"
  }, text)
}));
parser.addRule(/\+(.+?)\+/gi, (tag, text) => ({
  type: s => s.prosody({
    volume: "loud"
  }, text)
}));

// Rate
parser.addRule(/<<(.+?)<</gi, (tag, text) => ({
  type: s => s.prosody({
    rate: "x-slow"
  }, text)
}));
parser.addRule(/<(.+?)</gi, (tag, text) => ({
  type: s => s.prosody({
    rate: "slow"
  }, text)
}));
parser.addRule(/>>(.+?)>>/gi, (tag, text) => ({
  type: s => s.prosody({
    rate: "x-fast"
  }, text)
}));
parser.addRule(/>(.+?)>/gi, (tag, text) => ({
  type: s => s.prosody({
    rate: "fast"
  }, text)
}));

// Pitch
parser.addRule(/__(.+?)__/gi, (tag, text) => ({
  type: s => s.prosody({
    pitch: "x-low"
  }, text)
}));
parser.addRule(/_(.+?)_/gi, (tag, text) => ({
  type: s => s.prosody({
    pitch: "low"
  }, text)
}));
parser.addRule(/\^\^(.+?)\^\^/gi, (tag, text) => ({
  type: s => s.prosody({
    pitch: "x-high"
  }, text)
}));
parser.addRule(/\^(.+?)\^/gi, (tag, text) => ({
  type: s => s.prosody({
    pitch: "high"
  }, text)
}));

// Pause and break
const pauseRegex = /\.\.\.(\S+)(s|ms)/gi;
parser.addRule(new RegExp(pauseRegex), tag => {
  const [, time, unit] = new RegExp(pauseRegex).exec(tag);
  return {
    type: s => s.pause(time + unit)
  };
});

parser.addRule(/(\.\.\.)/gi, () => ({
  type: s => s.pause("1000ms")
}));

// Handle functions like extensions etc...
const addParseFunc = (name, callback) => {
  const regex = new RegExp(`\\[(.+?)\\]\\(${name}: (\\S+)\\)`, "gi");
  parser.addRule(regex, (tag, text) => {
    const [, , param] = new RegExp(regex, "gi").exec(tag);
    return {
      type: s => callback(s, text, param)
    };
  });
};

// Function for both volume rate and pitch
const volumes = ["silent", "x-soft", "soft", "medium", "loud", "x-loud"];
const rate = ["", "x-slow", "slow", "medium", "fast", "x-fast"];
const pitch = ["", "x-low", "low", "medium", "high", "x-high"];
addParseFunc("vrp", (s, text, param) => {
  const [vIdx, rIdx, pIdx] = param;
  return s.prosody({
      volume: volumes[vIdx],
      rate: rate[rIdx],
      pitch: pitch[pIdx]
    },
    text
  );
});

addParseFunc("as", (s, text, params) =>
  s.sayAs({
    word: text,
    interpret: params
  })
);

const extensions = {
  whisper: (text, s) => s.whisper(text),
  audio: (text, s) => s.audio(text)
};
addParseFunc("ext", (s, text, extension) => extensions[extension](text, s));

module.exports = parser;
