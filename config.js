/**
console.log('VCAP SERVICES: ' + JSON.stringify(process.env.VCAP_SERVICES, null, 4));
var mongoUrl;
if(process && process.env && process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  for (var svcName in vcapServices) {
  */
//    if (svcName.match(/^mongo.*/)) {
/**      mongoUrl = vcapServices[svcName][0].credentials.uri;
      mongoUrl = mongoUrl || vcapServices[svcName][0].credentials.url;
      break;
    }
  }
} else {
  mongoUrl = "localhost:27017/nodetest1";
}
console.log('Mongo URL: ' + mongoUrl);
*/
module.exports = {
    'secretKey': '12345-67890-09876-54321',
    //'mongoUrl' : 'mongodb://localhost:27017/cap',
    'mongoUrl' : 'mongodb://philmlab:zaqWE321@ds013221.mlab.com:13221/cap',
    'attrib' : '<a href="http://www.freepik.com/free-photos-vectors/tree">Tree vector designed by Freepik</a>'
};
