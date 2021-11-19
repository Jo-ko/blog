function fooPromiseExecutor(resolve, reject) {
    setTimeout(reject, 1000, 'bar');
}

function foo() {
    new Promise(fooPromiseExecutor);
}

foo()
