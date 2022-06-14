const STRING_TYPE = '[object String]';
const NUMBER_TYPE = '[object Number]';
const BOOL_TYPE = '[object Boolean]';
const NULL_TYPE = '[object Null]';
const UNDEFINED_TYPE = '[object Undefined]';
const SYMBOL_TYPE = '[object Symbol]';
const REGEXP_TYPE = '[object RegExp]';
const FUNCTION_TYPE = '[object Function]';
const DATE_TYPE = '[object Date]';

const ARRAY_TYPE = '[object Array]';
const OBJECT_TYPE = '[object Object]';
const MAP_TYPE = '[object Map]';
const SET_TYPE = '[object Set]'

function deepCopy(target, map = new WeakMap()) {
    const prototype = Object.prototype.toString.call(target);
    let cloneTarget;
    switch (prototype) {
        case STRING_TYPE:
        case NUMBER_TYPE:
        case BOOL_TYPE:
        case NULL_TYPE:
        case UNDEFINED_TYPE:
            return cloneTarget = target;
        case SYMBOL_TYPE:
            return cloneTarget = Object(Symbol.prototype.valueOf.call(target));
        case DATE_TYPE:
            return cloneTarget = new Date(target);
        case FUNCTION_TYPE:
            const fnStr = target.toString();
            const bodyReg = /(?<={)(.|\n)+(?=})/m;
            const paramReg = /(?<=\().+(?=\)\s+{)/;
            if (target.prototype) {
                const body = bodyReg.exec(fnStr);
                const param = paramReg.exec(fnStr);
                if (body) {
                    cloneTarget = param ? new Function(...param, body[0]) : new Function(body[0]);
                } else {
                    cloneTarget = null;
                }
            } else {
                cloneTarget = eval(fnStr);
            }
            return cloneTarget;
        case REGEXP_TYPE:
            const reFlags = /\w*$/;
            cloneTarget = new target.__proto__.constructor(target.__proto__.source, reFlags.exec(target));
            cloneTarget.lastIndex = target.lastIndex;
            return cloneTarget
        case ARRAY_TYPE:
            if (map.get(target)) return map.get(target);
            cloneTarget = initClone(target);
            map.set(target, cloneTarget);
            forEach(target, (item, index) => {
                cloneTarget[index] = deepCopy(item, map);
            });
            return cloneTarget;
        case OBJECT_TYPE:
            if (map.get(target)) return map.get(target);
            const keys = Object.keys(target);
            cloneTarget = initClone(target);
            map.set(target, cloneTarget);
            forEach(keys, (item, index) => {
                cloneTarget[item] = deepCopy(target[item], map);
            });
            return cloneTarget;
        case SET_TYPE:
            if (map.get(target)) return map.get(target);
            cloneTarget = initClone(target);
            map.set(target, cloneTarget);
            target.forEach(value => {
                cloneTarget.set(deepCopy(value, map));
            })
            return cloneTarget;
        case MAP_TYPE:
            if (map.get(target)) return map.get(target);
            cloneTarget = initClone(target);
            map.set(target, cloneTarget);
            target.forEach((key, value) => {
                cloneTarget.set(key, deepCopy(value, map));
            })
            return cloneTarget;
        default:
            return target;
    }
}

function initClone(obj) {
    const ctr = obj.__proto__.constructor;
    return new ctr;
}

function forEach(array, iterator) {
    let index = -1;
    let n = array.length;
    while(++index < n) {
        iterator(array[index], index)
    }
    return array;
}


const target = {
    field1: 1,
    field2: undefined,
    field3: {
        child: 'child'
    },
    field4: [2, 4, 8],
    target: null,
    a: new Map(),
    fn: () => 123,
};
target.target = target;

console.log(deepCopy(target));
