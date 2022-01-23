# SSMD

[![Build Status](https://travis-ci.org/fabien88/ssmd.svg?branch=master)](https://travis-ci.org/fabien88/ssmd)

Speech Synthesis Markdown (SSMD) is a lightweight alternative syntax for [SSML](https://www.w3.org/TR/speech-synthesis/).
It's a node port of [ruby ssmd](https://github.com/machisuji/ssmd)

See [specification](SPECIFICATION.md) of the language.

## Requirements

Node 8 or later

## Installation

```js
npm install ssmd
```

## Usage

```js
import { ssmd } from 'ssmd';

const ssml = ssmd("hello *SSMD*!");

console.log(ssml);

```

```xml
<speak>
    hello <emphasis>SSMD</emphasis>!
</speak>
```

## Options

```js
const config = {
  outputSpeakTag: false, 
  prettyPrint: true,
  headingLevels: { 
    1: [{
        tag: "emphasis",
        value: 'strong'
      },
      {
        tag: "pause",
        value: '300ms'
      },
    ]
   }
};

ssmd(`
  # My first heading 1
  Hello world
  `,
  config
)
```

```xml
  <s>
     <emphasis level='strong'>
       My first heading 1
     </emphasis> 
     <break time=\'300ms\'/>
  </s>
  <s>
    Hello world
  </s>
```

- `outputSpeakTag` (Boolean, default=`true`) Set it to false if you don't want to have <speak></speak> tags included.
- `prettyPrint` (String, default=`true`) Indent the resulting ssml.
- `headingLevels` (Object) Customize the way heading tags will be transformed into SSML, default value is specified in [specification.md](SPECIFICATION.md#headings)

**Note:**

This version is still under development. See below which essential SSML constructs are implemented so far:

- [x] Text
- [x] Emphasis
- [x] Break
- [ ] Language
- [ ] Mark
- [x] Paragraph
- [x] Sentence
- [ ] Phoneme
- [x] Prosody
- [x] Say-as
- [ ] Substitution
- [x] Audio
- [ ] Extensions

### Tests

Run `npm test` to run the tests against a given executable.

This implementation and any other can be tested against the SSMD specification.
Said specification is extracted from `SPECIFICATION.md`.
It runs each SSMD snippet through the tested tool and compares it to the output of
the following SSML snippet. If they match the test passes.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/fabien88/ssmd. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The module is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
