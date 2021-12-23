const assert = require('assert');
const parse = require('./parser.js');

const template = `
  <div class="test" @bind="handle">
    <br/>
    <div></div>
    <h3>hellow world</h3>
  </div>
`

const ast = parse(template);

// try {
//     assert.equal(ast, 1)
// } catch (e) {
//     console.log(e)
//     return
// }

// console.log('success')
