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

