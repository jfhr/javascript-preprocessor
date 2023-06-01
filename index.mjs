/**
 * Copyright 2023 jfhr <me@jfhr.de>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Preprocess input.
 * The result is equivalent to the result of the following algorithm:
 *
 * ```
 * Let stack be an empty stack.
 * Let output be an empty string.
 * For each line in input:
 *     If line is an ifdef-statement:
 *         Let variable be the variable of the ifdef-statement.
 *         If defined[variable] is truthy:
 *             Push true to stack.
 *         Else if defined[variable] is falsy:
 *             Push false to stack.
 *     Else if line is an ifndef-statement:
 *         Let variable be the variable of the ifdef-statement.
 *         If defined[variable] is truthy:
 *             Push false to stack.
 *         Else if defined[variable] is falsy:
 *             Push true to stack.
 *     Else if line is an endif-statement:
 *         Pop from stack.
 *     Else if stack contains only true values:
 *         Add line to output.
 * If stack is not empty:
 *     Return an error.
 * Return output.
 * ```
 *
 * The EBNF grammar rules are as follows:
 *
 * ```
 * ifdef-statement = space, "//", space, "@ifdef", variable, space;
 * ifndef-statement = space, "//", space, "@ifndef", variable, space;
 * endif-statement = space, "//", space, "@endif", space;
 * space = *( " " | "\t" );
 * variable = 1*( "-" | "_" | letter | digit );
 * ```
 *
 * The actual algorithm is optimized and differs from this description.
 * In particular, it does not support more than 32 levels of nesting.
 * A direct implementation of the description, with equivalent behavior,
 * is included in the source as commented out code.
 *
 * @param input {string}
 * @param defined {.Object<string, any>}
 * @return {string}
 */
export function preprocess(input, defined) {
  const regex = /^[\t ]*\/\/[\t ]*@(?<command>ifdef|ifndef|endif)[\t ]*(?<variable>\w+)?[\t ]*$/mg;

  /** @type {string[]} */
  const output = [];
  /**
   * A 32-bit integer, representing a stack of boolean values,
   * where the `i`th bit (from least to most significant)
   * is 1 if `stack[i]` would be false.
   */
  let stack = ~~0;
  /**
   * Equivalent to the length of the above stack.
   */
  let depth = 0;
  /**
   * Index in the input string after the end of the last match.
   */
  let index = 0;

  let match;
  while (match = regex.exec(input)) {
    const {
      /** @type {'ifdef'|'ifndef'|'endif'} */
      command,
      /** @type {string|undefined} */
      variable,
    } = match.groups;

    /**
     * stack === 0 iff no false values would currently be on the stack.
     */
    if (stack === 0) {
      const substring = input.substring(index, match.index);
      output.push(substring);
    }

    /**
     * Set index to the index after the match ends,
     * i.e. the first character that's not a part
     * of the current preprocessor instruction.
     */
    index = match.index + match[0].length + 1;

    if (command === 'ifdef' && variable !== undefined) {
      if (!defined[variable]) {
        stack ^= (1 << depth);
      }
      depth++;
    } else if (command === 'ifndef' && variable !== undefined) {
      if (defined[variable]) {
        stack ^= (1 << depth);
      }
      depth++;
    } else if (command === 'endif' && variable === undefined) {
      depth--;
      if (depth === 0) {
        stack = 0;
      } else {
        stack &= ((~0) >>> (32 - depth));
      }
    }
  }

  if (depth > 32) {
    throw new Error('preprocessor: exceeded maximum depth of 32');
  }

  if (stack !== 0) {
    throw new Error('preprocessor: stack not empty at EOF');
  }

  const lastSubstring = input.substring(index);
  output.push(lastSubstring);
  return output.join('');
}

/*

export function preprocess(input, defined) {
  const regex = /^[\t ]*\/\/[\t ]*@(?<command>ifdef|ifndef|endif)[\t ]*(?<variable>.*)?[\t ]*$/m;

  let stack = [];
  let output = [];

  for (const line of input.split(/\n/g)) {
    const match = line.match(regex);
    if (match && match.groups.command === 'ifdef') {
      let variable = match.groups.variable;
      if (defined[variable]) {
        stack.push(true);
      } else {
        stack.push(false);
      }
    }

    else if (match && match.groups.command === 'ifndef') {
      let variable = match.groups.variable;
      if (defined[variable]) {
        stack.push(false);
      } else {
        stack.push(true);
      }
    }

    else if (match && match.groups.command === 'endif') {
      stack.pop();
    }

    else if (stack.every(x => x)) {
      output.push(line);
    }
  }

  return output.join('\n');
}

 */
