# SSMD Specification

Here we specify how Speech Synthesis Markdown (SSMD) works.

## Syntax

SSMD is mapped to SSML using the following rules.

- [Text](#text)
- [Emphasis](#emphasis)
- [Break](#break)
- [Paragraph](#paragraph)
- [Prosody](#prosody)
- [Say-as](#say-as)
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
```

SSML:

```html
<emphasis level='moderate'>command</emphasis> & conquer
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
<p>First prepare the ingredients.
Don't forget to wash them first.</p><p>Lastly mix them all together.</p><p>Don't forget to do the dishes after!</p>
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
>fast>
>>extra fast>>

Pitch:

__extra low__
_low_
medium
^high^
^^extra high^^

[extra loud, fast, and high](vrp: 555) or
[extra loud, fast, and high](v: 5, r: 5, p: 5)
```

SSML:

```html
Volume:

<prosody volume="silent">silent</prosody>
<prosody volume="x-soft">extra soft</prosody>
<prosody volume="soft">soft</prosody>
medium
<prosody volume="loud">loud</prosody>
<prosody volume="x-loud">extra loud</prosody>

Rate:

<prosody rate="x-slow">extra slow</prosody>
<prosody rate="slow">slow</prosody>
medium
<prosody rate="fast">fast</prosody>
<prosody rate="x-fast">extra fast</prosody>

Pitch:

<prosody pitch="x-low">extra low</prosody>
<prosody pitch="low">low</prosody>
medium
<prosody pitch="high">high</prosody>
<prosody pitch="x-high">extra high</prosody>

<prosody volume="x-loud" rate="x-fast" pitch="x-high">extra loud, fast, and high</prosody> or
<prosody volume="x-loud" rate="x-fast" pitch="x-high">extra loud, fast, and high</prosody>
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
