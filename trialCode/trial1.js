var userfac = {};
/*
userfac.getCsIndex = function(array, cId) {
  var index = -1;
  for (var i = 0; i < array.length; i++) {
    if (array[i]._id === cId) index = i;
  }
  return index;
};
var a = [{_id:'t'},{_id:'r'},{_id:1}];
console.log(userfac.getCsIndex(a,'r') === 1);
console.log(userfac.getCsIndex(a,1) === 2);
console.log(userfac.getCsIndex(a,'j') === -1);
*/
userfac.getChartData = function(courseId, index) {
  var scores = [[[[true,true,true],[],[false]]],[[[true,true],[false]]]];
  //if (index) scores = user.courses[index].prog.scores;
  //else scores = userfac.getProgress(courseId).scores;
  var data = [];
  for (var i = 0 ; i < scores.length ; i++) {
    for (var j = 0 ; j < scores[i].length ; j++) {
      for (var k = 0 ; k < scores[i][j].length ; k++) {
        var l = scores[i][j][k].length;
        if (l > 0)
        data.push ({
          challenge : i + 1,
          repeat : j + 1,
          qu : k,
          attempts : l,
          score : scores[i][j][k][l-1]
        });
      }
    }
  }
  return data;

};
console.log(userfac.getChartData());
