# JavaScript Preprocessor

A very simple JavaScript or general-purpose preprocessor. It exports a single function that takes an input string
and a dictionary of definitions and returns an output string. 

It supports only three preprocessor instructions: `ifdef`, `ifndef`, and `endif`. It operates on a line-by-line basis.



## Example

Given the following code:

```javascript
const words = [];
//@ifdef DEFINED
words.push('the', 'cake', 'is');
//@ifdef NOTDEFINED
words.push('the', 'truth');
//@endif
//@endif
//@ifndef DEFINED
words.push('not');
//@ifndef NOTDEFINED
words.push('maybe');
//@endif
//@endif
words.push('a', 'lie');
```

The following function call:

```javascript
preprocess(code, { DEFINED: true })
```

will generate the following output:

```javascript
const words = [];
words.push('the', 'cake', 'is');
words.push('a', 'lie');
```



## Syntax

Preprocessor instructions must be on a separate line, they must be in a double-slash (`//`) comment, there must be an 
at (`@`) immediately before the instruction and there must not be anything else on the same line except for whitespace
and tab characters.

`ifdef` and `ifndef` statements must be followed by a variable name, which can consist of letters, digits, hyphens and
underscores.

For every `ifdef` or `ifndef` statement there must be a matching `endif` statement. There must not be more than 32 
levels of nested `ifdef` or `ifndef` statements.

### ifdef

```javascript
//@ifdef VARIABLE
```

All lines from here to the matching `endif` statement are included in the output only if the given variable has a truthy
value in the dictionary of definitions.

### ifndef

```javascript
//@ifndef VARIABLE
```

All lines from here to the matching `endif` statement are included in the output only if the given variable has a falsy
value in the dictionary of definitions.

### endif

```javascript
//@endif
```

Close the most recently opened `ifdef` or `ifndef` statement.



## Operation

The function `preprocess`, when called with valid input, returns output equivalent to the following algorithm:

```
Let stack be an empty stack.
Let output be an empty string.
For each line in input:
    If line is an ifdef-statement:
        Let variable be the variable of the ifdef-statement.
        If defined[variable] is truthy:
            Push true to stack.
        Else if defined[variable] is falsy:
            Push false to stack.
    Else if line is an ifndef-statement:
        Let variable be the variable of the ifdef-statement.
        If defined[variable] is truthy:
            Push false to stack.
        Else if defined[variable] is falsy:
            Push true to stack.
    Else if line is an endif-statement:
        Pop from stack.
    Else if stack contains only true values:
        Add line to output.
If stack is not empty:
    Return an error.
Return output.
```

The EBNF grammar rules are as follows:

```
ifdef-statement = space, "//", space, "@ifdef", variable, space;
ifndef-statement = space, "//", space, "@ifndef", variable, space;
endif-statement = space, "//", space, "@endif", space;
space = *( " " | "\t" );
variable = 1*( "-" | "_" | letter | digit );
```

The actual algorithm is optimized and differs from this description. In particular, it does not support more than 32 
levels of nesting. A direct implementation of the description, with equivalent behavior, is included in the source as
commented out code.




