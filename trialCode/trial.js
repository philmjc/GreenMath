user = {
  curr:1,
  courses : [
    {id:1},
    {id:2}
  ]
};
var updateUser = function(obj) {
  user = Object.assign(user, obj);
};
function gp(id) {
  if (!user.courses) return false;
  if (!id && user.currIndex) return user.courses[user.currIndex].prog;
  var ids = user.courses.map(function(el) {return el.id;});
  var i = id ? id : user.curr;
  var index = ids.indexOf(i);
  if (index < 0) return false;
  updateUser({currIndex:index});
  if (!user.courses[index].prog) user.courses[index].prog = {};
  return user.courses[index].prog;
}
function up(obj) {
  var pro = gp();
  console.log(pro);
  Object.assign(pro, obj);
}

up({mark:1, scores:[true,true]});
console.log(user.courses[user.currIndex].prog);
