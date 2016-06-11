aifac = {};
var track = 0;
aifac.setData = function(array) {
  data = array;
};
// Returns a random integer between min (included) and max (included)
aifac.getRnd = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
aifac.gen = function(cor) {
  // Convert an array of factors [[fac,fac]]
  // into    an array array of [[{init:a,rate:b},{init:b,rate:b}]]
  return cor.envir.facs.map(function(facx) {
      var yrs = aifac.getRnd(9,12);
      var rate = aifac.getRnd(1,9);
      return facx.map(function(fac) {
        return [
          (yrs * rate * fac), // init
          (rate * fac)        // rate
        ];
      });
  });
};

// generate a function from db data and return a Number result
aifac.genN = function(z) {
  if (Array.isArray(z)) {
    switch (z[0]) {
      case '+' : return aifac.genN(z[1]) + aifac.genN(z[2]);
      case '-' : return aifac.genN(z[1]) - aifac.genN(z[2]);
      case '*' : return aifac.genN(z[1]) * aifac.genN(z[2]);
      case '/' : return aifac.genN(z[1]) / aifac.genN(z[2]);
      default  : return data[z[0]][z[1]][z[2]];
    }
  } else return z;
};
// generate a function from db data and return a String result
aifac.genS = function(z) {
  var s = "";
  var i;
  for (i = 0; i < z.length; i++) {
    if (Array.isArray(z[i])) s += aifac.genN(z[i]);
    else s += z[i];
  }
  return s;
};
var res = [];
data = aifac.gen({envir:{facs:[[10]]}});
console.log(data);
data= [[[100,10]]];
function t(a,b) {
  res.push(aifac.genN(a) === b);
}
t(['*',[0,0,1],2], 20);
t(['-',[0,0,0] , ['*',[0,0,1],2]],80);
t(['/',[0,0,0],[0,0,1]],10);

res.forEach(function(n) {console.log(n);});

console.log(aifac.gen({envir:{facs:[[10,100]]}}));
data = [[[100,10],[1000,100]]];
t([0,0,1],10);
t([0,1,1],100);
t(['-',[0,1,0],['*',7,[0,1,1]]],300);
t(['/',['-',[0,1,0],[0,1,1]],[0,1,1]],9);
t(['-', ['/',['-',[0,1,0],[0,1,1]],[0,1,1]], 3],6);
res.forEach(function(n) {console.log(n);});
