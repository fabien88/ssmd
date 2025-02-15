# SSMD Specification

Here we specify how Speech Synthesis Markdown (SSMD) works.

## Syntax

SSMD is mapped to SSML using the following rules.

- [SSMD Specification](#ssmd-specification)
  - [Syntax](#syntax)
    - [Text](#text)
    - [Emphasis](#emphasis)
    - [Break](#break)
    - [Paragraph](#paragraph)
    - [Prosody](#prosody)
    - [Say-as](#say-as)
    - [Audio](#audio)
    - [Headings](#headings)
    - [Extensions](#extensions)

---

### Text

Any text written is implicitly wrapped in a `<speak>` root element.
This will be omitted in the rest of the examples shown in this section.

SSMD:

```
text
```

SSML:

```html
<speak>text</speak>
```

---

### Emphasis

SSMD:

```
*command* & conquer 
**_command_** & conquer 
```

SSML:

```html
<s><emphasis level='moderate'>command</emphasis> & conquer</s>
<s><emphasis level='strong'>command</emphasis> & conquer</s>
```

---

### Break

Pauses can be indicated by using `...`. Several modifications to the duration are allowed as shown below.

SSMD:

```
Hello ...      world    (default: x-strong break like after a paragraph)
Hello - ...0   world    (skip break when there would otherwise be one like after this dash)
Hello ...c     world    (medium break like after a comma)
Hello ...s     world    (strong break like after a sentence)
Hello ...p     world    (extra string break like after a paragraph)
Hello ...5s    world    (5 second break (max 10s))
Hello ...100ms world    (100 millisecond break (max 10000ms))
Hello ...100   world    (100 millisecond break (max 10000ms))
```

SSML:

```html
<s>Hello <break time='1000ms'/>      world    (default: x-strong break like after a paragraph)</s>
<s>Hello - <break time='1000ms'/>0   world    (skip break when there would otherwise be one like after this dash)</s>
<s>Hello <break time='1000ms'/>c     world    (medium break like after a comma)</s>
<s>Hello <break time='1000ms'/>s     world    (strong break like after a sentence)</s>
<s>Hello <break time='1000ms'/>p     world    (extra string break like after a paragraph)</s>
<s>Hello <break time='5s'/>    world    (5 second break (max 10s))</s>
<s>Hello <break time='100ms'/> world    (100 millisecond break (max 10000ms))</s>
<s>Hello <break time='1000ms'/>100   world    (100 millisecond break (max 10000ms))</s>
```

---

### Paragraph

Empty lines indicate a paragraph.

SSMD:

```
First prepare the ingredients.
Don't forget to wash them first.

Lastly mix them all together.

Don't forget to do the dishes after!
```

SSML:

```html
<p><s>First prepare the ingredients.</s>
<s>Don't forget to wash them first.</s></p>

<p>Lastly mix them all together.</p>

<p>Don't forget to do the dishes after!</p>
```

---

### Prosody

The prosody or rythm depends the volume, rate and pitch of the delivered text.

Each of those values can be defined by a number between 1 and 5 where those mean:

| number | volume | rate   | pitch  |
| ------ | ------ | ------ | ------ |
| 0      | silent |        |        |
| 1      | x-soft | x-slow | x-low  |
| 2      | soft   | slow   | low    |
| 3      | medium | medium | medium |
| 4      | loud   | fast   | high   |
| 5      | x-loud | x-fast | x-high |

SSMD:

```
Volume:
~silent~
--extra soft--
-soft-
medium
+loud+
++extra loud++
Rate:
<<extra slow<<
<slow<
medium
fast: >fast>
extra fast: >>extra fast>>
Pitch:
__extra low__
_low_
medium
^high^
^^extra high^^
[extra loud, fast, and high](vrp: 555)
```

SSML:

```html
<s>Volume:</s>
<s><prosody volume='silent'>silent</prosody></s>
<s><prosody volume='x-soft'>extra soft</prosody></s>
<s><prosody volume='soft'>soft</prosody></s>
<s>medium</s>
<s><prosody volume='loud'>loud</prosody></s>
<s><prosody volume='x-loud'>extra loud</prosody></s>
<s>Rate:</s>
<s><prosody rate='x-slow'>extra slow</prosody></s>
<s><prosody rate='slow'>slow</prosody></s>
<s>medium</s>
<s>fast: <prosody rate='fast'>fast</prosody></s>
<s>extra fast: <prosody rate='x-fast'>extra fast</prosody></s>
<s>Pitch:</s>
<s><prosody pitch='x-low'>extra low</prosody></s>
<s><prosody pitch='low'>low</prosody></s>
<s>medium</s>
<s><prosody pitch='high'>high</prosody></s>
<s><prosody pitch='x-high'>extra high</prosody></s>
<s><prosody rate='x-fast' pitch='x-high' volume='x-loud'>extra loud, fast, and high</prosody></s>
```

The shortcuts are listed first. While they can be combined, sometimes it's easier and shorter to just use
the explicit form shown in the last 2 lines. All of them can be nested, too.
Moreover changes in volume (`[louder](v: +10dB)`) and pitch (`[lower](p: -4%)`) can also be given explicitly in relative values.

---

### Say-as

You can give the speech sythesis engine hints as to what it's supposed to read using `as`.

Possible values:

- character - spell out each single character, e.g. for KGB
- number - cardinal number, e.g. 100
- ordinal - ordinal number, e.g. 1st
- digits - spell out each single digit, e.g. 123 as 1 - 2 - 3
- fraction - pronounce number as fraction, e.g. 3/4 as three quarters
- unit - e.g. 1meter
- date - read content as a date, must provide format
- time - duration in minutes and seconds
- address - read as part of an address
- telephone - read content as a telephone number
- expletive - beeps out the content

SSMD:

```
telephone number is [+49 123456](as: telephone).
You can't say [fuck](as: expletive) on television.
```

SSML:

```html
<s>telephone number is <say-as interpret-as='telephone'>+49 123456</say-as>.</s>
<s>You can't say <say-as interpret-as='expletive'>fuck</say-as> on television.</s>
```

---

### Audio

Audio

Syntax :  [description of sound](urlOfSound.mp3 alternative text)  
Description text is used for display  
Following the url, an alternate text may be provided in case the file is not readable

SSMD:

```
Here's a fun sound [boing](https://example.com/sounds/boing.mp3)
[a cat purring](cat_purr_close.ogg Purr (sound didn't load))
[](miaou.mp3)
```

SSML:

```html
<s>Here's a fun sound <audio src="https://example.com/sounds/boing.mp3"><desc>boing</desc></audio></s>
<s><audio src="cat_purr_close.ogg"><desc>a cat purring</desc>Purr (sound didn't load)</audio></s>
<s><audio src="miaou.mp3"></audio></s>
```

---

### Headings

Heading tag adds emphasis and a small break by default, but you can configure it as you like :  

```
const ssml = ssmd("# My first heading 1", {
  headingLevels: {
    1: [
        { tag: "emphasis", value: 'strong' },
        { tag: "pause", value: '300ms' },
    ],

    // if we ommit key "2", it will uses default params for heading 2

    3: [
        { tag: "pause", value: '50ms' },
        { tag: "prosody", value: {rate: 'slow'} },
        { tag: "pause", value: '200ms' },
    ],
  }
});
```

You can use any tag and value referenced from [ssml-builder project](https://www.npmjs.com/package/ssml-builder/v/0.4.3)  

By default headings give :  
* \# Heading 1 -> strong emphasis and a 100ms pause after  
* \# Heading 2 -> moderate emphasis and a 75ms pause after  
* \# Heading 3 -> reduced emphasis and a 50ms pause after  

SSMD:

```
# Heading 1
## Heading 2
 ##Heading 2
### Heading 3
#### Heading 4 // Not handled by default 
```

SSML:

```html
<s><emphasis level='strong'>Heading 1</emphasis> <break time='300ms'/></s>
<s><emphasis level='moderate'>Heading 2</emphasis> <break time='75ms'/></s>
<s><emphasis level='moderate'>Heading 2</emphasis> <break time='75ms'/></s>
<s><break time='50ms'/> <prosody rate='slow'>Heading 3</prosody> <break time='200ms'/></s>
<s>#### Heading 4 // Not handled by default</s>
```

---

### Extensions

Amazon SSML

SSMD:

```
If he [whispers](ext: whisper), he lies.
Listen this [https://example.com/test.mp3](ext: audio).
[Waouh](as: interjection) trop bien !
```

SSML:

```html
<s>If he <amazon:effect name="whispered">whispers</amazon:effect>, he lies.</s>
<s>Listen this <audio src='https://example.com/test.mp3'/>.</s>
<s><say-as interpret-as='interjection'>Waouh</say-as> trop bien !</s>
```

---
