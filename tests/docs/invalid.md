# Here's an example of an invalid document

## regex has the wrong casing

- We're expecting `RegEx` but I wrote `regex` instead
- words in code blocks or fenced code blocks should not be corrected

Let's see if we can correct table cells:

| Good  | Not Good |
|-------|----------|
| RegEx | regex    |
| Foo   | bar      |
| bar   | Foo      |
| foo   | Foo      |

- Blockquote:

> first line regex foobar  
foobar  
FOOBAR  
>
> another paragraph regex here foobar

1. Does it work if I put adjacent punctuation? Like regex, regex? 
2. testing fooBAR  
   testing regex on two lines ordered list
3. testing FooBAR
4. testing foo BAR
5. testing barFOO  
   foobar

```js
const no_errors("regex, foobar")
```