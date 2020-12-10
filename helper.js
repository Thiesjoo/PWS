//Auto assign all variables to a class
Object.autoAssign = function (fn, args) {
  // Match language expressions.
  const COMMENT = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
  const ARGUMENT = /([^\s,]+)/g;

  // Extract constructor arguments.
  const dfn = fn.constructor.toString().replace(COMMENT, "");
  const argList = dfn.slice(dfn.indexOf("(") + 1, dfn.indexOf(")"));
  const names = argList.match(ARGUMENT) || [];

  const toAssign = names.reduce((assigned, name, i) => {
    let val = args[i];

    // Rest arguments.
    if (name.indexOf("...") === 0) {
      name = name.slice(3);
      val = Array.from(args).slice(i);
    }

    if (name.indexOf("_") === 0) {
      assigned[name.slice(1)] = val;
    }

    return assigned;
  }, {});

  if (Object.keys(toAssign).length > 0) {
    Object.assign(fn, toAssign);
  }
};

function arrayPoint(point) {
  return { x: point[0], y: point[1] };
}
