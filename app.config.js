export default ({ config }) => {
  var currentdate = new Date();
  var now = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
  return {
    ...config,
    extra: {
      buildTime: now,
    },
  };
};